module.exports = function (shell) {
    var Webcam = {};

    /**
     * Start the usb webcam streaming server (uv4l-webrtc)
     * This function calls the start_stream.sh bash script,
     * which will start the uv4l-webrtc server
     */
     Webcam.start = function() {
        // The shell exec command to run our script, asynchronously, and silent if possible
        var child = shell.exec('/home/pi/SCSR/server/webcam/start_stream.sh', {async:true, silent:true});

        // On error, capture and run this function
        child.stderr.on('data', function (stderr) {

            if (stderr.substring(0,7) === "<error>") {
                console.log(chalk.red('uv4l stderr:'));
                console.log(stderr);
                setTimeout(function () {
                    start();
                }, 2000);
            }

        });

    };
    Webcam.stop = function() {
        shell.exec('/home/pi/SCSR/server/webcam/stop_stream.sh');
    };

    return Webcam;
};



//module.exports.startCam = start;
//module.exports.stopCam = stop;

