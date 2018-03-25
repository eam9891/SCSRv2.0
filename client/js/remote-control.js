var host = "ws://" + BASE_URL + ":" + WS_PORT;
var output           = $("#output");
var remoteControlBtn = $('#remoteControl');
var remoteControlDiv = $('#rc-container');
var dashboardDiv     = $('#dash-container');
var stopCam          = $('#stopCam');
var startCam         = $('#startCam');
var restartCam       = $('#restartCam');
var websocket;

// Remote control button click handler
remoteControlBtn.click(function () {

    // Remove display:none css selector, and add it to every other view
    remoteControlDiv.removeClass('display-none');
    dashboardDiv.addClass('display-none');

    // Start the websocket connection
    openWebSocket();


    // Add the css class for active button highlighting
    remoteControlBtn.addClass('active');
    dashboardBtn.removeClass('active');


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

// Convert a buffer to string
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// Open the remote control websocket connection
function openWebSocket() {
    websocket = new WebSocket(host);

    websocket.onopen = function(evt) {
        //writeToScreen("Websocket Connected");
        websocket.send("cam-start");
        //refreshStream();

    };

    websocket.onmessage = function(evt) {




        var message = JSON.parse(evt.data);
        var data = ab2str(message.data);

        console.log(data);
        if (data === "255") {
            writeToScreen('<span style = "color: red;">Error Incoming Collision Detected!</span>', true);
        } else {
            //writeToScreen('<span style = "color: blue;">RECEIVE: ' + data + '</span>');
        }

    };

    websocket.onerror = function(evt) {
        writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
    };

    websocket.onclose = function (p1) {
        websocket.send('cam-stop');
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
                case 68: return move("Right");
                case 83: return move("Backward");
                case 65: return move("Left");
                case 87: return move("Forward");
            }

        }

    };
}



// This will add a listener to the users browser and call our movement function whenever a key is pressed
window.addEventListener("keydown", movement(true), false);

// Send data through the websocket, and log it in the console
function move(data) {
    console.log(data);
    //writeToScreen('<span style = "color: green;">TRANSMIT: ' + data + '</span>');
    websocket.send(data);
}