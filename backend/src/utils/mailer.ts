import nodemailer from 'nodemailer';

export const mail = async ({ from, to, subject, text }: { from: string, to: string, subject: string, text: string }) => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const servername = process.env.SMTP_SERVER_NAME;
    const auth = user && pass ? {
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    } : {};
    const tls = {
        tls: {
            ...(servername && { servername }),
            rejectUnauthorized: process.env.NODE_ENV === 'production' //false on dev only, true makes sure the "host" param matches the host in the mail server cert
        }
    }

    try {
        console.log(process.env.SMTP_HOST, process.env.SMTP_PORT);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            //secure: process.env.SMTP_PORT === '465',
            secure: process.env.SMTP_SECURE === 'true', //only true only if using port 465
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