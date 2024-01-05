import { Stack, TextField, Typography } from "@mui/material";
import GradientButton from "@/components/button/GradientButton";
import { useState } from "react";

interface Props {
  joinSession: () => void;
}

const FanEntrance = ({ joinSession }: Props) => {
  const [userName, setUserName] = useState(
    "Participant" + Math.floor(Math.random() * 100),
  );

  return (
    <>
      <Typography variant={"h2"}>‍🥰 난 팬~ 영상통화 들어가기</Typography>
      <Stack spacing={2} sx={{ marginTop: 3 }}>
        <TextField
          placeholder={"닉네임"}
          onChange={(e) => setUserName(e.target.value)}
        >
          {userName}
        </TextField>
        <GradientButton
          onClick={joinSession}
          sx={{ padding: 1, py: 2, borderRadius: 2 }}
        >
          <Typography variant={"button"} sx={{ fontWeight: 800 }}>
            입장하기
          </Typography>
        </GradientButton>
      </Stack>
    </>
  );
};

export default FanEntrance;
