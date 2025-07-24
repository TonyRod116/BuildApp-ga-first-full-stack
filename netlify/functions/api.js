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
import { library, icon } from '@fortawesome/fontawesome-svg-core'
import isSignedIn from '../../middleware/isSignedIn.js'
import passUserToView from '../../middleware/passUserToView.js'
import userRouter from '../../controllers/user.js'
import authRouter from '../../controllers/auth.js'
import serverless from 'serverless-http'


const app = express()

// * -------- Middleware Configuration --------
app.set('view engine', 'ejs')
app.set('views', '../../views')
app.use(express.static('../../public'))
app.use(express.urlencoded({ extended: false }))
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
  res.status(500).render('error', { 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found' 
  })
})

// Export for Netlify Functions
export const handler = serverless(app)
