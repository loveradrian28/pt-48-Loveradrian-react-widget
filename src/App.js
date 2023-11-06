import React, { useEffect, useState, useRef } from "react";
import "./index.css";
import Switch from "@mui/material/Switch";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import song1 from "./song1.mp3";
import img1 from "./img1.gif";

const songs = [
  {
    id: 0,
    title: "NewJeans (뉴진스)",
    artist: "Hype Boy ",
    image:
      "https://res.cloudinary.com/tropicolx/image/upload/v1675352152/music_app/machinery-of-war_fqu8z6.jpg",
    src: song1,
  },
];

const Switcher = ({ onclick }) => {
  return (
    <>
      <div className="switcher__container">
        <div className="switcher-switcher">
          <label htmlFor="switch">UI Off</label>
          <Switch
            color="default"
            id="switch"
            onClick={() => {
              onclick();
            }}
          />{" "}
          <label htmlFor="switch">UI On</label>
        </div>
      </div>
    </>
  );
};
const VolumeBar = ({ onChange }) => {
  const [volume, setVolume] = useState(1);

  let backgroundStyle = {
    background: `linear-gradient(to right, var(--main-red) ${
      (volume * 100) / 2
    }%, var(--main-background) ${(volume * 100) / 2}%`,
  };

  const modifyVolume = (event) => {
    setVolume(event.target.value);
    onChange(event.target.value);
  };
  return (
    <>
      <div className="volumen-var__container">
        <input
          type="range"
          name="volume"
          id="volume"
          min={0}
          max={2}
          step={0.1}
          defaultValue={volume}
          onChange={modifyVolume}
          style={backgroundStyle}
        />
      </div>
    </>
  );
};
const ProgressComponent = ({
  playedorNot,
  onButtonClick,
  songprog,
  onChange,
  progressSeekEnd,
  progressSeekStart,
}) => {
  return (
    <>
      <div
        className="progress__container"
        style={{ background: playedorNot && `transparent` }}
      >
        <CircularProgress
          songProgress={songprog}
          isPlaying={playedorNot}
          onClickFunction={onButtonClick}
          playedorNot={playedorNot}
        />
        <VerticalProgress
          songProgress={songprog}
          onChange={onChange}
          progressSeekEnd={progressSeekEnd}
          progressSeekStart={progressSeekStart}
          playedorNot={playedorNot}
        />
      </div>
    </>
  );
};
const CircularProgress = ({
  isPlaying,
  songProgress,
  onClickFunction,
  playedorNot,
}) => {
  const [clipPathString, setClipPathString] = useState("");
  const [dotXPosition, setDotXPosition] = useState(0);
  const [dotYPosition, setDotYPosition] = useState(0);

  const getStartAngle = () => {
    return 2 * Math.PI;
  };
  const getEndAngle = (songProgress) => {
    return 2 * Math.PI - (songProgress / 50) * Math.PI;
  };

  const getSvgArc = (x, y, r) => {
    var largeArc =
      getEndAngle(songProgress) - getStartAngle() <= Math.PI ? 1 : 0;
    return [
      "path('M",
      x,
      y,
      "L",
      x + Math.cos(getEndAngle(songProgress)) * r,
      y - Math.sin(getEndAngle(songProgress)) * r,
      "A",
      r,
      r,
      0,
      largeArc,
      0,
      x + Math.cos(getStartAngle()) * r,
      y - Math.sin(getStartAngle()) * r,
      "L",
      x,
      y,
      "')",
    ].join(" ");
  };

  const getDotXPosition = (x, r) => {
    return Number(x + Math.cos(getEndAngle(songProgress)) * r);
  };
  const getDotYPosition = (y, r) => {
    return Number(y - Math.sin(getEndAngle(songProgress)) * r);
  };

  useEffect(() => {
    setClipPathString(getSvgArc(84, 84, 84));
    setDotXPosition(getDotXPosition(71, 69));
    setDotYPosition(getDotYPosition(71, 69));
  }, [songProgress]);

  return (
    <>
      <div
        className="circular-progress__container"
        style={{ background: playedorNot && `transparent` }}
      >
        <div className="circle-progress-circle">
          <div
            className="circle-red-progress"
            style={{ clipPath: clipPathString }}
          ></div>
          <div className="circle-progress-inner-circle">
            {!isPlaying && (
              <PlayCircleOutlineIcon
                sx={{ fontSize: 120, color: "white", cursor: "pointer" }}
                onClick={onClickFunction}
              ></PlayCircleOutlineIcon>
            )}
            {isPlaying && (
              <PauseCircleOutlineIcon
                sx={{ fontSize: 120, color: "white", cursor: "pointer" }}
                onClick={onClickFunction}
              >
                {" "}
              </PauseCircleOutlineIcon>
            )}
            <div
              className="circle-progress-inner-little-dot"
              style={{ left: `${dotXPosition}px`, top: `${dotYPosition}px` }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};
const VerticalProgress = ({
  songProgress,
  onChange,
  progressSeekEnd,
  progressSeekStart,
  playedorNot,
}) => {

  let backgroundStyle = {
    background: `linear-gradient(to right, var(--main-red) ${songProgress}%, var(--main-background) ${songProgress}%`,
  };
  return (
    <>
      <div
        className="vertical-progress__container"
        style={{ background: playedorNot && `transparent` }}
      >
        <input
          type="range"
          name="progress"
          id="progress"
          min={0}
          max={100}
          value={songProgress}
          onChange={onChange}
          onTouchStart={progressSeekStart}
          onMouseDown={progressSeekStart}
          onTouchEnd={progressSeekEnd}
          onClick={progressSeekEnd}
          style={backgroundStyle}
        />
        {/* <div className="vertical-progress-bar"></div> */}
      </div>
    </>
  );
};

export default function App() {
  const audioRef = useRef();
  const source = useRef();
  const analyzer = useRef();
  const track = useRef();
  const gainNode = useRef();
  const [songProgress, setSongProgress] = useState(0);
  const [playedorNot, setPlayedorNot] = useState(false);
  const [switcherState, setSwitcherState] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [songBannerText, setSongBannerText] = useState(``);

  source.current = songs[0].src;

  const onClickSwitch = () => {
    setSwitcherState(!switcherState);
  };
  const handleAudioPlay = () => {
    const audioContext = new AudioContext();
    if (!track.current) {
      track.current = audioContext.createMediaElementSource(audioRef.current);
      analyzer.current = audioContext.createAnalyser();
      gainNode.current = audioContext.createGain();
      track.current.connect(gainNode.current);
      gainNode.current.connect(audioContext.destination);
      // analyzer.current.connect(audioContext.destination);
      // track.current.connect(analyzer.current);
      // track.current.connect(audioContext.destination);
      console.log(audioContext);
    }
  };
  const setTimeUpdate = () => {
    const audio = audioRef.current;
    const currentTime = audio.currentTime;

    !dragging &&
      setSongProgress(() => {
        return currentTime
          ? Number(((currentTime * 100) / audio.duration).toFixed(1))
          : 0;
      });
  };

  const updateCurrentTime = (value) => {
    const audio = audioRef.current;
    const currentTime = (value * audio.duration) / 100;
    audio.currentTime = currentTime;
  };

  const progressSeekEnd = (e) => {
    updateCurrentTime(e.target.value);
    setDragging(false);
  };
  const playOrPause = () => {
    !playedorNot ? audioRef.current.play() : audioRef.current.pause();
    setPlayedorNot(!playedorNot);
  };

  const modifyVolume = (volume) => {
    gainNode.current.gain.value = volume;
    // console.log(gainNode.current.gain.value);
  };

  useEffect(() => {
    setSongBannerText(
      `${songs[0].title.toUpperCase()} - ${songs[0].artist.toUpperCase()}`
    );
  }, []);

  return (
    <div
      className="main__container"
      style={{
        backgroundImage: playedorNot && !switcherState && `url(${img1})`,
      }}
    >
      <h1 className="main-title">Custom player</h1>
      {playedorNot && (
        <div className="banner-text">
          <span style={{ color: switcherState && `white` }}>
            {songBannerText}
          </span>
        </div>
      )}
      <div className="main-window__controllers">
        <div className="main-window-controler red"></div>
        <div className="main-window-controler orange"></div>
        <div className="main-window-controler green "></div>
      </div>
      {(switcherState || playedorNot) && <VolumeBar onChange={modifyVolume} />}
      {switcherState && (
        <ProgressComponent
          playedorNot={playedorNot}
          onButtonClick={playOrPause}
          songprog={songProgress}
          onChange={(e) => setSongProgress(Number(e.target.value))}
          progressSeekEnd={progressSeekEnd}
          progressSeekStart={() => setDragging(true)}
        />
      )}
      <Switcher onclick={onClickSwitch} />
      {!playedorNot && !switcherState && songProgress !== 0 && (
        <PlayCircleOutlineIcon
          sx={{
            fontSize: 50,
            color: "var(--main-red)",
            cursor: "pointer",
            position: "absolute",
            bottom: 40,
            right: 30,
          }}
          onClick={playOrPause}
        ></PlayCircleOutlineIcon>
      )}
      {playedorNot && !switcherState && songProgress !== 0 && (
        <PauseCircleOutlineIcon
          sx={{
            fontSize: 50,
            color: "var(--main-red)",
            cursor: "pointer",
            position: "absolute",
            bottom: 40,
            right: 30,
          }}
          onClick={playOrPause}
        >
          {" "}
        </PauseCircleOutlineIcon>
      )}
      <audio
        ref={audioRef}
        onTimeUpdate={setTimeUpdate}
        onPlay={handleAudioPlay}
        src={source.current}
        controls
      />
    </div>
  );
}
