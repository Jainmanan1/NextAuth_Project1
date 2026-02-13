import { connects } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import jwt from "jsonwebtoken"
export async function GET(request: NextRequest) {
  try {
      await connects();

   
    const token = request.cookies.get("token")?.value;
    if(!token){
      return NextResponse.json(
        { message:"unauthorized"},
        {
          status:401
        }
    );
    }
    const decode = jwt.verify(token, process.env.TOKEN_SECRET!)as {id:string};
    const user = await User.findById(decode.id).select(
      "username email role isVerified",
    ).lean();
    if(!user){
      return NextResponse.json(
        { message: "user not found" },
        {
          status: 404,
        },
      );

    }
    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 },
    );
    
  } catch (error) {
    console.error("ME route error:", error);

    return NextResponse.json({ message:"unauthorized "}, { status: 401 });
  }
}
