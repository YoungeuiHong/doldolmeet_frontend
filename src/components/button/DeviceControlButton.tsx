"use client";
import { useEffect, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { Publisher } from "openvidu-browser";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";

import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import ClosedCaptionDisabledIcon from "@mui/icons-material/ClosedCaptionDisabled";

interface Props {
  publisher: Publisher | undefined;
  fullScreen: boolean;
  toggleFullScreen: () => void;
  filterOn: boolean;
  onClickFilter: () => void;
  toggleSubtitle: () => void;
  isSubtitleActive: boolean;
}

const DeviceControlButton = ({
  publisher,
  fullScreen,
  toggleFullScreen,
  filterOn,
  onClickFilter,
  toggleSubtitle,
  isSubtitleActive,
}: Props) => {
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);

  useEffect(() => {
    publisher?.publishVideo(camera);
    publisher?.publishAudio(mic);
  }, [mic, camera]);

  return (
    <ToggleButtonGroup
      id="device-control-button"
      sx={{ backgroundColor: "#FFFFFF", marginRight: 3 }}
    >
      <ToggleButton
        value="underlined"
        aria-label="underlined"
        onClick={() => setMic(!mic)}
      >
        {mic ? (
          <MicIcon sx={{ color: "#FFAFCC" }} />
        ) : (
          <MicOffIcon sx={{ color: "#bdbdbd" }} />
        )}
      </ToggleButton>
      <ToggleButton
        value="italic"
        aria-label="italic"
        onClick={() => setCamera(!camera)}
      >
        {camera ? (
          <VideocamIcon sx={{ color: "#FFAFCC" }} />
        ) : (
          <VideocamOffIcon sx={{ color: "#bdbdbd" }} />
        )}
      </ToggleButton>
      {/* 자막 켜기 / 끄기 */}
      <ToggleButton
        value="underlined"
        aria-label="underlined"
        onClick={toggleSubtitle}
      >
        {/* ex. translate 온, 오프 */}
        {isSubtitleActive ? (
          <ClosedCaptionIcon sx={{ color: "#FFAFCC" }} />
        ) : (
          <ClosedCaptionDisabledIcon sx={{ color: "#bdbdbd" }} />
        )}
      </ToggleButton>
      <ToggleButton
        value="underlined"
        aria-label="underlined"
        onClick={toggleFullScreen}
      >
        <FullscreenIcon sx={{ color: fullScreen ? "#FFAFCC" : "#bdbdbd" }} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default DeviceControlButton;
