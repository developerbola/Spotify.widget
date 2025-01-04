spotify="Not Running"
if pgrep -x "Spotify" > /dev/null
then
spotify=$(osascript -e '
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
fi

# Output the track info
echo "$spotify"
