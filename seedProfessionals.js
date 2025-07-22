import mongoose from 'mongoose'
import 'dotenv/config'
import User from './models/user.js'
import bcrypt from 'bcrypt'

const professionals = [
  {
    name: "John Smith",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 8,
    bio: "Professional carpenter specializing in custom furniture and restorations. Over 8 years of experience in the industry.",
    isPro: true,
    sector: "Carpenter",
    location: "Barcelona",
    contact: "+34 600 123 456",
    rating: 5
  },
  {
    name: "Sarah Johnson",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 12,
    bio: "Certified electrician with extensive experience in domestic and commercial installations.",
    isPro: true,
    sector: "Electrician",
    location: "Barcelona",
    contact: "+34 600 234 567",
    rating: 4
  },
  {
    name: "Michael Brown",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 15,
    bio: "Professional builder with 15 years of experience in construction and renovations. Specialized in finishing work.",
    isPro: true,
    sector: "Builder",
    location: "Barcelona",
    contact: "+34 600 345 678",
    rating: 5
  },
  {
    name: "Emily Davis",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 6,
    bio: "Professional painter with experience in interior and exterior work. Quality guaranteed.",
    isPro: true,
    sector: "Painter",
    location: "Barcelona",
    contact: "+34 600 456 789",
    rating: 4
  },
  {
    name: "David Wilson",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 10,
    bio: "Plumber with extensive experience in installations and repairs. Fast and efficient service.",
    isPro: true,
    sector: "Plumber",
    location: "Barcelona",
    contact: "+34 600 567 890",
    rating: 5
  },
  {
    name: "Lisa Anderson",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 7,
    bio: "Professional gardener specializing in garden design and maintenance. Unique and lasting creations.",
    isPro: true,
    sector: "Gardener",
    location: "Barcelona",
    contact: "+34 600 678 901",
    rating: 4
  },
  {
    name: "Robert Taylor",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 9,
    bio: "Professional locksmith with 24/7 service. Specialized in security and door opening.",
    isPro: true,
    sector: "Locksmith",
    location: "Madrid",
    contact: "+34 600 789 012",
    rating: 5
  },
  {
    name: "Jennifer White",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 5,
    bio: "Professional cleaning services for homes and offices. Attention to detail guaranteed.",
    isPro: true,
    sector: "Cleaner",
    location: "Madrid",
    contact: "+34 600 890 123",
    rating: 4
  },
  {
    name: "Thomas Garcia",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 11,
    bio: "Roofer with experience in all types of roofing. Repairs and new installations.",
    isPro: true,
    sector: "Roofer",
    location: "Barcelona",
    contact: "+34 600 901 234",
    rating: 5
  },
  {
    name: "Amanda Rodriguez",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 8,
    bio: "Interior decorator with design training. I transform spaces into unique places.",
    isPro: true,
    sector: "Decorator",
    location: "Madrid",
    contact: "+34 600 012 345",
    rating: 4
  }
]

async function seedProfessionals() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Hash passwords
    const hashedProfessionals = await Promise.all(
      professionals.map(async (pro) => ({
        ...pro,
        password: await bcrypt.hash(pro.password, 10)
      }))
    )

    // Insert professionals
    const result = await User.insertMany(hashedProfessionals)
    console.log(`✅ Successfully inserted ${result.length} professionals`)
    
    // List inserted professionals
    result.forEach(pro => {
      console.log(`- ${pro.name} (${pro.sector}) - ${pro.location} - Rating: ${pro.rating}`)
    })

  } catch (error) {
    console.error('Error seeding professionals:', error)
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed')
  }
}

seedProfessionals() 