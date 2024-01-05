"use client"; // 필요 없는 주석인지 확인 후 필요하면 사용하세요.

// Import 부분 (필요한 모듈 및 컴포넌트 추가)
import React, { useEffect, useState } from "react";
import { backend_api } from "@/utils/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Link,
  Avatar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import useJwtToken from "@/hooks/useJwtToken";
import SvgColor from "../../components/svg/SvgColor";
import GradientButton from "@/components/button/GradientButton";

// FanMeeting 인터페이스 정의
interface FanMeeting {
  id: number;
  imgUrl: string;
  profileImgUrl: string;
  title: string;
  startTime: string;
  fanMeetingStatus: string;
}

// MyPage 컴포넌트 정의
const MyPage = () => {
  const [fanmeetings, setFanMeetings] = useState<FanMeeting[]>([]);
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();
  const token = useJwtToken();
  const [filterOption, setFilterOption] = useState("opened"); // 기본 탭 설정 변경
  const [filteredFanMeetings, setFilteredFanMeetings] = useState<FanMeeting[]>(
    [],
  );

  useEffect(() => {
    setFanMeeting();
  }, [filterOption]);

  useEffect(() => {
    token.then((res) => {
      if (res) {
        setUserName(res.sub);
      }
    });
  }, [token]);

  const filterFanMeetings = (option: string) => {
    setFilterOption(option);
  };

  const setFanMeeting = () => {
    backend_api()
      .get("/fanMeetings/my", {
        params: {
          option: filterOption,
        },
      })
      .then((response) => {
        const fanMeetingsData: FanMeeting[] = response.data.data || [];
        setFanMeetings(fanMeetingsData);
        setFilteredFanMeetings(fanMeetingsData);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const formatDate = (dateTimeString: string) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateTimeString).toLocaleDateString("ko-KR", options);
  };

  const handleTabChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilterOption: string,
  ) => {
    if (newFilterOption !== null) {
      filterFanMeetings(newFilterOption);
    }
  };

  const joinMemoryRoom = async (info) => {
    const fanMeetingId = info.id;
    await router.push(`/my-page/${userName}/${fanMeetingId}`);
  };

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <h3
          style={{
            marginBottom: "40px",
            padding: "40px",
            color: "#FFFFFF",
            backgroundImage: "linear-gradient(to right, #ed6ea0, #ec8c69)",
            fontWeight: 700,
            boxShadow: "0 2px 5px 0 rgba(236, 116, 149, 0.75)",
            letterSpacing: 3,
            borderRadius: "10px",
          }}
        >
          {userName}님의 팬미팅 정보 페이지
        </h3>

        <Tabs
          value={filterOption}
          onChange={handleTabChange}
          sx={{
            marginBottom: "20px",
            marginTop: "8px",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
          centered
          exclusive
          aria-label="Filter options"
        >
          <Tab label="예정" value="opened" />
          <Tab label="진행" value="progress" />
          <Tab label="종료" value="closed" />
        </Tabs>

        {filteredFanMeetings.length === 0 ? (
          <Card
            sx={{
              width: "350px",
              height: "150px",
              marginBottom: "16px",
              position: "relative",
              backgroundColor: "#F8F8F8",
              border: "none",
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <h3>팬미팅이 없습니다.</h3>
          </Card>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {filteredFanMeetings.map((fanmeeting, idx) => (
              <Card
                key={idx}
                sx={{
                  width: "350px",
                  marginBottom: "16px",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    pt: "calc(100% * 3 / 4)",
                  }}
                >
                  <SvgColor
                    color="paper"
                    src="/shape-avatar.svg"
                    sx={{
                      width: 80,
                      height: 36,
                      zIndex: 9,
                      bottom: -15,
                      position: "absolute",
                      color: "background.paper",
                    }}
                  />
                  <Avatar
                    alt={fanmeeting.id.toString()}
                    src={fanmeeting.profileImgUrl}
                    sx={{
                      zIndex: 9,
                      width: 32,
                      height: 32,
                      position: "absolute",
                      left: (theme) => theme.spacing(3),
                      bottom: (theme) => theme.spacing(-2),
                    }}
                  />
                  <Box
                    component="img"
                    alt={fanmeeting.title}
                    src={fanmeeting.imgUrl}
                    sx={{
                      top: 0,
                      width: 1,
                      height: 1,
                      objectFit: "cover",
                      position: "absolute",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    p: (theme) => theme.spacing(4, 3, 3, 3),
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      mb: 2,
                      color: "text.disabled",
                    }}
                  >
                    {formatDate(fanmeeting.startTime)}
                  </Typography>
                  <Link
                    color="inherit"
                    variant="h6"
                    underline="hover"
                    sx={{
                      height: 44,
                      overflow: "hidden",
                      WebkitLineClamp: 2,
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {fanmeeting.title}
                  </Link>
                </Box>
                {/* 종료된 팬미팅이 있을 때만 추억보관함으로 이동하는 버튼 추가 */}
                {filterOption === "closed" && (
                  <GradientButton
                    onClick={() => joinMemoryRoom(fanmeeting)}
                    sx={{
                      width: "100%",
                      // position: "absolute",
                      bottom: 25,
                      padding: "12px 12px",
                      fontSize: "18px",
                    }}
                  >
                    추억보관함
                  </GradientButton>
                )}
              </Card>
            ))}
          </div>
        )}
      </Grid>
    </>
  );
};

export default MyPage;
