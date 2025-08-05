import { jwtVerify } from '~/utils/jwt'

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Không có token' })

  try {
    const decoded = jwtVerify(token)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ' })
  }
};