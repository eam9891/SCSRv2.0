#!/bin/bash
 
if pgrep mjpg_streamer > /dev/null
then
  echo "mjpg_streamer already running"
else
  LD_LIBRARY_PATH=/usr/local/bin/mjpg-streamer/ /usr/local/bin/mjpg_streamer -i "input_uvc.so -d /dev/video0 -r 640x480" -o "output_http.so -p 9090 -w ./www" > /dev/null 2>&1&
  echo "mjpg_streamer started"
fi
