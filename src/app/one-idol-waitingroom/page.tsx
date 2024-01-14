"use client";
import { useEffect, useRef, useState } from "react";
import { Connection, OpenVidu, StreamManager } from "openvidu-browser";
import { Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useRouter, useSearchParams } from "next/navigation";
import {
  closeOpenViduConnection,
  createOpenViduConnection,
} from "@/utils/openvidu";
import { Role, RoomType } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import JoinIdolRoomDialog from "@/components/dialog/JoinIdolRoomDialog";

interface Props {
  fanStream: StreamManager | undefined;
}
const OneIdolWaitingRoom = ({ fanStream }: Props) => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("fanMeetingId");
  const sessionId = searchParams?.get("sessionId");

  const [role, setRole] = useState<Role>(Role.FAN);
  const [userName, setUserName] = useState<string>("");
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [nextRoomId, setNextRoomId] = useState<string>("");
  const [connection, setConnection] = useState<Connection | undefined>();
  const [popupImage, setPopupImage] = useState<string>("");
  const [nextIdolName, setNextIdolName] = useState<string>("");
  const [motionType, setMotionType] = useState<string>("");

  /* EventSource */
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const token = useJwtToken();

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
        setUserName(res.sub);
      }
    });
  }, [token]);

  useEffect(() => {
    async function init() {
      await fetchSSE();
      await joinSession(sessionId);
    }

    if (userName && sessionId) {
      init();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userName, sessionId]);

  const joinSession = async (sessionId: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      const connection = await createOpenViduConnection(sessionId);

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
              type: RoomType.waitingRoom,
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
      console.error("Error in joinSession:", error);
      return null;
    }
  };

  const fetchSSE = async () => {
    const eventSource = new EventSource(
      `https://api.doldolmeet.store/fanMeetings/${fanMeetingId}/sse/${userName}`,
    );
    eventSource.addEventListener("connect", (e) => {
      console.log("🥹 연결되었습니다.");
    });

    eventSource.addEventListener("moveToIdolRoom", (e: MessageEvent) => {
      console.log("🥹 moveToIdolRoom: ", JSON.parse(e.data));
      setNextRoomId(JSON.parse(e.data).nextRoomId);
      setPopupImage(JSON.parse(e.data).roomThumbnail);
      setNextIdolName(JSON.parse(e.data).idolNickName);
      setMotionType(JSON.parse(e.data).motionType);
      setPopupOpen(true);
    });

    eventSource.onopen = () => {
      console.log("SSE 연결되었습니다.");
    };

    eventSource.onerror = (e) => {
      console.log("error");
      console.log(e);
    };

    setEventSource(eventSource);

    return true;
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // 미디어 스트림을 비디오 요소에 할당
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices: ", error);
      }
    };

    getMedia();
  }, []);

  const joinNextRoom = async () => {
    await leaveWaitingRoom().then(() => {
      router.push(
        `/one-to-one/${fanMeetingId}/${nextRoomId}/${nextIdolName}/${motionType}`,
      );
    });
  };

  const leaveWaitingRoom = async () => {
    if (sessionId && connection?.connectionId) {
      await closeOpenViduConnection(sessionId, connection.connectionId);
    }
  };

  const handleClose = (event, reason) => {
    if (reason && reason == "backdropClick") return;
    setPopupOpen(false);
  };

  return (
    <>
      <Stack spacing={2} justifyContent="center" alignItems="center">
        <Typography variant={"h2"}>
          통화가 연결될 때까지 조금만 기다려주세요 ☺️
        </Typography>
        <video autoPlay={true} ref={videoRef} style={{ borderRadius: 30 }} />
      </Stack>
      <JoinIdolRoomDialog
        open={popupOpen}
        idolImgUrl={popupImage}
        onClose={() => setPopupOpen(false)}
        handleClose={handleClose}
        handleEnter={joinNextRoom}
      />
    </>
  );
};

export default OneIdolWaitingRoom;
