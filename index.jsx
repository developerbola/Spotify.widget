import { run } from "uebersicht";
export const command = "source Spotify.widget/spotify.sh";
export let refreshFrequency = 800;
let perc = 0;
let previousTrack = null;

export const render = ({ output }) => {
  if (output === undefined) return;

  const spotify = output?.split("!!")[0].split("|");
  const trackId = spotify[0]; // Use track name as identifier

  // Track changed detection
  const trackChanged = previousTrack !== null && previousTrack !== trackId;
  previousTrack = trackId;

  const timePlayed = spotify?.length > 5 ? parseInt(spotify[5]) : 0;
  const totalTime = Math.ceil(parseInt(spotify[4]) / 1000);
  perc = Math.floor(timePlayed / (totalTime / 100));

  // Command for Spotify controls
  const commandSpotify = async (verb) => {
    await run(
      `osascript <<'END'
      if application "Spotify" is running then
        tell application "Spotify"
          ${verb}
        end tell
      end if
    END`
    );
  };

  // Improved color extraction function
  function getAverageRGB(e) {
    try {
      const img = e.target;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      context.drawImage(img, 0, 0, size, size);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Color quantization with improved binning
      const colorCounts = {};
      for (let i = 0; i < pixels.length; i += 4) {
        // Round to nearest 5 for finer color accuracy
        const r = Math.floor(pixels[i] / 5) * 5;
        const g = Math.floor(pixels[i + 1] / 5) * 5;
        const b = Math.floor(pixels[i + 2] / 5) * 5;
        const a = pixels[i + 3];

        // Skip transparent or near-black pixels (often shadows)
        if (a < 200 || (r < 15 && g < 15 && b < 15)) continue;

        const color = `${r},${g},${b}`;
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }

      // Sort colors by frequency
      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([color]) => color);

      // Get background color - prefer non-grayscale colors when possible
      let backgroundOptions = sortedColors.filter((color) => {
        const [r, g, b] = color.split(",").map(Number);
        // Filter out grayscale colors (where R, G, B are very close)
        const variance = Math.max(
          Math.abs(r - g),
          Math.abs(r - b),
          Math.abs(g - b)
        );
        return variance > 15; // At least some color difference
      });

      const background =
        backgroundOptions.length > 0 ? backgroundOptions[0] : sortedColors[0];

      // Filter out colors too similar to background for secondary color
      let colorOptions = sortedColors.filter(
        (color) => !isColorSimilar(color, background, 60)
      );

      // If no good options, use a contrasting color
      const color =
        colorOptions.length > 0
          ? colorOptions[0]
          : getContrastColor(background);

      // Apply colors to UI elements
      applyColorScheme(background, color);
    } catch (error) {
      console.error("Error in getAverageRGB:", error);
      // Apply fallback colors
      applyColorScheme("128,128,128", "255,255,255");
    }
  }

  // Improved color distance calculation
  function isColorSimilar(color1, color2, threshold = 100) {
    const [r1, g1, b1] = color1.split(",").map(Number);
    const [r2, g2, b2] = color2.split(",").map(Number);

    // Weighted Euclidean distance that better matches human perception
    const distance = Math.sqrt(
      2 * Math.pow(r2 - r1, 2) + 4 * Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
    );

    return distance < threshold;
  }

  // Calculate contrast color based on luminance
  function getContrastColor(color) {
    const [r, g, b] = color.split(",").map(Number);

    // Calculate relative luminance using standard formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return either black or white depending on background luminance
    return luminance > 0.5 ? "0,0,0" : "255,255,255";
  }

  // Adjust color lightness to ensure readability
  function adjustColorLightness(color, isBackgroundLight) {
    const [r, g, b] = color.split(",").map(Number);

    if (isBackgroundLight) {
      // Darken color for light backgrounds
      return [
        Math.max(r - 100, 0),
        Math.max(g - 100, 0),
        Math.max(b - 100, 0),
      ].join(",");
    } else {
      // Lighten color for dark backgrounds
      return [
        Math.min(r + 100, 255),
        Math.min(g + 100, 255),
        Math.min(b + 100, 255),
      ].join(",");
    }
  }

  // Apply the color scheme to all UI elements
  function applyColorScheme(background, color) {
    // Calculate luminance to determine if additional contrast is needed
    const [r, g, b] = background.split(",").map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isBackgroundLight = luminance > 0.5;

    // Ensure color has enough contrast with background
    const finalColor = isColorSimilar(color, background, 120)
      ? adjustColorLightness(color, isBackgroundLight)
      : color;

    // Create semi-transparent version for subtle effects
    const transparentColor = `${finalColor},0.3`;

    // Apply background color
    document.getElementById(
      "container"
    ).style.background = `rgb(${background})`;

    // Apply text and UI element colors
    document.getElementById("container").style.color = `rgb(${finalColor})`;
    document.getElementById("trackname").style.color = `rgb(${finalColor})`;
    document.getElementById(
      "playerthumb"
    ).style.background = `rgb(${finalColor})`;
    document.getElementById(
      "playerthumbcontainer"
    ).style.background = `rgba(${transparentColor})`;

    // Apply to SVG controls
    document.querySelectorAll("#controls").forEach((e) => {
      e.style.fill = `rgb(${finalColor})`;
    });

    // Create gradient effect for image cover
    document.getElementById(
      "imageCover"
    ).style.background = `linear-gradient(90deg, transparent, rgb(${background}))`;
  }

  // Improved image transition handling
  const handleImageLoad = (e) => {
    // Remove blur effect
    e.target.style.filter = "blur(0px)";
    e.target.style.opacity = "1";
    // Extract colors after image has loaded
    getAverageRGB(e);
  };

  // Apply blur when changing tracks
  const handleTrackChange = () => {
    const imageElement = document.getElementById("image");
    if (imageElement) {
      imageElement.style.filter = "blur(10px)";
      imageElement.style.opacity = "0.7";
    }
  };

  // If track changed, trigger blur transition
  if (trackChanged) {
    setTimeout(() => handleTrackChange(), 10);
  }

  const animations = [];
  if (trackChanged) {
    animations.push("fadeIn 0.5s ease-in-out");
  }
  if (spotify[0]?.length > 15) {
    animations.push("marquee 10s linear infinite");
  }
  const animationStyle = animations.length > 0 ? animations.join(", ") : "none";

  return (
    <div
      style={{
        ...styles.container,
        overflow: "hidden",
        WebkitBackdropFilter: "blur(10px)",
      }}
      id="container"
    >
      <div
        id="cover"
        style={{
          ...styles.albumImg,
          position: "relative",
        }}
      >
        <img
          style={{
            ...styles.albumImg,
            filter: trackChanged ? "blur(10px)" : "blur(0px)",
            opacity: trackChanged ? "0.7" : "1",
            transition: "filter 0.5s ease-out, opacity 0.5s ease-out",
          }}
          src={spotify[2] || "Spotify.widget/spotify.jpg"}
          alt="Album Art"
          id="image"
          crossOrigin="anonymous"
          loading="eager"
          onLoad={handleImageLoad}
        />

        <div
          style={{
            position: "absolute",
            zIndex: 10,
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
          }}
          onDoubleClick={() => commandSpotify('quit app "Spotify"')}
          id="imageCover"
        ></div>
      </div>

      <div style={{ ...styles.right }} id="right">
        {/* Track Name and Controls */}
        <div style={styles.title}>
          <div
            style={{
              ...styles.trackName,
              whiteSpace: "nowrap",
              animation: animationStyle,
            }}
            id="trackname"
          >
            {spotify[0] ? spotify[0] : "Not Running"}
          </div>
          <div style={styles.controls}>
            {/* Previous Button */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              fill={"#ffffff90"}
              height={15}
              width={15}
              onClick={() => {
                commandSpotify("previous track");
                handleTrackChange();
              }}
              id="controls"
            >
              <path d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3l0 41.7 0 41.7L459.5 440.6zM256 352l0-96 0-128 0-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-64z" />
            </svg>

            {/* Play/Pause Button */}
            {spotify[3] !== "playing" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                height={16}
                width={18}
                fill={"#ffffff90"}
                onClick={() => {
                  isNaN(timePlayed)
                    ? run(
                        `osascript -e 'tell application "Spotify" to play track "spotify:playlist:1Rp9TzAzZSlU8LAYASlgRR"'`
                      )
                    : commandSpotify("play");
                }}
                onDoubleClick={() =>
                  run(`osascript -e 'tell application "Spotify" to play'`)
                }
                id="controls"
              >
                <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
                height={18}
                width={18}
                fill={"#ffffff90"}
                onClick={() => commandSpotify("pause")}
                id="controls"
              >
                <path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" />
              </svg>
            )}

            {/* Next Button */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              fill={"#ffffff90"}
              height={15}
              width={15}
              onClick={() => {
                commandSpotify("next track");
                handleTrackChange();
              }}
              id="controls"
            >
              <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3l0 41.7 0 41.7L52.5 440.6zM256 352l0-96 0-128 0-32c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29l0-64z" />
            </svg>
          </div>
        </div>

        {/* Player Thumb */}
        <div style={styles.player}>
          <div
            style={{ ...styles.playerThumb, overflow: "hidden" }}
            id="playerthumbcontainer"
          >
            <div
              style={{
                ...styles.playerThumb,
                width: perc ? `${perc}%` : 0,
                opacity: perc ? "1" : "0.3",
              }}
              id="playerthumb"
            ></div>
          </div>
          <span style={styles.timePlayed}>
            {isNaN(timePlayed) ? "0:00" : formatTime(timePlayed) || "0:00"}
          </span>
        </div>
      </div>
    </div>
  );
};

