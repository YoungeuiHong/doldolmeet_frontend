import React, { useState, useEffect } from "react";
import { LinearProgress, Stack } from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import Typography from "@mui/material/Typography";

interface Props {
  timeLimit: number;
}

const LinearTimerBar = ({ timeLimit }: Props) => {
  const [seconds, setSeconds] = useState(timeLimit);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => (prevSeconds > 1 ? prevSeconds - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const progressStyle = {
    width: "100%",
    height: 10,
    borderRadius: 10,
  };

  return (
    <div style={{ width: "40%" }}>
      {seconds > 0 && (
        <Stack
          direction={"row"}
          justifyContent={"center"}
          alignItems={"center"}
          spacing={2}
        >
          {seconds % 2 === 1 ? (
            <HourglassBottomIcon sx={{ color: "#FFAFCC" }} />
          ) : (
            <HourglassTopIcon sx={{ color: "#FFAFCC" }} />
          )}
          <LinearProgress
            variant="determinate"
            value={(seconds / timeLimit) * 100}
            sx={progressStyle}
          />
          <Typography variant={"h5"} sx={{ color: "#ff86b3" }}>
            {seconds}
          </Typography>
        </Stack>
      )}
    </div>
  );
};

export default LinearTimerBar;
