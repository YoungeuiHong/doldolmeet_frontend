import React from "react";
import { Role } from "@/types";
import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";

interface Props {
  waitingFor: Role; // 누구를 기다리고 있는지
  name?: string;
}

const WaitingImage = ({ waitingFor, name }: Props) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "68vh",
        borderRadius: 2,
        backgroundColor: grey["300"],
        mx: 1,
      }}
    />
  );
};

export default WaitingImage;
