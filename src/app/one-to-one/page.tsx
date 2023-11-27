"use client";
import {
  Connection,
  OpenVidu,
  Publisher,
  Session,
  StreamManager,
} from "openvidu-browser";
import { Button, Grid, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import ShowChat from "@/components/ShowChat";
import { Role } from "@/types";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import DeviceControlButton from "@/components/meeting/DeviceControlButton";
import MyVideoComponent from "@/components/meeting/MyVideoComponent";
import WaitingFanImage from "@/components/meeting/WaitingFanImage";
import { Box } from "@mui/system";
import { fetchFanToFanMeeting } from "@/hooks/useFanMeetings";
import { useRouter, useSearchParams } from "next/navigation";
import Capture from "@/components/Capture";
import InviteDialog from "@/components/InviteDialog";

const OneToOnePage = () => {
  const router = useRouter();

  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("fanMeetingId");
  const sessionId = searchParams?.get("sessionId");

  /* OpenVidu */
  const [OV, setOV] = useState<OpenVidu | undefined>();

  /* OpenVidu Session Info*/
  const [session, setSession] = useState<Session | undefined>();

  /* OpenVidu Stream */
  const [idolStream, setIdolStream] = useState<Publisher>();
  const [fanStream, setFanStream] = useState<StreamManager>();
  const [subscribers, setSubscribers] = useState<StreamManager[]>([]);

  /* OpenVidu Connection */
  const [myConnection, setMyConnection] = useState<Connection | undefined>();

  /* Layout */
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(true);

  /* React Query FanToFanMeeting 조회 */
  const [chatRoomId, setChatRoomId] = useState<string | undefined>();

  /* 다음 아이돌의 대기실로 넘어가기 위해 필요한 state */
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [nextRoomId, setNextRoomId] = useState<string>("");

  useEffect(() => {
    async function findFanToFanMeeting() {
      const fanToFanMeeting = await fetchFanToFanMeeting(fanMeetingId);
      setChatRoomId(fanToFanMeeting?.chatRoomId);
    }

    findFanToFanMeeting();
  }, []);

  /* Role */
  const token: Promise<JwtToken | null> = useJwtToken();
  const [role, setRole] = useState<Role | undefined>();
  const [userName, setUserName] = useState<string>("");
  useEffect(() => {
    token.then((res) => {
      setRole(res?.auth);
      setUserName(res?.sub ?? "");
    });
  }, [token]);

  useEffect(() => {
    async function init() {
      if (role === Role.FAN) {
        await fetchSSE();
      }
      await joinSession();
    }

    if (role && userName !== "") {
      init();
    }
  }, [role, userName]);

  const joinSession = async () => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      setOV(ov);

      const mySession = ov.initSession();

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]); // subscribers 배열에 추가
      });

      mySession.on("streamDestroyed", (event) => {
        deleteSubscriber(event.stream.streamManager);
      });

      const connection = await createOpenViduConnection(sessionId);
      if (connection) {
        setMyConnection(connection);
      }
      const { token } = connection;
      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: role,
          fanMeetingId: fanMeetingId,
          userName: userName,
          type: "idolRoom",
        }),
      });

      await ov.getUserMedia({
        audioSource: undefined,
        videoSource: undefined,
      });

      const devices = await ov.getDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );

      const newPublisher = await ov.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: videoDevices[0].deviceId,
        publishAudio: true,
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
      });
      mySession.publish(newPublisher);
      setSession(mySession);
      setIdolStream(newPublisher);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const fetchSSE = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    eventSource.addEventListener("moveToWaitRoom", (e: MessageEvent) => {
      console.log("🥹 moveToWaitRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      setPopupOpen(true);
    });

    eventSource.onopen = () => {
      console.log("📣 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("error");
      console.log(e);
      eventSource.close();

      if (e.error) {
        // 에러 발생 시 할 일
      }

      if (e.target.readyState === EventSource.CLOSED) {
        // 종료 시 할 일
      }
    };

    return true;
  };

  // 세션을 나가면서 정리
  const leaveSession = async () => {
    // 세션 종료: 세션에 있는 모든 커넥션을 제거함
    // if (session) {
    //   await session.disconnect();
    // }
    if (myConnection?.connectionId) {
      await closeOpenViduConnection(sessionId, myConnection?.connectionId);
    }

    // state 초기화
    setIdolStream(undefined);
    setFanStream(undefined);
    setSubscribers([]);
    setMyConnection(undefined);
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      leaveSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [leaveSession]);

  /* Subscriber 삭제 */
  const deleteSubscriber = (streamManager) => {
    let newSubscribers = subscribers.filter((sub) => sub !== streamManager);
    setSubscribers(newSubscribers);
  };

  const joinNextRoom = async () => {
    await leaveWaitingRoom();
    if (nextRoomId === "END") {
      router.push(`/end-fanmeeting?fanMeetingId=${fanMeetingId}`);
    } else {
      router.push(
        `/one-idol-waitingroom?fanMeetingId=${fanMeetingId}&sessionId=${nextRoomId}`,
      );
    }
  };

  const leaveWaitingRoom = async () => {
    if (sessionId && myConnection?.connectionId) {
      await closeOpenViduConnection(sessionId, myConnection.connectionId);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={fullScreen ? 12 : 8.5}
        sx={{
          backgroundColor: "rgba(238,238,238,0.7)",
          borderRadius: 5,
          padding: 2,
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems={"flex-start"}
        >
          <Grid item xs={12}>
            <Stack
              direction={"row"}
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: "transparent",
                px: 2,
                mb: 2,
                height: 60,
              }}
            >
              <Typography variant={"h4"}>
                {"💜 Aespa Drama 발매 기념 팬미팅"}
              </Typography>
              <DeviceControlButton
                publisher={idolStream}
                fullScreen={fullScreen}
                toggleFullScreen={() => setFullScreen(!fullScreen)}
              />
              <Capture />
            </Stack>
          </Grid>
          <Grid
            item
            id="video-container"
            xs={12}
            container
            justifyContent="space-between"
          >
            <Grid item xs={6}>
              <MyVideoComponent nickName={"카리나"} stream={idolStream} />
            </Grid>
            <Grid item xs={6} style={{ position: "relative" }}>
              {subscribers.length > 0 ? (
                <MyVideoComponent nickName={"마재화"} stream={subscribers[0]} />
              ) : (
                <WaitingFanImage />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {!fullScreen && (
        <Grid
          item
          xs={3.5}
          sx={{
            backgroundColor: "rgba(238,238,238,0.7)",
            borderRadius: 5,
            padding: 2,
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              width: "100%",
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
                onClick={() => setChatOpen(false)}
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
          <div style={{ height: "70vh" }}>
            {chatOpen ? (
              <ShowChat roomId={chatRoomId} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  maxWidth: "400px",
                  height: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        </Grid>
      )}
      <InviteDialog
        open={popupOpen}
        handleClose={() => setPopupOpen(false)}
        handleEnter={joinNextRoom}
      />
    </Grid>
  );
};

export default OneToOnePage;
