#!/bin/bash
 


#if pgrep mjpg_streamer > /dev/null
if pgrep uv4l > /dev/null
then
  echo "uv4l stream server already running"
  #echo "mjpg_streamer already running"
else
  #LD_LIBRARY_PATH=/usr/local/bin/mjpg-streamer  /usr/local/bin/mjpg_streamer -i "input_uvc.so -d /dev/video0 -r 1280x900" -o "output_http.so -p 9090 -w /home/pi/mjpg-streamer/mjpg-streamer-experimental/www" > /dev/null 2>&1&
  LD_LIBRARY_PATH=/usr/bin/uv4l /usr/bin/uv4l --device-id 046d:081b --config-file=/etc/uv4l/uv4l-uvc.conf
  #error = $( /usr/bin/uv4l --device-id 046d:081b --config-file=/etc/uv4l/uv4l-uvc.conf > /dev/null 2>&1&)
  #echo error
  #if error > 0
  #then
  #  sleep 1.5s
  #fi
  #error = $( /usr/bin/uv4l --device-id 046d:081b --config-file=/etc/uv4l/uv4l-uvc.conf > /dev/null 2>&1&)
  #echo error
  #if error > 0
  #then
  #  sleep 1,5s
  #fi
  #error = $( /usr/bin/uv4l --device-id 046d:081b --config-file=/etc/uv4l/uv4l-uvc.conf > /dev/null 2>&1&)
  #echo error
  #echo "uv4l stream server started"
  #echo "mjpg_streamer started"
fi
