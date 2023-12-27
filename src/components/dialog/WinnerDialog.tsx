import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import { Publisher, StreamManager, Subscriber } from "openvidu-browser";
import IdolStreamView from "@/components/meeting/IdolStreamView";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  winnerName: string;
  fanStream: StreamManager | Subscriber | Publisher | undefined;
}

const WinnerDialog = ({ open, onClose, winnerName, fanStream }: Props) => {
  const [audio, setAudio] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAudio(new Audio("/mp3/fanfare.mp3"));
    }
  }, []);

  useEffect(() => {
    if (open && audio) {
      audio.play();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [open, audio]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialogContent-root": {
          padding: 2,
        },
        "& .MuiDialogActions-root": {
          padding: 2,
        },
      }}
    >
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <DialogTitle variant={"h3"}>
          🥳 {winnerName}님이 정답을 맞추셨어요!
        </DialogTitle>
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
      </Stack>
      <DialogContent>
        {fanStream && (
          <IdolStreamView name={winnerName} streamManager={fanStream} />
        )}
      </DialogContent>
      <DialogContentText textAlign={"center"} variant={"h5"}>
        정답을 맞추신 분께는 미공개 포토카드가 제공됩니다!
      </DialogContentText>
      <DialogActions></DialogActions>
    </Dialog>
  );
};

export default WinnerDialog;
