function checkAuth(req, res, next) {
    if (req.session && req.session.loggedin) {
        return next();
    }
    res.redirect('/');
}

module.exports = checkAuth;
