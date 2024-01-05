"use client";

import React, { useCallback, useEffect, useState } from "react";
import { openvidu_api } from "@/utils/api";
import { Role } from "@/types";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import GradientButton from "@/components/button/GradientButton";
import ChatBalloon from "@/components/chat/ChatBalloon";
import useJwtToken from "@/hooks/useJwtToken";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Publisher } from "openvidu-browser";
import SmallDeviceControlButton from "@/components/meeting/SmallDeviceControlButton";

export interface Answer {
  nickname: string;
  profileImgUrl: string;
  answer: string;
}

interface Props {
  fanMeetingId: string | undefined | null;
  sessionId: string | undefined | null;
  allIdolEntered: boolean;
  userName: string | undefined | null;
  replaynum: number;
  gameStart: boolean;
  role: string | undefined;
  answers: Answer[];
  connectionId: string | undefined;
  publisher: Publisher | undefined;
  micOn: boolean;
}

const SingGamePage = ({
  allIdolEntered,
  sessionId,
  fanMeetingId,
  replaynum,
  userName,
  role,
  gameStart,
  answers,
  connectionId,
  publisher,
  micOn,
}: Props) => {
  const [showAllIdolEnteredmodal, setShowAllIdolEnteredmodal] =
    useState<boolean>(false);
  const [showGameResultModal, setShowGameResultModal] =
    useState<boolean>(false);
  const [notshowAllIdolEnteredmodal, setnotShowAllIdolEnteredmodal] =
    useState(true);
  const [gameButtonActive, setGameButtonActive] = useState<boolean>(false);

  /* 정답맞춘사람 */
  const [winner, setWinner] = useState<string | undefined | null>();

  /* 정답 확인 */
  const isAnswer = "하입보이";
  const [answer, setAnswer] = useState("");

  /* audio */
  const [audio, setAudio] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAudio(new Audio("/mp3/idolsong1.mp3"));
    }
  }, []);

  /* 토큰 정보 */
  const [nickname, setNickname] = useState<string>("");
  const [profileImgUrl, setProfileImgUrl] = useState<string>("");
  const token = useJwtToken();
  useEffect(() => {
    token.then((res) => {
      setNickname(res?.nickname ?? "");
      setProfileImgUrl(res?.profileImgUrl ?? "");
    });
  }, [token]);

  useEffect(() => {
    if (gameStart && audio) {
      audio.volume = 0.5;
      audio.play();
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [gameStart, audio]);

  /* 다시 들려 주기 관련 */
  const send_replay = useCallback(async () => {
    if (userName !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:send_replay",
        data: JSON.stringify({
          username: userName,
        }),
      });
    }
  }, [userName, sessionId]);

  useEffect(() => {
    if (replaynum >= 1 && audio) {
      audio.volume = 0.5;
      audio.play();
      setTimeout(() => {
        if (audio) {
          audio.pause();
        }
      }, 1000);
    }
  }, [replaynum]);

  //만약 아이돌이 다들어왔으면 다 들어왔다고 모달창 띄우기
  useEffect(() => {
    if (allIdolEntered) {
      setShowAllIdolEnteredmodal(true);
      setGameButtonActive(true);
    }
  }, [allIdolEntered]);

  //아이돌이 다 왔다는 모달을 2초만 띄워주고 닫음
  useEffect(() => {
    if (showAllIdolEnteredmodal) {
      setTimeout(() => {
        setShowAllIdolEnteredmodal(false);
      }, 3000);
    }
  }, [showAllIdolEnteredmodal]);

  //모든 참가자들한테 게임 시작 시그널 보내기
  const startGame = useCallback(async () => {
    if (userName !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:gameStart",
        data: JSON.stringify({
          username: userName,
        }),
      });
    }
  }, [userName, sessionId]);

  const alertWinner = async (winnerName: string) => {
    if (winner !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:alertWinner",
        data: JSON.stringify({
          winnerName: winnerName,
          connectionId: connectionId,
        }),
      });
    }
  };

  //정답 제출
  const handleSubmit = (userAnswer) => {
    signalSubmitAnswer(userAnswer);
    if (userAnswer === isAnswer) {
      setWinner(userName);
      alertWinner(userName ?? "");
    } else {
      // alert("틀렸습니다.");
    }
  };

  const signalGoToEndPage = async () => {
    await openvidu_api.post(`/openvidu/api/signal`, {
      session: sessionId,
      type: "signal:goToEndPage",
    });
  };

  const signalSubmitAnswer = async (answer: string) => {
    await openvidu_api.post(`/openvidu/api/signal`, {
      session: sessionId,
      type: "signal:submitAnswer",
      data: JSON.stringify({
        nickname: nickname,
        profileImgUrl: profileImgUrl,
        answer: answer,
      }),
    });
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      handleSubmit(answer);
      setAnswer("");
    }
  };

  return (
    <Stack
      direction={"row"}
      spacing={1}
      justifyContent={"center"}
      alignItems={"center"}
      sx={{
        width: "100%",
        height: "38vh",
        backgroundColor: "#eeeeee",
        py: 1,
        px: 1,
        borderRadius: 5,
      }}
    >
      <Grid container sx={{ px: 3 }} columnGap={1}>
        <Grid item xs={1}>
          <SmallDeviceControlButton
            publisher={publisher}
            micInit={micOn}
            cameraInit={true}
          />
        </Grid>
        <Grid item xs={10}>
          <Box
            sx={{
              width: "100%",
              height: "30vh",
              overflowY: "auto",
              px: 2,
              py: 2,
              borderRadius: 2,
              backgroundColor: "#FFFFFF",
            }}
          >
            {answers.length > 0 &&
              answers.map((answer, index) => (
                <ChatBalloon
                  sender={answer.nickname}
                  message={answer.answer}
                  profile={answer.profileImgUrl}
                  key={index}
                />
              ))}
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ width: "100%", px: 2 }}>
        {gameStart ? (
          <Stack
            direction={"column"}
            spacing={2}
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <Typography variant={"h3"} textAlign={"center"}>
              🎧 지금 재생되는 노래의 제목을 맞춰주세요!
            </Typography>
            <img
              src={
                "https://m.media-amazon.com/images/G/01/digital/music/player/web/EQ_accent.gif"
              }
              style={{ maxHeight: "10vh", width: "10%", marginTop: 10 }}
            />
            <TextField
              variant="outlined"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              sx={{ width: 400, backgroundColor: "rgba(255,255,255,0.5)" }}
              inputProps={{
                style: {
                  textAlign: "center",
                },
              }}
              onKeyDown={handleEnter}
            />
          </Stack>
        ) : (
          <Typography variant={"h3"} textAlign={"center"}>
            게임이 시작될 때까지 조금만 기다려주세요 😎
          </Typography>
        )}

        {role === Role.IDOL && (
          <Stack direction="column" spacing={2}>
            <GradientButton onClick={startGame}>
              🎬 게임 시작 버튼 활성화🎬
            </GradientButton>
            <GradientButton onClick={send_replay}>
              🎶다시 들려주기🎶
            </GradientButton>
            <GradientButton onClick={signalGoToEndPage}>
              👋🏿종료 페이지로 보내기👋🏿
            </GradientButton>
          </Stack>
        )}
      </Box>
      {showAllIdolEnteredmodal && (
        <Dialog open={showAllIdolEnteredmodal}>
          <DialogTitle style={{ textAlign: "center" }}>
            <IconButton
              aria-label="close"
              onClick={() => setShowAllIdolEnteredmodal(false)}
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
          <DialogContent>
            <img src={"/game_modal.png"} style={{ width: "100%" }} />
            <Typography variant="h2" align="center" sx={{ marginTop: 2 }}>
              멤버들이 모두 도착했어요!
            </Typography>
            <Typography
              variant="h4"
              align="center"
              sx={{ marginTop: 2, fontWeight: 340 }}
            >
              곧 아이돌과 팬이 함께 하는 게임이 진행될 예정입니다 😎
            </Typography>
          </DialogContent>
        </Dialog>
      )}
    </Stack>
  );
};

export default SingGamePage;
