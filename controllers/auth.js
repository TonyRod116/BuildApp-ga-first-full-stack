import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import Comment from '../models/comments.js'
import ReviewsRating from '../models/reviewsRating.js'
import Project from '../models/project.js'

const router = express.Router()

router.get('/client', (req, res) => {
  res.render('auth/client-login.ejs')
})

router.get('/client/login', (req, res) => {
  res.render('auth/client-login.ejs')
})

router.get('/client/register', (req, res) => {
  res.render('auth/client-register.ejs')
})

router.post('/client/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword} = req.body
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.render('auth/client-register.ejs', { 
        message: 'Email already in use.' 
      })
    }
    
    if (email.trim() === '') {
      return res.render('auth/client-register.ejs', { 
        message: 'Please provide an email.' 
      })
    }
    
    if (password.trim() === '') {
      return res.render('auth/client-register.ejs', { 
        message: 'Please provide a password.' 
      })
    }
    
    if (password !== confirmPassword) {
      return res.render('auth/client-register.ejs', { 
        message: 'Passwords do not match.' 
      })
    }
    
    // if client registers from client/.. isPro = false
    const user = new User({
      name,
      email,
      password,
      isPro: false
    })
    
    await user.save()
    
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
    }
    
    return res.redirect('/pros/list')
    
  } catch (error) {
    console.error('Registration error:', error)
    return res.render('auth/client-register.ejs', { 
      message: 'An error occurred. Please try again.' 
    })
  }
})


export default router