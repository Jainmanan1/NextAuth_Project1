import { NextResponse ,NextRequest} from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgotpassword",
  "/resetpassword",
];
export  async function proxy(request:NextRequest){
    const {pathname} = request.nextUrl;
    const token = request.cookies.get("token")?.value;
    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if( !token){
        if(!isPublicPath ){
       return NextResponse.redirect(new URL('/login',request.url));
        }
         return NextResponse.next();
    }

    try {
        const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
        const {payload}= await jwtVerify(token,secret);
        const decoded = payload as unknown as {userId:string, isVerified:boolean};
        if(!decoded.isVerified && !isPublicPath){
            return NextResponse.redirect(new URL('/verifyemail',request.url));
        }
        if(decoded.isVerified && isPublicPath && pathname !== "/verifyemail"){
            return NextResponse.redirect(new URL('/profile',request.url));
        }
        return NextResponse.next();
        
    } catch (error) {
        const response = NextResponse.redirect(new URL('/Login',request.url));
        response.cookies.delete("token");
        return response;
        
    }
   
}

export const config = {
    matcher: [
        '/',
        '/profile',
        '/login',
        '/signup',
        '/verify-email',
        '/forgotpassword',
        '/resetpassword'

    ]
}