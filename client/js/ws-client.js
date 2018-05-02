var host = "ws://" + BASE_URL + ":" + WS_PORT;
var output           = $("#output");
var stopCam          = $('#stopCam');
var startCam         = $('#startCam');
var restartCam       = $('#restartCam');
var castLocalCam     = $('#cast_camera');
var websocket;

var logDiv = $("#log");
var eTerminal = $(".eTerminal");
var serialMonitorBtn = $('#serialMonitor');
var consoleDiv = $("#console");


consoleDiv.dialog({
    autoOpen: false,
    height: 570,
    width: 570,
    beforeClose: function() {}
});

consoleDiv.on("dialogbeforeclose", function() {
    serialMonitorBtn.removeClass("active");
});


serialMonitorBtn.click(function() {
    consoleDiv.dialog("open");
    serialMonitorBtn.addClass("active");
});


// Dashboard button click handler
dashboardBtn.click(function () {
    websocket.send('cam-stop');
});

// Start camera server button click handler
startCam.click(function () {
    websocket.send('cam-start');
});

// Stop camera server button click handler
stopCam.click(function () {
    websocket.send('cam-stop');
});

// Restart camera server button click handler
restartCam.click(function () {
    websocket.send('cam-restart');
});

// Cast local camera button click handler
function openLocalCam() {

    if (castLocalCam.checked) {
        $('#local-video').removeClass('display-none');
        $('#local-video-overlay').removeClass('display-none');
    } else {
        $('#local-video').addClass('display-none');
        $('#local-video-overlay').addClass('display-none');
    }

}

// Convert a buffer to string
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// Open the remote control websocket connection
function openWebSocket() {
    websocket = new WebSocket(host);
    log('<span class="text-info"> Status ' + websocket.readyState + ': Upgrading to WebSocket...</span>');

    websocket.onopen = function(evt) {
        //writeToScreen("Websocket Connected");
        websocket.send("cam-start");
        log("<span class='text-success'>Status " + this.readyState + ': WebSocket Connected</span>');
        //refreshStream();

    };

    websocket.onmessage = function(evt) {

        if (evt.data.substr(0, 7) === "avrdude" || evt.data.substr(0, 4) === "make") {
            log(evt.data);
        }

        //console.log(evt);
        var message = JSON.parse(evt.data);
        //console.log(message);
        if(message.users) {
            log("Getting IPs...");
            log("Connection" + message.users);
        } else if (message.uploadCmd) {
            console.log(message.uploadCmd);
            log(message.uploadCmd);
        } else if (message.avrdude) {
            log(message.avrdude);
        } else {
            var data = ab2str(message.data);
            log(data);
            console.log(data);
            if (data === '255') {
                console.log("Writing error message");
                writeToScreen('<span style = "color: red;">Error Incoming Collision Detected!</span>', true);
                log('<span style = "color: red;">Error Incoming Collision Detected!</span>');
            } else {
                //writeToScreen('<span style = "color: blue;">RECEIVE: ' + data + '</span>');
            }
        }




    };

    websocket.onerror = function(evt) {
        writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
    };

    websocket.onclose = function (p1) {
        websocket.send('cam-stop');
        log("<span class='text-info'>Status " + this.readyState + ': WebSocket Disconnected</span>');
    };

    // Console Input Handler
    $("#msg").on('keypress', function(e) {

        // Enter Key Handler - Send Data
        if(e.which === 13){

            // Disable input to prevent multiple submit attempts
            $(this).attr("disabled", "disabled");

            // Don't allow empty message to be sent, can handle multiple ways
            if(!this.value) {
                log('<span class="text-danger"> Error: Message can not be empty! </span>');
                //alert("Message can not be empty");
                return;
            }

            // Try sending message across socket, catch and log error
            try {
                websocket.send(this.value);
                log('$ ' + this.value);

            } catch(ex) {
                log('<span class="text-danger bg-danger"> Error: ' + ex + "</span>");
            }

            // Enable the input again
            $(this).removeAttr("disabled");

            // Clear the input value, and regain focus
            this.value = "";
            $("#msg").focus();
        }


    });
}


function closeWebSocket(){
    if (websocket !== null) {
        websocket.close();
        websocket = null;
    }

}

// Write messages to the screen
function writeToScreen(message, fadeout) {
    var pre = '';
    if (typeof(fadeout)==='undefined') fadeout = false;



    if (fadeout) {
        pre = '<p class="fadeout" style="z-index: 9999;">' + message + '</p>';

        output.append(pre);
        $('.fadeout').fadeOut(2000, function() {
            $(this).remove();
        });
    } else {
        pre = '<p>' + message + '</p>';
        output.append(pre);
    }


}

// Send movement data
function movement(canMove) {

    return function(event) {

        // Only send movement if the serial monitor input does not have focus and remoteControlDiv is open
        if (!$("#msg").is(":focus") && remoteControlBtn.hasClass('active')) {

            // Here we check if canMove is false
            // If it is we haven't reached the 1.5s delay timeout yet, so don't send movement
            if (!canMove) return false;

            // If canMove is true, set it to false, and set a timeout of 1.5s to set it back to true
            canMove = false;
            setTimeout(function() { canMove = true; }, 1500);

            // Now we can capture which key was pressed, and call our move function with the data we want to send
            switch (event.keyCode) {
                case 68: return move("d");
                case 83: return move("s");
                case 65: return move("a");
                case 87: return move("w");
                case 88: return move("x");
            }

        }

    };
}

function log(msg){
    logDiv.append(msg + "<br>");
    console.log(msg);
    logDiv.animate({scrollTop: logDiv.get(0).scrollHeight}, 2000);
}

// This will add a listener to the users browser and call our movement function whenever a key is pressed
window.addEventListener("keydown", movement(true), false);

// Send data through the websocket, and log it in the console
function move(data) {
    console.log(data);
    //writeToScreen('<span style = "color: green;">TRANSMIT: ' + data + '</span>');
    websocket.send(data);
}