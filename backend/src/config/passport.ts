import * as userProfileService from '@/services/userProfileService';
import * as userService from '@/services/userService';
import passport from 'passport';
import { Strategy as FacebookStrategy, type Profile as FacebookProfile } from 'passport-facebook';
import { Strategy as GoogleStrategy, type Profile as GoogleProfile, type VerifyCallback as GoogleVerifyCallback } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/auth/google/callback'
}, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: GoogleVerifyCallback) => {
    try {
        if (!profile || !profile.emails?.[0]?.value) {
            const message = 'Google oauth profile or profile email is empty';
            console.error(message);
            throw new Error(message);
        }

        console.log({ profile, emails: profile.emails, photos: profile.photos });

        const email = profile.emails[0].value.trim();
        let user = await userService.findByEmail(email);

        //create new user
        if (!user) {
            user = await userService.createUserFromSocialLogin(email, profile);
        } else {
            const userProfile = (await userProfileService.get({ user_id: user.id }))[0];
            const avatar_url = profile.photos?.[0]?.value;
            const first_name = profile.name?.givenName;
            const last_name = profile.name?.familyName;
            if (!userProfile) {
                //create user profile
                userProfileService.create({
                    user_id: user.id,
                    ...(first_name && { first_name }),
                    ...(last_name && { last_name }),
                    ...(avatar_url && { avatar_url })
                });
            } else {
                //update user profile
                userProfileService.update(userProfile.id, {
                    ...(first_name && { first_name }),
                    ...(last_name && { last_name }),
                    ...(avatar_url && { avatar_url })
                });
            }
        }

        done(null, { id: user.id });
    } catch (error) {
        done(error);
    }
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'picture']
}, async (accessToken: string, refreshToken: string, profile: FacebookProfile, done) => {
    try {
        console.log({ profile, emails: profile.emails, photos: profile.photos });
        //note: fb user email now requires business verification (2025-12-25)
        if (!profile || !profile.id) {
            const message = 'Facebook oauth profile or profile id is empty';
            console.error(message);
            throw new Error(message);
        }

        //const email = profile.emails[0].value.trim();
        const id = profile.id;
        let user = await userService.findByFacebookId(id);

        //create new user
        if (!user) {
            user = await userService.createUserFromFacebookLogin(id, profile);
        } else {
            const userProfile = (await userProfileService.get({ user_id: user.id }))[0];
            const avatar_url = profile.photos?.[0]?.value;
            const first_name = profile.name?.givenName;
            const last_name = profile.name?.familyName;
            if (!userProfile) {
                //create user profile
                userProfileService.create({
                    user_id: user.id,
                    ...(first_name && { first_name }),
                    ...(last_name && { last_name }),
                    ...(avatar_url && { avatar_url })
                });
            } else {
                //update user profile
                userProfileService.update(userProfile.id, {
                    ...(first_name && { first_name }),
                    ...(last_name && { last_name }),
                    ...(avatar_url && { avatar_url })
                });
            }
        }

        done(null, { id: user.id });
    } catch (error) {
        done(error);
    }
}));