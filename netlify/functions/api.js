import express from 'express'
import 'dotenv/config'
import methodOverride from 'method-override'
import mongoose from 'mongoose'
import ejs from 'ejs'
import session from 'express-session'
import bcrypt from 'bcrypt'
import MongoStore from 'connect-mongo'
import dotenv from 'dotenv'
import morgan from 'morgan'
import multer from 'multer'
import path from 'path'
import { library, icon } from '@fortawesome/fontawesome-svg-core'
import isSignedIn from '../../middleware/isSignedIn.js'
import passUserToView from '../../middleware/passUserToView.js'
import userRouter from '../../controllers/user.js'
import authRouter from '../../controllers/auth.js'
import serverless from 'serverless-http'

const app = express()

// * -------- Middleware Configuration --------
app.set('view engine', 'ejs')
// Use relative paths that work in Netlify Functions
app.set('views', path.join(process.cwd(), 'views'))
app.use(express.static(path.join(process.cwd(), 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(morgan('dev'))

// Session configuration optimized for serverless
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Changed to false for better security
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // Session TTL: 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

app.use(passUserToView)

// * -------- Routes Section --------

// Home routes
app.get('/', (req, res) => {
  res.render('home.ejs')
})

app.get('/home', (req, res) => {
  res.render('home.ejs')
})

// API routes
app.use('/auth', authRouter)
app.use('/client', userRouter)

// * -------- Database Connection --------
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`✅ Connected to MongoDB ${mongoose.connection.name}`)
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err)
})

// * -------- Error Handling --------
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err)
  
  // Try to render error page, fallback to JSON if it fails
  try {
    res.status(500).render('error', { 
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err : {}
    })
  } catch (renderError) {
    console.error('❌ Error rendering error page:', renderError)
    res.status(500).json({
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    })
  }
})

// 404 handler
app.use((req, res) => {
  // Try to render error page, fallback to JSON if it fails
  try {
    res.status(404).render('error', { 
      message: 'Page not found' 
    })
  } catch (renderError) {
    console.error('❌ Error rendering 404 page:', renderError)
    res.status(404).json({
      error: 'Page not found',
      message: 'The requested page could not be found'
    })
  }
})

// Export for Netlify Functions
export const handler = serverless(app)
