import './env.js'
import {fastify} from 'fastify'
import fastifyStatic from 'fastify-static'
import fastifyCookie from 'fastify-cookie'
import fastifyCors from 'fastify-cors'
import path from 'path'
import {fileURLToPath} from 'url'
import {connectDb} from './db.js'
import {registerUser} from './accounts/register.js'
import {authorizeUser} from './accounts/authorize.js'
import {logUserIn} from './accounts/logUserIn.js'
import {logUserOut} from './accounts/logUserOut.js'
import { getUserFromCookies } from './accounts/user.js'
import { request } from 'http'
import { user } from './user/user.js'
import { sendEmail, mailInit } from './mail/index.js'
import { createVerifyEmailLink } from './accounts/verify.js'

// ESM Specific fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = fastify()

async function startApp() {
    try {
        await mailInit()

        app.register(fastifyCors, {
            origin : [
                /\.nodeauth.dev/,
                "https://nodeauth.dev",
            ], credentials : true
        })

        app.register(fastifyCookie, {
            secret : process.env.COOKIE_SIGNATURE
        })
        app.register(fastifyStatic, {
            root : path.join(__dirname, "public")
        })

        app.get("/test", {}, async(request, reply) => {
            
            try {
                // verify the user login
                const user = await getUserFromCookies(request, reply)
                
                // return user email, if it exists, otherwise return unauthorized
                    if (user?._id) {
                        reply.send({
                            data : user,
                        })
                    } else {
                        reply.send({
                            data : "User Look up failed"
                        })
                    }

                } catch (e) {
                    throw new Error(e)
                }
        })
        app.post("/api/register", {}, async (request, reply) => {
            try {
                const userId = await registerUser(request.body.email, request.body.password)
                
                // if account creation was successful 
                if (userId) {
                    const emailLink = await createVerifyEmailLink(request.body.email)
                    await sendEmail({
                        to : request.body.email,
                        subject : "Verify your email",
                        html : `<a href="${emailLink}">verify</a>`
                    })
                    await logUserIn(userId, request, reply)
                    reply.send({
                        data : {
                            status : "success",
                            userId,
                        }
                    })
                }

            } catch (e) {
                console.error(e)
                reply.send({
                    data : {
                        status : "Failed",
                        userId,
                    }
                })
            }
        })

        app.post("/api/logout", {}, async (request, reply) => {
            try {
                await logUserOut(request, reply)
                reply.send({
                    data : {
                        status : "SUCCESS",
                    },
                })
            } catch (e) {
                console.error(e)
            }
        })

        app.post("/api/authorize", {}, async (request, reply) => {
            try {
                console.log(request.body.email, request.body.password)
                const {isAuthorized, userId } = await authorizeUser(request.body.email, request.body.password)

                if(isAuthorized) {
                   await logUserIn(userId, request, reply) 
                   reply.send({
                    data : {
                        status : "SUCCESS",
                        userId,
                    },
                })
                }
                reply.send({
                    data : "Authentication Failed"
                })
            } catch (e) {
                console.error(e)
            }
        })

        app.post("/api/verify", {}, async (request, reply) => {
            try {
                const {token, email } = request.body 
                reply.send({
                    data : {
                        status : "SUCCESS",
                    },
                })
            } catch (e) {
                console.error(e)
                reply.send({
                    data : {
                        status : "FAILED",
                        userId
                    }
                })
            }
        })

        await app.listen(3000)
        console.log(`Server listening on port: 3000`)
    } catch (e) {
        console.error(e);
    }
}

connectDb().then(() => {
    startApp()
})

