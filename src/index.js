import './env.js'
import {fastify} from 'fastify'
import fastifyStatic from 'fastify-static'
import fastifyCookie from 'fastify-cookie'
import path from 'path'
import {fileURLToPath} from 'url'
import {connectDb} from './db.js'
import {registerUser} from './accounts/register.js'
import {authorizeUser} from './accounts/authorize.js'


// ESM Specific fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = fastify()

async function startApp() {
    try {
        console.log(process.env.API_URL)

        app.register(fastifyCookie, {
            secret : process.env.COOKIE_SIGNATURE
        })
        app.register(fastifyStatic, {
            root : path.join(__dirname, "public")
        })

        app.post("/api/register", {}, async (request, reply) => {
            try {
                const userId = await registerUser(request.body.email, request.body.password)
                console.log('userId', userId)
            } catch (e) {
                console.error(e)
            }
        })

        app.post("/api/authorize", {}, async (request, reply) => {
            try {
                console.log(request.body.email, request.body.password)
                const userId = await authorizeUser(request.body.email, request.body.password)
                console.log('userId', userId)

                // generate auth token

                // set cookies
                reply.setCookie('textCookie', 'the value is this', {
                    path : "/",
                    domain : "localhost",
                    httpOnly : true,
                }).send({
                    data : "just testing"
                })
            } catch (e) {
                console.error(e)
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

