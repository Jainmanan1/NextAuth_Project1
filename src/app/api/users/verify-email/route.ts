import { connects } from "@/dbConfig/dbConfig";
import { NextRequest,NextResponse } from "next/server";
import User from "@/models/userModel";
import crypto from "crypto"
export async function  POST(request:NextRequest){
    try {
        await connects()
        
         const { token } = await request.json();

         if (!token) {
           return NextResponse.json(
             { error: "Token missing" },
             { status: 400 },
           );
         }
         const hashedToken = crypto
         .createHash("sha256")
         .update(token)
         .digest("hex")
         const user = await User.findOne({
            verifyToken:hashedToken,
            verifyTokenExpiry:{$gt:Date.now()}
         })
         if (!user) {
           return NextResponse.json(
             { error: "Invalid or expired token" },
             { status: 400 },
           );
         }

         user.verifyToken=undefined
         user.isVerified=true
         user.verifyTokenExpiry=undefined;
         await user.save();

         return NextResponse.json({message:"email verified successfully ",success:true})
        
        
    } catch (error:any) {
        console.error("Verify email error:", error);
        return NextResponse.json(
          { error: "Verification failed" },
          { status: 500 },
        );
    }
}