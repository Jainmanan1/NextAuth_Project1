import { connects } from "@/dbConfig/dbConfig";
import crypto from "crypto";
import { sendEmail } from "@/helper/resend";
import { EmailType } from "@/components/email-template";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/services/rate_limiting";
import { getClientIp } from "@/lib/get_Ip";



export async function POST(request: NextRequest) {
  try {
     await connects();
    const reqBody = await request.json();
    const { username, email, password } = reqBody;

     const ip = getClientIp(request);
     const ipRl = await rateLimit({
       key: `signup-ip:${ip}`,
       limit: 3,
       window: 3600,
     });

     if (!ipRl.allowed) {
       return NextResponse.json(
         {
           error: "RATE_LIMIT_EXCEEDED",
           retryAfter: ipRl.retryAfter,
           message:
             "Too many accounts created from this connection. Try again later.",
         },
         { status: 429 },
       );
       
     }
    const user = await User.findOne({ email });
    if (user) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }
   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verifyToken:hashedToken,
      verifyTokenExpiry:Date.now()+60*60*1000
    });
    const savedUser = await newUser.save();

     await sendEmail({email, emailType: EmailType.VERIFY, token}).catch((error)=>{
      console.error("email failed to sent",error)
     })
    return NextResponse.json(
      {
        message: "User created successfully.Please verify your email",
        success: true,
        user:{
            id:savedUser._id,
            username:savedUser.username,
            email:savedUser.email
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error in Signup", error },
      { status: 500 },
    );
  }
}
