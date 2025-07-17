// *Import section
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import methodOverride from 'method-override'
import morgan from 'morgan'
import session from 'express-session'
import MongoStore from "connect-mongo"

// *Routers

// *Const section
const app = express()
const port = process.env.PORT || 3000

// *Middleware section
app.use(express.urlencoded({ extended: false }))
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


// * -------- Routes Section --------

// Home route
app.get('/', (req, res) => {
  res.render('index.ejs')
})


//* -------- Server Section --------
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`)
})