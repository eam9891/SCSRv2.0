/**
 * app/routes/profile-route.js
 *
 * This file contains all handlers for requests to /profile.
 * This route will display the users profile
 *
 * ToDo: UI needs work, very basic right now
 *
 */
module.exports = function(server) {

    // Protected Profile Page
    // We will use route middleware to verify this (the isLoggedIn function)
    server.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user[0] // get the user out of session and pass to template
        });
    });

    // Route middleware to make sure user is authenticated
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't, destroy the sesion and redirect them to the home page
        req.session.destroy();
        res.redirect('/');
    }

};