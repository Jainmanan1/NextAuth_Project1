import { connects } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/services/rate_limiting";
import { getClientIp } from "@/lib/get_Ip";
import {redis} from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    await connects();
    const reqBody = await request.json();
    const { email, password } = reqBody;
    if (!email || !password) {
      return NextResponse.json(
        { message: "Please provide all the fields" },
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
      limit: 20,
      window: 60,
    });
    if (!accountRl.allowed|| !ipRl.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          retryAfter: accountRl.retryAfter,
        },
        { status: 429 },
      );
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json(
        { message: "invalid user or password" },
        { status: 400 },
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
  await redis.del(`ratelimit:login:${email}:${ip}`);
}
    if (!isMatch) {
      return NextResponse.json(
        { message: "invalid password or user" },
        { status: 400 },
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED" },
        { status: 403 },
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
      process.env.TOKEN_SECRET!,
      { expiresIn: "1h" },
    );

    const response = NextResponse.json({
      message: "Login successfull",
      success: true,
    });
    response.cookies.set("token", token, {
      httpOnly: true,
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
