import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import Comment from '../models/comments.js'
import ReviewsRating from '../models/reviewsRating.js'
import Project from '../models/project.js'

const router = express.Router()

router.get('/auth/client', (req, res) => {
  res.render('auth/client/sign-up.ejs')
})


export default router