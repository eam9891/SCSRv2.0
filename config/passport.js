// config/passport.js
// Expose this function to our server app using module.exports
module.exports = function(passport, mysql, bcrypt, LocalStrategy) {


    // Start a new sql connection to our database
    //var mysql = new sql(dbconfig.connection);



    // Passport Session Setup: =================================================
    // Required for persistent login sessions
    // Passport needs the ability to serialize and un-serialize users out of session

    // Used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Used to deserialize the user
    passport.deserializeUser(function(id, done) {
        mysql.query("SELECT * FROM users WHERE id = ? ",[id], function(error, rows){
            done(error, rows);
        });
    });


    // Local Signup: ============================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // Allows us to pass back the entire request to the callback function
        },
        function(req, username, password, done) { // Callback function with username and password from our form

            // First, check to see if the username trying to signup already exists
            mysql.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {

                // If there was an error
                if (err) {

                    return done(err);   // Return the error
                }

                // If the username is already taken
                if (rows.length) {

                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {

                    // If there is no user with that username, create one
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)
                    };

                    // Prepare our insert query
                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                    // Send query and parameter to the database
                    mysql.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {

                        // Set the new user id into our user object, then return the user object
                        newUserMysql.id = rows.insertId;



                        // Return the new user object
                        return done(null, newUserMysql);
                    });


                }
            });

        })
    );


    // Local Login: =============================================================
    // We are using named strategies since we have one for login and one for signup
    // By default, if there was no name, it would just be called 'local'
    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // Allows us to pass back the entire request to the callback function
        },
        function(req, username, password, done) { // Callback function with username and password from our form



                // Query the database for the username
                mysql.query("SELECT * FROM users WHERE username = ?",[username], function(error, rows) {

                    // If there was an error
                    if (error) {
                        // Return the error
                        return done(error);
                    }

                    // If no user is found
                    if (!rows.length) {

                        console.log('incorrect username');

                        // req.flash is the way to set flashdata using connect-flash
                        return done(null, false, req.flash('loginMessage', 'That username or password is incorrect.'));
                    }

                    // If the user is found but the password is wrong
                    if (!bcrypt.compareSync(password, rows[0].password)) {

                        console.log('incorrect password');

                        // create the loginMessage and save it to session as flashdata
                        return done(null, false, req.flash('loginMessage', 'That username or password is incorrect.'));
                    }


                    console.log(rows[0]);

                    return done(null, rows[0]);
                });







        })
    );



};
