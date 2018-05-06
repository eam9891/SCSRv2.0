/**
 * server.js
 *
 * This is the executable script to start scsr-server
 * Once running, it will process HTTP and WebSocket requests on user configurable ports
 *
 */


/** Set up all node_modules / dependencies */
const session      = require('express-session');              //
const cookieParser = require('cookie-parser');                //
const bodyParser   = require('body-parser');                  //
const morgan       = require('morgan');                       //
const passport     = require('passport');                     //
const flash        = require('connect-flash');                //
const path         = require('path');                         //
const os           = require('os');                           //
const chalk        = require('chalk');                        // Lib for CLI colors
const bcrypt       = require('bcrypt-nodejs');
const sql          = require('mysql');
const shell        = require('shelljs');
const webcam       = require('./server/webcam/webcam')(shell);


/** Get all configuration files */
const config       = require('./config/server-config');       // Main Configuration File
const db_config    = require('./config/database');


/** Set up http and websocket server */
const express      = require('express');                      //
const server       = express();
const fileUpload   = require('express-fileupload');
const port         = config.server.port;
require('express-ws')(server);


/** Set up database connection objects */
//var sql = require('mariasql');
const mysql = sql.createConnection(db_config.connection);
mysql.connect(function(error) {
    if (error) console.log(error);
    console.log("Connected!");
    mysql.query('USE ' + db_config.database, function (error) {
        if (error) console.log(error);
    });
});



/** Set up passport and local strategy objects */
const LocalStrategy = require('passport-local').Strategy;
require('./config/passport')(passport, mysql, bcrypt, LocalStrategy); // Passport config, pass in dependencies


/** Set up our express application */
server.use(morgan('dev'));                                  // Log every request to the console
server.use(cookieParser());                                 // Set up cookie reader (needed for auth)
server.use(bodyParser.urlencoded({ extended: true }));      // Set up url encoding
server.use(bodyParser.json());                              // Set up json parser
server.set('view engine', 'ejs');                           // Set up ejs for templating
server.use(session({                                        // Set up session handler
	secret: 'scsrrandomsecretkeycontainingnonsense',        // Secret session key
	resave: true,                                           // Enable re-save
	saveUninitialized: true,                                // Enable save uninitialized,
    cookie: { expires : new Date(Date.now() + 3600000) }    // Expire cookie after 1 hour
 }));
server.use(passport.initialize());                          // Set up Passport (needed for auth)
server.use(passport.session());                             // Set up persistent login sessions
server.use(flash());                                        // Set up connect-flash for messages stored in session
server.use(fileUpload());
server.use(express.static(__dirname + '/client/css'));      // Set a static path for client side css files
server.use(express.static(__dirname + '/client/js'));       // Set a static path for client side js files
server.use(express.static(__dirname + '/client/public'));   // Set a static path for client side libraries
server.set('views', path.join(__dirname, '/client/views')); // Set the views path


/** Load all HTTP server routes */
require('./server/http/default-route.js')(server);
require('./server/http/login-route.js')(server, passport);
require('./server/http/logout-route.js')(server);
require('./server/http/signup-route.js')(server, passport);
require('./server/http/admin-route.js')(server, config);
require('./server/http/profile-route.js')(server);
require('./server/http/dashboard-route.js')(server, passport, os);
require('./server/http/upload-route.js')(server);


/** Load SerialPort WebSocket server route */
require('./server/websocket/ws-server.js')(server, webcam, config, chalk, shell);



/** Launch the server */
server.listen(port);
console.log('Serving HTTP at: http://' + config.server.host +':' + port);
console.log('Serving WebSocket at: ws://'+ config.server.host +':' + port);