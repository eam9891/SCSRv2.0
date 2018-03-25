/**
 * app/routes/dashboard-route.js
 *
 * This file contains all handlers for requests to /dashboard.
 * This route is authenticated by an administrator only
 *
 */
module.exports = function(server, passport) {

    /**
     * REST POST Request endpoint for login
     * This is where all login request get processed
     */
    server.post('/login', passport.authenticate('local-login', {
            failureRedirect : '/',  // Redirect back to the home page if there is an error
            failureFlash : true     // Allow flash messages
        }), roleRedirect            // Specify our callback function
    );

    /**
     * Anonymous callback function from successful login
     * If this function gets called, authentication was successful.
     * req.user contains the authenticated user, eg. we can use req.user.username
     */
    function roleRedirect(req, res) {

        /**
         * Set a session cookie, so we can remember the session
         * This session cookie contains a session ID which is private key encrypted
         * The server can use this to validate ongoing connections, hence the name sessions
        */
        if (req.body.remember) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            req.session.cookie.expires = false;
        }

        // Redirect based on role
        if (req.user.role === "admin") {
            res.redirect('/admin');
        } else {
            res.redirect('/profile');
        }
    }



    // Old Login Page
    //server.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    //res.render('login.ejs', { message: req.flash('loginMessage') });
    //});

};