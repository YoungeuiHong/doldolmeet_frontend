import { Stack, TextField, Typography } from "@mui/material";
import GradientButton from "@/components/button/GradientButton";
import { useState } from "react";
import { useAtom } from "jotai/react";
import { currSessionIdAtom } from "@/atom";

interface Props {
  createSession: () => void;
}

const IdolEntrance = ({ createSession }: Props) => {
  const [userName, setUserName] = useState("");
  const [mySessionId, setMySessionId] = useState("");
  const [sessionId, setSessionId] = useAtom(currSessionIdAtom);

  const onClickJoinButton = () => {
    createSession();
    setSessionId(mySessionId);
  };

  return (
    <>
      <Typography variant={"h2"}>👯‍♀️난 아이돌~ 영상통화 들어가기</Typography>
      <Stack spacing={2} sx={{ marginTop: 3 }}>
        <TextField
          placeholder={"닉네임"}
          onChange={(e) => setUserName(e.target.value)}
        >
          {userName}
        </TextField>
        <TextField
          placeholder={"방 이름"}
          onChange={(e) => setMySessionId(e.target.value)}
        >
          {mySessionId}
        </TextField>
        <GradientButton
          onClick={onClickJoinButton}
          sx={{ padding: 1, py: 2, borderRadius: 2 }}
        >
          <Typography variant={"button"} sx={{ fontWeight: 800 }}>
            시작하기
          </Typography>
        </GradientButton>
      </Stack>
    </>
  );
};

export default IdolEntrance;
