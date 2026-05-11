import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS,
    },
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
});

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, unknown>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[];
}

export const sendEmail = async ({
    subject,
    templateData,
    templateName,
    to,
    attachments,
}: SendEmailOptions): Promise<void> => {

    console.log(envVars.EMAIL_SENDER.SMTP_HOST, envVars.EMAIL_SENDER.SMTP_USER, envVars.EMAIL_SENDER.SMTP_PASS, envVars.EMAIL_SENDER.SMTP_PORT)

    try {
        const templatePath = path.resolve(
            process.cwd(),
            `src/templates/${templateName}.ejs`
        );

        const html = await ejs.renderFile(templatePath, templateData);

        await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to,
            subject,
            html,
            attachments: attachments?.map((a) => ({
                filename: a.filename,
                content: a.content,
                contentType: a.contentType,
            })),
        });
    } catch (error: unknown) {
        console.error("\n============= EMAIL SENDING FAILED =============");
        console.error("SMTP Error:", error instanceof Error ? error.message : String(error));
        console.error("\nBut don't worry! For development, here is the simulated email data:");
        console.error("To:", to);
        console.error("Subject:", subject);
        if (templateData.inviteUrl) console.error("URL:", templateData.inviteUrl);
        if (templateData.acceptUrl) console.error("URL:", templateData.acceptUrl);
        if (templateData.url) console.error("URL:", templateData.url);
        console.error("================================================\n");

        if (envVars.NODE_ENV !== "development") {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Email could not be sent: ${message}`);
        }
    }
};
