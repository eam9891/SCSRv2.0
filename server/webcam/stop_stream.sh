#!/bin/bash
 
#if pgrep mjpg_streamer
if pgrep uv4l
then
  #kill $(pgrep mjpg_streamer) > /dev/null 2>&1
  pkill uv4l > /dev/null 2>&1
  echo "uv4l stream server stopped"
  #echo "mjpg_streamer stopped"
else
  echo "uv4l stream server not running"
  #echo "mjpg_streamer not running"
fi
