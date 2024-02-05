import { LinearProgress, linearProgressClasses, styled } from "@mui/material";
import { grey } from "@mui/material/colors";
import React from "react";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 15,
  borderRadius: 10,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: grey[300],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 10,
  },
}));

export default function MockLinearProgress() {
  const [progress, setProgress] = React.useState(80);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 100 : prevProgress + 1,
      );
    }, 3000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return <BorderLinearProgress variant="determinate" value={progress} />;
}
