import User from '../models/user.js'
import express from 'express'
import Project from '../models/project.js'
import Comment from '../models/comment.js'
import multer from 'multer'

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });


router.get('/pro-list', async (req, res) => {
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
})


router.get('/profile', async (req, res) => {
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

router.get('/edit-client-profile', async (req, res) => {
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

router.get('/projects', async (req, res) => {
  try {
  const user = req.session.user;
  if (!user) return res.redirect('/auth/client/login');
  
  // Check if user is not a professional
  if (user.isPro) {
    return res.status(403).render('error', { message: 'Only clients can view projects' });
  }
  
  const projects = await Project.find({ createdBy: user.id });
  res.render('client/projects', { user, projects });
} catch (error) {
  console.error('Error fetching projects:', error);
  res.status(500).render('client/projects', { 
    user: null,
    error: 'Error loading projects'
  });
}
});

router.get('/projects/new', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/auth/client/login');
    
    // Check if user is not a professional
    if (user.isPro) {
      return res.status(403).render('error', { message: 'Only clients can create projects' });
    }
    
    res.render('client/new-project', { user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).render('client/new-project', { 
      user: null,
      error: 'Error loading user'
    });
  }
});

router.post('/projects', upload.array('images', 5), async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    
    const user = req.session.user;
    if (!user) return res.redirect('/auth/client/login');
    
    // Check if user is not a professional
    if (user.isPro) {
      return res.status(403).render('client/new-project', { 
        user: req.session.user,
        error: 'Only clients can create projects'
      });
    }
    
    const { title, description, location, type, price } = req.body;
    console.log('Object Data:', { title, description, location, type, price });
    
    // verufy there's no two same projects
    const existingProject = await Project.findOne({ 
      title: title, 
      createdBy: user.id 
    });
    
    if (existingProject) {
      return res.status(400).render('client/new-project', { 
        user: req.session.user,
        error: 'A project with this title already exists'
      });
    }
    
    // process images if uploaded
    const images = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];
    
    const project = new Project({ 
      title, 
      description, 
      location,
      type,
      price: parseFloat(price) || 0,
      images,
      createdBy: user.id 
    });
    await project.save();
    res.redirect('/client/projects');
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).render('client/new-project', { 
      user: req.session.user,
      error: 'Error creating project'
    });
  }
});

// Route to show edit project form
router.get('/projects/:id/edit', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/auth/client/login');
    
    // Check if user is not a professional
    if (user.isPro) {
      return res.status(403).render('error', { message: 'Only clients can edit projects' });
    }
    
    const project = await Project.findOne({ _id: req.params.id, createdBy: user.id });
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found or you are not authorized to edit this project' });
    }
    
    res.render('client/edit-project', { user, project });
  } catch (error) {
    console.error('Error fetching project for edit:', error);
    res.status(500).render('error', { message: 'Error loading project' });
  }
});

// Route to handle project update
router.post('/projects/:id/edit', upload.array('images', 5), async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/auth/client/login');
    
    // Check if user is not a professional
    if (user.isPro) {
      return res.status(403).render('error', { message: 'Only clients can edit projects' });
    }
    
    const { title, description, location, type, price } = req.body;
    
    const project = await Project.findOne({ _id: req.params.id, createdBy: user.id });
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found or you are not authorized to edit this project' });
    }
    
    // Update project fields
    project.title = title;
    project.description = description;
    project.location = location;
    project.type = type;
    project.price = parseFloat(price) || 0;
    
    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => '/uploads/' + file.filename);
      project.images = newImages;
    }
    
    await project.save();
    res.redirect('/client/projects');
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).render('error', { message: 'Error updating project' });
  }
});

// Route to handle project deletion
router.post('/projects/:id/delete', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/auth/client/login');
    
    // Check if user is not a professional
    if (user.isPro) {
      return res.status(403).render('error', { message: 'Only clients can delete projects' });
    }
    
    const project = await Project.findOne({ _id: req.params.id, createdBy: user.id });
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found or you are not authorized to delete this project' });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    res.redirect('/client/projects');
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).render('error', { message: 'Error deleting project' });
  }
});

// Route to handle individual image deletion
router.post('/projects/:id/images/:imageIndex/delete', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/auth/client/login');
    
    // Check if user is not a professional
    if (user.isPro) {
      return res.status(403).render('error', { message: 'Only clients can delete project images' });
    }
    
    const project = await Project.findOne({ _id: req.params.id, createdBy: user.id });
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found or you are not authorized to modify this project' });
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= project.images.length) {
      return res.status(400).render('error', { message: 'Invalid image index' });
    }
    
    // Remove the image at the specified index
    project.images.splice(imageIndex, 1);
    await project.save();
    
    res.redirect(`/client/projects/${req.params.id}/edit`);
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).render('error', { message: 'Error deleting image' });
  }
});

export default router;