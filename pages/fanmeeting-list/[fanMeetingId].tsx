"use client";
// components/FanMeetingDetailPage.js
import React, { useEffect, useState } from "react";
import { backend_api } from "@/utils/api";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import GradientButton from "@/components/button/GradientButton";
import { Modal, Backdrop, Fade } from "@mui/material";
import Link from "next/link";
// import LazyLoad from "react-lazyload";

const FanMeetingDetailPage = () => {
  const router = useRouter();
  const { fanMeetingId } = router.query;
  const [fanMeetingInfo, setFanMeetingInfo] = useState({});
  const [fanMeetingApplyStatus, setFanMeetingApplyStatus] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const infoResponse = await backend_api().get(
          `/fanMeetings/${fanMeetingId}`,
        );
        setFanMeetingInfo(infoResponse.data.data);

        const applyStatusResponse = await backend_api().get(
          `/fanMeetings/${fanMeetingId}/fanToFanMeeting`,
        );
        setFanMeetingApplyStatus(
          applyStatusResponse.data.data.fanMeetingApplyStatus,
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [fanMeetingId]);

  const handleApplyFanMeeting = async () => {
    try {
      const response = await backend_api().post(`/fanMeetings/${fanMeetingId}`);
      setFanMeetingApplyStatus(response.data.data.fanMeetingApplyStatus);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error("서버에서 오류 응답:", error.response.data);
      } else if (error.request) {
        console.error("서버로부터 응답이 없습니다.");
      } else {
        console.error("요청 설정 중 에러 발생:", error.message);
      }
      // alert("로그인 후 신청해주세요!!");
      handleOpenModal();
      console.error("🐱🐱🐱팬미팅 신청 실패🐱🐱🐱");
    }
  };

  // 날짜 및 시간 포맷 변환 함수
  const formatDate = (dateTimeString) => {
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
    <Box
      style={{
        maxWidth: "660px",
        margin: "0 auto",
      }}
    >
      <Card>
        <Grid container>
          <Grid item xs={12}>
            {/*<LazyLoad height={200} offset={100}>*/}
            <img
              src={
                fanMeetingInfo.imgUrl ??
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwtP8HD6icOnned-S7izWwvhW4AHcNmOdREg&usqp=CAU"
              }
              alt={`fanMeetingInfo ${fanMeetingInfo.title} Image`}
              style={{
                minWidth: 660,
                width: "100%",
                height: "auto",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              }}
            />
            {/*</LazyLoad>*/}
          </Grid>
          <Grid item xs={12}>
            <CardContent>
              <Typography
                variant="h4"
                mb={1}
                fontWeight="bold"
                textAlign="center"
              >
                {fanMeetingInfo.title}
              </Typography>
              <Typography
                variant="h6"
                color="textSecondary"
                mb={2}
                textAlign="center"
              >
                {fanMeetingInfo.teamName}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                mb={2}
                textAlign="center"
              >
                <strong>Start Time:</strong>{" "}
                {formatDate(fanMeetingInfo.startTime)}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                mb={2}
                textAlign="center"
              >
                <strong>End Time:</strong> {formatDate(fanMeetingInfo.endTime)}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                mb={2}
                textAlign="center"
              >
                <strong>신청 여부:</strong>{" "}
                {fanMeetingApplyStatus === "APPROVED" ? "✅" : "❌"}
              </Typography>
              {/* 팬미팅 신청 버튼 */}
              {fanMeetingApplyStatus !== "APPROVED" && (
                <Box textAlign="center" mt={2}>
                  <GradientButton
                    onClick={handleApplyFanMeeting}
                    size="large" // 원하는 크기로 조절 (small, medium, large 등)
                  >
                    팬미팅 신청
                  </GradientButton>
                </Box>
              )}
            </CardContent>
          </Grid>
        </Grid>
      </Card>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" textAlign="center" mb={2}>
                  로그인 후 신청해주세요!!
                </Typography>
                <Grid container justifyContent="center" spacing={2}>
                  <Grid item>
                    <Link href={"/login"}>
                      <GradientButton
                      // variant="contained"
                      >
                        로그인 페이지로 이동
                      </GradientButton>
                    </Link>
                  </Grid>
                  <Grid item>
                    <Button onClick={handleCloseModal} variant="outlined">
                      닫기
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default FanMeetingDetailPage;
