/**
 * app/routes/logout-route.js
 *
 * This file contains all handlers for requests to /logout.
 * This route will log out a user
 *
 */
module.exports = function(server) {

    // Logout
    server.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};