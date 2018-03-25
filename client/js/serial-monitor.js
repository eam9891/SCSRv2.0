var socket;
var logDiv = $("#log");
var eTerminal = $(".eTerminal");
var host = "ws://" + BASE_URL + ":" + WS_PORT;
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
    closeSerialMonitor();
});


serialMonitorBtn.click(function() {
    consoleDiv.dialog("open");
});

serialMonitorBtn.click(function() {
    //eTerminal.dialog({});
    //eTerminal.show();
    serialMonitorBtn.addClass("active");
    openSerialMonitor();
});


function openSerialMonitor() {

    // Try WebSocket connection, catch and log error
    try {
        socket = new WebSocket(host);
        log('<span class="text-info"> Status ' + socket.readyState + ': Upgrading to WebSocket...</span>');

        socket.onopen    = function() {
            log("<span class='text-success'>Status " + this.readyState + ': WebSocket Connected</span>');
        };

        socket.onmessage = function(msg) {
            var message;
            var data;

            //log("Received: " + msg.data);
            message = JSON.parse(msg.data);
            //log(message);

            if(message.users) {
                console.log("Getting IPs...");
                log("Received: " + message.users);
            } else {

                data = buffer2str(message.data);
                log("Received: " + data);
            }
        };

        socket.onclose   = function() {
            log("<span class='text-info'>Status " + this.readyState + ': WebSocket Disconnected</span>');
        };
    }
    catch(ex){
        log(ex);
    }

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
                socket.send(this.value);
                log('Sent: ' + this.value);

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
function closeSerialMonitor(){
    if (socket !== null) {
        socket.close();
        socket = null;
        logDiv.html("");
    }

}
function reopenSerialMonitor() {
    closeSerialMonitor();
    openSerialMonitor();
}
function log(msg){
    logDiv.append(msg + "<br>");
    console.log(msg);
    logDiv.animate({scrollTop: logDiv.get(0).scrollHeight}, 2000);
}
function buffer2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}