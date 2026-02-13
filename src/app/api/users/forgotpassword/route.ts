import { connects } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/helper/resend";
import { EmailType } from "@/components/email-template";
import { rateLimit } from "@/services/rate_limiting";
import { getClientIp } from "@/lib/get_Ip";
import {redis} from "@/lib/redis";
export async function POST(request: NextRequest) {
  try {
    await connects();
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { message: "Please provide email" },
        { status: 400 },
      );
    }
    const ip = getClientIp(request);
    
        const accountRl = await rateLimit({
          key: `login:${email}:${ip}`,
          limit: 5,
          window: 60,
        });
    
        const ipRl = await rateLimit({
          key: `login-ip:${ip}`,
          limit: 3600,
          window: 3600,
        });
        if (!accountRl.allowed|| !ipRl.allowed) {
          return NextResponse.json(
            {
              error: "RATE_LIMIT_EXCEEDED",
              retryAfter: Math.max(accountRl.retryAfter || 0, ipRl.retryAfter || 0),
            },
            { status: 429 },
          );
        }
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If the account exists, a password reset email has been sent",
        },
        { status: 200 },
      );
    }
    if (!user.isVerified) {
      return NextResponse.json({
        message: "Please verify your email first",
      });
    }

    await redis.del(`ratelimit:login:${email}:${ip}`);

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hr
    await user.save();

    await sendEmail({
      email: user.email,
      emailType: EmailType.RESET,
      token:token
    });

    return NextResponse.json({
      message: "If the account exists, a password reset email has been sent",
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
