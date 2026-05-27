// 404 — Route exist nahi karta
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  // Kabhi kabhi status 200 aata hai even on error — fix karo
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message

  // 🔐 Mongoose — Galat ID format
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404
    message = 'Resource not found'
  }

  // 🔐 Mongoose — Duplicate field (email already exists)
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `${field} already exists`
  }

  // 🔐 Mongoose — Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')
  }

  // 🔐 JWT — Token invalid
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  // 🔐 JWT — Token expire
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired, please login again'
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Development mein stack trace dikhao
    // Production mein mat dikhao 🔐
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  })
}

export { notFound, errorHandler }