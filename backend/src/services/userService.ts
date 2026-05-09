import { ServiceError } from '@/errors/ServiceError.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import type { KeyValue } from '@/types/KeyValue.js';
import { randomString } from '@/utils/helper.js';
import { moderateName } from '@/utils/llm.js';
import { canModify as _canModify } from '@/utils/permissions.js';
import type { MeDTO } from '@shared/models/dto/MeDTO.js';
import type UserWithRoles from '@shared/models/extensions/UserWithRoles.js';
import type { RefreshToken, RefreshTokenInitializer } from '@shared/models/generated/RefreshToken.js';
import type { User, UserId, UserInitializer, UserMutator } from '@shared/models/generated/User.js';
import type { UserProfile } from '@shared/models/generated/UserProfile.js';
import type { UserRole as UserRoleModel } from '@shared/models/generated/UserRole.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import type { Jwt, PayloadData } from '@shared/types/Jwt.js';
import type { UserRole } from '@shared/types/UserRole.js';
import { jsonBase64Decode } from '@shared/utils/encoding.js';
import { generateRandomUsername, getEmailUsername } from '@shared/utils/username.js';
import { isValidEmail, validatePassword, validateUsername } from '@shared/utils/validation.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Profile as FacebookProfile } from 'passport-facebook';
import type { Profile as GoogleProfile } from 'passport-google-oauth20';
import { validate } from 'uuid';
import { ApiError } from '../utils/apiHelper.js';
import { mail } from '../utils/mailer.js';

type UpdateParams = UserMutator & {
    old_password?: string;
    new_password?: string;
};

type DeleteParams = {
    password?: string;
    token?: string;
};

