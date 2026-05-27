import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  try {
    let token

    // 1. Token header mein hai?
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    // 2. Token mila nahi
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      })
    }

    // 3. Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 4. User find karo — password nahi chahiye
    req.user = await User.findById(decoded.id).select('-password')

    // 5. User nahi mila
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      })
    }

    next()

} catch (error) {
    // 6. Token invalid ya expire
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    })
  }
}

export default protect