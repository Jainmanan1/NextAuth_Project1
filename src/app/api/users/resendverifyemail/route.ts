import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/userModel";
import { connects } from "@/dbConfig/dbConfig";
import { sendEmail } from "@/helper/resend";
import {EmailType} from "@/components/email-template";
import { rateLimit } from "@/services/rate_limiting";
import { getClientIp } from "@/lib/get_Ip";

export async function POST(request: NextRequest) {
  try {
    await connects();
    const RESEND_COOLDOWN = 60 * 1000;

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const ip = getClientIp(request);
    const rl = await rateLimit({
      key: `resend-verify:${email}:${ip}`,
      limit: 5, 
      window: 3600, 
    });

    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          retryAfter: rl.retryAfter,
          message: "Too many requests. Please try again in an hour.",
        },
        { status: 429 },
      );
    }
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          message: "If the account exists, a verification email has been sent ",
        },
      );
    }
    if (user.isVerified) {
      return NextResponse.json({
        message: "user is already verified",
      });
    }

     const now = Date.now();
     const lastSentTime = user.verifyTokenExpiry
       ? user.verifyTokenExpiry - 60 * 60 * 1000
       : 0;

     if (now - lastSentTime < RESEND_COOLDOWN) {
       return NextResponse.json(
         {
           error: "Please wait at least 1 minute before resending.",
         },
         { status: 429 },
       );
     }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.verifyToken = hashedToken;
    user.verifyTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    await sendEmail({
      email: user.email,
      emailType:EmailType.VERIFY,
      token: token,
    });

   
    return NextResponse.json({
      message: "If the account exists, a verification email has been sent",
      success: true,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
