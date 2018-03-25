module.exports = function(server, webcam, config, chalk) {


    var SerialPort = require("serialport");
    var serial = new SerialPort(config.serial.path, {baudRate : config.serial.baud});
    //webcam = new webcam();

    // Array of active connections
    var connections = [];

    // Endpoint for WebSocket server, requests look like ws://<IP/Domain>/
    server.ws('/', function(client, req) {

        // Authenticate for admin only
        if (!req.isAuthenticated() || req.user.role !== "admin") {
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
                    client.send(JSON.stringify("Upload Command Received, this would be cool to implement!"));
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
                    startCam();

                    break;

                // Start/Show webcam stream
                case "cam-stop":
                    stopCam();

                    break;

                case "cam-restart":
                    stopCam();
                    setTimeout(function () {
                        startCam();
                    }, 2000);

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

    function broadcast(data) {
        for(myConnection in connections) {
            connections[myConnection].send(JSON.stringify(data));
            //connections[myConnection].send(data);
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
        broadcast(data);
    });

    // If the serial port closes, wait .5s and reopen it
    serial.on('close', function () {
        setTimeout(function () {
            serial.open();
        }, 500);

    });


    const shell = require('shelljs');

    /**
     * Start the usb webcam streaming server (uv4l-webrtc)
     * This function calls the start_stream.sh bash script,
     * which will start the uv4l-webrtc server
     */
    function startCam() {
        // The shell exec command to run our script, asynchronously, and silent if possible
        var child = shell.exec('/home/pi/SCSR/server/webcam/start_stream.sh', {async:true, silent:true});

        // On error, capture and run this function
        child.stderr.on('data', function (stderr) {

            if (stderr.substring(0,7) === "<error>") {
                console.log(chalk.red('uv4l stderr:'));
                console.log(stderr);
                setTimeout(function () {
                    startCam();
                }, 2000);
            }

        });

    }
    function stopCam() {
        shell.exec('/home/pi/SCSR/server/webcam/stop_stream.sh');
    }



};