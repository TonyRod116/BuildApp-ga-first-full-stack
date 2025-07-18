import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  location: { type: String, required: false },
  images: { type: [String], required: false },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  comments: { type: [String], required: false },
})

const Project = mongoose.model('Project', projectSchema)

export default Project