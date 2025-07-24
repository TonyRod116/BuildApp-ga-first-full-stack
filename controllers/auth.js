import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import Comment from '../models/comment.js'
import ReviewsRating from '../models/reviewsRating.js'
import Project from '../models/project.js'
import { upload } from '../utils/cloudinary.js'

const router = express.Router()

router.get('/login', (req, res) => {
  res.render('auth/login.ejs')
})

// *Client
router.get('/client/register', (req, res) => {
  res.render('auth/register.ejs', { isPro: false })
})

// *Pro
router.get('/pro/register', (req, res) => {
  res.render('auth/register.ejs', { isPro: true })
})

// * Client Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      return res.render('auth/login.ejs', { message: 'User not found.' })
    }

    const isPasswordValid = bcrypt.compareSync(password, existingUser.password)
    if (!isPasswordValid) {
      return res.render('auth/login.ejs', { message: 'Incorrect password.' })
    }

    req.session.user = {
      id: existingUser._id,
      email: existingUser.email,
      name: existingUser.name,
      isPro: existingUser.isPro, 
      profilePic: existingUser.profilePic || null
    }
    req.session.save(() => {
      return res.redirect('/client/pro-list')
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return res.render('auth/login.ejs', { message: 'An error occurred. Please try again.' })
  }
})



// * Client Register
router.post('/client/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword} = req.body
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.render('auth/register.ejs', { 
        message: 'Email already in use.',
        isPro: false
      })
    }
    
    if (email.trim() === '') {
      return res.render('auth/register.ejs', { 
        message: 'Please provide an email.',
        isPro: false
      })
    }
    
    if (password.trim() === '') {
      return res.render('auth/register.ejs', { 
        message: 'Please provide a password.',
        isPro: false
      })
    }
    
    if (password !== confirmPassword) {
      return res.render('auth/register.ejs', { 
        message: 'Passwords do not match.',
        isPro: false
      })
    }
    
    // Client registration - isPro = false
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
      isPro: false
    }
    
    return res.redirect('/client/pro-list')
    
  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error details:', error.message)
    return res.render('auth/register.ejs', { 
      message: `An error occurred, please try again.`,
      isPro: false
    })
  }
})

// * Professional Register
router.post('/pro/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword} = req.body
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.render('auth/register.ejs', { 
        message: 'Email already in use.',
        isPro: true
      })
    }
    
    if (email.trim() === '') {
      return res.render('auth/register.ejs', { 
        message: 'Please provide an email.',
        isPro: true
      })
    }
    
    if (password.trim() === '') {
      return res.render('auth/register.ejs', { 
        message: 'Please provide a password.',
        isPro: true
      })
    }
    
    if (password !== confirmPassword) {
      return res.render('auth/register.ejs', { 
        message: 'Passwords do not match.',
        isPro: true
      })
    }
    
    // Professional registration - isPro = true
    const user = new User({
      name,
      email,
      password,
      isPro: true
    })
    
    await user.save()
    
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      isPro: true
    }
    
    return res.redirect('/client/profile')
    
  } catch (error) {
    console.error('Registration error:', error)
    return res.render('auth/register.ejs', { 
      message: `An error occurred, please try again.`,
      isPro: true
    })
  }
})

// * Client Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/home')
  })
})


export default router