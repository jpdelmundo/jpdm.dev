import { ServiceError } from '@/errors/ServiceError';
import type UserWithRoles from '@shared/models/extensions/UserWithRoles';
import type { RefreshTokenInitializer } from '@shared/models/generated/RefreshToken';
import type { User, UserId, UserInitializer } from '@shared/models/generated/User';
import type { UserProfile } from '@shared/models/generated/UserProfile';
import type { UserRole } from '@shared/models/generated/UserRole';
import { ErrorCode } from '@shared/types/ErrorCode';
import type { TokenUserData } from '@shared/types/Jwt';
import * as bcrypt from 'bcrypt';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { UserProfileRepository } from '../repositories/UserProfileRepository';
import { UserRepository } from '../repositories/UserRepository';
import { UserRoleRepository } from '../repositories/UserRoleRepository';
import { ApiError } from '../utils/apiHelper';
import { mail } from '../utils/mailer';

export const isValidCredentials = async (username: string, password: string): Promise<boolean> => {
    const user = await findByUsernameOrEmail(username);
    return bcrypt.compare(password, user?.password || '');
}

export const getTokenData = async ({ user_id, username, email }: { user_id?: string; username?: string; email?: string }): Promise<TokenUserData> => {
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
    if (await isEmailAlreadyUsed(email)) throw new ServiceError('The email address is already used in another account.', ErrorCode.ALREADY_USED, { param: 'email' });
    //not existing, create code, send email

    const checkAllowed = await isAllowedToEmailConfirmCode(userId);
    if (!checkAllowed.allowed) {
        if (checkAllowed.reason == 'max_sent_limit') throw new ServiceError('Request limit reached. Please try again after 1 hour.', ErrorCode.MAX_SENT_LIMIT);
        if (checkAllowed.reason == 'cooldown') throw new ServiceError('Still on cooldown...', ErrorCode.COOLDOWN, { cooldown: checkAllowed.cooldown });
        throw new Error();
    }

    //generate
    const repo = new UserRepository();
    const code = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const result = await repo.update(userId, { unconfirmed_email: email, email_confirm_code: code });
    if (result?.[0]?.email_confirm_code != code) return false;

    const mailResult = await mail({
        from: 'jpdm.dev <noreply@jpdm.dev>',
        to: email,
        subject: 'Your 4-digit code',
        text: `Your 4-digit code is: ${code}`
    });

    //TODO add logging here to monitor failed emails?
    if (!mailResult || mailResult.rejected.length > 0 || !mailResult.response) throw new Error(`Problem generating/sending email confirm code for user : ${userId}`);

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
    if (!updatedUser || !updatedUser[0]) throw new Error(`User email update failed: ${user.id} ${user.unconfirmed_email}`);

    //send confirmation email
    mail({
        from: 'jpdm.dev <noreply@jpdm.dev>',
        to: updatedUser[0].email!,
        subject: 'Email Confirmation',
        text: 'Your email address is now confirmed'
    });

    return true;
}

export const signOutUser = async (userId: UserId, deviceId: string) => {
    if (!deviceId) return
    const repo = new RefreshTokenRepository();
    const refreshTokens = await repo.find({ deviceId, userId });
    refreshTokens.forEach(v => {
        //repo.delete(v.id);
        if (!v.is_used) repo.query(`update refresh_tokens
                                    set used_at = now()
                                    where id = $1`, [v.id]);
    });
}

export const findById = async (id: string): Promise<User | null> => {
    const repo = new UserRepository();
    const result = await repo.find({ id });
    return result[0] || null;
}

export const findByVanityId = async (vanity_id: string): Promise<User | null> => {
    const repo = new UserRepository();
    const result = await repo.find({ vanity_id });
    return result[0] || null;
}