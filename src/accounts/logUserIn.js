import { user } from "../user/user.js";
import { createSession } from "./session.js";
import { refreshTokens } from "./user.js";

export async function logUserIn(userId, request, reply) {
    const connectionInformation = {
        ip : request.ip,
        userAgent : request.headers["user-agent"],
    }
    // create session
    const sessionToken = await createSession(userId, connectionInformation)
    console.log("sessionToken", sessionToken)



    // create JWT

    // set the cookie
    await refreshTokens(sessionToken, userId, reply)

}