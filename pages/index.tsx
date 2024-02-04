import Banner from "@/components/banner/Banner";
import { Button, Grid, Stack, Typography } from "@mui/material";
import ForwardIcon from "@mui/icons-material/Forward";
import PostCard from "@/components/card/PostCard";
import { fetchFanMeetings } from "@/hooks/useFanMeetings";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import ShowDialog from "@/components/dialog/ShowDialog";
import { fetchTodayFanmeeting } from "@/hooks/useTodayFanmeeting";
import Link from "next/link";
import { useSession } from "next-auth/react";
import TodayMeetingBanner from "@/components/banner/TodayMeetingBanner";

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["fanMeetings", "opened"],
    queryFn: ({ queryKey }) => fetchFanMeetings(queryKey[1]),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default function Home() {
  const { data: session } = useSession();

  const { data: openedMeeting } = useQuery({
    queryKey: ["fanMeetings", "opened"],
    queryFn: ({ queryKey }) => fetchFanMeetings(queryKey[1]),
  });

  const { data: todayMeeting } = useQuery({
    queryKey: ["fanMeetings", "today"],
    queryFn: () => fetchTodayFanmeeting(),
    // enabled: !!session?.user,
  });

  return (
    <Grid container maxWidth="lg" spacing={2} alignItems={"flex-start"}>
      <Grid item xs={12} sx={{ marginTop: 1 }}>
        <Banner />
      </Grid>
      {todayMeeting?.data && (
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <TodayMeetingBanner todayMeeting={todayMeeting} />
        </Grid>
      )}

      <Grid item xs={12}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ marginTop: 2 }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#e85b94",
              fontWeight: 800,
            }}
          >
            OPEN
          </Typography>
          <Link href={"/fanmeeting-list"}>
            <Button
              variant="contained"
              endIcon={<ForwardIcon />}
              sx={{
                borderRadius: "10px",
                color: "#FFFFFF",
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              전체보기
            </Button>
          </Link>
        </Stack>
      </Grid>
      {openedMeeting &&
        openedMeeting?.map((meeting, i) => (
          <Grid key={i} item xs={6} md={3}>
            <PostCard fanMeeting={meeting} index={1} />
          </Grid>
        ))}
      {todayMeeting && (
        <ShowDialog todayMeeting={todayMeeting} popupOpen={true} />
      )}
    </Grid>
  );
}
