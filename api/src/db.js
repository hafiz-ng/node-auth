import mongo from "mongodb"

const {MongoClient} = mongo

const url = process.env.MONGO_URL

export const client = new MongoClient(url, {useNewUrlParser:true})

export async function connectDb() {
    try {
        await client.connect()

        // confirm connection
        await client.db("admin").command({ping:1})
        console.log("Connection to database successful")

    } catch (e) {
        console.error(e)

        // if there is a problem close connection to the db
        await client.close()
    }
}

