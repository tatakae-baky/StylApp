import jwt from 'jsonwebtoken'

const generatedAccessToken = async (userId, role) => {
    const payload = { id: userId };
    if (role) payload.role = role;

    const token = await jwt.sign(
        payload,
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '24h' }
    )

    return token
}

export default generatedAccessToken
