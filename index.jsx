import { run } from "uebersicht";
export const command = "source My-Spotify.widget/spotify-data.sh";
export const refreshFrequency = 100;
let perc = 0;

export const render = ({ output }) => {
  const segments = output?.split("|");

  const timePlayed = parseInt(segments[5]);
  const totalTime = Math.ceil(parseInt(segments[4]) / 1000);
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

  return (
    <div
      style={styles.parent}
      onMouseEnter={() => {
        document.getElementById("container").style.top = "20px";
      }}
      onMouseLeave={() => {
        document.getElementById("container").style.top = "100px";
      }}
    >
      <div style={styles.container} id="container">
        <img
          style={styles.albumImg}
          src={segments[2] ? segments[2] : "My-Spotify.widget/spotify.jpg"}
          alt="Album Art"
        />
        <div style={styles.right}>
          {/* Track Name and Controls */}
          <div style={styles.title}>
            <div style={styles.trackName}>{segments[0]}</div>
            <div style={styles.controls}>
              {/* Previous Button */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                fill="#ffffff90"
                height={15}
                width={15}
                onClick={() => commandSpotify("previous track")}
              >
                <path d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3l0 41.7 0 41.7L459.5 440.6zM256 352l0-96 0-128 0-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-64z" />
              </svg>

              {/* Play/Pause Button */}
              {segments[3] !== "playing" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                  height={16}
                  width={18}
                  fill="#ffffff90"
                  onClick={() => commandSpotify("play")}
                >
                  <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                  height={18}
                  width={18}
                  fill="#ffffff90"
                  onClick={() => commandSpotify("pause")}
                >
                  <path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" />
                </svg>
              )}

              {/* Next Button */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                fill="#ffffff90"
                height={15}
                width={15}
                onClick={() => commandSpotify("next track")}
              >
                <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3l0 41.7 0 41.7L52.5 440.6zM256 352l0-96 0-128 0-32c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29l0-64z" />
              </svg>
            </div>
          </div>

          {/* Player Thumb */}
          <div style={styles.player}>
            <div style={styles.playerThumb}>
              <div
                style={{
                  ...styles.playerThumb,
                  width: `${perc}%`,
                  background: "#ffffff30",
                }}
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

const styles = {
  parent: {
    position: "relative",
    top: 800,
    left: 0,
    height: 100,
    width: 350,
  },
  container: {
    position: "absolute",
    top: 20,
    left: 10,
    fontFamily: "Montserrat, sans-serif",
    width: 270,
    height: 55,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    color: "#fff",
    padding: "10px 15px",
    overflow: "hidden",
    border: "0.5px solid #ffffff15",
    background: "#00000040",
    transition: "500ms all ease",
    userSelect: "none",
    pointerEvents: "auto",
  },
  albumImg: {
    display: "block",
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  right: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: 3,
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
    width: "130px",
    color: "#fff",
    display: "inline-block",
    WebkitAnimation: "scroll 10s linear infinite",
  },
  controls: {
    with: "40%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  player: {
    width: 220,
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
    background: "#ffffff15",
    borderRadius: 10,
  },
  timePlayed: {
    opacity: 0.4,
  },
};
