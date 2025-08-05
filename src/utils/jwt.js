import jwt from 'jsonwebtoken'
import { env } from '~/config/environment.js'

const jwtGenerate = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '1h'
  })
}

const jwtVerify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      resolve(decoded)
    })
  })
}

export { jwtGenerate, jwtVerify }