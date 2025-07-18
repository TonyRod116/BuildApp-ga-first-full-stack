import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const reviewsRatingSchema = new mongoose.Schema({
  type: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
})

const ReviewsRating = mongoose.model('ReviewsRating', reviewsRatingSchema)

export default ReviewsRating