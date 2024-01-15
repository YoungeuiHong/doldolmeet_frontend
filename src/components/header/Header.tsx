"use client";
import {
  AppBar,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
  Stack,
  styled,
  Toolbar,
} from "@mui/material";
import { Box } from "@mui/system";
import Link from "next/link";
import GradientButton from "@/components/button/GradientButton";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Role } from "@/types";
import useJwtToken from "@/hooks/useJwtToken";
import SmallAvatar from "@/components/avatar/SmallAvatar";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import { backend_api } from "@/utils/api";

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  "&.Mui-selected": {
    backgroundColor: theme.palette.grey["100"],
  },
}));

export default function Header() {
  const { data: session } = useSession();

  const router = useRouter();

  const [userName, setUserName] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [role, setRole] = useState<Role>(Role.FAN);
  const [profileImg, setProfileImg] = useState<string | undefined>();
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(
    null,
  );

  const gameRoomId = 1;

  const token = useJwtToken();

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setRole(res.auth);
        setProfileImg(res.profileImgUrl);
        setUserName(res.sub);
      }
    });
  }, [token]);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      component="nav"
      sx={{
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
      }}
      elevation={0}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
        <Link href="/" style={{ textDecoration: "none", marginRight: "8px" }}>
          <Image src={"/en_logo.svg"} width={200} height={30} alt="logo" />
        </Link>
        <Box sx={{ flexGrow: 1 }}></Box>

        {role === Role.ADMIN && (
          <Stack direction={"row"} spacing={1}>
            <Link
              href="/admin-init-fanmeeting?id=1"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <GradientButton
                variant="contained"
                disableElevation
                sx={{ px: 3, borderRadius: 10, marginLeft: "8px" }} // 왼쪽 간격 추가
              >
                팬미팅 관리
              </GradientButton>
            </Link>
            <Link
              href="/create-fanmeeting"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <GradientButton
                variant="contained"
                disableElevation
                sx={{ px: 3, borderRadius: 10, marginLeft: "8px" }} // 왼쪽 간격 추가
              >
                팬미팅 등록
              </GradientButton>
            </Link>
          </Stack>
        )}

        {userName ? (
          <Typography
            sx={{
              color: "#9e9e9e",
            }}
          >
            {userName}
          </Typography>
        ) : (
          ""
        )}

        {session?.user ? (
          <>
            <SmallAvatar
              imgSrc={profileImg}
              anchorEl2={anchorEl}
              setAnchorEl2={setAnchorEl}
            />
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              PaperProps={{
                elevation: 10,
                style: {
                  width: "95px",
                },
              }}
              sx={{ mt: 1 }}
            >
              <MenuList>
                <MenuItemStyled onClick={() => router.push("/my-page")}>
                  <ListItemText>마이 페이지</ListItemText>
                </MenuItemStyled>
                <MenuItemStyled onClick={() => signOut()}>
                  <ListItemText>로그아웃</ListItemText>
                </MenuItemStyled>
              </MenuList>
            </Popover>
          </>
        ) : (
          <Link
            href="/login"
            style={{ textDecoration: "none", marginLeft: "8px" }}
          >
            <GradientButton
              variant="contained"
              disableElevation
              sx={{ px: 3, borderRadius: 10 }}
              onClick={() => signIn()}
            >
              {"로그인"}
            </GradientButton>
          </Link>
        )}
      </Toolbar>
    </AppBar>
  );
}
