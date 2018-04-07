module.exports = function (server) {


    server.post('/upload', function(req, res) {
        if (!req.files)
            return res.status(400).send('No files were uploaded.');

        //console.log(req.files);

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        var sampleFile = req.files.sampleFile;
        console.log(sampleFile);


        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv("/home/pi/SCSR/arduino/motorDriver/" + sampleFile.name, function(err) {
            if (err)
                return res.status(500).send(err);

            res.send('File uploaded!');
        });
    });
};