const formatTime = (time) => {
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time % 60);

  seconds < 10 ? (seconds = "0" + seconds) : "";

  return minutes + ":" + seconds;
};

export const className = `
  user-select: none;
  cursor: default;

  * {
    overflow: hidden;
  }
  
  #controls {
    transition: transform 400ms;
  }
  
  #controls:active {
    transform: scale(0.8);
  }
  
  #image {
    transition: filter 0.3s ease-in-out, opacity 0.8s ease-in-out;
  }
  
  #playerthumb {
    transition: width 0.3s ease-in-out, background 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
`;

const styles = {
  container: {
    position: "absolute",
    top: 828,
    left: 1181,
    fontFamily: "Montserrat, sans-serif",
    width: 250,
    height: 70,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    color: "#fff",
    overflow: "hidden",
  },
  albumImg: {
    height: "100%",
    width: "auto",
    overflow: "hidden",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: 7,
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    whiteSpace: "nowrap",
    padding: "0 10px",
    boxSizing: "border-box",
  },
  trackName: {
    overflow: "hidden",
    width: "80px",
    color: "#fff",
    display: "inline-block",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  controls: {
    width: "40%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  player: {
    width: 170,
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 10px",
    marginTop: 6,
    boxSizing: "border-box",
  },
  playerThumb: {
    height: 7,
    width: "100%",
    borderRadius: 10,
  },
  timePlayed: {
    width: 45,
  },
};
