
var signalling_server_hostname = "192.168.0.136";
var signalling_server_address = "192.168.0.136:8090";
//var signalling_server_address = signalling_server_hostname + ':' + (location.port || (location.protocol === 'https:' ? 443 : 80));
var isFirefox = typeof InstallTrigger !== 'undefined';// Firefox 1.0+

addEventListener("DOMContentLoaded", function () {
    document.getElementById('signalling_server').value = signalling_server_address;
    var cast_not_allowed = !('MediaSource' in window) || location.protocol !== "https:";
    if (cast_not_allowed || !isFirefox) {
        if (document.getElementById('cast_tab'))
            document.getElementById('cast_tab').disabled = true;
        if (cast_not_allowed) { // chrome supports if run with --enable-usermedia-screen-capturing
            document.getElementById('cast_screen').disabled = true;
        }
        document.getElementById('cast_window').disabled = true;
        document.getElementById('cast_application').disabled = true;
        //document.getElementById('note2').style.display = "none";
        //document.getElementById('note4').style.display = "none";
    } else {
        document.getElementById('note1').style.display = "none";
        document.getElementById('note3').style.display = "none";
    }

});

var ws = null;
var pc;
var gn;
var datachannel, localdatachannel;
var audio_video_stream;
var recorder = null;
var recordedBlobs;
var pcConfig = {"iceServers": [
    {"urls": ["stun:stun.l.google.com:19302", "stun:" + signalling_server_hostname + ":3478"]}
]};
var pcOptions = {
    optional: [
        // Deprecated:
        //{RtpDataChannels: false},
        //{DtlsSrtpKeyAgreement: true}
    ]
};
var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};
var keys = [];

RTCPeerConnection = window.RTCPeerConnection || /*window.mozRTCPeerConnection ||*/ window.webkitRTCPeerConnection;
RTCSessionDescription = /*window.mozRTCSessionDescription ||*/ window.RTCSessionDescription;
RTCIceCandidate = /*window.mozRTCIceCandidate ||*/ window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;
var URL = window.URL || window.webkitURL;

function createPeerConnection() {
    try {
        var pcConfig_ = pcConfig;
        try {
            ice_servers = document.getElementById('ice_servers').value;
            if (ice_servers) {
                pcConfig_.iceServers = JSON.parse(ice_servers);
            }
        } catch (e) {
            alert(e + "\nExample: "
                + '\n[ {"urls": "stun:stun1.example.net"}, {"urls": "turn:turn.example.org", "username": "user", "credential": "myPassword"} ]'
                + "\nContinuing with built-in RTCIceServer array");
        }
        console.log(JSON.stringify(pcConfig_));
        pc = new RTCPeerConnection(pcConfig_, pcOptions);
        pc.onicecandidate = onIceCandidate;
        if ('ontrack' in pc) {
            pc.ontrack = onTrack;
        } else {
            pc.onaddstream = onRemoteStreamAdded; // deprecated
        }


        pc.onremovestream = onRemoteStreamRemoved;
        pc.ondatachannel = onDataChannel;
        console.log("peer connection successfully created!");
    } catch (e) {
        console.error("createPeerConnection() failed");
    }
}

function onDataChannel(event) {
    console.log("onDataChannel()");
    datachannel = event.channel;

    event.channel.onopen = function () {
        console.log("Data Channel is open!");
        document.getElementById('datachannels').disabled = false;
    };

    event.channel.onerror = function (error) {
        console.error("Data Channel Error:", error);
    };

    event.channel.onmessage = function (event) {
        console.log("Got Data Channel Message:", event.data);
        document.getElementById('datareceived').value = event.data;
    };

    event.channel.onclose = function () {
        datachannel = null;
        document.getElementById('datachannels').disabled = true;
        console.log("The Data Channel is Closed");
    };
}

