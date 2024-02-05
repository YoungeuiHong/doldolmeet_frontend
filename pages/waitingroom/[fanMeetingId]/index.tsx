"use client";
import { Box, Grid, Stack } from "@mui/material";
import {
  fetchFanMeeting,
  useFanMeeting,
  useMainWaitRoom,
} from "@/hooks/fanmeeting";
import React, { useEffect, useState } from "react";
import YoutubePlayer from "@/components/player/YoutubePlayer";
import { Connection, OpenVidu } from "openvidu-browser";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import ChatAndMemo from "@/components/chat/ChatAndMemo";
import Typography from "@mui/material/Typography";
import StartFanMeetingDialog from "@/components/dialog/StartFanMeetingDialog";
import { useRouter } from "next/router";
import { grey } from "@mui/material/colors";
import MockLinearProgress from "@/components/progress/LinearProgressBar";
import WaitingRoomTour from "./product-tour";
import { CallBackProps } from "react-joyride";

interface NextRoomEvent {
  nextRoomId: string;
  currRoomType: string;
  roomThumbnail: string;
  idolNickName: string;
}

const WaitingRoom = () => {
  const router = useRouter();
  const searchParams = router.query;
  const fanMeetingId = searchParams?.fanMeetingId;

  const { data: fanMeeting } = useFanMeeting(fanMeetingId);
  const { data: waitRoomId } = useMainWaitRoom(fanMeetingId);

  useEffect(() => {
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;
      if (as !== currentPath) {
        leaveWaitingRoom();
        return true;
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);

  const [role, setRole] = useState<Role>(Role.FAN);
  const [userName, setUserName] = useState<string>("");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [nextRoomId, setNextRoomId] = useState<string>("");
  const [connection, setConnection] = useState<Connection | undefined>(
    undefined,
  );
  const [pepleAhead, setPeopleAhead] = useState<number>(0);

  const token = useJwtToken();

  /* FanMeeting 이름 */
  const [fanMeetingName, setFanMeetingName] = useState<string | undefined>();

  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    if (fanMeetingId && userName) {
      fetchSSE();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fanMeetingId, userName]);

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
        setUserName(res.sub);
      }
    });
  }, [token]);

  useEffect(() => {
    if (waitRoomId && role && userName) {
      joinSession(waitRoomId);
    }
  }, [waitRoomId, role, userName]);

  useEffect(() => {
    if (fanMeetingId) {
      fetchFanMeetingTitle();
    }
  }, [fanMeetingId]);

  const joinSession = async (sessionId: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      const connection = await createOpenViduConnection(sessionId);
      if (connection) {
        setConnection(connection);
      }
      const { token } = connection;

      let connectRetryCount = 0;
      const maxConnectRetries = 2;
      while (connectRetryCount < maxConnectRetries) {
        try {
          await mySession.connect(token, {
            clientData: JSON.stringify({
              role: role,
              fanMeetingId: fanMeetingId,
              userName: userName,
              type: "waitingRoom",
            }),
          });
          break;
        } catch (e) {
          console.error(e);
          connectRetryCount++;
          if (connectRetryCount === maxConnectRetries) {
            throw e;
          }
        }
      }
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const fetchSSE = () => {
    if (!fanMeetingId || !userName) return;

    const eventSource = new EventSource(
      `https://api.doldolmeet.store/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    setEventSource(eventSource);

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 SSE 연결되었습니다.");
    });

    eventSource.addEventListener(
      "moveToFirstIdolWaitRoom",
      (e: MessageEvent) => {
        console.log(
          "😎 첫 번째 아이돌과의 영상통화방으로 이동하세요! ",
          JSON.parse(e.data),
        );
        setNextRoomId(JSON.parse(e.data).nextRoomId);
        setPopupOpen(true);
      },
    );

    eventSource.addEventListener("numberOfPeopleAhead", (e: MessageEvent) => {
      setPeopleAhead(JSON.parse(e.data));
    });

    eventSource.addEventListener("moveToIdolRoom", (e: MessageEvent) => {
      console.log("🥹 moveToIdolRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      setPopupOpen(true);
    });

    eventSource.onerror = (e) => {
      console.log("eventSource error", e);
    };
  };

  const leaveWaitingRoom = async () => {
    if (waitRoomId && connection?.connectionId) {
      await closeOpenViduConnection(waitRoomId, connection.connectionId);
    }
  };

  const joinNextRoom = async () => {
    await leaveWaitingRoom();
    router.push(
      // `/one-idol-waitingroom?fanMeetingId=${fanMeetingId}&sessionId=${nextRoomId}`,
      `/one-to-one/3/4/jungkook/bigHeart`,
    );
  };

  const handleClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;
    setPopupOpen(false);
  };

  const fetchFanMeetingTitle = async () => {
    try {
      const fanMeeting = await fetchFanMeeting(fanMeetingId);

      if (fanMeeting) {
        setFanMeetingName(fanMeeting.title);
      }
    } catch (error) {
      console.error("FanMeeting fetch error:", error);
    }
  };

  const productTourCallback = (data: CallBackProps) => {
    const { type } = data;

    if (type === "tour:end") {
      setPopupOpen(true);
    }
  };

  return (
    <>
      <Grid
        id={"waiting-room"}
        container
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
        spacing={3}
        sx={{ px: 2 }}
      >
        <Grid item xs={8} sx={{ width: "100%", height: "70%" }}>
          <Stack
            direction={"column"}
            justifyContent="center"
            alignItems="flex-start"
            sx={{ width: "100%" }}
            spacing={2}
          >
            <Typography variant={"h4"}>
              {fanMeetingName && `💜 ${fanMeetingName} 대기방 💜`}
            </Typography>
            <div
              style={{
                width: "100%",
                height: "40%",
              }}
            >
              <YoutubePlayer />
            </div>
            <Stack
              id={"waiting-info"}
              direction={"column"}
              justifyContent={"center"}
              alignItems={"center"}
              spacing={3}
              sx={{
                width: "100%",
                height: "25vh",
                borderRadius: 3,
                backgroundColor: grey["200"],
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  zIndex: 1,
                  fontWeight: 700,
                  color: "#212121",
                  textAlign: "center",
                }}
              >
                당신은 {pepleAhead + 1}번째 순서입니다!
              </Typography>
              <Box sx={{ width: "80%" }}>
                <MockLinearProgress />
              </Box>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={4}>
          <ChatAndMemo chatRoomId={fanMeeting?.chatRoomId} height={"75vh"} />
        </Grid>
      </Grid>
      <StartFanMeetingDialog
        open={popupOpen}
        handleClose={handleClose}
        handleEnter={joinNextRoom}
      />
      <WaitingRoomTour callback={productTourCallback} />
    </>
  );
};

export default WaitingRoom;
