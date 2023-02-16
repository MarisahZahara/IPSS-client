import jwt from 'jsonwebtoken'

export default async function authorization(token) {
  const dataToken = jwt.verify(token, process.env.REACT_APP_JWT, function (err, decoded) {
    if (err) return null
    return decoded
  })
  if (dataToken) {
    return dataToken
  } else {
    return undefined
  }
}