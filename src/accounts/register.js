import bcrypt from 'bcryptjs' // takes care of salting and hashing
import {user} from "../user/user.js"
const { genSalt, hash } = bcrypt



export async function registerUser(email, password) {
    
    const {user} = await import("../user/user.js")

    // generate the salt
    const salt = await genSalt(10)

    // hash with salt
    const hashedPassword = await hash(password, salt)

    // store in database
    const result = await user.insertOne({
        email : {
            address : email,
            verified : false
        },
        password : hashedPassword
    })

    // return the user from database
    return result.insertedId
}