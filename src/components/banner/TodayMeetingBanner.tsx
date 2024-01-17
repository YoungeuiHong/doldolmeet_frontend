import Link from "next/link";
import { Box, Typography } from "@mui/material";
import styles from "./TodayMeetingBanner.module.css";

export default function TodayMeetingBanner({ todayMeeting }) {
  const bannerStyle = {
    backgroundImage: `url('/banner.jpeg')`,
  };

  return (
    <Link
      href={`/waitingroom/${todayMeeting?.data?.id}`}
      style={{ width: "100%" }}
    >
      <Box className={styles.banner} style={bannerStyle}>
        <Typography variant="h3" className={styles.bannerText}>
          당신의 {todayMeeting?.data?.title ?? "팬미팅"} 놓치지 마세요! 지금
          바로 클릭하세요!
        </Typography>
      </Box>
    </Link>
  );
}
