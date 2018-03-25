/**
 * app/routes/default-route.js
 *
 * This file contains all handlers for requests to /.
 * This is the default route to the home/main page
 *
 *
 */
module.exports = function(server) {

	// Main page
	server.get('/', function(req, res) {

        // Render the default view, ie. send back the index.ejs file
		res.render('index.ejs');

	});


};



