const isPro = (req, res, next) => {
  if (req.session.user.isPro) {
    next();
  } else {
    res.redirect('/auth/client/login');
  }
};

export default isPro;