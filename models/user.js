import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  password: { type: String, required: true },
  profilePic: { type: String, required: false },
  bio: { type: String, required: false },
  isPro: { type: Boolean, required: true },
  sector: { type: String, required: false },
  location: { type: String, required: false },
  contact: { type: String, required: false },
  images: { type: [String], required: false },
  comments: { type: [String], required: false },
})

const User = mongoose.model('User', userSchema)

export default User