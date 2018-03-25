/* app/routes/dashboard-route.js

   This file contains all handlers for requests to /dashboard.
   This route is authenticated by an administrator only

 */
module.exports = function(server, passport, os) {

    // Dashboard system stats REST endpoint
    // Need to verify any requests to this page, Admin Only
    // POST request that sends back system information
    server.post('/dashboard', isLoggedInAdmin, function (req, res) {
        // Send back statistics about our system
        res.send(JSON.stringify({
            arch: os.arch(),
            platform: os.platform(),
            hostname: os.hostname(),
            loadavg: os.loadavg(),
            cpus: os.cpus(),
            freemem: os.freemem(),
            totalmem: os.totalmem(),
            uptime: os.uptime(),
            netint: os.networkInterfaces()

        }))
    });

};

// Route middleware to make sure admin is authenticated
function isLoggedInAdmin(req, res, next) {

    // if user is authenticated in the session and an admin, carry on
    if (req.isAuthenticated() && req.user.role === "admin")
        return next();

    // if they aren't, destroy the sesion and redirect them to the home page
    req.session.destroy();
    res.redirect('/');
}