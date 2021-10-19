import jwt from "jsonwebtoken"


const JWTSignature = process.env.JWT_SIGNATURE

export async function createTokens(sessionToken, userId) {
    try {

        // create refresh token
        // session id
        const refreshToken = jwt.sign({
            sessionToken
        }, JWTSignature)

        // create access token
        // session id, user id
        const accessToken = jwt.sign({
            sessionToken,
            userId
        }, JWTSignature)
            
        // return the refresh token and access token
        return {accessToken, refreshToken}

    } catch (e) {
        console.error(e)
    }
}

