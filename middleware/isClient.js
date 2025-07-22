const isClient = (req, res, next) => {
  if (req.session.user && req.session.user.isPro === false) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};

export default isClient; 