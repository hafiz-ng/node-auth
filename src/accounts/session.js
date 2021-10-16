import {randomBytes} from "crypto"


export async function createSession(userId, connection) {
    // generate a session token
    const sessionToken = randomBytes(43).toString("hex")

    // retrieve connection information
    const {ip, userAgent} = connection

    // database insert for session
    const {session} = await import("../session/session.js")
    await session.insertOne({
        sessionToken,
        userId,
        valid : true,
        userAgent,
        ip,
        updatedAt : new Date(),
        createdAt : new Date()
    })
    // return the session token
}