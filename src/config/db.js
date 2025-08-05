import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const DATABASE_NAME = process.env.DATABASE_NAME

export const CONNECT_DB = async () => {
  await mongoose.connect(MONGODB_URI, {
    dbName: DATABASE_NAME
  })
}