import mongo from "mongodb"
import jwt from "jsonwebtoken"
import { createTokens } from "./tokens.js"

const JWTSignature = process.env.JWT_SIGNATURE

const {ObjectId} = mongo

export async function getUserFromCookies(request, reply) {

    try {
        const {user} = await import("../user/user.js")
        const {session} = await import("../session/session.js")

        // check to make sure access token exists
        if (request?.cookies?.accessToken) {
            
            // if access token exists
            const {accessToken} = request.cookies

            // if access token exists, decode the access token
            const decodedAccessToken = jwt.verify(accessToken, JWTSignature)
            console.log(decodedAccessToken)

            // return user from record
            return user.findOne({
                _id : ObjectId(decodedAccessToken.userId)
            })
        }
        if (request?.cookies?.refreshToken) { 
            const {refreshToken} = request.cookies

            // decode refresh token
            const {sessionToken} = jwt.verify(refreshToken, JWTSignature)

            // look up session
            const currentSession = await session.findOne({sessionToken})
            console.log("currentSession", currentSession)

            // confirm session is valid
            if (currentSession.valid) {
                // lookup current user
                const currentUser = await user.findOne({
                    _id : ObjectId(currentSession.userId)
                })
                console.log("currentUser", currentUser)

                // refresh tokens
                await refreshTokens(sessionToken, currentUser._id, reply)

                // return current user
                return currentUser

                 
            }

        }


    } catch (e) {
        console.error(e)
    }
}

export async function refreshTokens(sessionToken, userId, reply) {
    try {
        // create JWT
        const { accessToken, refreshToken } = await createTokens (
            sessionToken,
            userId
        )

        // set cookie
        const now = new Date()

        // get date, 30 days in the future
        const refreshExpires = now.setDate(now.getDate() + 30)

        reply
            .setCookie("refreshToken", refreshToken, {
                path : "/",
                domain : "localhost",
                secure: true,
                httpOnly : true,
                expires : refreshExpires
            })
            .setCookie("accessToken", accessToken, {
                path : "/",
                domain : "localhost",
                secure: true,
                httpOnly : true,
            })
    } catch (e) {
        console.error(e)
    }
}