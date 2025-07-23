import User from '../models/user.js'
import express from 'express'
import Project from '../models/project.js'
import Comment from '../models/comment.js'
import multer from 'multer'
import isClient from '../middleware/isClient.js';
import isSignedIn from '../middleware/isSignedIn.js';

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

// Application route for professionals - moved to top to avoid conflicts
router.post('/projects/:id/apply', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.isPro) {
      return res.status(401).render('error', { message: 'You must be logged in as a professional to apply' });
    }
    
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found' });
    }
    
    // Check if already applied
    if (project.appliedBy && project.appliedBy.includes(user.id)) {
      return res.status(400).render('error', { message: 'You have already applied to this project' });
    }
    
    // Add professional to project's appliedBy array
    if (!project.appliedBy) {
      project.appliedBy = [];
    }
    project.appliedBy.push(user.id);
    await project.save();
    
    res.redirect('/client/projects/public');
  } catch (error) {
    console.error('Error applying to project:', error);
    res.status(500).render('error', { message: 'Error applying to project' });
  }
});

router.get('/pro-list', async (req, res) => {
  try {
    const professionals = await User.find({ isPro: true })   
    return res.render('proslist', { professionals })
  } catch (error) {
    console.error('Error fetching professionals:', error)
    res.status(500).render('proslist', { 
      professionals: [],
      error: 'Error loading professionals'
    })
  }
})

router.get('/profile', isSignedIn, async (req, res) => {
  try {
    const user = req.session.user; 
    const isPro = await User.find({ isPro: true });
    const clientProjects = await Project.find({ createdBy: user.id });
    const clientComments = await Comment.find({ user: user.id });

    // For professionals, get their applied projects
    let appliedProjects = [];
    if (user.isPro) {
      appliedProjects = await Project.find({ 
        appliedBy: { $in: [user.id] } 
      });
    }

    return res.render('profile', {
      user,
      clientProjects,
      clientComments,
      isPro,
      appliedProjects
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).render('profile', { 
      user: null,
      error: 'Error loading user',
      appliedProjects: []
    });
  }
});

router.get('/edit-profile', isSignedIn, async (req, res) => {
  try {
    const user = req.session.user;
    return res.render('edit-profile', { user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).render('edit-profile', { 
      user: null,
      error: 'Error loading user'
    });
  }
});

router.post('/edit-profile', isSignedIn, upload.single('profilePic'), async (req, res) => {
  try {
    const user = req.session.user;
    const { name, email } = req.body;
    const updateData = { name, email };
    if (req.file) {
      updateData.profilePic = '/uploads/' + req.file.filename;
    }
    await User.findByIdAndUpdate(user.id, updateData);
    req.session.user.name = name;
    req.session.user.email = email;
    if (req.file) req.session.user.profilePic = updateData.profilePic;
    res.redirect('/client/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).render('edit-profile', { user: req.session.user, error: 'Error updating profile' });
  }
});

router.get('/projects', isClient, async (req, res) => {
  try {
    const user = req.session.user;
    const projects = await Project.find({ createdBy: user.id });
    
    // Load comments
    const projectsWithComments = await Promise.all(projects.map(async (project) => {
      const comments = await Comment.find({ project: project._id }).populate('user', 'name');
      const commentsWithUserData = comments.map(comment => ({
        comment: comment.comment,
        userName: comment.user.name,
        createdAt: comment.createdAt
      }));
      
      return {
        ...project.toObject(),
        comments: commentsWithUserData
      };
    }));
    
    res.render('projects', { user, projects: projectsWithComments });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).render('projects', { 
      user: null,
      error: 'Error loading projects'
    });
  }
});

// Ruta pública para ver todos los proyectos con comentarios
router.get('/projects/public', async (req, res) => {
  try {
    const projects = await Project.find().populate('createdBy', 'name');
    
    // Load comments
    const projectsWithComments = await Promise.all(projects.map(async (project) => {
      const comments = await Comment.find({ project: project._id }).populate('user', 'name');
      const commentsWithUserData = comments.map(comment => ({
        comment: comment.comment,
        userName: comment.user.name,
        createdAt: comment.createdAt
      }));
      
      return {
        ...project.toObject(),
        comments: commentsWithUserData
      };
    }));
    
    res.render('projects', { 
      user: req.session.user || null, 
      projects: projectsWithComments
    });
  } catch (error) {
    console.error('Error fetching public projects:', error);
    res.status(500).render('error', { message: 'Error loading projects' });
  }
});

// Comments
router.post('/projects/:id/comment', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).render('error', { message: 'You must be logged in to comment' });
    }
    
    const { comment } = req.body;
    const projectId = req.params.id;
    
    // project exists?
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found' });
    }
    
    // Create comment
    const newComment = new Comment({
      comment,
      user: user.id,
      project: projectId
    });
    
    await newComment.save();
    res.redirect('/client/projects/public');
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).render('error', { message: 'Error adding comment' });
  }
});

router.get('/projects/new', isSignedIn, async (req, res) => {
  try {
    const user = req.session.user;
    res.render('new-project', { user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).render('new-project', { 
      user: null,
      error: 'Error loading user'
    });
  }
});

router.post('/projects', isSignedIn, upload.array('images', 4), async (req, res) => {
  try {
    const user = req.session.user;
    const { title, description, location, type, price } = req.body;
    const existingProject = await Project.findOne({ 
      title: title, 
      createdBy: user.id 
    });
    if (existingProject) {
      return res.status(400).render('new-project', { 
        user: req.session.user,
        error: 'A project with this title already exists'
      });
    }
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
    res.status(500).render('new-project', { 
      user: req.session.user,
      error: 'Error creating project'
    });
  }
});

router.get('/projects/:id/edit', isSignedIn, async (req, res) => {
  try {
    const user = req.session.user;
    const project = await Project.findOne({ _id: req.params.id, createdBy: user.id });
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found or you are not authorized to edit this project' });
    }
    res.render('edit-project', { user, project });
  } catch (error) {
    console.error('Error fetching project for edit:', error);
    res.status(500).render('error', { message: 'Error loading project' });
  }
});

router.post('/projects/:id/edit', isSignedIn, upload.array('images', 4), async (req, res) => {
  try {
    const user = req.session.user;
    const { title, description, location, type, price } = req.body;
    const project = await Project.findOne({ _id: req.params.id, createdBy: user.id });
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found or you are not authorized to edit this project' });
    }
    project.title = title;
    project.description = description;
    project.location = location;
    project.type = type;
    project.price = parseFloat(price) || 0;
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

router.post('/projects/:id/delete', isSignedIn, async (req, res) => {
  try {
    const user = req.session.user;
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

router.post('/projects/:id/images/:imageIndex/delete', isSignedIn, async (req, res) => {
  try {
    const user = req.session.user;
    const project = await Project.findOne({ _id: req.params.id, createdBy: user.id });
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found or you are not authorized to modify this project' });
    }
    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= project.images.length) {
      return res.status(400).render('error', { message: 'Invalid image index' });
    }
    project.images.splice(imageIndex, 1);
    await project.save();
    res.redirect(`/client/projects/${req.params.id}/edit`);
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).render('error', { message: 'Error deleting image' });
  }
});

export default router;