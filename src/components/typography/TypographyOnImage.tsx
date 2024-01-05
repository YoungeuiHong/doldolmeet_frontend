import { styled } from "@mui/material";
import Typography from "@mui/material/Typography";

export const TypographyOnImage = styled(Typography)(() => ({
  textAlign: "center",
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 1,
  fontWeight: 700,
  color: "#ffffff",
  marginBottom: 10,
}));
