import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI,{
       maxPoolSize: 10,               // Max 10 connections ready
      minPoolSize: 2,                // Min 2 hamesha ready
      serverSelectionTimeoutMS: 5000, // 5s mein server nahi mila → error
      socketTimeoutMS: 45000          // 45s mein response nahi → timeout
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    //  Server band kar do
    process.exit(1)
  }
}

export default connectDB 
