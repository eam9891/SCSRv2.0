/* create-db.js
 *
 * This file is an executable command line program that will create a database, create a users table,
 * and insert a default administrator into the users table provided a valid username and password.
 * All passwords are encrypted with the bcrypt hashing algorithm.
 */
var mysql = require('mysql');
var dbconfig = require('./database');
var bcrypt = require('bcrypt-nodejs');
var prompt = require('prompt');

// Start the prompt
prompt.start();

// Connect to MySQL
console.log('Connecting to mysql ...');
const connection = mysql.createConnection(dbconfig.connection);
connection.connect(function(error) {
    if (error) console.log(error);

});
console.log("Connected!");

// Create a new database with the name from database.js config file
console.log('Creating new database "' + dbconfig.database + '"...');
//connection.query('CREATE DATABASE ' + dbconfig.database);
connection.query('CREATE DATABASE ' + dbconfig.database, function (error) {
    if (error) console.log(error);
});
console.log('Success: Database Created');

// Use the new database
connection.query('USE ' + dbconfig.database, function (error) {
    if (error) console.log(error);
});


// Create a users table with the name from database.js config file
// This table will be inserted into the previously create database
console.log('Creating new table "' + dbconfig.users_table + '"...');

connection.query('\
    CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
        PRIMARY KEY (`id`), \
    `role` CHAR(60), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)', function (error) {
    if (error) console.log(error);
});
console.log('Success: Table Created');


// Schema for our prompt, validates user input
var schema = {
    properties: {
        username: {
            description: "Enter a Username",
            pattern: /^[a-zA-Z\s\-]+$/,
            message: 'Username must be only letters, spaces, or dashes',
            required: true
        },
        password: {
            description: "Enter a Password",
            pattern: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
            message: 'Password must contain at least 8 character, 1 number, and 1 special character',
            hidden: true,
            replace: '*',
            required: true
        }
    }
};

// Prompt user for two properties: username and password
var un = "";
var pw = "";
prompt.get(schema, function (err, result) {

    // Store the values
    un = result.username;
    pw = result.password;

    // Create the default administrator account with the supplied credentials
    // Hash the password before sending so it is stored securely
    console.log('Creating default admin ...');
    var insertQuery = "INSERT INTO users ( username, password, role ) values (?, ?, ?)";
    connection.query(insertQuery,[un, bcrypt.hashSync(pw, null, null), "admin"], function (error) {
        if (error) console.log(error);
    });
    console.log('Success: Default Admin Created');

    connection.end();
});

return true;
