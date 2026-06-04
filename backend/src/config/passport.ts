import { pool } from '@/infra/db.js';
import { makeDeps } from '@/infra/makeDeps.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import { createUserProfileService } from '@/services/userProfileService.js';
import { createUserService } from '@/services/userService.js';
import { downloadImage, getUserAvatarDir } from '@/utils/helper.js';
import { NIL_UUID } from '@shared/constants/uuid.js';
import passport from 'passport';
import { Strategy as FacebookStrategy, type Profile as FacebookProfile } from 'passport-facebook';
import { Strategy as GoogleStrategy, type Profile as GoogleProfile, type VerifyCallback as GoogleVerifyCallback } from 'passport-google-oauth20';
import path from 'path';
import { APP_URL, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, USERCONTENT_DIR } from './config.js';

// Create system context for passport strategies
const systemContext: ServiceContext = {
    deps: makeDeps(pool),
    actor: { type: 'system', id: NIL_UUID }
};

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${APP_URL}/api/auth/google/callback`
    }, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: GoogleVerifyCallback) => {
        try {
            if (!profile || !profile.emails?.[0]?.value) {
                const message = 'Google oauth profile or profile email is empty';
                console.error(message);
                throw new Error(message);
            }

            console.debug({ profile, emails: profile.emails, photos: profile.photos });

            const email = profile.emails[0].value.trim();
            const userSvc = createUserService(systemContext);
            const userProfileSvc = createUserProfileService(systemContext);
            let user = await userSvc.findByEmail(email);

            //create new user
            user = user ?? await userSvc.createUserFromSocialLogin(email, profile);
            await userSvc.update(user.id, { deleted: null, deleted_at: null });

            const userProfile = (await userProfileSvc.get({ user_id: user.id }))[0];
            const avatar_url = profile.photos?.[0]?.value;
            const first_name = profile.name?.givenName;
            const last_name = profile.name?.familyName;
            const profileParams = {
                ...(first_name && { first_name }),
                ...(last_name && { last_name })
            };

            if (!userProfile) {
                //create user profile
                await userProfileSvc.create({ user_id: user.id, ...profileParams });
            } else {
                //update user profile
                await userProfileSvc.update(userProfile.id, profileParams);
            }

            if (avatar_url) {
                const userAvatarDir = path.resolve(USERCONTENT_DIR, getUserAvatarDir(user.id));
                const avatarFile = await downloadImage(avatar_url, userAvatarDir);
                avatarFile && await userProfileSvc.setImageFileToUserAvatar(avatarFile, user.id);
            }

            done(null, { id: user.id, username: user.username, email: user.email, roles: await userSvc.getRoles(user.id), type: 'user' });
        } catch (error) {
            done(error);
        }
    }));
}

if (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: `${APP_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'email', 'name', 'picture']
    }, async (accessToken: string, refreshToken: string, profile: FacebookProfile, done) => {
        try {
            console.debug({ profile, emails: profile.emails, photos: profile.photos });
            //note: fb user email now requires business verification (2025-12-25)
            if (!profile || !profile.id) {
                const message = 'Facebook oauth profile or profile id is empty';
                console.error(message);
                throw new Error(message);
            }

            const email = profile.emails?.[0]?.value.trim();
            const id = profile.id;
            const userSvc = createUserService(systemContext);
            const userProfileSvc = createUserProfileService(systemContext);
            let user = email ? await userSvc.findByEmail(email) : await userSvc.findByFacebookId(id);

            //create new user
            user = user ?? await userSvc.createUserFromFacebookLogin(id, profile);
            await userSvc.update(user.id, { deleted: null, deleted_at: null });

            const userProfile = (await userProfileSvc.get({ user_id: user.id }))[0];
            const avatar_url = profile.photos?.[0]?.value;
            const first_name = profile.name?.givenName;
            const last_name = profile.name?.familyName;
            const profileParams = {
                ...(first_name && { first_name }),
                ...(last_name && { last_name })
            };

            if (!userProfile) {
                //create user profile
                await userProfileSvc.create({ user_id: user.id, ...profileParams });
            } else {
                //update user profile
                await userProfileSvc.update(userProfile.id, profileParams);
            }

            if (avatar_url) {
                const userAvatarDir = path.resolve(USERCONTENT_DIR, getUserAvatarDir(user.id));
                const avatarFile = await downloadImage(avatar_url, userAvatarDir);
                avatarFile && await userProfileSvc.setImageFileToUserAvatar(avatarFile, user.id);
            }

            done(null, { id: user.id });
        } catch (error) {
            done(error);
        }
    }));
}
