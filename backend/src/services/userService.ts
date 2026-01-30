import { ServiceError } from '@/errors/ServiceError';
import { PasswordResetRepository } from '@/repositories/PasswordResetRepository';
import * as userProfileService from '@/services/userProfileService';
import type { FindParamsBase } from '@/types/FindParams';
import { randomString } from '@/utils/helper';
import type { MeDTO } from '@shared/models/dto/MeDTO';
import type UserWithRoles from '@shared/models/extensions/UserWithRoles';
import type { RefreshTokenInitializer } from '@shared/models/generated/RefreshToken';
import type { User, UserId, UserInitializer, UserMutator } from '@shared/models/generated/User';
import type { UserProfile } from '@shared/models/generated/UserProfile';
import type { UserRole } from '@shared/models/generated/UserRole';
import { ErrorCode } from '@shared/types/ErrorCode';
import type { Jwt, PayloadData } from '@shared/types/Jwt';
import type { OrderDirection } from '@shared/types/OrderDirection';
import type { UserIdentity } from '@shared/types/User';
import { jsonBase64Decode } from '@shared/utils/encoding';
import { generateRandomUsername, getEmailUsername } from '@shared/utils/username';
import { isValidEmail, validatePassword } from '@shared/utils/validation';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Profile as FacebookProfile } from 'passport-facebook';
import type { Profile as GoogleProfile } from 'passport-google-oauth20';
import { validate } from 'uuid';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { UserProfileRepository } from '../repositories/UserProfileRepository';
import { UserRepository } from '../repositories/UserRepository';
import { UserRoleRepository } from '../repositories/UserRoleRepository';
import { ApiError } from '../utils/apiHelper';
import { mail } from '../utils/mailer';

type GetParams = {
    current_user_id?: UserId;
    id?: UserId;
    page_num?: number;
    page_size?: number;
    order_by?: string;
    order_dir?: OrderDirection;
}

type UpdateParams = UserMutator & {
    old_password?: string;
    new_password?: string;
};

type DeleteParams = {
    password?: string;
    token?: string;
};

type Context = {
    isSystem?: boolean;
    actor?: UserIdentity;
}

export const isValidCredentials = async (username: string, password: string): Promise<boolean> => {
    const user = await findByUsernameOrEmail(username);
    if (!user || !user.password) {
        const dummyPw = '$2b$12$6w0EVGd5ym.snFXuONzcZunBbXWR7A4cwmUugFGLfJnn23viNTPnK';
        bcrypt.compare(password, dummyPw);
        return false;
    }

    return bcrypt.compare(password, user.password);
}

export const getTokenData = async ({ user_id, username, email }: { user_id?: string; username?: string; email?: string }): Promise<PayloadData> => {
    let user;
    if (user_id) {
        const repo = new UserRepository();
        user = (await repo.find({ id: user_id }))[0];
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
    return { id: userWithRoles.id, username: userWithRoles.username, email: userWithRoles.email, roles: userWithRoles.roles.map(v => v.role) };
}

export const findByUsername = async (username: string): Promise<User | null> => {
    const repo = new UserRepository();
    const result = await repo.find({ username });
    return result[0] || null;
}

export const findByEmail = async (email: string): Promise<User | null> => {
    const repo = new UserRepository();
    const result = await repo.find({ email });
    return result[0] || null;
}

export const findByUsernameOrEmail = async (usernameOrEmail: string): Promise<User | null> => {
    const repo = new UserRepository();
    let result = await repo.find({ username: usernameOrEmail });
    if (!result[0]) {
        result = await repo.find({ email: usernameOrEmail });
    }
    return result[0] || null;
}

export const getUserWithRoles = async (userId: string): Promise<UserWithRoles> => {
    const repo = new UserRepository();
    const result = await repo.findById(userId);
    if (!result) throw new Error(`User id not found: ${userId}`);

    return { ...result, roles: await getRoles(result.id) };
}

export const getRoles = async (userId: string): Promise<UserRole[]> => {
    const repo = new UserRoleRepository();
    const result = await repo.find({ userId });
    return result;
}

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
    const repo = new UserProfileRepository();
    const result = await repo.find({ userId });
    return result[0] || null;
}

export const getRefreshToken = async (id: string) => {
    const repo = new RefreshTokenRepository();
    return repo.findById(id);
};

