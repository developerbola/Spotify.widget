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

bt=$(system_profiler SPBluetoothDataType)

name=$(echo "$bt" | sed -n '/Connected:/, /Not Connected:/p' | sed -n 's/^[[:space:]]*\([^[:space:]:]*\):/\1/p' | head -n 2 | awk -F'Connected' '{print $1}' | sed 's/\$$//')
state=$(echo "$bt" | grep -m 1 -E "^\s*State:" | sed -E 's/^\s*State:\s*([A-Za-z]+)/\1/' | awk '{print $2}')
connected=$(echo "$bt" | grep -m 1 -E "^\s*Connected:" | sed -E 's/^\s*Connected:\s*([A-Za-z]+)/\1/' | sed 's/^[[:space:]]*//' | sed 's/:$//')
case=$(echo "$bt" | grep -m 1 -E "^\s*Case Battery Level:" | sed -E 's/^\s*Case Battery Level:\s*([A-Za-z]+)/\1/'| awk '{print $4}' | awk -F'%' '{print $1}')
right=$(echo "$bt" | grep -m 1 -E "^\s*Right Battery Level:" | sed -E 's/^\s*Right Battery Level:\s*([A-Za-z]+)/\1/'| awk '{print $4}' | awk -F'%' '{print $1}')
left=$(echo "$bt" | grep -m 1 -E "^\s*Left Battery Level:" | sed -E 's/^\s*Left Battery Level:\s*([A-Za-z]+)/\1/'| awk '{print $4}' | awk -F'%' '{print $1}')

# Call the function with the output from system_profiler
bt_status="$name|$state|$connected|$case|$right|$left"

# Output the track info
echo "$spotify!!$bt_status"
