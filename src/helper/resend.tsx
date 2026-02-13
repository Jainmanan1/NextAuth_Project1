import { EmailTemplate, EmailType } from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  email: string;
  emailType: EmailType;
  token: string;
}

export async function sendEmail({
  email,
  emailType,
  token,
}: SendEmailOptions): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL||(process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");


  const subject =
    emailType === EmailType.VERIFY
      ? "Verify your email"
      : "Reset your password";

  const { error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: "mananjain2435@gmail.com",
    subject,
    react: (
      <EmailTemplate
        email={email}
        emailType={emailType}
        token={token}
        baseUrl={baseUrl}
      />
    ),
  });

  if (error) {
    throw new Error(error.message);
  }
}
