import crypto from "crypto"
const {JWT_SIGNATURE} = process.env

export async function createVerifyEmailToken(email) {

    try {
        // Auth String, JWT Signature, email
        const authString = `${JWT_SIGNATURE}:${email}`
        return crypto.createHash("sha256").update(authString).digest("hex")
    } catch (error) {
        console.log('error', error)
    }
}

export async function createVerifyEmailLink(email) {
    try {

        //create token
        const emailToken = await createVerifyEmailToken(email)

        // encode url string
        const URIencodedEmail = encodeURIComponent(email)

        // return link for verification
        return `http://127.0.0.1:5000/verify/${URIencodedEmail}/${emailToken}`
    } catch (error) {
        console.log(error)
    }
}

export async function validateVerifyEmail(token, email) {
    try {
        // create a hash aka token
        const emailToken = await createVerifyEmailToken(email)
        
        // compare hash with token
        var isValid = emailToken === token

        if(isValid) {
            // update user, to make them verified
            const {user} = await import("../user/user.js")
            await user.updateOne({
                "email.address" : email,
            }, 
            {
                // "email.address" : true
                $set : {"email.verified" : true},
            })

            // return success
            return true
        }

        return false
    } catch (e) {
        console.log('error', e)
    }
}