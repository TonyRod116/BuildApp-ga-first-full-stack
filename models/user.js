import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, required: false },
  experience: { type: Number, required: false },
  bio: { type: String, required: false },
  isPro: { type: Boolean, required: true },
  sector: { type: String, required: false },
  location: { type: String, required: false },
  contact: { type: String, required: false },
  images: { type: [String], required: false },
  comments: { type: [String], required: false },
  appliedTo: { type: [mongoose.Schema.Types.ObjectId], ref: 'Project', required: false },
})

userSchema.pre('save', function(next){
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 12)
  }
  next()
})

const User = mongoose.model('User', userSchema)

export default User