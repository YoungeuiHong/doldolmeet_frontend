"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Link from "next/link";
import { useTodayFanmeeting } from "@/hooks/useTodayFanmeeting";
import GradientButton from "@/components/button/GradientButton";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { backend_api } from "@/utils/api";
import Typography from "@mui/material/Typography";

export interface TodayFanMeeting {
  id: number;
  imgUrl: string;
  title: string;
  startTime: string;
}

interface Props {
  todayMeeting: any;
  popupOpen: boolean;
}

export default function ShowDialog({ todayMeeting, popupOpen }) {
  const [role, setRole] = useState<Role>(Role.FAN);
  const [imgSrc, setImgSrc] = useState<string>("");

  const [sessionId, setSessionId] = useState<string | undefined>();
  const [motionType, setMotionType] = useState<string | undefined>();
  const [idolName, setIdolName] = useState<string | undefined>();

  const token = useJwtToken();

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
      }
    });
  }, [token]);
  const [open, setOpen] = useState(popupOpen);

  useEffect(() => {
    setImgSrc(todayMeeting?.data?.imgUrl);
    idolRoomMove(todayMeeting);
  }, [todayMeeting]);

  const handleClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;
    setOpen(false);
  };

  const idolRoomMove = async (todayMeeting) => {
    try {
      if (todayMeeting && todayMeeting.data && todayMeeting.data.id) {
        // 추가된 부분
        const idolRoomResponse = await backend_api().get(
          `/roomOrder/${todayMeeting.data.id}`,
        );

        setSessionId(idolRoomResponse.data.data.currentRoom);
        setMotionType(idolRoomResponse.data.data.motionType);
        setIdolName(idolRoomResponse.data.data.idolName);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateTimeString: string) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateTimeString).toLocaleDateString("ko-KR", options);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          width: "40vw",
          height: "auto",
        },
      }}
    >
      <DialogTitle style={{ textAlign: "center" }}>
        <Typography variant="h3">{todayMeeting?.data?.title}</Typography>
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
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

      {role === Role.FAN && (
        <>
          <DialogContentText
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <img
              src={imgSrc}
              alt="이미지"
              style={{
                maxWidth: "70%",
                maxHeight: "80%",
                width: "auto",
                height: "auto",
                position: "relative",
                borderRadius: 10,
                marginBottom: 10,
              }}
              onError={() => setImgSrc("/images/fanmeeting/riize_cover.jpeg")}
            />
          </DialogContentText>
          <DialogTitle style={{ textAlign: "center" }}>
            시작시간이 {formatDate(todayMeeting?.data?.startTime)} 입니다.
          </DialogTitle>
          <DialogContentText style={{ textAlign: "center" }}>
            당신의 아이돌을 만나기 위해{" "}
            <span style={{ color: "#ed6ea0" }}>이동하기</span> 버튼을
            눌러주세요.
          </DialogContentText>
          <DialogTitle style={{ textAlign: "center" }}></DialogTitle>
          <DialogActions style={{ justifyContent: "space-between" }}>
            {todayMeeting?.data?.id && (
              <Link
                href={`/waitingroom/${todayMeeting?.data?.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block", // 링크를 블록 레벨 요소로 설정
                  width: "100%", // 전체 폭을 사용하도록 설정
                }}
              >
                <GradientButton
                  sx={{ width: "100%", height: 45, borderRadius: 4 }}
                >
                  이동하기
                </GradientButton>
              </Link>
            )}
          </DialogActions>
        </>
      )}
      {role === Role.IDOL && (
        <>
          <DialogContentText
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <img
              src={imgSrc}
              alt="이미지"
              style={{
                maxWidth: "70%",
                maxHeight: "80%",
                width: "auto",
                height: "auto",
                position: "relative",
                borderRadius: 10,
                marginBottom: 10,
              }}
              onError={() => setImgSrc("/images/fanmeeting/riize_cover.jpeg")}
            />
          </DialogContentText>
          <DialogContentText style={{ textAlign: "center" }}>
            오늘의 팬미팅이 시작되었습니다.
          </DialogContentText>
          <DialogTitle style={{ textAlign: "center" }}>
            시작시간이 {formatDate(todayMeeting?.data?.startTime)} 입니다.
          </DialogTitle>
          <DialogContentText style={{ textAlign: "center" }}>
            팬미팅을 시작하시겠습니까?
          </DialogContentText>
          <DialogActions style={{ justifyContent: "space-between" }}>
            {todayMeeting?.data?.id && sessionId && idolName && motionType && (
              <Link
                href={`one-to-one/${todayMeeting?.data?.id}/${sessionId}/${idolName}/${motionType}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block", // 링크를 블록 레벨 요소로 설정
                  width: "100%", // 전체 폭을 사용하도록 설정
                }}
              >
                <GradientButton
                  sx={{ width: "100%", height: 45, borderRadius: 4 }}
                >
                  이동하기
                </GradientButton>
              </Link>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
