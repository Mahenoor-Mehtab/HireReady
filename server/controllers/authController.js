import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// JWT Token banao
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // 1. Saari fields hain?
    if (!name || !email || !password) {
      res.status(400)
      throw new Error('Please fill all fields')
    }

    // 2. Email already exist karti hai?
    const userExists = await User.findOne({ email })
    if (userExists) {
      res.status(400)
      throw new Error('User already exists with this email')
    }

    // 3. User banao
    const user = await User.create({
      name,
      email,
      password  // Model khud hash karega
    })

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        }
      })
    }

  } catch (error) {
    next(error)
  }
}

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400)
      throw new Error('Please fill all fields')
    }

    // 2. User dhundho — password bhi lao
    const user = await User.findOne({ email }).select('+password')

    // 3. User mila aur password match kiya?
    if (!user || !(await user.matchPassword(password))) {
      res.status(401)
      throw new Error('Invalid email or password')
    }

    // 4. Response bhejo
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      }
    })

  } catch (error) {
    next(error)
  }
}

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    next(error)
  }
}

export { registerUser, loginUser, getMe } 
