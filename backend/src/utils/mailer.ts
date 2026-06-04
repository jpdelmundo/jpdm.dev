import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_SECURE, SMTP_SERVER_NAME, SMTP_USER } from '@/config/config.js';
import nodemailer from 'nodemailer';

export const mail = async ({ from, to, subject, text }: { from: string, to: string, subject: string, text: string }) => {
    const user = SMTP_USER;
    const pass = SMTP_PASS;
    const servername = SMTP_SERVER_NAME;
    const auth = user && pass ? {
        auth: {
            user: user,
            pass: pass
        }
    } : {};
    const tls = {
        tls: {
            ...(servername && { servername }),
            rejectUnauthorized: process.env.NODE_ENV === 'production' //false on dev only, true makes sure the "host" param matches the host in the mail server cert
        }
    }

    try {
        console.log(SMTP_HOST, SMTP_PORT);
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST as string,
            port: Number(SMTP_PORT),
            //secure: SMTP_PORT === '465',
            secure: SMTP_SECURE === 'true', //only true only if using port 465
            ...auth,
            ...tls
        });

        const result = await transporter.sendMail({ from, to, subject, text });
        console.log('Email sent', { result });
        return result;
    } catch (error) {
        console.error('Cannot send email', { error });
        return false;
    }
}