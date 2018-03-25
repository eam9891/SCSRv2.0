/**
 * app/routes/signup-route.js
 *
 * This file contains all handlers for requests to /signup.
 * There are two route handlers for POST and GET requests to /signup
 *
 */
module.exports = function(server, passport) {

    // Signup Page
    server.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // Process the signup form
    server.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
};