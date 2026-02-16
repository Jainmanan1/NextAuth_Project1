import User from "@/models/userModel";
import Crypto from "crypto";

export async function validateToken(token:string,type:'VERIFY'|'RESET'){
    const hashedToken = Crypto.createHash("sha256").update(token).digest("hex");

    const query =
      type == "VERIFY"
        ? { verifyToken: hashedToken, verifyTokenExpiry: { $gt: Date.now() } }
        : { forgotPasswordToken: hashedToken, forgotPasswordExpiry:{$gt:Date.now()} };

     const user = await User.findOne(query);
     
     return user;

}