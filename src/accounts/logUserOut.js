import mongo from "mongodb"
import jwt from "jsonwebtoken"

const JWTSignature = process.env.JWT_SIGNATURE


export async function logUserOut(request, reply) {
    // this function needs to end the current session and remove the cookies
  
    try {

        const {session} = await import("../session/session.js")
        // get refresh token
        if (request?.cookies?.refreshToken) {
        const {refreshToken} = request.cookies
        
        // decode refreshToken 
        const {sessionToken} = jwt.verify(refreshToken, JWTSignature)

        // Delete database record for session
        await session.deleteOne({sessionToken})
        
    }

    // remove cookies
    reply.clearCookie("refreshToken").clearCookie("accessToken")
        
    } catch (e) {
        console.error(e)
    }
}