module.exports = function(server, webcam, config, chalk, shell) {

    var uploading = false;

    var SerialPort = require("serialport");
    var serial = new SerialPort(config.serial.path, {baudRate : config.serial.baud});
    //webcam = new webcam();

    // Array of active connections
    var connections = [];

    // Endpoint for WebSocket server, requests look like ws://<IP or Domain>/
    server.ws('/', function(client, req) {

        // Authenticate for admin only
        if (!req.isAuthenticated() || req.user[0].role !== "admin") {
            req.close();
        }

        // Log the IP
        const ip = req.connection.remoteAddress;
        console.log("New Connection: " + ip);

        // Add to active connections
        connections.push(client);

        // Anytime a connected client sends us a message, this function is run
        client.on('message', function(data) {

            // Log the data in console
            console.log(ip + ": " + data);

            // Handle possible commands
            switch (data) {

                // A future possibility, check out avrgirl-arduino
                case "upload":
                    client.send('{"type":"String","uploadCmd":"Upload received, starting compile process..."}');
                    programArduino();
                    break;

                // Show all connected users
                case "users":
                    for(myConnection in connections) {
                        client.send(
                            '{"type":"String","users":"' + connections[myConnection]._socket.remoteAddress + '"}'
                        );
                    }
                    break;

                // Start/Show webcam stream
                case "cam-start":
                    webcam.start();
                    break;

                // Start/Show webcam stream
                case "cam-stop":
                    webcam.stop();
                    serial.close(function (error) {
                       console.log(error);
                    });
                    break;

                case "cam-restart":
                    webcam.stop();
                    serial.close(function (error) {
                        console.log(error);
                    });

                    setTimeout(function () {
                        webcam.start();
                    }, 1000);

                    break;

                // The default if no other commands are handled
                // Write serial data to the Arduino
                default:
                    serial.write(data);
                    break;
            }

        });


        // Handle a connection closing
        client.on('close', function() {
            console.log("connection closed");

            // We need to remove the disconnected clients from our array of active connections
            var position = connections.indexOf(client);
            connections.splice(position,1);
        });


    });

    function broadcast(data, stringify) {
        if (stringify) {
            for(myConnection in connections) {
                connections[myConnection].send(JSON.stringify(data));
                //connections[myConnection].send(data);
            }
        } else {
            for(myConnection in connections) {
                connections[myConnection].send(data);
                //connections[myConnection].send(data);
            }
        }


    }


    // This function is run anytime the serial port is opened
    serial.on('open', function() {
        console.log("Opening serial connection to arduino...");
    });

    // This function is run anytime the serial port connection encounters and error
    // The error message is contained in err
    serial.on('error', function(err) {
        console.log('SerialPort ', err.message);
    });

    // This function reads data that is available but keep the stream from entering "flowing mode"
    serial.on('readable', function () {
        var data = serial.read();
        console.log('Serial Message: ' + data);
        broadcast(data, true);
    });

    // If the serial port closes, wait .5s and reopen it
    serial.on('close', function () {

        if (uploading === false) {
            setTimeout(function () {
                serial.open();
            }, 500);
        }


    });

    function programArduino() {
        uploading = true;
        serial.close(function (error) {
            console.log(error);
        });

        var child = shell.exec('sudo make upload -C /home/pi/SCSR/arduino/motorDriver/', {async:true}, function(code, stdout, stderr) {
            broadcast(stdout);
            broadcast(stderr);
            console.log(code);
        });

        setTimeout(function () {
            serial.open();
        }, 2000);
        uploading = false;
    }




};