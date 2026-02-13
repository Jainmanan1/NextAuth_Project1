import * as React from "react";


export enum EmailType {
  VERIFY = "VERIFY",
  RESET = "RESET",
}

interface EmailTemplateProps {
  email: string;
  emailType: EmailType;
  token: string;
  baseUrl: string;
}

export function EmailTemplate({ email, emailType, token, baseUrl }: EmailTemplateProps) {
 
  const isVerify = emailType === EmailType.VERIFY;

  const actionUrl = isVerify
    ? `${baseUrl}/verifyemail?token=${token}`
    : `${baseUrl}/resetpassword?token=${token}`;

  const title = isVerify ? "Verify your email" : "Reset your password";
  const buttonText = isVerify ? "Verify Email" : "Reset Password";

  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>{title}</h1>
      <p style={pStyle}>Hello {email},</p>
      <p style={pStyle}>
        {isVerify
          ? "Thank you for joining! Please click the button below to verify your account."
          : "We received a request to reset your password. If you didn't do this, ignore this email."}
      </p>

      <div style={{ margin: "32px 0" }}>
        <a href={actionUrl} target="_blank" style={buttonStyle}>
          {buttonText}
        </a>
      </div>

      <p style={footerStyle}>
        This link will expire in <strong>60 minutes</strong>.
        <br />
        If the button doesn't work, copy and paste this link:
      </p>
      <p style={linkStyle}>{actionUrl}</p>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#ffffff",
  padding: "40px",
  color: "#333",
  textAlign: "center",
  borderRadius: "8px",
  border: "1px solid #eaeaea",
};

const h1Style = { fontSize: "24px", fontWeight: "bold", marginBottom: "20px" };
const pStyle = { fontSize: "16px", lineHeight: "1.6", color: "#555" };
const footerStyle = { fontSize: "12px", color: "#888", marginTop: "40px" };
const linkStyle = {
  fontSize: "12px",
  color: "#2563eb",
  wordWrap: "break-word" as const,
  overflowWrap: "break-word" as const,
  display: "block", 
  marginTop: "10px"
 
};
const buttonStyle = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold",
  display: "inline-block",
};
