import { run } from "uebersicht";
export const command = "source Spotify.widget/spotify.sh";
export let refreshFrequency = 800;
let perc = 0;
export const render = ({ output }) => {
  if (output === undefined) return;

  const spotify = output?.split("!!")[0].split("|");

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
    `
    );
  };

  function getAverageRGB(e) {
    try {
      const img = e.target;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      context.drawImage(img, 0, 0, size, size);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const colorCounts = {};
      for (let i = 0; i < pixels.length; i += 20) {
        const r = Math.floor(parseInt(pixels[i]));
        const g = Math.floor(parseInt(pixels[i + 1]));
        const b = Math.floor(parseInt(pixels[i + 2]));
        const color = `${r},${g},${b}`;
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }
      var sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([color]) => color);

      const background = sortedColors[0];
      const color = sortedColors[1];
      // Update avgColor state or variable

      document.getElementById(
        "container"
      ).style.background = `rgb(${background})`;
      document.getElementById(
        "container"
      ).style.border = `0.5px solid rgb(${adjustTextColorBasedOnBackground(
        background,
        color
      )},0.2)`;

      document.getElementById(
        "imageCover"
      ).style.background = `linear-gradient(90deg , transparent, rgb(${background}) )`;

      // =========== check color similar ===========
      function colorDistance(color1, color2) {
        const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
        const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
        return Math.sqrt(
          Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
        );
      }

      function isColorSimilar(color1, color2) {
        return colorDistance(color1, color2) < 100;
      }

      function adjustTextColorBasedOnBackground(
        backgroundColor,
        secondaryColor
      ) {
        // Helper function to calculate relative luminance
        function luminance(r, g, b) {
          const a = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928
              ? v / 12.92
              : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        }

        // Convert background and secondary colors to RGB arrays
        const bgRgb = backgroundColor.match(/\d+/g).map(Number);
        const secRgb = secondaryColor.match(/\d+/g).map(Number);

        // Calculate the luminance of the background color
        const bgLuminance = luminance(...bgRgb);

        // Determine if the background is light or dark
        const isBackgroundLight = bgLuminance > 0.5;

        // Adjust the secondary color based on the background luminance
        const adjustedColor = isBackgroundLight
          ? darkenColor(secRgb)
          : lightenColor(secRgb);

        return `${adjustedColor.join(",")}`;
      }

      // Helper function to darken a color
      function darkenColor([r, g, b], amount = 150) {
        return [
          Math.max(r - amount, 0),
          Math.max(g - amount, 0),
          Math.max(b - amount, 0),
        ];
      }

      // Helper function to lighten a color
      function lightenColor([r, g, b], amount = 150) {
        return [
          Math.min(r + amount, 255),
          Math.min(g + amount, 255),
          Math.min(b + amount, 255),
        ];
      }
      if (isColorSimilar(color, background)) {
        document.getElementById(
          "container"
        ).style.color = `rgb(${adjustTextColorBasedOnBackground(
          background,
          color
        )})`;
        document.getElementById(
          "trackname"
        ).style.color = `rgb(${adjustTextColorBasedOnBackground(
          background,
          color
        )})`;

        document.getElementById(
          "playerthumb"
        ).style.background = `rgb(${adjustTextColorBasedOnBackground(
          background,
          color
        )})`;

        document.getElementById(
          "playerthumbcontainer"
        ).style.background = `rgb(${adjustTextColorBasedOnBackground(
          background,
          color
        )},0.3)`;
        document
          .querySelectorAll("#controls")
          .forEach(
            (e) =>
              (e.style.fill = `rgb(${adjustTextColorBasedOnBackground(
                background,
                color
              )})`)
          );
      }
      window.vibeBG = background;
    } catch (error) {
      console.error("Error in getAverageRGB:", error);
    }
  }

  function smoothTrackChange() {
    document.getElementById("image").style.filter = "blur(10px)";
  }

  return (
    <div style={{ ...styles.parent }} id="parent">
      {/* SPOTIFY CONTAINER */}
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
              filter: "blur(10px)",
              transition: "filter 0.5s ease-out",
            }}
            src={spotify[2] || "Spotify.widget/spotify.jpg"}
            alt="Album Art"
            id="image"
            crossOrigin="anonymous"
            loading="eager"
            onLoad={(e) => {
              e.target.style.filter = "blur(0px)";
              getAverageRGB(e);
            }}
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
            <div style={styles.trackName} id="trackname">
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
                  smoothTrackChange();
                  commandSpotify("previous track");
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
                  smoothTrackChange();
                  commandSpotify("next track");
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
`;

const styles = {
  parent: {
    position: "relative",
    top: 760,
    left: 1050,
    height: 170,
    width: 400,
  },
  container: {
    position: "absolute",
    top: "40%",
    left: "calc(100% - 280px)",
    fontFamily: "Montserrat, sans-serif",
    width: 260,
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
    width: "90px",
    color: "#fff",
    display: "inline-block",
  },
  controls: {
    with: "40%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  player: {
    width: 180,
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
