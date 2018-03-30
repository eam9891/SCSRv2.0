/**
 * app/routes/admin-route.js
 *
 * This file contains all handlers for requests to /admin.
 * This route is authenticated by an administrator only
 *
 */
module.exports = function(server, config) {

    // Protected Admin Page
    // Need to verify any requests to this page
    server.get('/admin', isLoggedInAdmin, function (req, res) {

        // Render the default admin view
        res.render('admin/admin.ejs', {
            user : req.user[0], // pass user to template
            config: config   // pass config to template
        });

    });

    // Route middleware to make sure admin is authenticated
    function isLoggedInAdmin(req, res, next) {

        // if user is authenticated in the session and an admin, carry on
        if (req.isAuthenticated() && req.user[0].role === "admin")
            return next();

        // if they aren't, destroy the session and redirect them to the home page
        req.session.destroy();
        res.redirect('/');
    }

};