export const createRefreshToken = async (data: RefreshTokenInitializer) => {
    const repo = new RefreshTokenRepository();
    const result = await repo.create(data);
    if (result?.id && data.previous_refresh_token_id) {
        //update previous token as used
        await repo.update(data.previous_refresh_token_id, { used_at: new Date() });
    }
    return result;
}

export const createUser = async (data: UserInitializer): Promise<User> => {
    const repo = new UserRepository();

    const checkUsername = await findByUsername(data.username);
    if (checkUsername?.id) throw new ServiceError('The username chosen is already in use by another account', ErrorCode.ALREADY_USED, { param: 'email' });

    const result = await repo.create(data);
    return result;
}

export const isEmailAlreadyUsed = async (email: string) => {
    const repo = new UserRepository();
    const result = await repo.find({ email });
    return !!result?.[0]?.email_confirmed;
}

export const isAllowedToEmailConfirmCode = async (userId: UserId) => {
    const repo = new UserRepository();
    const user = await repo.findById(userId);
    if (!user) throw Error(`User not found: ${userId}`);
    if (!user.email_confirm_code_last_sent_at || !user.email_confirm_code_first_sent_at) return { allowed: true }; //first time sending

    const maxPerHour = 5;
    const resendCooldown = 60 * 2 * 1000; //2 min
    const window = 60 * 60 * 1000; //1 hour
    const windowElapsed = Date.now() - user.email_confirm_code_first_sent_at.getTime() >= window;
    const timeSinceLastSent = Date.now() - user.email_confirm_code_last_sent_at.getTime();

    //still in cooldown: not allowed
    //console.log({ timeSinceLastSent, resendCooldown });
    if (timeSinceLastSent < resendCooldown) return { allowed: false, reason: 'cooldown', cooldown: resendCooldown - timeSinceLastSent };

    //already 5 emails sent in the last hour: not allowed
    if (!windowElapsed && user.email_confirm_code_num_sent + 1 > maxPerHour) return { allowed: false, reason: 'max_sent_limit' };

    //reset
    if (windowElapsed) {
        await repo.update(userId, { email_confirm_code_num_sent: 0, email_confirm_code_first_sent_at: null, email_confirm_code_last_sent_at: null });
    }

    //allowed
    return { allowed: true };
}

export const sendEmailConfirmCode = async (userId: UserId, email: string) => {
    //check if email is used
    const repo = new UserRepository();
    const emailCheckResult = (await repo.find({ email }))[0];
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
    const updatedUser = await repo.update(userId, { unconfirmed_email: email, email_confirm_code: code });
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
    await repo.update(userId, {
        ...(!updatedUser.email_confirm_code_first_sent_at && { email_confirm_code_first_sent_at: new Date() }),
        email_confirm_code_last_sent_at: new Date(),
        email_confirm_code_num_sent: updatedUser.email_confirm_code_num_sent + 1
    });

    return mailResult;
}

