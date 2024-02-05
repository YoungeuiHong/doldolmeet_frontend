import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
// @ts-ignore
import GradientButton from "@/components/button/GradientButton";
import Typography from "@mui/material/Typography";
import Image from "next/image";

interface Props {
  open: boolean;
  handleClose: (event, reason) => void;
  handleEnter: () => void;
}

const StartFanMeetingDialog = ({ open, handleClose, handleEnter }: Props) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography
          variant="h3"
          component="div"
          sx={{ fontWeight: "bold", color: "#424242", margin: 1 }}
        >
          {"🔔  나의 순서가 다가왔어요!"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            width: 350,
            height: 350,
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Image
            src="/hi.gif"
            alt="invite"
            style={{ objectFit: "cover" }}
            fill={true}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <GradientButton
          onClick={handleEnter}
          sx={{
            width: "100%",
            margin: 1,
            height: 45,
            letterSpacing: 3,
            fontSize: 18,
            borderRadius: 3,
          }}
        >
          입장하기
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
};

export default StartFanMeetingDialog;