function onIceCandidate(event) {
    if (event.candidate) {
        var candidate = {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        var request = {
            what: "addIceCandidate",
            data: JSON.stringify(candidate)
        };
        ws.send(JSON.stringify(request));
    } else {
        console.log("End of candidates.");
    }
}

function onRemoteStreamAdded(event) {
    console.log("Remote stream added:", URL.createObjectURL(event.stream));
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.src = URL.createObjectURL(event.stream);
    remoteVideoElement.play();
}

function onTrack(event) {
    console.log("Remote track!");
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.srcObject = event.streams[0];
    remoteVideoElement.play();
}

function onRemoteStreamRemoved(event) {
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.srcObject = null;
    remoteVideoElement.src = ''; // TODO: remove
    var remoteStatusElement = document.getElementById('remote-stream-status');
    remoteStatusElement.classList.remove('red');
}

function start() {
    if ("WebSocket" in window) {
        document.getElementById("stop").disabled = false;
        document.getElementById("start").disabled = true;
        var remoteStatusElement = document.getElementById('remote-stream-status');
        remoteStatusElement.classList.add('red');
        document.documentElement.style.cursor = 'wait';
        var server = document.getElementById("signalling_server").value.toLowerCase();

        var protocol = location.protocol === "https:" ? "wss:" : "ws:";
        ws = new WebSocket(protocol + '//' + server + '/stream/webrtc');

        function call(stream) {
            createPeerConnection();
            if (stream) {
                pc.addStream(stream);
            }
            var request = {
                what: "call",
                options: {
                    force_hw_vcodec: document.getElementById("remote_hw_vcodec").checked,
                    vformat: document.getElementById("remote_vformat").value
                }
            };
            ws.send(JSON.stringify(request));
            console.log("call(), request=" + JSON.stringify(request));
        }

        ws.onopen = function () {
            console.log("onopen()");

            audio_video_stream = null;
            var cast_mic = document.getElementById("cast_mic").checked;
            var cast_tab = document.getElementById("cast_tab") ? document.getElementById("cast_tab").checked : false;
            var cast_camera = document.getElementById("cast_camera").checked;
            var cast_screen = document.getElementById("cast_screen").checked;
            var cast_window = document.getElementById("cast_window").checked;
            var cast_application = document.getElementById("cast_application").checked;
            var echo_cancellation = document.getElementById("echo_cancellation").checked;
            var localConstraints = {};
            if (cast_mic) {
                if (echo_cancellation)
                    localConstraints['audio'] = isFirefox ? {echoCancellation: true} : {optional: [{echoCancellation: true}]};
                else
                    localConstraints['audio'] = isFirefox ? {echoCancellation: false} : {optional: [{echoCancellation: false}]};
            } else if (cast_tab) {
                localConstraints['audio'] = {mediaSource: "audioCapture"};
            } else {
                localConstraints['audio'] = false;
            }
            if (cast_camera) {
                localConstraints['video'] = true;
            } else if (cast_screen) {
                if (isFirefox) {
                    localConstraints['video'] = {frameRate: {ideal: 15, max: 30},
                        //width: {min: 640, max: 960},
                        //height: {min: 480, max: 720},
                        mozMediaSource: "screen",
                        mediaSource: "screen"};
                } else {
                    // chrome://flags#enable-usermedia-screen-capturing
                    document.getElementById("cast_mic").checked = false;
                    localConstraints['audio'] = false; // mandatory for chrome
                    localConstraints['video'] = {'mandatory': {'chromeMediaSource':'screen'}};
                }
            } else if (cast_window)
                localConstraints['video'] = {frameRate: {ideal: 15, max: 30},
                    //width: {min: 640, max: 960},
                    //height: {min: 480, max: 720},
                    mozMediaSource: "window",
                    mediaSource: "window"};
            else if (cast_application)
                localConstraints['video'] = {frameRate: {ideal: 15, max: 30},
                    //width: {min: 640, max: 960},
                    //height:  {min: 480, max: 720},
                    mozMediaSource: "application",
                    mediaSource: "application"};
            else
                localConstraints['video'] = false;

            var localVideoElement = document.getElementById('local-video');
            if (localConstraints.audio || localConstraints.video) {
                if (navigator.getUserMedia) {
                    navigator.getUserMedia(localConstraints, function (stream) {
                        audio_video_stream = stream;
                        call(stream);
                        localVideoElement.muted = true;
                        //localVideoElement.src = URL.createObjectURL(stream); // deprecated
                        localVideoElement.srcObject = stream;
                        localVideoElement.play();
                    }, function (error) {
                        stop();
                        alert("An error has occurred. Check media device, permissions on media and origin.");
                        console.error(error);
                    });
                } else {
                    console.log("getUserMedia not supported");
                }
            } else {
                call();
            }
        };

        ws.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);
            if (msg.what !== 'undefined') {
                var what = msg.what;
                var data = msg.data;
            } else { /* TODO: for backward compatibility, remove this branch in the future */
                var what = msg.type;
                var data = msg; // only used for 'offer' in the switch case below
                console.log("still using the old API?");
            }
            //console.log("message=" + msg);
            console.log("message =" + what);

            switch (what) {
                case "offer":
                    pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)),
                        function onRemoteSdpSuccess() {
                            console.log('onRemoteSdpSucces()');
                            pc.createAnswer(function (sessionDescription) {
                                pc.setLocalDescription(sessionDescription);
                                var request = {
                                    what: "answer",
                                    data: JSON.stringify(sessionDescription)
                                };
                                ws.send(JSON.stringify(request));
                                console.log(request);

                            }, function (error) {
                                alert("Failed to createAnswer: " + error);

                            }, mediaConstraints);
                        },
                        function onRemoteSdpError(event) {
                            alert('Failed to set remote description (unsupported codec on this browser?): ' + event);
                            stop();
                        }
                    );

                    var request = {
                        what: "generateIceCandidates"
                    };
                    console.log(request);
                    ws.send(JSON.stringify(request));
                    break;

                case "answer":
                    break;

                case "message":
                    alert(msg.data);
                    break;

                case "geticecandidate": // TODO: remove
                case "iceCandidates":
                    var candidates = JSON.parse(msg.data);
                    for (var i = 0; candidates && i < candidates.length; i++) {
                        var elt = candidates[i];
                        // noinspection JSAnnotator
                        let candidate = new RTCIceCandidate({sdpMLineIndex: elt.sdpMLineIndex, candidate: elt.candidate});
                        pc.addIceCandidate(candidate,
                            function () {
                                console.log("IceCandidate added: " + JSON.stringify(candidate));
                            },
                            function (error) {
                                console.error("addIceCandidate error: " + error);
                            }
                        );
                    }
                    document.documentElement.style.cursor = 'default';
                    break;
            }
        };

        ws.onclose = function (evt) {
            if (pc) {
                pc.close();
                pc = null;
            }
            document.getElementById("stop").disabled = true;
            document.getElementById("start").disabled = false;

            var remoteStatusElement = document.getElementById('remote-stream-status');
            remoteStatusElement.classList.remove('red');

            document.documentElement.style.cursor = 'default';
        };

        ws.onerror = function (evt) {
            alert("An error has occurred!");
            ws.close();
        };

    } else {
        alert("Sorry, this browser does not support WebSockets.");
    }
}

