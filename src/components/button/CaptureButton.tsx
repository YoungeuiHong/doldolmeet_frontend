"use client";
import html2canvas from "html2canvas";
import { backend_api } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { ToggleButton } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useEffect, useState } from "react";

const Capture = () => {
  const searchParams = useSearchParams();
  const fanMeetingId = searchParams?.get("id");
  const audio = new Audio("/mp3/camera9.mp3");
  const [idolImgSrc, setidolImgSrc] = useState<string>("");
  const [fanImgSrc, setFanImgSrc] = useState<string>("");

  /* videoElement가 화면에 보이는 상태대로 canvasElement에 복사하여 이미지의 data url을 반환하는 함수 */
  const createImageDataUrl = (
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
  ) => {
    const aspectRatio = videoElement.clientWidth / videoElement.clientHeight;

    canvasElement.width = videoElement.clientWidth;
    canvasElement.height = canvasElement.width / aspectRatio;

    const ctx = canvasElement.getContext("2d");

    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Calculate scaling factor based on objectFit: 'cover'
      const scale = Math.max(
        canvasElement.width / videoElement.videoWidth,
        canvasElement.height / videoElement.videoHeight,
      );

      // Calculate positioning to center the content on the canvas
      const xOffset =
        (canvasElement.width - videoElement.videoWidth * scale) / 2;
      const yOffset =
        (canvasElement.height - videoElement.videoHeight * scale) / 2;

      // Draw the video content on the canvas
      ctx.drawImage(
        videoElement,
        xOffset,
        yOffset,
        videoElement.videoWidth * scale,
        videoElement.videoHeight * scale,
      );

      // Return the created image data URL
      return canvasElement.toDataURL("image/png");
    } else {
      console.error("2D context not supported");
      return "";
    }
  };

  const onCapture = async () => {
    const idolElement: HTMLVideoElement = document.getElementById(
      "idol-video-container",
    ) as HTMLVideoElement;
    const fanElement: HTMLVideoElement = document.getElementById(
      "fan-video-container",
    ) as HTMLVideoElement;

    const idolCanvas: HTMLCanvasElement = document.getElementById(
      "idol-canvas",
    ) as HTMLCanvasElement;
    const fanCanvas: HTMLCanvasElement = document.getElementById(
      "fan-canvas",
    ) as HTMLCanvasElement;

    if (idolElement && fanElement) {
      const idolImageDataUrl = createImageDataUrl(idolElement, idolCanvas);
      setidolImgSrc(idolImageDataUrl);

      const fanImageDataUrl = createImageDataUrl(fanElement, fanCanvas);
      setFanImgSrc(fanImageDataUrl);

      audio.play(); // 찰칵 소리
    } else {
      console.error("Target element not found");
    }
  };

  useEffect(() => {
    if (fanImgSrc === "" || idolImgSrc === "") {
      return;
    }

    const photoFrameElement = document.getElementById("photo-frame");

    if (photoFrameElement) {
      html2canvas(photoFrameElement, {
        onclone: function (cloned) {
          // @ts-ignore
          cloned.getElementById("photo-frame").style.display = "block";
        },
      })
        .then((canvas) => {
          audio.play(); // 찰칵 소리
          const imageDataUrl = canvas.toDataURL("image/png");
          uploadImage(imageDataUrl);
        })
        .catch((error) => {
          console.error("html2canvas error:", error);
        });
    }
  }, [idolImgSrc, fanImgSrc]);

  const uploadImage = (imageDataUrl) => {
    const blobImage = dataURLtoBlob(imageDataUrl);
    // Blob을 파일로 변환
    const imageFile = new File([blobImage], "image.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", imageFile);

    if (fanMeetingId) {
      backend_api()
        .post(`/captures/upload/${fanMeetingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log("Image uploaded successfully:", response.data);
        })
        .catch((error) => {
          console.error("Image upload failed:", error);
        });
    }
  };

  function dataURLtoBlob(dataURL) {
    let arr = dataURL.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  return (
    <>
      <ToggleButton
        value="underlined"
        aria-label="underlined"
        onClick={onCapture}
      >
        <CameraAltIcon sx={{ color: "#FFAFCC" }} />
      </ToggleButton>
    </>
  );
};
export default Capture;
