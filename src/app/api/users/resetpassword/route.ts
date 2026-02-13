import { connects } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs"
import { rateLimit } from "@/services/rate_limiting";
import { getClientIp } from "@/lib/get_Ip";
import {redis} from "@/lib/redis";
export async function POST(request:NextRequest){
    try {
        await connects();
        const reqBody = await request.json();
        const {password,confirmPassword,token} = reqBody;
        if(!password || !confirmPassword || !token){
            return NextResponse.json({message:"Please provide all fields"},{status:400});
        }
        if(password !== confirmPassword){
            return NextResponse.json({message:"Passwords do not match"},{status:400});
        }

         const ip = getClientIp(request);
             const ipRl = await rateLimit({
               key: `resetpassword-ip:${ip}`,
               limit: 3,
               window: 3600,
             });
        
             if (!ipRl.allowed) {
               return NextResponse.json(
                 {
                   error: "RATE_LIMIT_EXCEEDED",
                   retryAfter: ipRl.retryAfter,
                   message:
                     "Too many password resets from this connection. Try again later.",
                 },
                 { status: 429 },
               );
               
             }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
          forgotPasswordToken: hashedToken,
          forgotPasswordExpiry: { $gt: Date.now() },
        });

        if(!user){
            return NextResponse.json(
              { message: "Invalid or expired token" },
              { status: 400 },
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        user.password=hashedPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await redis.del(`ratelimit:resetpassword:${user.email}:${ip}`);
        await user.save()

        return NextResponse.json({
          message: "Password reset successful",
          success: true,
        });


        
    } catch (error) {
         console.error("Reset password error:", error);
         return NextResponse.json(
           { message: "Internal server error" },
           { status: 500 },
         );
    }

}