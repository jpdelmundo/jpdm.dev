import nodemailer from 'nodemailer';

export const mail = async ({ from, to, subject, text }: { from: string, to: string, subject: string, text: string }) => {
    try {
        console.log(process.env.SMTP_HOST, process.env.SMTP_PORT);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            tls: {
                // key: fs.readFileSync(String(process.env.SMTP_CLIENT_KEY)),
                // cert: fs.readFileSync(String(process.env.SMTP_CLIENT_CERT)),
                rejectUnauthorized: false //false on dev only, true makes sure the "host" param matches the host in the mail server cert
            }
        });

        const result = await transporter.sendMail({ from, to, subject, text });
        console.log('Email sent', { result });
        return result;
    } catch (error) {
        console.error('Cannot send email', { error });
        return false;
    }
}