import nodemailer from 'nodemailer'
import type { User } from '../../generated/prisma/client';


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

type SendMailProps = {
  user : Partial<User>;
  url : string;
  token : string
}

const getEmailTemplate = (userName: string, verificationUrl: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - SkillBridge</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <table role="presentation" style="width: 540px; max-width: 100%; border-collapse: collapse;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 0 0 48px; text-align: left;">
                            <h1 style="margin: 0; color: #000000; font-size: 22px; font-weight: 600; letter-spacing: -0.5px;">SkillBridge</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0;">
                            <h2 style="margin: 0 0 16px; color: #000000; font-size: 26px; font-weight: 500; letter-spacing: -0.5px; line-height: 1.3;">
                                Verify your email
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.5;">
                                Hi ${userName}, welcome to SkillBridge.
                            </p>
                            
                            <p style="margin: 0 0 32px; color: #666666; font-size: 16px; line-height: 1.5;">
                                Click the button below to verify your email address and get started.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 0 32px;">
                                <tr>
                                    <td>
                                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #088395; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">
                                            Verify email address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 8px; color: #999999; font-size: 14px; line-height: 1.5;">
                                Or copy this link:
                            </p>
                            
                            <p style="margin: 0 0 40px; color: #999999; font-size: 13px; word-break: break-all; line-height: 1.5;">
                                ${verificationUrl}
                            </p>
                            
                            <!-- Divider -->
                            <table role="presentation" style="width: 100%; margin: 0 0 32px;">
                                <tr>
                                    <td style="border-top: 1px solid #e5e7eb;"></td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 24px; color: #999999; font-size: 14px; line-height: 1.5;">
                                This link expires in 24 hours. If you didn't create this account, you can ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 0 0;">
                            <p style="margin: 0 0 8px; color: #999999; font-size: 13px;">
                                Questions? <a href="mailto:support@skillbridge.com" style="color: #000000; text-decoration: none;">Contact support</a>
                            </p>
                            <p style="margin: 0; color: #cccccc; font-size: 13px;">
                                © 2026 SkillBridge
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}


const sendVerificationEmail = async ({ user, url, token } : SendMailProps) => {
    try {

      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`

    const info = await transporter.sendMail({
      from: '"SkillBridge" <skillbridge@mail.com>',
      to: user.email,
      subject: "Verify Your Email Address - SkillBridge",
      text: `Hi ${user.name},\n\nThank you for signing up with SkillBridge! Please verify your email address by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.\n\nBest regards,\nThe SkillBridge Team`,
      html: getEmailTemplate(user.name as string, url),
    });

      console.log("Message sent:", info.messageId);
    } catch (error) {
      console.log(error)
    }
}

export default sendVerificationEmail