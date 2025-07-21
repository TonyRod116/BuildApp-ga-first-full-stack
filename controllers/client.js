import User from '../models/user.js'
import router from './auth.js'
import Project from '../models/project.js'
import Comment from '../models/comment.js'



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

router.get('/client/profile', async (req, res) => {
  try {
  const user = req.session.user; 
  if (!user) {
    return res.redirect('/auth/client/login');
  }
  const isPro = await User.find({ isPro: true });
  const clientProjects = await Project.find({ createdBy: user.id });
  const clientComments = await Comment.find({ user: user.id });
  return res.render('client/client-profile', {
    user,
    clientProjects,
    clientComments,
    isPro,
  });
} catch (error) {
  console.error('Error fetching user:', error);
  res.status(500).render('client/client-profile', { 
    user: null,
    error: 'Error loading user'
  });
}
});

router.get('/client/edit-client-profile', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.redirect('/auth/client/login');
    }
    return res.render('client/edit-client-profile', { user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).render('client/edit-client-profile', { 
      user: null,
      error: 'Error loading user'
    });
  }
});