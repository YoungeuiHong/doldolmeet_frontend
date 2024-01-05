// @app/fanmeeting-list/page.ts
"use client";

import React, { useEffect, useState } from "react";
import { backend_api } from "@/utils/api";
import {
  Button,
  Grid,
  Card,
  Avatar,
  Typography,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Box, // Add this line
} from "@mui/material";
import { useRouter } from "next/navigation";
import useJwtToken from "@/hooks/useJwtToken";
import SvgColor from "../../components/svg/SvgColor";

interface FanMeeting {
  id: number;
  imgUrl: string;
  profileImgUrl: string;
  title: string;
  startTime: string;
}

const FanMeetingsPage = () => {
  const [fanmeetings, setFanMeetings] = useState<FanMeeting[]>([]);
  const [filteredFanMeetings, setFilteredFanMeetings] = useState<FanMeeting[]>(
    [],
  );
  const [filterOption, setFilterOption] = useState("all");

  const router = useRouter();
  const token = useJwtToken();

  useEffect(() => {
    setFanMeeting();
  }, []);

  const setFanMeeting = () => {
    backend_api()
      .get("/fanMeetings", {
        params: {
          option: "all",
        },
      })
      .then((response) => {
        const fanMeetingsData = response.data.data || [];
        const openedMeetings = fanMeetingsData.filter(
          (meeting) => new Date(meeting.endTime) > new Date(),
        );
        setFanMeetings(fanMeetingsData);
        setFilteredFanMeetings(openedMeetings);
        setFilterOption("opened");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilterOption: string,
  ) => {
    if (newFilterOption !== null) {
      setFilterOption(newFilterOption);
      filterFanMeetings(newFilterOption);
    }
  };

  const filterFanMeetings = (option: string) => {
    if (option === "all") {
      setFilteredFanMeetings(fanmeetings);
    } else if (option === "opened") {
      const openedMeetings = fanmeetings.filter(
        (meeting) => new Date(meeting.endTime) > new Date(),
      );
      setFilteredFanMeetings(openedMeetings);
    } else if (option === "closed") {
      const closedMeetings = fanmeetings.filter(
        (meeting) => new Date(meeting.endTime) <= new Date(),
      );
      setFilteredFanMeetings(closedMeetings);
    }
  };

  useEffect(() => {
    console.log("🦊🦊🦊🦊", filteredFanMeetings);
  }, []);

  const handleList = async (info: FanMeeting) => {
    const fanMeetingId = info.id;
    await router.push(`/fanmeeting-list/${fanMeetingId}`);
  };

  // 날짜 및 시간 포맷 변환 함수
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

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <ToggleButtonGroup
          value={filterOption}
          exclusive
          onChange={handleFilterChange}
          aria-label="Filter options"
          sx={{ marginBottom: "16px" }}
        >
          <ToggleButton
            value="opened"
            aria-label="Opened"
            sx={{ width: "70px" }}
          >
            Opend
          </ToggleButton>
          <ToggleButton
            value="closed"
            aria-label="Closed"
            sx={{ width: "70px" }}
          >
            Closed
          </ToggleButton>
          <ToggleButton value="all" aria-label="All" sx={{ width: "70px" }}>
            All
          </ToggleButton>
        </ToggleButtonGroup>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          {filteredFanMeetings.map((fanmeeting, idx) => (
            <Card
              key={idx}
              onClick={() => handleList(fanmeeting)}
              sx={{
                width: "300px", // Adjust the width as needed
                marginBottom: "16px", // Increase the bottom margin for spacing
                cursor: "pointer", // Add pointer cursor to indicate interactivity
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
            </Card>
          ))}
        </div>
      </Grid>
    </>
  );
};

export default FanMeetingsPage;
