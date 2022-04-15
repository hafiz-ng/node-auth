import { fastify } from "fastify"
import fetch from "cross-fetch"
import fastifyStatic from "fastify-static"
import path from 'path'
import {fileURLToPath} from 'url'


// ESM Specific fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = fastify()

async function startApp() {
    try {
        app.register(fastifyStatic, {
            root : path.join(__dirname, "public")
        })
        
        app.get("/verify/:email/:token", {}, async (request, reply) => {
            try {
                console.log("request", request.params.email, request.params.token)
                const {email, token} = request.params

                const values = {
                    email,
                    token
                }
                const res = await fetch('http://localhost:3000/api/verify', {
                    method : "POST",
                    body : JSON.stringify(values),
                    credentials : "include",
                    headers : {"Content-type" : "application/json; charset=UTF-8"},
                })
                if (res.status === 200) {
                    return reply.redirect("/")
                }
                reply.code(401).send()
                console.log("res", res.status)
                reply.code(200).send("All is good")
            } catch (e) {
                console.log("e", e)
                reply.code(401).send()
            }
        })

        const PORT = 5000 
        await app.listen(PORT)
        console.log(`Server listening on port: ${PORT}`)
    } catch (error) {
        console.log("error", error)
    }
}

startApp()
