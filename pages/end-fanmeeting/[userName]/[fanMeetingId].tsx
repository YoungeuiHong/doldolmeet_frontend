"use client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { backend_api } from "@/utils/api";
import {
  Dialog,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { GetApp, Twitter } from "@mui/icons-material";
import Carousel from "react-material-ui-carousel";
import ScratchCard from "@/components/alert/ScratchCard";
import { useSearchParams } from "next/navigation";
import EndFanMeetingTour from "./product-tour";
import { CallBackProps } from "react-joyride";

function captureVideoFrame(videoUrl, time, callback) {
  const video = document.createElement("video");

  // CORS 정책 준수를 위해 crossOrigin 속성 설정
  video.crossOrigin = "anonymous"; // 또는 "use-credentials" 사용 가능

  video.src = videoUrl;

  video.addEventListener("loadedmetadata", function () {
    video.currentTime = time;
  });

  video.addEventListener("seeked", function () {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(callback);
    } catch (error) {
      console.error("Error capturing video frame: ", error);
    }
  });

  video.addEventListener("error", (e) => {
    console.error("Error loading video: ", e);
  });

  video.load();
}
const EndFanMeetingPage = () => {
  /* route query */
  const router = useRouter();
  const { userName, fanMeetingId } = router.query;
  const searchParams = useSearchParams();
  const winner = searchParams?.get("winner");

  const [user, setUser] = useState(null);
  const [captures, setCaptures] = useState(["/images/frame.png"]);
  const [videos, setVideos] = useState([]); // Todo: captures를 videos로 변경해야됨
  const [videosUrls, setVidesoUrls] = useState<string[]>([]); // Todo: captures를 videos로 변경해야됨

  /* States */
  const [contents, setContents] = useState<string[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [showSecretCard, setShowSecretCard] = useState(false);
  const [thumbnails, setThumbnails] = useState({});

  const generateThumbnails = (videoUrls) => {
    videoUrls.forEach((url) => {
      captureVideoFrame(url, 10, (blob) => {
        const thumbnailUrl = URL.createObjectURL(blob);
        setThumbnails((prevThumbnails) => ({
          ...prevThumbnails,
          [url]: thumbnailUrl,
        }));
      });
    });
  };

  useEffect(() => {
    // 썸네일 생성은 동영상 URL들이 로드된 후에만 수행됩니다.
    const videoUrls = videosUrls.filter(
      (url) =>
        url !== null && url !== undefined && url !== "" && url.endsWith(".mp4"),
    );
    generateThumbnails(videoUrls);
  }, [videosUrls]);

  /* 녹화본 */
  const handleDownload = (videoUrl) => {
    fetch(videoUrl)
      .then((response) => response.blob()) // 비디오 데이터를 Blob 형식으로 받아옵니다.
      .then((blob) => {
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = userName + "video.mp4"; // 다운로드할 파일명 설정
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Optionally revoke the Object URL to free up resources
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading the video:", error);
      });
  };

  // const searchParams = useSearchParams();
  const s3Addr = "https://s3.ap-northeast-2.amazonaws.com/doldolmeet.test/";

  useEffect(() => {
    async function init() {
      if (
        userName &&
        userName !== undefined &&
        fanMeetingId &&
        fanMeetingId !== "undefined"
      ) {
        await backend_api()
          .post(`recording-java/api/recordings/get`, {
            fanMeetingId: fanMeetingId,
            fan: userName,
            // idol: "karina",
          })
          .then((res) => {
            if (Object.values(res.data).length > 0) {
              const videoUrls: string[] = Object.values(res.data).map(
                // @ts-ignore
                (video) => video.url,
              );
              setVideos(res.data);
              setVidesoUrls((prev) => [...prev, ...videoUrls]);
              console.log("videos", videos);
              console.log("vide🥶🥶🥶🥶🥶🥶oUrls", videoUrls);
            }
          })
          .catch((error) => {
            console.error("Error fetching videos:", error);
          });
      }

      // fanMeetingId가 유효한 경우에만 API 호출 수행
      if (fanMeetingId && fanMeetingId !== "undefined") {
        await backend_api()
          .get(`/captures/${fanMeetingId}`)
          .then((res) => {
            setCaptures(res.data.data);
          })
          .catch((error) => {
            console.error("Error fetching captures:", error);
          });
      }
      if (winner === "true") {
        setShowSecretCard(true);
      }
    }

    init();
  }, [fanMeetingId]);

  /* 캡쳐본 */
  const imgDownLoad = (imgUrl) => {
    const fileName = imgUrl;

    // Axios를 사용하여 파일 다운로드 요청
    backend_api()
      .get(`s3/file/download?fileName=${fileName}`, {
        responseType: "blob", // 파일 다운로드를 위해 responseType을 'blob'으로 설정
      })
      .then((response) => {
        // 파일 다운로드를 위해 Blob 형식으로 받은 응답을 처리
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);

        // 생성된 URL을 사용하여 다운로드 링크 생성
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);

        // 링크 클릭하여 파일 다운로드
        document.body.appendChild(link);
        link.click();

        // 필요 없는 링크 제거
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const joinMemoryRoom = async () => {
    await router.push(`/my-page/${userName}/${fanMeetingId}`);
  };

  const shareTwitter = (imageUrl) => {
    const sendText = "💜 돌돌밋 공유";
    const sendUrl = imageUrl; // 이미지 URL
    window.open(
      `https://twitter.com/intent/tweet?text=${sendText}&url=${sendUrl}`,
    );
  };

  const productTourCallback = ({ type }: CallBackProps) => {
    if (type === "tour:end") {
      window.location.href = "/";
    }
  };

  return (
    <Grid id={"end-fanmeeting-page"} container alignItems={"center"}>
      <Grid item xs={5}>
        <Stack
          direction={"column"}
          justifyContent="flex-start"
          sx={{ marginLeft: 10 }}
        >
          <Typography
            variant={"h2"}
            sx={{
              zIndex: 300,
              lineHeight: 2,
              color: "#212121",
            }}
          >
            팬미팅이 종료되었습니다. <br />
            함께 찍은 사진과 영상을 공유해보세요 ☺️
          </Typography>
        </Stack>
      </Grid>
      <Grid id={"fan-meeting-photo-carousel"} item xs={7}>
        <Carousel
          sx={{
            height: "70vh",
            minWidth: "40%",
          }}
          animation={"fade"}
          duration={1500}
        >
          {[...Object.values(videos), ...captures].map((item, i) => {
            const isVideo = item.url && item.url.endsWith(".mp4");
            const contentUrl = isVideo ? item.url : s3Addr + item.captureUrl;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  height: "70vh",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
                onMouseOver={() => setIsHovering(true)}
                onMouseOut={() => setIsHovering(false)}
              >
                {isVideo ? (
                  <video
                    id={item.url}
                    style={{
                      display: "flex",
                      width: "88%",
                      marginTop: "auto",
                      marginBottom: "auto",
                    }}
                    controls
                    poster={thumbnails[item.url]} // 썸네일 URL 사용
                  >
                    <source src={item.url} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={item}
                    alt={`Capture ${i}`}
                    style={{
                      width: "88%",
                      maxHeight: "70vh",
                      objectFit: "cover",
                    }}
                  />
                )}
                <Stack
                  direction="row"
                  spacing={4}
                  sx={{
                    position: "absolute",
                    top: "45%",
                    left: "35%",
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: isHovering ? "flex" : "none",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "28%",
                    height: "12%",
                    borderRadius: 10,
                  }}
                >
                  <IconButton
                    onClick={() =>
                      isVideo
                        ? handleDownload(item.url)
                        : imgDownLoad(item.captureUrl)
                    }
                    size="large"
                    sx={{
                      color: "#FFFFFF",
                      transform: "scale(1.5)",
                      "&:hover": {
                        color: "#FFAFCC",
                      },
                    }}
                  >
                    <GetApp fontSize={"inherit"} />
                  </IconButton>
                  <IconButton
                    onClick={() => shareTwitter(contentUrl)}
                    sx={{
                      color: "#FFFFFF",
                      transform: "scale(1.5)",
                      "&:hover": {
                        color: "#FFAFCC",
                      },
                    }}
                  >
                    <Twitter />
                  </IconButton>
                </Stack>
              </div>
            );
          })}
        </Carousel>
      </Grid>
      {showSecretCard && (
        <Dialog
          open={showSecretCard}
          onClose={() => setShowSecretCard(false)}
          PaperProps={{
            style: {
              width: "550px", // 모달 창의 너비
              height: "700px", // 모달 창의 높이는 내용에 따라 자동 조정
              backgroundColor: "#fff", // 배경색
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)", // 그림자 스타일
              // borderRadius: "20px", // 모달 창의 모서리 둥글게
              padding: "20px", // 내부 패딩
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <DialogContentText>
            <ScratchCard
              imageSrc="/majong.jpeg"
              brushSize={20}
              revealPercent={30}
            />
          </DialogContentText>
          <DialogTitle style={{ textAlign: "center" }}>
            🎉마종스 미공개 포카에 당첨되셨습니다.🎉
          </DialogTitle>
          <DialogContentText style={{ textAlign: "center" }}>
            마종스 미공개 포카를 확인하시려면 이미지를 스크래치 해주세요.
          </DialogContentText>
          <DialogContentText style={{ textAlign: "center", fontSize: "10px" }}>
            -당첨된 포카는 추억보관함에서 확인하실 수 있습니다.-
          </DialogContentText>
        </Dialog>
      )}
      <EndFanMeetingTour callback={productTourCallback} />
    </Grid>
  );
};

export default EndFanMeetingPage;
