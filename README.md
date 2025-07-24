BuildApp


Description:
BuildApp is a full-stack web platform developed as part of my software engineering bootcamp. The project connects clients with skilled professionals (electricians, plumbers, builders, etc.) for construction and service projects. 
Clients can post new projects and browse professionals, while professionals can showcase their portfolios, apply to projects, and receive ratings and reviews. 
The app was built with Node.js, Express, MongoDB (Mongoose), EJS and CSS, and supports both local and serverless (Netlify) deployment.

Getting Started / Code Installation
1. Clone the repository:
   git clone <repo-url>
   cd buildapp
2. Install dependencies:
   npm install
3. Configure your .env file:
   MONGODB_URI=mongodb://localhost:27017/buildapp
   SESSION_SECRET=your_secret
   PORT=3000
5. Start the server:
   npm start

Timeframe & Working Team:
- Time allocated: 1 week (Bootcamp sprint)
- Type: Solo project (individual work)
Technologies Used
- Back End: Node.js, Express.js, MongoDB, Mongoose
- Front End: EJS (templating), HTML5, CSS3, JavaScript
- Authentication: express-session, bcrypt
- File Uploads: Multer (local), Cloudinary (cloud)
- Deployment: Netlify Functions (serverless-ready)
- Others: dotenv, FontAwesome, method-override
Brief
- Clients can create projects, view professionals and post project requirements.
- Professionals can create a detailed profile, upload portfolio images, and apply to projects.
- Clients can review Professionals.
- Full authentication and session management.
- Responsive, modern UI for all user types.
- Secure storage and validation of all user and project data.
Planning
- Wireframes & Design: Sketched initial mockups for the landing page and key flows. Designed a simple, visual home page (see screenshots).
- ERD (Data modeling): Users (clients & professionals, differentiated by isPro), Projects (linking users), Comments (for projects and profiles), ReviewsRating (ratings for both professionals and projects)
- Project Management: Trello for task organization, Figma for wireframes, dbdiagram.io for ERD.
- Sprint Plan:
  - Day 1-2: Auth, models, user stories, registration/login logic
  - Day 3-4: Project logic, file uploads
  - Day 5-6: Applications, ratings, comments
  - Day 7: Testing, UI/UX polish, documentation
Build / Code Process
- Authentication & Models: Implemented secure registration and login, using session-based authentication and bcrypt for password hashing. Unified user model for both clients and professionals with a boolean isPro flag.
- Projects CRUD: RESTful controllers for projects, with full validation. Users can create, edit, and delete their own projects. Professionals can browse all projects and apply.
- Portfolio & Applications: Professionals can upload multiple images to their profile and apply to any open project. All file uploads are validated (Multer) and can be stored locally or on Cloudinary.
- Ratings & Reviews: Models and logic for project/professional ratings (1-5 stars), reviews, and automatic average calculation. Prevented self-rating and duplicate reviews.
- Frontend: Reusable EJS templates, modern CSS (Grid & Flexbox), modal dialogs for image viewing, alerts, and confirmations for all critical actions.
- Key snippet example:
  # Middleware for session authentication
  module.exports = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    next();
  };
Challenges
- Merging clients and professionals into a single, flexible user model.
- Implementing file upload and image management (especially for production and cloud storage).
- Preventing duplicate applications and self-reviews.
- Ensuring a clean and modern UI/UX for all users.
- Adjusting sessions and authentication to work both locally and with Netlify Functions (serverless).
- Debugging session persistence issues on serverless deployment.
Wins
- Professional ratings system with statistics and media, visible in each profile.
- Modern, visual portfolio gallery for professionals.
- Modular, scalable codebase (controllers, models, middleware).
- Clean onboarding and user journey for both clients and professionals.
- Working deployment both locally and (optionally) serverless.
Key Learnings / Takeaways
- Solidified my understanding of secure authentication (sessions, bcrypt).
- Improved data modeling (single user collection with roles).
- Learned integration of file uploads, image validation, and cloud storage.
- Sharpened my skills in UI/UX and full-stack delivery.
- Practiced writing thorough technical documentation (README).
Bugs
- Occasionally, session persistence may fail on Netlify serverless deployment after a period of inactivity.
Future Improvements
- Real-time chat between users.
- Notification system (in-app or email).
- Switch all file/image uploads to cloud storage by default (Cloudinary or AWS S3).
- Reviews for professionals on their fully completed projects will be weighted more heavily and visually highlighted in the app.
- Advanced search with filtering and geolocation.
 
BuildApp: Startup Vision and Demo Disclaimer
BuildApp: Startup Vision and Demo Disclaimer

BuildApp is much more than a simple marketplace—it's a project with a vision to redefine how clients and professionals connect, collaborate, and succeed in the construction and home services industry.
This open repository contains only a basic MVP demo, focused on user authentication, project listings, image uploads, and client-to-professional reviews.

The full BuildApp startup (currently in private development) will include many other advanced features.

Legal Notice:
The BuildApp name, idea, and business concept are protected by copyright and intellectual property laws. Any reproduction or commercial use of the idea or code without my written consent is strictly prohibited.

You can find this demo/MVP version here:
https://github.com/TonyRod116/BuildApp-ga-first-full-stack

