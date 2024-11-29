#!/bin/bash

# Check if Spotify is running
if ! pgrep -x "Spotify" > /dev/null
then
  echo "Spotify is not running"
  exit 1
fi

# Use osascript to get the track information from Spotify
track_info=$(osascript -e '
  tell application "Spotify"
    if player state is playing or player state is paused then
      set trackName to name of current track
      set artistName to artist of current track
      set albumUrl to artwork url of current track
      set playerState to player state as string
      set trackDuration to duration of current track
      set trackPosition to player position
      return trackName & "|" & artistName & "|" & albumUrl & "|" & playerState & "|" & trackDuration & "|" & trackPosition
    else
      return "No track playing"
    end if
  end tell
')

# Output the track info
if [ -z "$track_info" ]; then
  echo "No track playing or could not retrieve track info"
else
  echo "$track_info"
fi