function stop() {
    if (datachannel) {
        console.log("closing data channels");
        datachannel.close();
        datachannel = null;
        document.getElementById('datachannels').disabled = true;
    }
    if (localdatachannel) {
        console.log("closing local data channels");
        localdatachannel.close();
        localdatachannel = null;
    }
    if (audio_video_stream) {
        try {
            if (audio_video_stream.getVideoTracks().length)
                audio_video_stream.getVideoTracks()[0].stop();
            if (audio_video_stream.getAudioTracks().length)
                audio_video_stream.getAudioTracks()[0].stop();
            audio_video_stream.stop(); // deprecated
        } catch (e) {
            for (var i = 0; i < audio_video_stream.getTracks().length; i++)
                audio_video_stream.getTracks()[i].stop();
        }
        audio_video_stream = null;
    }
    stop_record();
    document.getElementById('remote-video').srcObject = null;
    document.getElementById('local-video').srcObject = null;
    document.getElementById('remote-video').src = ''; // TODO; remove
    document.getElementById('local-video').src = ''; // TODO: remove
    if (pc) {
        pc.close();
        pc = null;
    }
    if (ws) {
        ws.close();
        ws = null;
    }
    document.getElementById("stop").disabled = true;
    document.getElementById("start").disabled = false;

    var remoteStatusElement = document.getElementById('remote-stream-status');
    remoteStatusElement.classList.remove('red');

    document.documentElement.style.cursor = 'default';
}

