// *Import section
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import methodOverride from 'method-override'
import morgan from 'morgan'
import session from 'express-session'
import MongoStore from "connect-mongo"
import { library, icon } from '@fortawesome/fontawesome-svg-core'
import multer from 'multer'
import isSignedIn from './middleware/isSignedIn.js'
import passUserToView from './middleware/passUserToView.js'

import authRouter from './controllers/auth.js'
import clientRouter from './controllers/client.js'






// *Routers

// *Const section
const app = express()
const port = process.env.PORT || 3000

// *Middleware section
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}))
app.use(passUserToView)


// * -------- Routes Section --------

// Home route
app.get('/', (req, res) => {
  res.render('index.ejs')
})

// Router files 
app.use('/auth', authRouter)
app.use('/client', clientRouter)

// Client routes


//* -------- Server Section --------
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`)
})