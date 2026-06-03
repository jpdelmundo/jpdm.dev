import { ServiceError } from "@/errors/ServiceError.js";
import { ErrorCode } from "@shared/types/ErrorCode.js";

export const botCheck = async (captchaToken: string) => {
    const captchaVerifyResult = await verifyCaptcha(captchaToken);
    if (!captchaVerifyResult.success) throw new ServiceError('Security check failed');
    if (captchaVerifyResult.score <= 0.5) throw new ServiceError('Low captcha score', ErrorCode.BOT_DETECTED);
}

export const verifyCaptcha = async (token: string) => {
    const captchaKey = process.env.RECAPTCHAV3_SECRET_KEY;
    if (!captchaKey) return { success: true, score: 1 };

    const captchaVerifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'post',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            secret: process.env.RECAPTCHAV3_SECRET_KEY as string,
            response: token
        }).toString()
    });

    return await captchaVerifyResponse.json() as {
        success: boolean;
        score: number;
    };
}