function mute() {
    var remoteVideo = document.getElementById("remote-video");
    remoteVideo.muted = !remoteVideo.muted;
}

function pause() {
    var remoteVideo = document.getElementById("remote-video");
    if (remoteVideo.paused)
        remoteVideo.play();
    else
        remoteVideo.pause();
}

function fullscreen() {
    var remoteVideo = document.getElementById("remote-video");
    if (remoteVideo.requestFullScreen) {
        remoteVideo.requestFullScreen();
    } else if (remoteVideo.webkitRequestFullScreen) {
        remoteVideo.webkitRequestFullScreen();
    } else if (remoteVideo.mozRequestFullScreen) {
        remoteVideo.mozRequestFullScreen();
    }
}

function handleDataAvailable(event) {
    //console.log(event);
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

function handleStop(event) {
    console.log('Recorder stopped: ', event);
    document.getElementById('record').innerHTML = 'Start Recording';
    recorder = null;
    var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    var recordedVideoElement = document.getElementById('recorded-video');
    recordedVideoElement.src = URL.createObjectURL(superBuffer);
}

function discard_recording() {
    var recordedVideoElement = document.getElementById('recorded-video');
    recordedVideoElement.srcObject = null;
    recordedVideoElement.src = '';
}

function stop_record() {
    if (recorder) {
        recorder.stop();
        console.log("recording stopped");
        document.getElementById('record-detail').open = true;
    }
}

function startRecording(stream) {
    recordedBlobs = [];
    var options = {mimeType: 'video/webm;codecs=vp9'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: 'video/webm;codecs=vp8'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + ' is not Supported');
            options = {mimeType: 'video/webm;codecs=h264'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log(options.mimeType + ' is not Supported');
                options = {mimeType: 'video/webm'};
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.log(options.mimeType + ' is not Supported');
                    options = {mimeType: ''};
                }
            }
        }
    }
    try {
        recorder = new MediaRecorder(stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder: ' + e);
        alert('Exception while creating MediaRecorder: ' + e + '. mimeType: ' + options.mimeType);
        return;
    }
    console.log('Created MediaRecorder', recorder, 'with options', options);
    //recorder.ignoreMutedMedia = true;
    recorder.onstop = handleStop;
    recorder.ondataavailable = handleDataAvailable;
    recorder.onwarning = function (e) {
        console.log('Warning: ' + e);
    };
    recorder.start();
    console.log('MediaRecorder started', recorder);
}

function start_stop_record() {
    if (pc && !recorder) {
        var streams = pc.getRemoteStreams();
        if (streams.length) {
            console.log("starting recording");
            startRecording(streams[0]);
            document.getElementById('record').innerHTML = 'Stop Recording';
        }
    } else {
        stop_record();
    }
}

