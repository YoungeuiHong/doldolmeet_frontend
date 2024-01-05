"use client";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
// @ts-ignore
import GradientButton from "@/components/button/GradientButton";
import React, { useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  idolImgUrl: string;
  onClose: () => void;
  handleClose: (event, reason) => void;
  handleEnter: () => void;
}

const JoinIdolRoomDialog = ({
  open,
  idolImgUrl,
  onClose,
  handleClose,
  handleEnter,
}: Props) => {
  // @ts-ignore
  const audio = new Audio("/mp3/iphone_bell.mp3");

  useEffect(() => {
    if (open) {
      audio.play();
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle style={{ textAlign: "center" }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", justifyContent: "center" }}>
        <img
          src={idolImgUrl}
          alt="invite"
          style={{ height: "600px", borderRadius: 20 }}
        />
      </DialogContent>
      <DialogActions>
        <GradientButton
          onClick={async () => {
            handleEnter();
          }}
          sx={{
            width: "100%",
            margin: 1,
            height: 45,
            letterSpacing: 3,
            fontSize: 18,
            borderRadius: 3,
          }}
        >
          통화하기
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
};

export default JoinIdolRoomDialog;
