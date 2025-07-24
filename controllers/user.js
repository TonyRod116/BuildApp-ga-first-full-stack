import User from '../models/user.js'
import express from 'express'
import Project from '../models/project.js'
import Comment from '../models/comment.js'
import ReviewsRating from '../models/reviewsRating.js'
import multer from 'multer'
import isClient from '../middleware/isClient.js';
import isSignedIn from '../middleware/isSignedIn.js';

const router = express.Router()

// Simple welcome page route
router.get('/', async (req, res) => {
  try {
    const user = req.session.user || null;
    res.render('index', { user });
  } catch (error) {
    console.error('Error loading welcome page:', error);
    res.status(500).render('index', { 
      user: null,
      error: 'Error loading welcome page'
    });
  }
});

// Marketing home page route
router.get('/home', async (req, res) => {
  try {
    const user = req.session.user || null;
    res.render('home', { user });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).render('home', { 
      user: null,
      error: 'Error loading home page'
    });
  }
});

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
    const professionals = await User.find({ isPro: true });
    
    // Get ratings for each professional
    const professionalsWithRatings = await Promise.all(professionals.map(async (professional) => {
      const ratings = await ReviewsRating.find({ 
        targetUserId: professional._id,
        type: 'professional'
      });
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0;
      
      return {
        ...professional.toObject(),
        rating: {
          average: Math.round(averageRating * 10) / 10,
          total: totalRatings
        }
      };
    }));
    
    return res.render('proslist', { professionals: professionalsWithRatings });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    res.status(500).render('proslist', { 
      professionals: [],
      error: 'Error loading professionals'
    });
  }
});

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
    
    // Get ratings for professionals
    let ratings = null;
    if (user.isPro) {
      const professionalRatings = await ReviewsRating.find({ 
        targetUserId: user.id,
        type: 'professional'
      }).populate('userId', 'name');
      
      const totalRatings = professionalRatings.length;
      const averageRating = totalRatings > 0 
        ? professionalRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0;
      
      ratings = {
        average: Math.round(averageRating * 10) / 10,
        total: totalRatings,
        recent: professionalRatings.slice(0, 10) // Show last 10 ratings
      };
    }
    
    // Get ratings given by client (if user is a client)
    let ratingsGiven = null;
    if (!user.isPro) {
      const clientRatings = await ReviewsRating.find({ 
        userId: user.id,
        type: 'professional'
      });
      
      ratingsGiven = {
        total: clientRatings.length,
        average: clientRatings.length > 0 
          ? Math.round((clientRatings.reduce((sum, r) => sum + r.rating, 0) / clientRatings.length) * 10) / 10
          : 0
      };
    }
    
    return res.render('profile', {
      user,
      clientProjects,
      clientComments,
      isPro,
      appliedProjects,
      ratings,
      ratingsGiven
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).render('profile', { 
      user: null,
      error: 'Error loading user',
      appliedProjects: [],
      ratings: null,
      ratingsGiven: null
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
    const { name, email, sector, location, experience, bio } = req.body;
    const updateData = { name, email, sector, location, experience: experience ? parseInt(experience) : 0, bio };
    if (req.file) {
      updateData.profilePic = '/uploads/' + req.file.filename;
    }
    await User.findByIdAndUpdate(user.id, updateData);
    req.session.user.name = name;
    req.session.user.email = email;
    req.session.user.sector = sector;
    req.session.user.location = location;
    req.session.user.experience = experience ? parseInt(experience) : 0;
    req.session.user.bio = bio;
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

// Public route with all projects and comments
router.get('/projects/public', async (req, res) => {
  try {
    const projects = await Project.find().populate('createdBy', 'name');
    
    // Load comments and check if professional has applied
    const projectsWithComments = await Promise.all(projects.map(async (project) => {
      const comments = await Comment.find({ project: project._id }).populate('user', 'name');
      const commentsWithUserData = comments.map(comment => ({
        comment: comment.comment,
        userName: comment.user.name,
        createdAt: comment.createdAt
      }));
      
      // Check if current user (if professional) has already applied
      let hasApplied = false;
      if (req.session.user && req.session.user.isPro) {
        hasApplied = project.appliedBy && project.appliedBy.includes(req.session.user.id);
      }
      
      return {
        ...project.toObject(),
        comments: commentsWithUserData,
        hasApplied: hasApplied
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

router.get('/projects/new', isClient, async (req, res) => {
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

router.post('/projects', isClient, upload.array('images', 4), async (req, res) => {
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

router.get('/projects/:id/edit', isClient, async (req, res) => {
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

router.post('/projects/:id/edit', isClient, upload.array('images', 4), async (req, res) => {
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
      // Add new images to existing ones instead of replacing
      if (!project.images) {
        project.images = [];
      }
      project.images = [...project.images, ...newImages];
    }
    await project.save();
    res.redirect('/client/projects');
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).render('error', { message: 'Error updating project' });
  }
});

router.post('/projects/:id/delete', isClient, async (req, res) => {
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

router.post('/projects/:id/images/:imageIndex/delete', isClient, async (req, res) => {
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

// Application route for professionals
router.post('/projects/:id/apply', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.isPro) {
      return res.status(401).json({ 
        success: false, 
        message: 'You must be logged in as a professional to apply' 
      });
    }
    
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    // Check if already applied
    if (project.appliedBy && project.appliedBy.includes(user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied to this project' 
      });
    }
    
    // Add professional to project's appliedBy array
    if (!project.appliedBy) {
      project.appliedBy = [];
    }
    project.appliedBy.push(user.id);
    await project.save();
    
    res.json({ 
      success: true, 
      message: 'Successfully applied to the project' 
    });
  } catch (error) {
    console.error('Error applying to project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error applying to project' 
    });
  }
});

// Cancel application route for professionals
router.post('/projects/:id/cancel-application', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.isPro) {
      return res.status(401).json({ 
        success: false, 
        message: 'You must be logged in as a professional to cancel application' 
      });
    }
    
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    // Check if has applied
    if (!project.appliedBy || !project.appliedBy.includes(user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have not applied to this project' 
      });
    }
    
    // Remove professional from project's appliedBy array
    project.appliedBy = project.appliedBy.filter(id => id.toString() !== user.id.toString());
    await project.save();
    
    res.json({ 
      success: true, 
      message: 'Successfully cancelled application to the project' 
    });
  } catch (error) {
    console.error('Error cancelling application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling application' 
    });
  }
});

// Upload portfolio photos route
router.post('/profile/upload-photo', isSignedIn, upload.any(), async (req, res) => {
  try {
    // Logged in?
    const user = req.session.user;
    
    // Pro?
    if (!user.isPro) {
      return res.status(403).render('error', { message: 'Only professionals can upload portfolio photos' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).render('error', { message: 'No files uploaded' });
    }
    
    // Process multiple photos - handle both single and multiple files
    const photoPaths = req.files.map(file => '/uploads/' + file.filename);
    
    // Add photos to user's images array
    if (!user.images) {
      user.images = [];
    }
    user.images.push(...photoPaths);
    
    // Update user in database
    await User.findByIdAndUpdate(user.id, { 
      $push: { images: { $each: photoPaths } } 
    });
    
    // Update session
    req.session.user.images = user.images;
    
    res.redirect('/client/profile');
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).render('error', { message: 'Error uploading photos' });
  }
});



// Delete portfolio image route
router.post('/profile/images/:imageIndex/delete', isSignedIn, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user.isPro) {
      return res.status(403).render('error', { message: 'Only professionals can delete portfolio images' });
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= user.images.length) {
      return res.status(400).render('error', { message: 'Invalid image index' });
    }
    
    // Remove image from user's images array
    user.images.splice(imageIndex, 1);
    
    // Update user in database
    await User.findByIdAndUpdate(user.id, { 
      images: user.images 
    });
    
    // Update session
    req.session.user.images = user.images;
    
    res.redirect('/client/profile');
  } catch (error) {
    console.error('Error deleting portfolio image:', error);
    res.status(500).render('error', { message: 'Error deleting portfolio image' });
  }
});

// Route to show which professionals have applied to which projects
router.get('/applications', isSignedIn, async (req, res) => {
  try {
    const user = req.session.user;
    
    // Get all projects with their applications
    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .populate('appliedBy', 'name email sector location experience');
    
    // Group applications by project
    const applicationsByProject = projects.map(project => ({
      project: {
        id: project._id,
        title: project.title,
        type: project.type,
        price: project.price,
        location: project.location,
        createdBy: project.createdBy
      },
      applications: project.appliedBy || []
    }));
    
    res.render('applications', { 
      user, 
      applicationsByProject,
      totalProjects: projects.length,
      totalApplications: projects.reduce((sum, project) => sum + (project.appliedBy ? project.appliedBy.length : 0), 0)
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).render('error', { message: 'Error loading applications data' });
  }
});

// Route to view a specific professional's profile
router.get('/pro/:professionalId', isSignedIn, async (req, res) => {
  try {
    const professionalId = req.params.professionalId;
    const user = req.session.user;
    
    // Find the professional
    const professional = await User.findById(professionalId);
    if (!professional || !professional.isPro) {
      return res.status(404).render('error', { message: 'Professional not found' });
    }
    
    // Get projects this professional has applied to
    const appliedProjects = await Project.find({ 
      appliedBy: professionalId 
    }).populate('createdBy', 'name');
    
    // Get comments by this professional
    const clientComments = await Comment.find({ 
      user: professionalId 
    }).populate('project', 'title');
    
    // Get ratings for this professional
    const ratings = await ReviewsRating.find({ 
      targetUserId: professionalId,
      type: 'professional'
    }).populate('userId', 'name');
    
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;
    
    // Check if current user has already rated this professional
    const userRating = await ReviewsRating.findOne({ 
      targetUserId: professionalId, 
      userId: user.id,
      type: 'professional'
    });
    
    res.render('pro-profile', { 
      user, 
      professional,
      appliedProjects,
      clientComments,
      ratings: {
        average: Math.round(averageRating * 10) / 10,
        total: totalRatings,
        userRating: userRating ? userRating.rating : null,
        recent: ratings.slice(0, 5) // Show last 5 ratings
      }
    });
  } catch (error) {
    console.error('Error fetching professional profile:', error);
    res.status(500).render('error', { message: 'Error loading professional profile' });
  }
});



// Route to rate a professional
router.post('/rate/:professionalId', isSignedIn, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const professionalId = req.params.professionalId;
    const clientId = req.session.user.id;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    // Check if professional exists and is actually a professional
    const professional = await User.findById(professionalId);
    if (!professional || !professional.isPro) {
      return res.status(404).json({ 
        success: false, 
        message: 'Professional not found' 
      });
    }
    
    // Check if client is not rating themselves
    if (professionalId === clientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot rate yourself' 
      });
    }
    
    // Check if user has already rated this professional
    const existingRating = await ReviewsRating.findOne({ 
      targetUserId: professionalId, 
      userId: clientId,
      type: 'professional'
    });
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
    } else {
      // Create new rating
      await ReviewsRating.create({
        type: 'professional',
        userId: clientId,
        targetUserId: professionalId,
        rating: rating,
        review: review
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Rating submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting rating' 
    });
  }
});

// Route to get professional's average rating
router.get('/rating/:professionalId', async (req, res) => {
  try {
    const professionalId = req.params.professionalId;
    
    const ratings = await ReviewsRating.find({ 
      targetUserId: professionalId,
      type: 'professional'
    }).populate('userId', 'name');
    
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;
    
    res.json({
      success: true,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings,
      ratings: ratings.slice(0, 10) // Return last 10 ratings
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching ratings' 
    });
  }
});

export default router;