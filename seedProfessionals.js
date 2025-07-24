import mongoose from 'mongoose'
import 'dotenv/config'
import User from './models/user.js'
import ReviewsRating from './models/reviewsRating.js'
import bcrypt from 'bcrypt'

const professionals = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
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
    email: "sarah.johnson@example.com",
    password: "password123",
    profilePic: "/media/default-avatar.png",
    experience: 12,
    bio: "Certified electrician with extensive experience in domestic and commercial installations.",
    isPro: true,
    sector: "Electrician",
    location: "Barcelona",
    contact: "+34 600 234 567",
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

    // Create sample ratings for professionals
    for (const pro of result) {
      // Create 2-3 sample ratings for each professional
      const sampleRatings = [
        {
          type: 'professional',
          userId: null, // Anonymous rating
          targetUserId: pro._id,
          rating: pro.rating,
          review: `Great work by ${pro.name}! Very professional and reliable.`
        },
        {
          type: 'professional',
          userId: null, // Anonymous rating
          targetUserId: pro._id,
          rating: Math.max(1, pro.rating - 1), // Slightly lower rating
          review: `Good service from ${pro.name}. Would recommend.`
        }
      ]

      await ReviewsRating.insertMany(sampleRatings)
      console.log(`✅ Created ${sampleRatings.length} ratings for ${pro.name}`)
    }

  } catch (error) {
    console.error('Error seeding professionals:', error)
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed')
  }
}

seedProfessionals() 