export const createUserService = (ctx: ServiceContext) => {
    const { deps, actor } = ctx;

    const get = async <P extends KeyValue>(params: P) => {
        return deps.userRepo.find(params);
    };

    const findById = async (id: string): Promise<User | null> => {
        if (!id) throw new ServiceError(`Missing or empty parameter: id`);
        const result = await deps.userRepo.find({ id });
        return result[0] || null;
    };

    const findByUsername = async (username: string): Promise<User | null> => {
        const result = await deps.userRepo.find({ username });
        return result[0] || null;
    };

    const findByEmail = async (email: string): Promise<User | null> => {
        const result = await deps.userRepo.find({ email });
        return result[0] || null;
    };

    const findByUsernameOrEmail = async (usernameOrEmail: string): Promise<User | null> => {
        let result = await deps.userRepo.find({ username: usernameOrEmail });
        if (!result[0]) {
            result = await deps.userRepo.find({ email: usernameOrEmail });
        }
        return result[0] || null;
    };

    const findByVanityId = async (vanity_id: string): Promise<User | null> => {
        const result = await deps.userRepo.find({ vanity_id });
        return result[0] || null;
    };

    const findByFacebookId = async (id: string): Promise<User | null> => {
        const result = await deps.userRepo.find({ facebook_id: id });
        return result[0] || null;
    };

    const getUserWithRoles = async (userId: string): Promise<UserWithRoles> => {
        const result = await deps.userRepo.findById(userId);
        if (!result) throw new Error(`User id not found: ${userId}`);

        return { ...result, roles: await getRoles(result.id) };
    };

    const getRoles = async (userId: string): Promise<UserRole[]> => {
        const result: UserRoleModel[] = await deps.userRoleRepo.find({ userId });
        const roles = result.map(v => v.role as UserRole);
        return roles;
    };

    const getProfile = async (userId: string): Promise<UserProfile | null> => {
        const result = await deps.userProfileRepo.find({ userId });
        return result[0] || null;
    };

    const getRefreshToken = async (id: string) => {
        return deps.refreshTokenRepo.findById(id);
    };

    const createRefreshToken = async (data: RefreshTokenInitializer) => {
        const result = await deps.refreshTokenRepo.create(data);
        if (result?.id && data.previous_refresh_token_id) {
            //update previous token as used
            await deps.refreshTokenRepo.update(data.previous_refresh_token_id, { used_at: new Date() });
        }
        return result;
    };

    const createUser = async (data: UserInitializer): Promise<User> => {
        const username = (data.username || '').trim();
        const password = (data.password || '').trim();

        if (!data.google_id && !data.facebook_id) {
            if (!password) throw new ServiceError('Password required');
            if (validatePassword(password).length > 0) throw new ServiceError('Password invalid');
            if (validateUsername(username).length > 0) throw new ServiceError('Username invalid');

            const moderation = await moderateName(username);
            if (!moderation) throw new Error('Invalid AI moderation result');
            if (!moderation.is_allowed) throw new ServiceError(`AI Moderation: ${moderation.reason}`);
        }

        const checkUsername = await findByUsername(data.username);
        if (checkUsername?.id) throw new ServiceError('The username chosen is already in use by another account', ErrorCode.ALREADY_USED, { param: 'email' });

        const result = await deps.userRepo.create(data);
        return result;
    };

    const isEmailAlreadyUsed = async (email: string) => {
        const result = await deps.userRepo.find({ email });
        return !!result?.[0]?.email_confirmed;
    };

    const isAllowedToEmailConfirmCode = async (userId: UserId) => {
        const user = await deps.userRepo.findById(userId);
        if (!user) throw Error(`User not found: ${userId}`);
        if (!user.email_confirm_code_last_sent_at || !user.email_confirm_code_first_sent_at) return { allowed: true }; //first time sending

        const maxPerHour = 5;
        const resendCooldown = 60 * 2 * 1000; //2 min
        const window = 60 * 60 * 1000; //1 hour
        const windowElapsed = Date.now() - user.email_confirm_code_first_sent_at.getTime() >= window;
        const timeSinceLastSent = Date.now() - user.email_confirm_code_last_sent_at.getTime();

        //still in cooldown: not allowed
        if (timeSinceLastSent < resendCooldown) return { allowed: false, reason: 'cooldown', cooldown: resendCooldown - timeSinceLastSent };

        //already 5 emails sent in the last hour: not allowed
        if (!windowElapsed && user.email_confirm_code_num_sent + 1 > maxPerHour) return { allowed: false, reason: 'max_sent_limit' };

        //reset
        if (windowElapsed) {
            await deps.userRepo.update(userId, { email_confirm_code_num_sent: 0, email_confirm_code_first_sent_at: null, email_confirm_code_last_sent_at: null });
        }

        //allowed
        return { allowed: true };
    };

    const sendEmailConfirmCode = async (userId: UserId, email: string) => {
        //check if email is used
        const emailCheckResult = (await deps.userRepo.find({ email }))[0];
        if (emailCheckResult?.email_confirmed) {
            if (emailCheckResult.id == userId) throw new ServiceError('You are already using this email.');
            throw new ServiceError('The email address is already used in another account.', ErrorCode.ALREADY_USED, { param: 'email' });
        }

        //not existing, create code, send email
        const checkAllowed = await isAllowedToEmailConfirmCode(userId);
        if (!checkAllowed.allowed) {
            if (checkAllowed.reason == 'max_sent_limit') throw new ServiceError('Request limit reached. Please try again after 1 hour.', ErrorCode.MAX_SENT_LIMIT);
            if (checkAllowed.reason == 'cooldown') throw new ServiceError(`Please wait a couple of minutes to send another confirmation code.`, ErrorCode.COOLDOWN, { cooldown: checkAllowed.cooldown });
            throw new Error();
        }

        //generate
        const code = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        const updatedUser = await deps.userRepo.update(userId, { unconfirmed_email: email, email_confirm_code: code });
        if (updatedUser.email_confirm_code != code) return false;

        const mailResult = await mail({
            from: 'jpdm.dev <noreply@jpdm.dev>',
            to: email,
            subject: 'Your 4-digit code',
            text: `Your 4-digit code is: ${code}`
        });

        //TODO add logging here to monitor failed emails?
        if (!mailResult || mailResult.rejected.length > 0 || !mailResult.response) throw new Error(`Problem generating/sending email confirm code for user : ${userId}`);

        //update first/last sent date (for rate limiting)
        await deps.userRepo.update(userId, {
            ...(!updatedUser.email_confirm_code_first_sent_at && { email_confirm_code_first_sent_at: new Date() }),
            email_confirm_code_last_sent_at: new Date(),
            email_confirm_code_num_sent: updatedUser.email_confirm_code_num_sent + 1
        });

        return mailResult;
    };

    const confirmEmailCode = async (userId: UserId, code: string) => {
        //get user
        const user = await deps.userRepo.findById(userId);
        if (!user) throw new Error(`User not found: ${userId}`);
        //if (user.email_confirmed) throw new Error(`Email already confirmed: ${user.email}`);

        //check code is valid
        if (!code || user.email_confirm_code != code) throw new ApiError('That code doesn\'t look right. Please check and try again.');

        //code is valid, update email confirmed
        const updatedUser = await deps.userRepo.update(user.id, { email: user.unconfirmed_email, email_confirm_code: null, unconfirmed_email: null, email_confirmed: true });
        if (!updatedUser) throw new Error(`User email update failed: ${user.id} ${user.unconfirmed_email}`);

        console.log(`User email changed from ${user.email} to ${updatedUser.email}`);

        //send confirmation email
        mail({
            from: 'jpdm.dev <noreply@jpdm.dev>',
            to: updatedUser.email!,
            subject: 'Email Confirmation',
            text: 'Your email address is now confirmed'
        });

        return true;
    };

    const signOut = async (userId: UserId, deviceId: string) => {
        if (!deviceId) return;
        const refreshTokens: RefreshToken[] = await deps.refreshTokenRepo.find({ deviceId, userId });
        refreshTokens.forEach(v => {
            if (!v.is_used) deps.refreshTokenRepo.query(`update refresh_tokens
                                        set revoked_at = now()
                                        where id = $1`, [v.id]);
        });
    };

    const isValidCredentials = async (username: string, password: string): Promise<boolean> => {
        const user = await findByUsernameOrEmail(username);
        if (!user || !user.password) {
            const dummyPw = '$2b$12$6w0EVGd5ym.snFXuONzcZunBbXWR7A4cwmUugFGLfJnn23viNTPnK';
            bcrypt.compare(password, dummyPw);
            return false;
        }

        return bcrypt.compare(password, user.password);
    };

    const getTokenData = async ({ user_id, username, email }: { user_id?: string; username?: string; email?: string }): Promise<PayloadData> => {
        let user;
        if (user_id) {
            user = (await deps.userRepo.find({ id: user_id }))[0];
        } else {
            const identifier = username ?? email;
            if (identifier) {
                user = await findByUsernameOrEmail(identifier);
            }
        }

        if (!user) {
            throw new Error(`Cannot get token data. User not found: user_id: ${user_id}, username: ${username}, email: ${email}`);
        }

        const userWithRoles = await getUserWithRoles(user.id);
        return { id: userWithRoles.id, username: userWithRoles.username, email: userWithRoles.email, roles: userWithRoles.roles };
    };

    const recoverAccount = async (email: string, fingerprint: string) => {
        if (!email || !isValidEmail(email)) throw new ServiceError('Invalid parameter: email', ErrorCode.INVALID_PARAMETER);

        const fingerprintObj = jsonBase64Decode(fingerprint);
        if (!validate(fingerprintObj.device_id)) throw new ServiceError('Invalid parameter: fingerprint', ErrorCode.INVALID_PARAMETER);

        const user = (await deps.userRepo.find({ email, email_confirmed: true }))[0];
        if (!user) throw new ServiceError(`User with confirmed email not found. email: ${email}`);

        //check if already emailed in the last 15 minutes
        const checkAllowed = await isAllowedToSendRecoveryEmail(user.id);
        if (!checkAllowed.allowed) {
            if (checkAllowed.reason == 'cooldown') throw new ServiceError('Email sent just a while ago. Try again later.', ErrorCode.COOLDOWN);
            throw new Error('Email not sent. Try again later.');
        }

        const token_hash = randomString(64);
        const result = await deps.passwordResetRepo.create({ user_id: user.id, token_hash });
        if (!result) throw new ServiceError('Failed creating password reset.');

        const mailResult = await mail({
            from: 'jpdm.dev <noreply@jpdm.dev>',
            to: email,
            subject: 'Account Recovery',
            text: `Hi - You can reset your password using this link:

${process.env.FRONTEND_BASE_URL}/reset-password/${token_hash}

Please disregard if you did not make this request.`
        });

        //TODO add logging here to monitor failed emails?
        if (!mailResult || mailResult.rejected.length > 0 || !mailResult.response) throw new Error(`Problem generating/sending email confirm code for user : ${user.id}`);

        return mailResult;
    };

    const isAllowedToSendRecoveryEmail = async (user_id: UserId) => {
        const user = await deps.userRepo.findById(user_id);
        if (!user) throw new Error(`User not found: ${user_id}`);

        const fifteenMinAgo = new Date(Date.now() - (15 * 60 * 1000));
        const existing = (await deps.passwordResetRepo.find({ user_id: user.id, limit: 1, order_by: 'created_at', order_dir: 'desc' }))[0];
        if (existing && existing.created_at > fifteenMinAgo) return { allowed: false, reason: 'cooldown' };

        return { allowed: true };
    };

    const isResetPasswordTokenHashValid = async (token_hash: string) => {
        if (!token_hash) throw new ServiceError('Missing/empty parameter: token_hash');

        const result = (await deps.passwordResetRepo.find({ token_hash }))[0];
        if (!result || result.used_at || result.expires_at < new Date()) return false;
        return true;
    };

    const resetPassword = async (token_hash: string, password: string) => {
        if (!await isResetPasswordTokenHashValid(String(token_hash))) throw new ServiceError('Token is invalid, expired, or already used.', ErrorCode.TOKEN_INVALID)

        if (!password) throw new ServiceError('Missing or empty parameter: password', ErrorCode.MISSING_PARAMETER);
        if (validatePassword(password).length > 0) throw new ServiceError('Invalid password', ErrorCode.INVALID_PARAMETER);

        const passwordReset = (await deps.passwordResetRepo.find({ token_hash }))[0];
        if (!passwordReset) throw new Error('Password reset token not found');

        //update password
        const user = await deps.userRepo.update(passwordReset.user_id, { password: await bcrypt.hash(password, 12) });
        if (!user) throw new Error(`Cannot reset password. user_id: ${passwordReset.user_id}`);

        await deps.passwordResetRepo.update(passwordReset.id, { used_at: new Date() });

        const mailResult = await mail({
            from: 'jpdm.dev <noreply@jpdm.dev>',
            to: user.email!,
            subject: 'Password reset successful',
            text: `Hi,

Your account password was successfully updated.

If you initiated this change, you can safely ignore this message.

If you don't recognize this activity, please reset your password immediately and contact support.

Stay safe,
The Support Team`
        });

        if (!mailResult || mailResult.rejected.length > 0 || !mailResult.response) throw new Error(`Problem generating/sending email confirm code for user : ${user.id}`);

        return mailResult;
    };

    const createUserFromSocialLogin = async (email: string, profile: GoogleProfile) => {
        const emailUsername = getEmailUsername(email).replace(/[^A-Za-z0-9]/g, '').trim();
        if (!emailUsername) throw new Error('No email username found in profile email');

        let newUsername = emailUsername;
        let findUsername = await findByUsername(newUsername);

        let attempt = 0;
        const maxAttempts = 10;
        while (findUsername && attempt < maxAttempts) {
            attempt++;
            const rand4Digits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            newUsername = `${emailUsername}${rand4Digits}`;
            findUsername = await findByUsername(newUsername);
        }

        if (findUsername) throw new Error('Could not generate unique username');

        const newUser = await createUser({
            username: newUsername,
            email,
            ...(profile.provider == 'google' && { google_id: profile.id })
        });

        return newUser;
    };

    const createUserFromFacebookLogin = async (id: string, profile: FacebookProfile) => {
        if (!id) throw new Error('Missing or empty parameter: id');
        const email = profile.emails?.[0]?.value.trim();

        let baseUsername;
        if (email) {
            baseUsername = getEmailUsername(email).replace(/[^A-Za-z0-9]/g, '').trim();
        } else {
            baseUsername = profile.name?.givenName && profile.name.givenName.length >= 2 ? profile.name.givenName : generateRandomUsername({ numberPart: false });
        }

        let newUsername = baseUsername;
        let findUsername = await findByUsername(newUsername);

        let attempt = 0;
        const maxAttempts = 10;
        while (findUsername && attempt < maxAttempts) {
            attempt++;
            const rand4Digits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            newUsername = `${baseUsername}${rand4Digits}`;
            findUsername = await findByUsername(newUsername);
        }

        if (findUsername) throw new Error('Could not generate unique username');

        const newUser = await createUser({
            username: newUsername,
            facebook_id: profile.id,
            ...(email && { email })
        });

        return newUser;
    };

    const update = async (id: UserId, params: UpdateParams) => {
        const { old_password, new_password, deleted, deleted_at } = params;
        if (!id) throw new ServiceError('Missing parameter: id');
        if (!await canModify(id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        if (old_password && new_password) {
            const user = await findById(id);
            if (!user?.id) throw new ServiceError('User not found.');
            if (!await bcrypt.compare(old_password, user.password || '')) throw new ServiceError('Incorrect old password.', ErrorCode.INVALID_CREDENTIALS);
            if (await bcrypt.compare(new_password, user.password || '')) throw new ServiceError('New password is the same as the old password.', ErrorCode.INVALID_CREDENTIALS);
        }

        const updated = await deps.userRepo.update(id, {
            ...(new_password && { password: await bcrypt.hash(new_password, 12), password_updated_at: new Date() }),
            ...('deleted' in params && { deleted }),
            ...(deleted_at && { deleted_at })
        });

        const result = (await get({ id: updated?.id }))[0];
        if (!result?.id) throw new ServiceError('User not found.');

        if (new_password) {
            await deps.refreshTokenRepo.markUserRefreshTokensAsUsed(result.id);
        }

        return result;
    };

    const del = async (id: UserId, params: DeleteParams) => {
        const { password, token } = params;
        if (!password && !token) throw new ServiceError('Missing or empty required parameter: password or token');
        if (!await canModify(id)) throw new ServiceError('Forbidden', ErrorCode.FORBIDDEN);

        const user = await findById(id);
        if (password && !await bcrypt.compare(password, user?.password || '')) throw new ServiceError('Incorrect password', ErrorCode.INVALID_CREDENTIALS);
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as Jwt;
            if (!decoded.id || decoded.scope != 'delete_account') throw new ServiceError('Invalid delete token');
            if (decoded.id != id) throw new ServiceError('Unauthorized request', ErrorCode.NOT_ALLOWED);
        }

        const deleted = await deps.userRepo.delete(id);
        if (!deleted?.id) throw new Error(`Failed deleting user: ${id}`);

        deps.refreshTokenRepo.markUserRefreshTokensAsRevoked(id);

        return deleted;
    };

    const toMe = (user: User | null): MeDTO => {
        if (!user) throw new ServiceError(`Missing or empty parameter: user`);

        const result: MeDTO = {
            id: user.id,
            username: user.username,
            created_at: user.created_at,
            updated_at: user.updated_at,
            email: user.email,
            has_password: !!user.password,
            social_login: user.google_id ? 'google' : (user.facebook_id ? 'facebook' : null),
            password_updated_at: user.password_updated_at
        }

        return result;
    };

    const canModify = async (id: UserId) => {
        const user = await deps.userRepo.findById(id);
        if (!user) return false;

        return _canModify(actor, user.id);
    };

    return {
        get,
        findById,
        findByUsername,
        findByEmail,
        findByUsernameOrEmail,
        findByVanityId,
        findByFacebookId,
        getUserWithRoles,
        getRoles,
        getProfile,
        getRefreshToken,
        createRefreshToken,
        createUser,
        isEmailAlreadyUsed,
        isAllowedToEmailConfirmCode,
        sendEmailConfirmCode,
        confirmEmailCode,
        signOut,
        isValidCredentials,
        getTokenData,
        recoverAccount,
        isAllowedToSendRecoveryEmail,
        isResetPasswordTokenHashValid,
        resetPassword,
        createUserFromSocialLogin,
        createUserFromFacebookLogin,
        update,
        delete: del,
        toMe,
        canModify
    };
};