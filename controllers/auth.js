import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import Comment from '../models/comment.js'
import ReviewsRating from '../models/reviewsRating.js'
import Project from '../models/project.js'
import { upload } from '../utils/cloudinary.js'

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

// * Client Login
router.post('/client/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      return res.render('auth/client-login.ejs', { message: 'User not found.' })
    }

    const isPasswordValid = bcrypt.compareSync(password, existingUser.password)
    if (!isPasswordValid) {
      return res.render('auth/client-login.ejs', { message: 'Incorrect password.' })
    }

    req.session.user = {
      id: existingUser._id,
      email: existingUser.email,
      name: existingUser.name,
      isPro: false
    }
    req.session.save(() => {
      return res.redirect('/client/pro-list')
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return res.render('auth/client-login.ejs', { message: 'An error occurred. Please try again.' })
  }
})



// * Client Register
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
      isPro: false
    }
    
    return res.redirect('/pros/list')
    
  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error details:', error.message)
    return res.render('auth/client-register.ejs', { 
      message: `An error occurred, please try again.` 
    })
  }
})

// * Client Logout
router.get('/client/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})


export default router