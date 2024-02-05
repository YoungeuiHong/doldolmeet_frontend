"use client";
import {
  Connection,
  OpenVidu,
  Publisher,
  Session,
  StreamManager,
} from "openvidu-browser";
import { Box, Grid, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import { Role } from "@/types";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import DeviceControlButton from "@/components/button/DeviceControlButton";
import { fetchFanToFanMeeting } from "@/hooks/useFanMeetings";
import { useRouter } from "next/router";
import LinearTimerBar from "@/components/timer/ShowTimer";
import MyStreamView from "@/components/meeting/MyStreamView";
import PartnerStreamView from "@/components/meeting/PartnerStreamView";
import ChatAndMemo from "@/components/chat/ChatAndMemo";
import AlertSnackBar from "@/components/snackbar/AlertSnackBar";
import { backend_api, SPRING_URL } from "@/utils/api";
import MotionDetector from "@/components/photo/MotionDetector";

import { fetchFanMeeting } from "@/hooks/fanmeeting";
import { v4 as uuidv4 } from "uuid";
import FilterSelectDialog from "@/components/dialog/FilterSelectDialog";
import { useAtomValue } from "jotai/react";
import { languageTargetAtom } from "@/atom";
import SpeechDetector from "@/components/speech/SpeechDetector";
import PhotoTimeAlert from "@/components/alert/PhotoTimeAlert";
import OneToOneTour from "./product-tour";
import { grey } from "@mui/material/colors";
import { CallBackProps } from "react-joyride";

const OneToOnePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.beforePopState(({ as }) => {
      const currentPath = router.asPath;
      if (as !== currentPath) {
        leaveSession();
        return true;
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);

  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = router.query;
  const fanMeetingId = searchParams?.fanMeetingId;
  const sessionId = searchParams?.sessionId;
  const idolName = searchParams?.idolName;
  const motionType = searchParams?.motionType;

  /* OpenVidu */
  const [OV, setOV] = useState<OpenVidu | undefined>();

  /* OpenVidu Session Info*/
  const [session, setSession] = useState<Session | undefined>();

  /* OpenVidu Stream */
  const [myStream, setMyStream] = useState<Publisher | undefined>();
  const [partnerStream, setPartnerStream] = useState<
    StreamManager | undefined
  >();

  /* 닉네임 */
  const [myNickName, setMyNickName] = useState<string | undefined>(undefined);
  const [partnerNickName, setPartnerNickName] = useState<string | undefined>(
    undefined,
  );

  /* OpenVidu Connection */
  const [myConnection, setMyConnection] = useState<Connection | undefined>();

  /* Layout */
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  /* React Query FanToFanMeeting 조회 */
  const [chatRoomId, setChatRoomId] = useState<string | undefined>();

  /* 팬미팅 종료 임박 Alert */
  const [endSoon, setEndSoon] = useState<boolean>(false);

  /* SnackBar 상태 */
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarTitle, setSnackBarTitle] = useState("");
  const [snackBarContent, setSnackBarContent] = useState("");

  /* 녹화를 위한 recordingid */
  const [forceRecordingId, setForceRecordingId] = useState("");

  /* 다음 아이돌의 대기실로 넘어가기 위해 필요한 state */
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [nextRoomId, setNextRoomId] = useState<string>("");

  /* Role */
  const token: Promise<JwtToken | null> = useJwtToken();
  const [role, setRole] = useState<Role | undefined>();
  const [userName, setUserName] = useState<string>("");

  /* 사진 촬영 */
  const [photoTime, setPhotoTime] = useState<boolean>(false);
  const [partnerPose, setPartnerPose] = useState<boolean>(false);

  /* FanMeeting 이름 */
  const [fanMeetingName, setFanMeetingName] = useState<string | undefined>();

  /* 게임시작 */
  const [gameStart, setGameStart] = useState<boolean>(false);

  /* 게임종료 */
  const [gameEnd, setGameEnd] = useState<boolean>(false);

  /* 이심전심 선택 */
  const [partnerChoice, setPartnerChoice] = useState<string | undefined>();

  /* 상대방 음성 인식 */
  const [isSubtitleActive, setSubtitleActive] = useState(false);
  const [partnerVoice, setPartnerVoice] = useState<string | undefined>();
  const langTarget = useAtomValue(languageTargetAtom);

  /* 필터 On/Off */
  const [filter, setFilter] = useState(false);
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);

  /* 남은 통화 시간 */
  const [timeLimit, setTimeLimit] = useState(60);

  /* EventSource */
  const [fanEventSource, setFanEventSource] = useState<EventSource | null>(
    null,
  );
  const [idolEventSource, setIdolEventSource] = useState<EventSource | null>(
    null,
  );

  useEffect(() => {
    token.then((res) => {
      setRole(res?.auth);
      setUserName(res?.sub ?? "");
      setMyNickName(res?.nickname ?? "");
    });
  }, [token]);

  useEffect(() => {
    async function init() {
      if (role === Role.IDOL) {
        await joinSession();
        await fetchSSE_idol();
      } else if (role === Role.FAN) {
        const fanToFanMeeting = await fetchFanToFanMeeting(fanMeetingId);
        await joinSession(fanToFanMeeting?.chatRoomId);
        setChatRoomId(fanToFanMeeting?.chatRoomId);
        await fetchSSE();
      } else {
        await joinSession();
      }
    }

    if (role && userName !== "") {
      init();
    }

    return () => {
      if (fanEventSource) {
        fanEventSource.close();
      }
      if (idolEventSource) {
        idolEventSource.close();
      }
    };
  }, [role, userName]);

  const startRecording = async () => {
    const recording_name = uuidv4();
    const maxRetries = 2;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      console.log(`🎥 startRecording (Attempt ${retryCount + 1})`, {
        session: sessionId,
        fanMeetingId: fanMeetingId,
        fan: userName,
        idol: idolName,
        name: recording_name,
        hasAudio: true,
        hasVideo: true,
        outputMode: "COMPOSED",
      });

      try {
        const response = await backend_api().post(
          SPRING_URL + "/recording-java/api/recording/start",
          {
            session: sessionId,
            fanMeetingId: fanMeetingId ?? "1",
            fan: userName,
            idol: idolName,
            name: recording_name,
            hasAudio: true,
            hasVideo: true,
            outputMode: "COMPOSED",
          },
        );

        setForceRecordingId(response.data.id);
        break;
      } catch (error) {
        console.error(
          `Start recording attempt ${retryCount + 1} failed:`,
          error,
        );
        retryCount++;
      }
    }

    if (retryCount === maxRetries) {
      console.error("Max retries reached. Recording start failed.");
    }
  };

  const updateShowOverlay = (newValue) => {
    setEndSoon(newValue);
  };

  const joinSession = async (_chatRoomId?: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();
      setOV(ov);

      const mySession = ov.initSession();

      mySession.on("streamCreated", (event) => {
        console.log("🥳 streamCreated 이벤트 발생: ", event);
        const subscriber = mySession.subscribe(event.stream, undefined);
        setPartnerStream(subscriber);
        if (role === Role.IDOL) {
          const clientData = JSON.parse(
            event.stream.connection.data,
          ).clientData;
          const chatRoomId = JSON.parse(clientData).chatRoomId;
          const partnerNickName = JSON.parse(clientData).nickname;
          setChatRoomId(chatRoomId);
          setPartnerNickName(partnerNickName);
        }
      });

      mySession.on("streamDestroyed", (event) => {
        setPartnerStream(undefined);
      });

      mySession.on("signal:pose_detected", (event) => {
        if (event.data !== userName) {
          console.log("👋 상대방이 포즈를 취했어요.", event.data);
          setPartnerPose(true);
        }
      });

      mySession.on("signal:voice_detected", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          setPartnerVoice(data.translatedText);
        }
      });

      setSession(mySession);

      const connection = await createOpenViduConnection(sessionId);
      if (connection) {
        setMyConnection(connection);
      }
      const { token } = connection;

      await connectToSession({
        session: mySession,
        token: token,
        chatRoomId: _chatRoomId,
      });

      await initPublisher({ ov: ov, session: mySession });

      if (role === Role.FAN) {
        await startRecording();
      }
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const connectToSession = async ({
    session,
    token,
    chatRoomId,
  }: {
    session: Session;
    token: string;
    chatRoomId: string | undefined;
  }) => {
    let connectRetryCount = 0;
    const maxConnectRetries = 3;
    while (connectRetryCount < maxConnectRetries) {
      try {
        if (role === Role.IDOL) {
          await session?.connect(token, {
            clientData: JSON.stringify({
              role: role,
              fanMeetingId: fanMeetingId,
              userName: userName,
              type: "idolRoom",
              chatRoomId: chatRoomId,
              nickname: myNickName,
            }),
          });
        } else if (role === Role.FAN) {
          await session?.connect(token, {
            clientData: JSON.stringify({
              role: role,
              fanMeetingId: fanMeetingId,
              userName: userName,
              type: "idolRoom",
              chatRoomId: chatRoomId,
              nickname: myNickName,
              idolName: idolName,
            }),
          });
        }

        break;
      } catch (e) {
        console.error(e);
        connectRetryCount++;
      }
    }
  };

  const initPublisher = async ({
    ov,
    session,
  }: {
    ov: OpenVidu;
    session: Session;
  }) => {
    let retryCount = 0;

    while (retryCount < 3) {
      try {
        await ov.getUserMedia({
          audioSource: undefined,
          videoSource: undefined,
        });

        const devices = await ov.getDevices();
        const videoDevices = devices?.filter(
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
          mirror: false,
        });

        if (newPublisher) {
          session?.publish(newPublisher);
          setMyStream(newPublisher);
        }
        break;
      } catch (e) {
        console.error(e);
        retryCount++;
      }
    }
  };

  const fetchSSE = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.store/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 연결되었습니다.");
    });

    eventSource.addEventListener("moveToWaitRoom", async (e: MessageEvent) => {
      console.log("👋 moveToWaitRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      await joinNextRoom(
        JSON.parse(e.data).nextRoomId,
        JSON.parse(e.data).nextRoomType,
      );
    });

    eventSource.addEventListener("endNotice", (e: MessageEvent) => {
      console.log("🥹 통화가 곧 종료 됩니다.", JSON.parse(e.data));
      setEndSoon(true);
      setPhotoTime(true);
      setSnackBarTitle("팬미팅이 종료되기까지 10초가 남았어요!");
      setSnackBarContent("아쉽지만 통화를 마무리할 준비를 해주세요.");
      setSnackBarOpen(true);
    });

    eventSource.addEventListener("reConnect", (e: MessageEvent) => {
      console.log("🥹 재접속 되었습니다.", JSON.parse(e.data));
      setSnackBarTitle("팬미팅에 재접속 되었습니다!");
      setSnackBarContent(
        `통화시간이 ${Math.floor(e.data / 1000)}초 남았습니다.`,
      );
      setSnackBarOpen(true);
      setTimeLimit(Math.floor(e.data / 1000));
    });

    eventSource.onopen = () => {
      console.log("📣 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("🥲 eventSource 에러가 발생했어요", e);
      // eventSource.close();
    };

    setFanEventSource(eventSource);

    return true;
  };

  const fetchSSE_idol = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.store/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 아이돌 SSE 연결되었습니다.");
    });

    eventSource.addEventListener("idolEndNotice", (e: MessageEvent) => {
      console.log("🥹 통화가 곧 종료 됩니다.", JSON.parse(e.data));
      setEndSoon(true);
      setPhotoTime(true);
      setSnackBarTitle("팬미팅이 종료되기까지 10초가 남았어요!");
      setSnackBarContent("아쉽지만 통화를 마무리할 준비를 해주세요.");
      setSnackBarOpen(true);
    });

    eventSource.onopen = () => {
      console.log("📣 아이돌 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      // 종료 또는 에러 발생 시 할 일
      console.log("🥲 eventSource 에러가 발생했어요", e);
      // eventSource.close();
    };

    setIdolEventSource(eventSource);

    return true;
  };
  // 세션을 나가면서 정리
  const leaveSession = async () => {
    console.log(
      `leaveSession called.🥶🥶🥶 sessionId: ${sessionId}, connectionId: ${myConnection?.connectionId}`,
    );
    if (sessionId && myConnection?.connectionId) {
      await closeOpenViduConnection(sessionId, myConnection?.connectionId);
      console.log("🥲🤡🤡🤡 세션🤡🤡을 나갔습니다.");
    }

    // state 초기화
    setMyStream(undefined);
    setPartnerStream(undefined);
    setMyConnection(undefined);
  };

  const joinNextRoom = async (sessionId: string, nextRoomType: string) => {
    if (nextRoomType === "gameRoom") {
      router.push(`/game-page/${fanMeetingId}/${sessionId}`);
    } else {
      router.push(
        `/one-idol-waitingroom?fanMeetingId=${fanMeetingId}&sessionId=${sessionId}`,
      );
    }
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

  useEffect(() => {
    if (fanMeetingId) {
      fetchFanMeetingTitle();
    }
  }, [fanMeetingId]);

  const toggleFilter = async () => {
    if (filter) {
      await myStream?.stream.removeFilter();
      setFilter(false);
    } else {
      setFilterPopupOpen(true);
    }
  };

  const onClickApplyFilter = async (filterUrl: string, toPartner: boolean) => {
    const targetStream = toPartner ? partnerStream : myStream;

    await targetStream?.stream
      .applyFilter("FaceOverlayFilter", {})
      .then((filter) => {
        filter.execMethod("setOverlayedImage", {
          uri: filterUrl,
          offsetXPercent: -0.2,
          offsetYPercent: -0.8,
          widthPercent: 1.4,
          heightPercent: 1.0,
        });
      });

    if (!toPartner) {
      setFilter(true);
    }
    setFilterPopupOpen(false);
  };

  const productTourCallback = (data: CallBackProps) => {
    const { type, step, action, lifecycle } = data;

    if (step.target === "#subtitle-bar" && lifecycle === "tooltip") {
      setEndSoon(true);
    }

    if (type === "tour:end") {
      window.location.href = "/end-fanmeeting/user/3";
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
                {fanMeetingName && `💜 ${fanMeetingName} 💜`}
              </Typography>
              <LinearTimerBar timeLimit={timeLimit} />
              <DeviceControlButton
                publisher={myStream}
                fullScreen={fullScreen}
                toggleFullScreen={() => setFullScreen(!fullScreen)}
                filterOn={filter}
                onClickFilter={toggleFilter}
                toggleSubtitle={() => setSubtitleActive(!isSubtitleActive)}
                isSubtitleActive={isSubtitleActive}
              />
            </Stack>
          </Grid>
          <Grid item id="video-container" xs={12}>
            <Stack direction={"row"} spacing={1}>
              {role === Role.IDOL ? (
                <MyStreamView
                  name={`😎 ${idolName ?? "아이돌"}`}
                  stream={myStream}
                  left={true}
                  showOverlay={endSoon}
                  motionType={motionType}
                />
              ) : (
                <PartnerStreamView
                  name={`😎 ${idolName ?? "아이돌"}`}
                  stream={partnerStream}
                  partnerRole={Role.IDOL}
                  left={true}
                  showOverlay={endSoon}
                  motionType={motionType}
                />
              )}
              {role === Role.FAN ? (
                <MyStreamView
                  name={`😍 ${myNickName ?? "팬"}`}
                  stream={myStream}
                  left={false}
                  showOverlay={endSoon}
                  motionType={motionType}
                />
              ) : (
                <PartnerStreamView
                  name={`😍 ${partnerNickName ?? "팬"}`}
                  stream={partnerStream}
                  partnerRole={Role.FAN}
                  left={false}
                  showOverlay={endSoon}
                  motionType={motionType}
                />
              )}
            </Stack>
          </Grid>
          <Grid id={"subtitle-bar"} item xs={12}>
            {isSubtitleActive ? (
              <SpeechDetector
                sessionId={sessionId}
                partnerVoice={partnerVoice}
                username={userName}
                active={isSubtitleActive}
                languageTarget={langTarget}
              />
            ) : (
              <Box
                sx={{
                  backgroundColor: grey["300"],
                  width: "100%",
                  height: "6vh",
                  borderRadius: 2,
                  mt: 1,
                }}
              />
            )}
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
          <ChatAndMemo chatRoomId={chatRoomId} height={"75vh"} />
        </Grid>
      )}
      <AlertSnackBar
        open={snackBarOpen}
        handleClose={() => setSnackBarOpen(false)}
        title={snackBarTitle}
        content={snackBarContent}
      />
      {fanMeetingId && idolName && sessionId && userName && photoTime && (
        <MotionDetector
          role={role}
          fanMeetingId={fanMeetingId}
          idolName={idolName}
          sessionId={sessionId}
          partnerPose={partnerPose}
          username={userName}
          motionType={motionType}
          updateShowOverlay={updateShowOverlay}
        />
      )}
      <FilterSelectDialog
        popupOpen={filterPopupOpen}
        onClose={() => setFilterPopupOpen(false)}
        onClickApplyFilter={onClickApplyFilter}
      />
      <PhotoTimeAlert open={endSoon} motionType={motionType} />
      <OneToOneTour callback={productTourCallback} />
    </Grid>
  );
};

export default OneToOnePage;
