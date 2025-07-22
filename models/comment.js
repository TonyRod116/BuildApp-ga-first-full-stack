import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  createdAt: { type: Date, default: Date.now }
})

const Comment = mongoose.model('Comment', commentSchema)

export default Comment