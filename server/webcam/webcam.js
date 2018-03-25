module.exports = function Webcam() {
    const exec = require('child_process').exec;

    function startCam() {

        const startcam = exec('bash start_stream.sh');

        startcam.stdout.on('data', function(data){
            //console.log(data);
            //console.log(data.substring(0, 8));
            if (data.substring(0, 8) === "<alert>") {
                setTimeout(function () {
                    startCam();
                }, 1000);

            }
            // sendBackInfo();
        });

        startcam.stderr.on('data', function(data){
            //console.log(data);
            if (data === "<error> [core] Device not found or access denied 046d:081b") {
                setTimeout(function () {
                    startCam();
                }, 1000);

            }
            // triggerErrorStuff();
        });
    }
    function stopCam() {

        const stopcam = exec('bash stop_stream.sh');
    }
};

