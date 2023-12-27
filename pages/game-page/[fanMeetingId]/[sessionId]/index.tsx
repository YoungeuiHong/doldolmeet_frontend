"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Connection,
  OpenVidu,
  Publisher,
  Session,
  StreamManager,
  Subscriber,
} from "openvidu-browser";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import useJwtToken, { JwtToken } from "@/hooks/useJwtToken";
import { Role } from "@/types";
import { fetchFanToFanMeeting } from "@/hooks/useFanMeetings";
import { Box, Grid, Stack } from "@mui/material";
import IdolStreamView from "@/components/meeting/IdolStreamView";
import FanStreamView from "@/components/meeting/FanStreamView";
import Game, { Answer } from "@/components/Game";
import WinnerDialog from "@/components/dialog/WinnerDialog";
import { useRouter } from "next/router";

interface NameAndStream {
  name: string;
  stream: Subscriber;
}

const GamePage = () => {
  const router = useRouter();

  const [session, setSession] = useState<Session | undefined>();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const searchParams = router.query;
  const fanMeetingId = searchParams?.fanMeetingId;
  const sessionId = searchParams?.sessionId;

  /* Role */
  const token: Promise<JwtToken | null> = useJwtToken();
  const [role, setRole] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [myNickName, setMyNickName] = useState<string | undefined>();

  /* 아이돌들의 Stream */
  const [idolStreams, setIdolStreams] = useState<NameAndStream[]>([]);

  /* 팬들의 Stream */
  const [fanStreams, setFanStreams] = useState<NameAndStream[]>([]);

  /* 나의 Stream */
  const [myStream, setMyStream] = useState<Publisher | undefined>();

  /* OpenVidu Connection */
  const [myConnection, setMyConnection] = useState<Connection | undefined>();

  /* Main Stream */
  const [mainStream, setMainStream] = useState<
    Subscriber | Subscriber | Publisher | undefined
  >();

  /* 아이돌이 다 들어왔는지 */
  const [allIdolEntered, setAllIdolEntered] = useState<boolean>(false);

  /* 노래 다시 듣기 */
  const [replaynum, setReplaynum] = useState(0);

  /* 게임 시작 */
  const [gameStart, setGameStart] = useState(false);

  /* 위너 */
  const [winner, setWinner] = useState<boolean>(false);
  const [winnerName, setWinnerName] = useState<string>("");
  const [winnerStream, setWinnerStream] = useState<
    StreamManager | Publisher | Subscriber | undefined
  >();
  const winnerRef = useRef(winner);
  winnerRef.current = winner;
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);

  /* 다른 사람들의 응답 */
  const [answers, setAnswers] = useState<Answer[]>([]);

  /* EventSource */
  const [fanEventSource, setFanEventSource] = useState<EventSource | null>(
    null,
  );
  const [idolEventSource, setIdolEventSource] = useState<EventSource | null>(
    null,
  );

  /* 다른 URL로 이동할 때 OpenVidu 커넥션을 끊도록 설정 */
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
        await fetchSSE_idol();
        await joinSession();
      } else if (role === Role.FAN) {
        await fetchSSE();
        const fanToFanMeeting = await fetchFanToFanMeeting(fanMeetingId);
        await joinSession(fanToFanMeeting?.chatRoomId);
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

  const fetchSSE_idol = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    setIdolEventSource(eventSource);

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 아이돌 SSE 연결되었습니다.");
    });

    eventSource.addEventListener("idolGameStart", (e: MessageEvent) => {
      console.log("🥹 game이 시작됐습니다!", JSON.parse(e.data));
      // setGameStart(true);
    });

    eventSource.addEventListener("gameEnd", (e: MessageEvent) => {
      console.log("🥹 game이 종료됐습니다!", JSON.parse(e.data));
      // setGameEnd(true);
    });

    eventSource.onopen = () => {
      console.log("📣 아이돌 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      console.log("🥲 eventSource 에러가 발생했어요", e);
      // eventSource.close();
    };

    return true;
  };

  const fetchSSE = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.shop/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );

    setFanEventSource(eventSource);

    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 연결되었습니다.");
    });

    eventSource.addEventListener("moveToWaitRoom", (e: MessageEvent) => {
      console.log("👋 moveToWaitRoom: ", JSON.parse(e.data));
      joinNextRoom();
    });

    eventSource.addEventListener("gameEnd", (e: MessageEvent) => {
      console.log("🥹 game이 종료됐습니다!", JSON.parse(e.data));
      // setGameEnd(true);
    });

    eventSource.onopen = () => {
      console.log("📣 SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      console.log("🥲 eventSource 에러가 발생했어요", e);
      // eventSource.close();
    };

    eventSource.addEventListener("allIdolEntered", (e: MessageEvent) => {
      console.log("👋 아이돌이 다 들어왔어요!!!!: ", JSON.parse(e.data));
      setAllIdolEntered(true);
    });

    return true;
  };

  const joinNextRoom = async () => {
    await leaveSession();
    if (role === Role.IDOL) {
      router.push("/");
    } else {
      router.push(
        `/end-fanmeeting/${userName}/${fanMeetingId}?winner=${
          winnerRef.current ? "true" : "false"
        }`,
      );
    }
  };

  const joinSession = async (_chatRoomId?: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
        const clientData = JSON.parse(event.stream.connection.data).clientData;
        const role = JSON.parse(clientData).role;
        const nameAndStream = {
          name: JSON.parse(clientData).nickname,
          stream: subscriber,
        };
        if (role === Role.IDOL) {
          setIdolStreams((prev) => [...prev, nameAndStream]);
        } else if (role === Role.FAN) {
          setFanStreams((prev) => [...prev, nameAndStream]);
        } else {
          setFanStreams((prev) => [...prev, nameAndStream]);
        }
      });

      mySession.on("streamDestroyed", (event) => {
        const clientData = JSON.parse(event.stream.connection.data).clientData;
        const role = JSON.parse(clientData).role;
        console.log("👋 streamDestroyed", event, role);
        deleteSubscriber(role, event.stream.streamManager);
      });

      mySession.on("signal:send_replay", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 리플레이를 했어요.", event.data);
          setReplaynum((prev) => prev + 1);
        }
      });

      mySession.on("signal:gameStart", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 게임시작", event.data);
          setGameStart(true);
        }
      });

      mySession.on("signal:submitAnswer", (event) => {
        const data = JSON.parse(event.data) as Answer;
        setAnswers((prev) => [...prev, data]);
      });

      mySession.on("signal:alertWinner", (event) => {
        const data = JSON.parse(event.data);
        setWinner(data.winnerName === userName);
        setWinnerName(data.winnerName);
        const connectionIdOfWinner = data.connectionId;
        const winnerStream = sessionRef?.current?.streamManagers.find(
          (streamManagers) =>
            streamManagers.stream.connection.connectionId ===
            connectionIdOfWinner,
        );
        console.log("session", session);
        console.log("sessionRef", sessionRef);
        console.log("winnerStream", winnerStream);
        setWinnerStream(winnerStream);
        setShowWinnerDialog(true);
      });

      mySession.on("signal:click_answer", (event) => {
        const data = JSON.parse(event.data);
        if (data.username !== userName) {
          console.log("👋 상대방이 리플레이를 했어요.", event.data);
          // setClickAnswer(data.isAnswer);
        }
      });

      mySession.on("signal:goToEndPage", (event) => {
        joinNextRoom();
      });

      const connection = await createOpenViduConnection(sessionId);
      if (connection) {
        setMyConnection(connection);
      }
      const { token } = connection;

      let sessionConnectCnt = 0;
      const maxSessionConnectCnt = 2;

      while (sessionConnectCnt < maxSessionConnectCnt) {
        try {
          await mySession.connect(token, {
            clientData: JSON.stringify({
              role: role,
              fanMeetingId: fanMeetingId,
              userName: userName,
              nickname: myNickName,
              type: "gameRoom",
            }),
          });
          break;
        } catch (e) {
          console.error(e);
          sessionConnectCnt++;
          if (sessionConnectCnt === maxSessionConnectCnt) {
            throw e;
          }
        }
      }

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
        videoSource: undefined,
        publishAudio: role === Role.IDOL || userName === "hoyoung123", // 아이돌인 경우에만 말할 수 있도록
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });

      mySession.publish(newPublisher);
      setSession(mySession);
      setMyStream(newPublisher);
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const leaveSession = async () => {
    if (
      sessionId &&
      typeof sessionId === "string" &&
      myConnection?.connectionId
    ) {
      await closeOpenViduConnection(sessionId, myConnection?.connectionId);
    }

    // state 초기화
    setMyStream(undefined);
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

  const deleteSubscriber = (role, streamManager) => {
    if (role === Role.IDOL) {
      setIdolStreams((prevSubscribers) => {
        const index = prevSubscribers.findIndex(
          (nameAndStream) => nameAndStream.stream === streamManager,
        );
        if (index > -1) {
          const newSubscribers = [...prevSubscribers];
          newSubscribers.splice(index, 1);
          return newSubscribers;
        } else {
          return prevSubscribers;
        }
      });
    } else if (role === Role.FAN) {
      setFanStreams((prevSubscribers) => {
        const index = prevSubscribers.findIndex(
          (nameAndStream) => nameAndStream.stream === streamManager,
        );
        if (index > -1) {
          const newSubscribers = [...prevSubscribers];
          newSubscribers.splice(index, 1);
          return newSubscribers;
        } else {
          return prevSubscribers;
        }
      });
    }
  };

  return (
    <Grid container>
      <Grid item xs={10}>
        {/* 아이돌 카메라 영역*/}
        <Stack direction="column" spacing={1} sx={{ minHeight: "40vh" }}>
          <Stack
            direction={"row"}
            sx={{
              width: "100%",
              height: "40vh",
              backgroundColor: "#eeeeee",
              py: 2,
              px: 1,
              borderRadius: 5,
            }}
          >
            {role === Role.IDOL && myStream && (
              <IdolStreamView
                key={myStream.id}
                streamManager={myStream}
                name={myNickName}
              />
            )}
            {idolStreams.map((nameAndStream) => (
              <IdolStreamView
                key={nameAndStream.stream.id}
                streamManager={nameAndStream.stream}
                name={nameAndStream.name ?? "아이돌"}
              />
            ))}
          </Stack>
          {/* 게임 문제 나오는 영역 */}
          <Game
            role={role}
            fanMeetingId={fanMeetingId}
            sessionId={sessionId}
            allIdolEntered={allIdolEntered}
            userName={userName}
            replaynum={replaynum}
            gameStart={gameStart}
            answers={answers}
            connectionId={myConnection?.connectionId}
            publisher={myStream}
            micOn={role === Role.IDOL || userName === "hoyoung123"}
          />
        </Stack>
      </Grid>
      {/* 팬들 카메라 나오는 곳 */}
      <Grid item xs={2} sx={{ borderRadius: 3 }}>
        <Box sx={{ height: "84vh", overflowY: "auto", paddingLeft: 3 }}>
          <Stack
            direction={"column"}
            spacing={1}
            sx={{ py: 2, px: 1, borderRadius: 3 }}
          >
            {role === Role.FAN && myStream && (
              <FanStreamView
                key={myStream.id}
                streamManager={myStream}
                name={myNickName}
              />
            )}
            {fanStreams.map((nameAndStream) => (
              <FanStreamView
                key={nameAndStream.stream.id}
                streamManager={nameAndStream.stream}
                name={nameAndStream.name ?? "팬"}
              />
            ))}
          </Stack>
        </Box>
      </Grid>
      <WinnerDialog
        open={showWinnerDialog}
        onClose={() => setShowWinnerDialog(false)}
        winnerName={winnerName}
        fanStream={winnerStream}
      />
    </Grid>
  );
};

export default GamePage;
