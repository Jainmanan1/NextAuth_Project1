import nodemailer from "nodemailer";

type EmailType = "VERIFY" | "RESET";
let transporter: nodemailer.Transporter;

const actionMap: Record<EmailType, string> = {
  VERIFY: "verifyemail",
  RESET: "resetpassword",
};
const subjectMap: Record<EmailType, string> = {
  VERIFY: "Verify your email",
  RESET: "Reset your password",
};

export const sendEmail = async ({
  email,
  emailType,
  token,
}: {
  email: string;
  emailType: EmailType;
  token: string;
}) => {
  try {
  

    const action = actionMap[emailType];
    
     if (!transporter) {
      transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      });
    }

    await transporter.sendMail({
      from: '"Auth App" <no-reply@authapp.com>',
      to: email,
      subject: subjectMap[emailType],
      html: `
      <p>
        Click <a href="${process.env.DOMAIN}/${action}?token=${token}">
        here</a> to ${
          emailType === "VERIFY" ? "verify your email" : "reset your password"
        }.
      </p>
    `,
    });
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};
