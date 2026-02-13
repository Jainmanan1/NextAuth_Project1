import {NextRequest} from "next/server";

export function getClientIp(request:NextRequest): string {
    return(
        request.headers.get("x-forwarded-for")?.split(",").shift() ||
        request.headers.get("x-real-ip") || "unknown"
    )
}