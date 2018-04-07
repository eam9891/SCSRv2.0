// Populate stats on initial page load
getStats();


// Ajax post request to /dashboard rest endpoint
function getStats() {

    // Send a post request to get the dashboard view
    $.post('/dashboard', function (jsondata) {

        console.log(jsondata);

        // Parse the json data coming back
        var data = JSON.parse(jsondata);

        // Insert newly parsed data into the appropriate html element
        // System Information Data
        $('#cpuarch').html(data.arch);
        $('#platform').html(data.platform);
        $('#hostname').html(data.hostname);
        $('#uptime').html(secondsToDHMS(data.uptime));
        //console.log(data.uptime);

        // CPU Load Averages
        $('#load1').html(data.loadavg[0].toFixed(3)); // ToDo: fix the meter bars, cant tell if they
        $('#load5').html(data.loadavg[1].toFixed(3)); // ToDo: aren't working since the loads are so low
        $('#load10').html(data.loadavg[2].toFixed(3)); // ToDo: :)

        // Network Interfaces
        // Since the network interfaces like eth0, wlan0 etc. may change over time,
        // we must loop through the returned data from our server.
        // After parsing the json our data.netint hold a 3-dimensional array of our interface data.
        var nets = data.netint;

        $.each(nets, function (x) {
            $.each(this, function (y) {
                var tr = '<tr>';
                $.each(this, function (z) {

                    tr += "<td>" + nets[x][y][z] + "</td>";

                    //console.log(nets[x][y][z]);
                });
                $('#network').append(tr);
            });
        });




        // RAM Memory Statistics
        // ToDo: convert bytes into readable format
        $('#totalmem').html(data.totalmem);             // We have total ram
        $('#freemem').html(data.freemem);               // And the free ram
        var usedMem = data.totalmem - data.freemem;     // But not used ram, we can easily calculate this
        $('#usedmem').html(usedMem);
        var percent = (usedMem / data.totalmem) * 100;  // Calculate used ram percentage for meter bar progression
        $('#memory').css("width", percent + "%");       // Set meter bar css style width to percentage

    });

    // Add the css class for active button highlighting
    dashboardBtn.addClass('active');
}

// Convert seconds into x days, x hours, x minutes, x seconds
// Example: 2696707 seconds becomes 31 days, 5 hours, 5 mins, 7 secs
function secondsToDHMS(s) {

    // A day contains 60 * 60 * 24 = 86400 seconds
    // An hour contains 60 * 60 = 3600 seconds
    // A minute contains 60 seconds

    // Get whole days
    var d = Math.floor(s/86400);
    s-= d*86400;

    // Get whole hours
    var h = Math.floor(s/3600);
    s -= h*3600;

    //Get remaining minutes
    var m = Math.floor(s/60);
    s -= m*60;

    return d + " days, " + h + " hours, " + m + " mins, " + s + " secs";
}
