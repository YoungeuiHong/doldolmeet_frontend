"use client";
import { useEffect, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import {
  closeOpenViduSession,
  createOpenViduConnection,
  createOpenViduSession,
} from "@/utils/openvidu";
import { Button, Grid, Stack } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import {
  fetchAllRoomIdsByAdmin,
  updateFanMeetingRoomCreated,
} from "@/hooks/fanmeeting";
import { backend_api } from "@/utils/api";

import Typography from "@mui/material/Typography";
import OpenViduSessionInfo from "@/components/openvidu/OpenViduSessionInfo";

const AdminInitFanMeetingPage = () => {
  /* Query Param으로 전달된 팬미팅 아이디 */
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");
  const [sessionIds, setSessionIds] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      if (fanMeetingId) {
        await fetchAllRoomIdsByAdmin(fanMeetingId).then((res) => {
          setSessionIds(res);
        });
      }
    }

    init();
  }, []);

  const joinSession = async (sessionId: string) => {
    try {
      // OpenVidu 객체 생성
      const ov = new OpenVidu();

      const mySession = ov.initSession();

      await createOpenViduSession(sessionId);

      mySession.on("streamCreated", (event) => {
        const subscriber = mySession.subscribe(event.stream, undefined);
      });

      const connection = await createOpenViduConnection(sessionId);

      const { token } = connection;

      await mySession.connect(token, {
        clientData: JSON.stringify({
          role: Role.ADMIN,
          fanMeetingId: fanMeetingId,
          userName: "admin123",
        }),
      });
    } catch (error) {
      console.error("Error in enterFanmeeting:", error);
      return null;
    }
  };

  const joinMultipleSession = async () => {
    sessionIds.forEach(async (sessionId) => {
      await joinSession(sessionId);
    });
    if (fanMeetingId) {
      await updateFanMeetingRoomCreated(fanMeetingId);
    }
  };

  const startFanMeeting = async () => {
    await backend_api()
      .post(`/fanMeetings/${fanMeetingId}/start`)
      .then((res) => {
        console.log(res);
      });
  };

  const deleteFanMeeting = async () => {
    await backend_api()
      .post(`/fanMeetings/${fanMeetingId}/roomDeleted`)
      .then((res) => {
        console.log(res);
      });

    sessionIds.forEach(async (sessionId) => {
      await closeOpenViduSession(sessionId);
    });
  };

  const endFanMeeting = async () => {
    await backend_api()
      .post(`/fanMeetings/${fanMeetingId}/close`)
      .then((res) => {
        console.log(res);
      });
  };

  const initFanMeeting = async () => {
    await deleteFanMeeting();
    await endFanMeeting();
    await joinMultipleSession();
    await startFanMeeting();
  };

  return (
    <Grid
      container
      justifyContent={"center"}
      alignItems={"center"}
      direction={"column"}
      spacing={2}
    >
      <Grid item>
        <Typography variant={"h2"}>👩🏻‍💻 팬미팅 관리자 페이지</Typography>
      </Grid>
      <Grid item>
        <Typography variant={"h5"}>팬미팅 아이디: {fanMeetingId}</Typography>
      </Grid>
      <Grid item>
        <Stack direction={"row"} spacing={2} sx={{ marginBottom: 5 }}>
          <Button variant={"contained"} onClick={joinMultipleSession}>
            팬미팅 생성하기
          </Button>
          <Button variant={"contained"} onClick={startFanMeeting}>
            팬미팅 시작하기
          </Button>
          <Button variant={"contained"} onClick={deleteFanMeeting}>
            팬미팅 삭제하기
          </Button>
          <Button variant={"contained"} onClick={endFanMeeting}>
            팬미팅 종료하기
          </Button>
          <Button variant={"contained"} onClick={initFanMeeting}>
            팬미팅 초기화하기
          </Button>
        </Stack>
      </Grid>
      <Grid item>
        <OpenViduSessionInfo fanMeetingId={fanMeetingId} />
      </Grid>
    </Grid>
  );
};

export default AdminInitFanMeetingPage;
