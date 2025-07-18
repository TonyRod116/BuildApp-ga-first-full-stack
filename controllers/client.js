import User from '../models/user.js'

export const showProsList = async (req, res) => {
  try {
    const professionals = await User.find({ isPro: true })   
    return res.render('client/proslist', { professionals })
  } catch (error) {
    console.error('Error fetching professionals:', error)
    res.status(500).render('client/proslist', { 
      professionals: [],
      error: 'Error loading professionals'
    })
  }
} 

