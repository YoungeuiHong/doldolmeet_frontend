"use client";
import { Button, styled } from "@mui/material";

const GradientButton = styled(Button)(({ theme }) => ({
  color: "#FFFFFF",
  backgroundImage: "linear-gradient(to right, #ed6ea0, #ec8c69)",
  fontWeight: 700,
  boxShadow: "0 2px 5px 0 rgba(236, 116, 149, 0.75)",
  letterSpacing: 3,
  "&:hover": {
    backgroundPosition: "100% 0",
    backgroundSize: "200% 100%",
    transition: "all .5s ease-in-out",
    backgroundImage:
      "linear-gradient(to right, #ed6ea0, #ec8c69, #f7186a , #FBB03B)",
  },
}));

export default GradientButton;
