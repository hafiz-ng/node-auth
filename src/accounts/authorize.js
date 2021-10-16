import bcrypt from "bcryptjs"
const { compare } = bcrypt

export async function authorizeUser(email, password) {
    // import user collection
    const {user} = await import("../user/user.js")

    // look up user
    const userData = await user.findOne({
        'email.address' : email,
    }) 
    // console.log("userData", userData)

    // get user password
    const savedPassword = userData.password

    // compare password with one in database
    const isAuthorized = await compare(password, savedPassword)
    console.log('isAuthorized', isAuthorized)
    // return boolean if password is correct
    return isAuthorized
}