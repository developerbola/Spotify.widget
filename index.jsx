import { run } from "uebersicht";
export const command = "source My-Spotify.widget/spotify-data.sh";
export let refreshFrequency = 500;
let perc = 0;

export const render = ({ output }) => {
  if (output === undefined) return;

  const spotify = output?.split("!!")[0].split("|");
  const bt = output?.split("!!")[1].split("|");

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

  let bluetoothState = bt[1] === "On" ? true : false;

  const handleTop = (num) => {
    document.getElementById("container").style.top = `${num}%`;
    document.getElementById("containerAirpods").style.top = `${num}%`;
  };

  return (
    <div
      style={styles.parent}
      onMouseEnter={() => {
        handleTop(40);
      }}
      onMouseLeave={() => {
        handleTop(105);
      }}
    >
      <div style={styles.container} id="container">
        <div
          style={{
            position: "absolute",
            top: 5,
            left: "93%",
            borderRadius: "50%",
            height: 10,
            width: 10,
            rotate: "45deg",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 0 1px 1px",
            color: "#ffffff50"
          }}
          onClick={() => commandSpotify('quit app "Spotify"')}
        >
          +
        </div>
        <img
          style={styles.albumImg}
          src={spotify[2] ? spotify[2] : "My-Spotify.widget/spotify.jpg"}
          alt="Album Art"
        />
        <div style={styles.right}>
          {/* Track Name and Controls */}
          <div style={styles.title}>
            <div style={styles.trackName}>{spotify[0]}</div>
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
              {spotify[3] !== "playing" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                  height={16}
                  width={18}
                  fill="#ffffff90"
                  onClick={() => {
                    isNaN(timePlayed)
                      ? run(
                          `osascript -e 'tell application "Spotify" to play track "spotify:playlist:1Rp9TzAzZSlU8LAYASlgRR"'`
                        )
                      : commandSpotify("play");
                  }}
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
                  width: perc > 0 ? `${perc}%` : 0,
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

      <div
        style={{
          ...styles.container,
          left: 315,
          width: 150,
          background: "#00000040",
        }}
        id="containerAirpods"
      >
        {/* ======= TOP START ======= */}
        <div
          style={{
            position: "absolute",
            top: "-42%",
            left: 0,
            width: 160,
            padding: "5px 0 5px 15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 20,
          }}
        >
          <div style={{ fontSize: "14px" }}>{bt[2] ? bt[0] : ""}</div>
          <div
            style={{
              height: 15,
              width: 22,
              background: bluetoothState ? "#00ff0025" : "#ffffff25",
              borderRadius: "20px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              padding: "0 3px",
              transition: "300ms all ease",
              transform: bt[2] ? "" : "translate(-5px, 42px)",
            }}
            onClick={() => {
              run(
                bluetoothState
                  ? `osascript -e 'do shell script "/usr/local/bin/blueutil -p 0"'`
                  : `osascript -e 'do shell script "/usr/local/bin/blueutil -p 1"'`
              );
              bluetoothState = true;
            }}
          >
            <div
              style={{
                height: 10,
                width: 10,
                background: "#ffffff90",
                borderRadius: "50%",
                transform: bluetoothState ? "translate(11px,0)" : "",
                transition: "300ms transform ease",
              }}
            ></div>
          </div>
        </div>

        {/* ======= TOP END ======= */}
        <div
          style={{
            transition: "400ms opacity ease",
            position: "absolute",
            top: 0,
            left: 13,
            paddingTop: 10,
            opacity: bluetoothState && bt[2] ? 1 : 0,
            visibility: bluetoothState && bt[2] ? "visible" : "hidden",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {/* #1 */}
            <div
              style={{
                height: 55,
                width: 35,
                borderRadius: 8,
                background: "#ffffff10",
                position: "relative",
                display: "flex",
                alignItems: "end",
                fontSize: "14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: +bt[5] < 50 ? "#ffff00" : "#55ff00",
                  display: "grid",
                  placeItems: "center",
                  filter: "blur(40px)",
                  height: "100%",
                  width: 35,
                }}
              ></div>
              <h3 style={{ position: "absolute", top: 4, left: 9 }}>{bt[5]}</h3>
            </div>

            {/* #2 */}
            <div
              style={{
                height: 55,
                width: 70,
                borderRadius: 8,
                background: "#ffffff10",
                position: "relative",
                display: "flex",
                alignItems: "end",
                fontSize: "14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: +bt[3] < 50 ? "#ffff00" : "#55ff00",
                  display: "grid",
                  placeItems: "center",
                  filter: "blur(40px)",
                  height: "100%",
                  width: 70,
                }}
              ></div>
              <h3 style={{ position: "absolute", top: 4, left: 25 }}>
                {bt[3]}
              </h3>
            </div>
            {/* #3 */}
            <div
              style={{
                height: 55,
                width: 35,
                borderRadius: 8,
                background: "#ffffff10",
                position: "relative",
                display: "flex",
                alignItems: "end",
                fontSize: "14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background:
                    +bt[4] < 50 ? "yellow" : +bt[4] < 20 ? "red" : "#55ff00",
                  display: "grid",
                  placeItems: "center",
                  filter: "blur(40px)",
                  height: "100%",
                  width: 35,
                }}
              ></div>
              <h3 style={{ position: "absolute", top: 4, left: 9 }}>{bt[4]}</h3>
            </div>
          </div>
        </div>

        <p
          style={{
            transition: "400ms opacity ease",
            position: "absolute",
            top: -2,
            left: 15,
            opacity: bluetoothState && !bt[2] ? 1 : 0,
            visibility: bluetoothState && !bt[2] ? "visible" : "hidden",
          }}
        >
          No Connected
        </p>

        <div
          style={{
            display: "flex",
            padding: "16px 0",
            height: "100%",
            transition: "400ms opacity ease",
            position: "absolute",
            top: -2,
            left: 15,
            opacity: !bluetoothState ? 1 : 0,
            visibility: !bluetoothState ? "visible" : "hidden",
          }}
        >
          Bluetooth
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
`;

const styles = {
  parent: {
    position: "relative",
    top: 750,
    left: 0,
    height: 170,
    width: 600,
  },
  container: {
    position: "absolute",
    top: "105%",
    left: "1.5%",
    fontFamily: "Montserrat, sans-serif",
    width: 270,
    height: 55,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    color: "#fff",
    padding: "10px 15px",
    border: "0.5px solid #ffffff20",
    background: "#00000030",
    transition: "500ms all ease",
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