export const confirmEmailCode = async (userId: UserId, code: string) => {
    //get user
    const repo = new UserRepository();
    const user = await repo.findById(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    if (user.email_confirmed) throw new Error(`Email already confirmed: ${user.email}`);

    //check code is valid
    if (!code || user.email_confirm_code != code) throw new ApiError('That code doesn\'t look right. Please check and try again.');

    //code is valid, update email confirmed
    const updatedUser = await repo.update(user.id, { email: user.unconfirmed_email, email_confirm_code: null, unconfirmed_email: null, email_confirmed: true });
    if (!updatedUser) throw new Error(`User email update failed: ${user.id} ${user.unconfirmed_email}`);

    //send confirmation email
    mail({
        from: 'jpdm.dev <noreply@jpdm.dev>',
        to: updatedUser.email!,
        subject: 'Email Confirmation',
        text: 'Your email address is now confirmed'
    });

    return true;
}

export const signOut = async (userId: UserId, deviceId: string) => {
    if (!deviceId) return;
    const repo = new RefreshTokenRepository();
    const refreshTokens = await repo.find({ deviceId, userId });
    refreshTokens.forEach(v => {
        //repo.delete(v.id);
        if (!v.is_used) repo.query(`update refresh_tokens
                                    set revoked_at = now()
                                    where id = $1`, [v.id]);
    });
}

export const findById = async (id: string): Promise<User | null> => {
    if (!id) throw new ServiceError(`Missing or empty parameter: id`);
    const repo = new UserRepository();
    const result = await repo.find({ id });
    return result[0] || null;
}

export const findByVanityId = async (vanity_id: string): Promise<User | null> => {
    const repo = new UserRepository();
    const result = await repo.find({ vanity_id });
    return result[0] || null;
}

export const recoverAccount = async (email: string, fingerprint: string) => {
    if (!email || !isValidEmail(email)) throw new ServiceError('Invalid parameter: email', ErrorCode.INVALID_PARAMETER);

    const fingerprintObj = jsonBase64Decode(fingerprint);
    if (!validate(fingerprintObj.device_id)) throw new ServiceError('Invalid parameter: fingerprint', ErrorCode.INVALID_PARAMETER);

    const userRepo = new UserRepository();
    const user = (await userRepo.find({ email, email_confirmed: true }))[0];
    if (!user) throw new ServiceError(`User with confirmed email not found. email: ${email}`);

    //check if already emailed in the last 15 minutes
    const checkAllowed = await isAllowedToSendRecoveryEmail(user.id);
    if (!checkAllowed.allowed) {
        if (checkAllowed.reason == 'cooldown') throw new ServiceError('Still on cooldown...', ErrorCode.COOLDOWN);
        throw new Error('isAllowedToSendRecoveryEmail not allowed for some reason');
    }

    const passwordResetRepo = new PasswordResetRepository();
    const token_hash = randomString(64);
    const result = await passwordResetRepo.create({ user_id: user.id, token_hash });
    if (!result) throw new ServiceError('Failed creating password reset.');

    const mailResult = await mail({
        from: 'jpdm.dev <noreply@jpdm.dev>',
        to: email,
        subject: 'Account Recovery',
        text: `Hi - You can reset your password using this link:

${process.env.SITE_URL}/reset-password/${token_hash}

Please disregard if you did not make this request.`
    });

    //TODO add logging here to monitor failed emails?
    if (!mailResult || mailResult.rejected.length > 0 || !mailResult.response) throw new Error(`Problem generating/sending email confirm code for user : ${user.id}`);

    return mailResult;
}

export const isAllowedToSendRecoveryEmail = async (user_id: UserId) => {
    const repo = new UserRepository();
    const user = await repo.findById(user_id);
    if (!user) throw new Error(`User not found: ${user_id}`);

    const pwResRepo = new PasswordResetRepository();
    const fifteenMinAgo = new Date(Date.now() - (15 * 60 * 1000));
    const existing = (await pwResRepo.find({ user_id: user.id, limit: 1, order_by: 'created_at', order_dir: 'desc' }))[0];
    if (existing && existing.created_at > fifteenMinAgo) return { allowed: false, reason: 'cooldown' };

    return { allowed: true };
}

export const isResetPasswordTokenHashValid = async (token_hash: string) => {
    if (!token_hash) throw new ServiceError('Missing/empty parameter: token_hash');

    const repo = new PasswordResetRepository();
    const result = (await repo.find({ token_hash }))[0];
    if (!result || result.used_at || result.expires_at < new Date()) return false;
    return true;
}

export const resetPasword = async (token_hash: string, password: string) => {
    if (!await isResetPasswordTokenHashValid(String(token_hash))) throw new ServiceError('Token is invalid, expired, or already used.', ErrorCode.TOKEN_INVALID)

    if (!password) throw new ServiceError('Missing or empty parameter: password', ErrorCode.MISSING_PARAMETER);
    if (validatePassword(password).length > 0) throw new ServiceError('Invalid password', ErrorCode.INVALID_PARAMETER);

    const pwResetRepo = new PasswordResetRepository();
    const passwordReset = (await pwResetRepo.find({ token_hash }))[0];
    if (!passwordReset) throw new Error('Password reset token not found');

    //update password
    const repo = new UserRepository();
    const user = await repo.update(passwordReset.user_id, { password: await bcrypt.hash(password, 12) });
    if (!user) throw new Error(`Cannot reset password. user_id: ${passwordReset.user_id}`);

    await pwResetRepo.update(passwordReset.id, { used_at: new Date() });

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
}

export const createUserFromSocialLogin = async (email: string, profile: GoogleProfile) => {
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

    const avatar_url = profile.photos?.[0]?.value;
    const first_name = profile.name?.givenName;
    const last_name = profile.name?.familyName;
    userProfileService.create({
        user_id: newUser.id,
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(avatar_url && { avatar_url })
    });

    return newUser;
}

export const createUserFromFacebookLogin = async (id: string, profile: FacebookProfile) => {
    if (!id) throw new Error('Missing or empty parameter: id');

    let newUsername = profile.name?.givenName && profile.name.givenName.length >= 2 ? profile.name.givenName : generateRandomUsername({ numberPart: false });
    let findUsername = await findByUsername(newUsername);

    let attempt = 0;
    const maxAttempts = 10;
    while (findUsername && attempt < maxAttempts) {
        attempt++;
        const rand4Digits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        newUsername = `${newUsername}${rand4Digits}`;
        findUsername = await findByUsername(newUsername);
    }

    if (findUsername) throw new Error('Could not generate unique username');

    const newUser = await createUser({
        username: newUsername,
        facebook_id: profile.id
    });

    const avatar_url = profile.photos?.[0]?.value;
    const first_name = profile.name?.givenName;
    const last_name = profile.name?.familyName;
    userProfileService.create({
        user_id: newUser.id,
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(avatar_url && { avatar_url })
    });

    return newUser;
}

export const findByFacebookId = async (id: string): Promise<User | null> => {
    const repo = new UserRepository();
    const result = await repo.find({ facebook_id: id });
    return result[0] || null;
}

export const get = async <P extends FindParamsBase>(params: P) => {
    const { id, page_num, page_size, order_by, order_dir } = params as GetParams;
    const repo = new UserRepository();

    const findParams = {
        ...(id && { id }),
        ...(page_num && { page_num }),
        ...(page_size && { page_size }),
        ...(order_by && { order_by }),
        ...(order_dir && { order_dir }),
    } as P;

    const findResult = await repo.find(findParams);

    // const items = ('page_items' in findResult ? findResult.page_items : findResult) as User[];
    // for (const item of items) {
    //     item.display_name = await getDisplayName(item.user_id);
    // }

    return findResult;
}

export const update = async (id: UserId, params: UpdateParams, context: Context) => {
    const { old_password, new_password, deleted, deleted_at } = params;
    const { actor, isSystem } = context;
    if (!id) throw new ServiceError('Missing parameter: id');
    if (!isSystem && !actor?.roles.includes('admin') && actor?.id != id) throw new ServiceError('Unauthorized request');

    if (old_password && new_password) {
        const user = await findById(id);
        if (!user?.id) throw new ServiceError('User not found.');
        if (!await bcrypt.compare(old_password, user.password || '')) throw new ServiceError('Incorrect old password.', ErrorCode.INVALID_CREDENTIALS);
        if (await bcrypt.compare(new_password, user.password || '')) throw new ServiceError('New password is the same as the old password.', ErrorCode.INVALID_CREDENTIALS);
    }

    const repo = new UserRepository();
    const updated = await repo.update(id, {
        ...(new_password && { password: await bcrypt.hash(new_password, 12), password_updated_at: new Date() }),
        ...('deleted' in params && { deleted }),
        ...(deleted_at && { deleted_at })
    });

    const result = (await get({ id: updated?.id }))[0];
    if (!result?.id) throw new ServiceError('User not found.');

    if (new_password) {
        const refreshTokenRepo = new RefreshTokenRepository();
        await refreshTokenRepo.markUserRefreshTokensAsUsed(result.id);
    }

    return result;
}

export const del = async (id: UserId, params: DeleteParams, context: Context) => {
    const { password, token } = params;
    const { actor, isSystem } = context;

    if (!isSystem && !actor?.roles.includes('admin')) {
        if (!password && !token) throw new ServiceError('Missing or empty require parameter: password or token');
        if (actor?.id != id) throw new ServiceError('Unauthorized request');
    }

    const user = await findById(id);
    if (!user) throw new Error(`User not found. id: ${id}`);
    if (password && !await bcrypt.compare(password, user.password || '')) throw new ServiceError('Incorrect password', ErrorCode.INVALID_CREDENTIALS);
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as Jwt;
        if (!decoded.id || decoded.scope != 'delete_account') throw new ServiceError('Invalid delete token');
        if (decoded.id != id) throw new ServiceError('Unauthorized request');
    }

    const repo = new UserRepository();
    const deleted = await repo.delete(id);
    if (!deleted?.id) throw new Error(`Failed deleting user. id: ${id}`);

    new RefreshTokenRepository().markUserRefreshTokensAsRevoked(id);

    return deleted;
}

export const toMe = (user: User | null): MeDTO => {
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
}