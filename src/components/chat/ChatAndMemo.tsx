"use client";

import { Box } from "@mui/system";
import { Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Chat from "@/components/chat/Chat";
import Memo from "@/components/chat/Memo";
import React, { useState } from "react";

interface Props {
  chatRoomId: string | undefined;
  height: string;
}

const ChatAndMemo = ({ chatRoomId, height }: Props) => {
  const [chatOpen, setChatOpen] = useState<boolean>(true);

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          width: "100%",
          maxWidth: "500px",
          height: 60,
          borderRadius: 1,
          bgcolor: "#ffffff",
          mb: 2,
        }}
      >
        <Stack
          direction={"row"}
          justifyContent="space-around"
          alignItems="center"
          sx={{ width: "100%", height: "100%" }}
        >
          <Button
            variant={chatOpen ? "contained" : "text"}
            onClick={() => setChatOpen(true)}
            sx={{
              width: "46%",
              height: "70%",
              backgroundColor: chatOpen ? "#ff8fab" : "#ffffff",
            }}
          >
            <Typography
              variant={"button"}
              sx={{
                fontWeight: 700,
                color: chatOpen ? "#ffffff" : "#9e9e9e",
                letterSpacing: 3,
              }}
            >
              채팅창
            </Typography>
          </Button>
          <Button
            variant={chatOpen ? "text" : "contained"}
            onClick={() => setChatOpen(false)} // 여기를 수정
            sx={{
              width: "46%",
              height: "70%",
              backgroundColor: chatOpen ? "#ffffff" : "#ff8fab",
            }}
          >
            <Typography
              variant={"button"}
              sx={{
                fontWeight: 700,
                color: chatOpen ? "#9e9e9e" : "#ffffff",
                letterSpacing: 3,
              }}
            >
              메모장
            </Typography>
          </Button>
        </Stack>
      </Box>
      <div
        style={{
          display: chatOpen ? "block" : "none",
          height: height,
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <Chat roomId={chatRoomId} />
      </div>

      {/* 메모 컴포넌트 */}
      <div
        style={{
          display: chatOpen ? "none" : "block",
          height: height,
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <Memo />
      </div>
    </>
  );
};

export default ChatAndMemo;