function download() {
    if (recordedBlobs !== undefined) {
        var blob = new Blob(recordedBlobs, {type: 'video/webm'});
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'video.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}

function remote_hw_vcodec_selection() {
    if (!document.getElementById('remote_hw_vcodec').checked)
        unselect_remote_hw_vcodec();
    else
        select_remote_hw_vcodec();
}

function remote_hw_vcodec_format_selection() {
    if (document.getElementById('remote_hw_vcodec').checked)
        remote_hw_vcodec_selection();
}

function select_remote_hw_vcodec() {
    document.getElementById('remote_hw_vcodec').checked = true;
    var vformat = document.getElementById('remote_vformat').value;
    switch (vformat) {
        case '5':
            document.getElementById('remote-video').style.width = "320px";
            document.getElementById('remote-video').style.height = "240px";
            break;
        case '10':
            document.getElementById('remote-video').style.width = "320px";
            document.getElementById('remote-video').style.height = "240px";
            break;
        case '20':
            document.getElementById('remote-video').style.width = "352px";
            document.getElementById('remote-video').style.height = "288px";
            break;
        case '25':
            document.getElementById('remote-video').style.width = "640px";
            document.getElementById('remote-video').style.height = "480px";
            break;
        case '30':
            document.getElementById('remote-video').style.width = "640px";
            document.getElementById('remote-video').style.height = "480px";
            break;
        case '35':
            document.getElementById('remote-video').style.width = "800px";
            document.getElementById('remote-video').style.height = "480px";
            break;
        case '40':
            document.getElementById('remote-video').style.width = "960px";
            document.getElementById('remote-video').style.height = "720px";
            break;
        case '50':
            document.getElementById('remote-video').style.width = "1024px";
            document.getElementById('remote-video').style.height = "768px";
            break;
        case '55':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "720px";
            break;
        case '60':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "720px";
            break;
        case '63':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "720px";
            break;
        case '65':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "768px";
            break;
        case '70':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "768px";
            break;
        case '80':
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "960px";
            break;
        case '90':
            document.getElementById('remote-video').style.width = "1600px";
            document.getElementById('remote-video').style.height = "768px";
            break;
        case '95':
            document.getElementById('remote-video').style.width = "1640px";
            document.getElementById('remote-video').style.height = "1232px";
            break;
        case '97':
            document.getElementById('remote-video').style.width = "1640px";
            document.getElementById('remote-video').style.height = "1232px";
            break;
        case '100':
            document.getElementById('remote-video').style.width = "1920px";
            document.getElementById('remote-video').style.height = "1080px";
            break;
        case '105':
            document.getElementById('remote-video').style.width = "1920px";
            document.getElementById('remote-video').style.height = "1080px";
            break;
        default:
            document.getElementById('remote-video').style.width = "1280px";
            document.getElementById('remote-video').style.height = "720px";
    }
    /*
     // Disable video casting. Not supported at the moment with hw codecs.
     var elements = document.getElementsByName('video_cast');
     for(var i = 0; i < elements.length; i++) {
     elements[i].checked = false;
     }
     */
}

function unselect_remote_hw_vcodec() {
    document.getElementById('remote_hw_vcodec').checked = false;
    document.getElementById('remote-video').style.width = "640px";
    document.getElementById('remote-video').style.height = "480px";
}

function singleselection(name, id) {
    var old = document.getElementById(id).checked;
    var elements = document.getElementsByName(name);
    for (var i = 0; i < elements.length; i++) {
        elements[i].checked = false;
    }
    document.getElementById(id).checked = old ? true : false;
    /*
     // Disable video hw codec. Not supported at the moment when casting.
     if (name === 'video_cast') {
     unselect_remote_hw_vcodec();
     }
     */
}








window.onload = function () {
    if (window.MediaRecorder === undefined) {
        document.getElementById('record').disabled = true;
    }
    if (false) {
        start();
    }
};

window.onbeforeunload = function () {
    if (ws) {
        ws.onclose = function () {}; // disable onclose handler first
        stop();
    }
};

