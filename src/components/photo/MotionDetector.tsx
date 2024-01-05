"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as tmPose from "@teachablemachine/pose";
import html2canvas from "html2canvas";
import { backend_api, openvidu_api } from "@/utils/api";
import PhotoFrame from "@/components/photo/PhotoFrame";
import { Role } from "@/types";

interface Props {
  fanMeetingId: string | null | undefined;
  idolName: string | null | undefined;
  sessionId: string | null | undefined;
  partnerPose: boolean;
  username: string;
  role: string | undefined;
  motionType: string | undefined | null;
  updateShowOverlay: (newValue: boolean) => void;
}

const MotionDetector = ({
  role,
  fanMeetingId,
  idolName,
  sessionId,
  partnerPose,
  username,
  motionType,
  updateShowOverlay,
}: Props) => {
  const audio = new Audio("/mp3/camera9.mp3");

  /* Ref */
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const labelContainerRef2 = useRef<HTMLDivElement>(null);

  /* State*/
  const [hasCaptured, setHasCaptured] = useState<boolean>(false);
  const hasCapturedRef = useRef(hasCaptured);
  hasCapturedRef.current = hasCaptured;

  const [myPose, setMyPose] = useState<boolean>(false);
  const myPoseRef = useRef(myPose);
  myPoseRef.current = myPose;

  const [myPose2, setMyPose2] = useState<boolean>(false);
  const myPoseRef2 = useRef(myPose2);
  myPoseRef2.current = myPose2;

  let model, maxPredictions;
  let model2, maxPredictions2;
  let hasDetected = false;

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

      ctx.save(); // Save current transformation state
      ctx.scale(-1, 1); // Flip horizontally
      ctx.drawImage(
        videoElement,
        -xOffset - videoElement.videoWidth * scale,
        yOffset,
        videoElement.videoWidth * scale,
        videoElement.videoHeight * scale,
      );
      ctx.restore(); // Restore original transformation state

      // Return the created image data URL
      return canvasElement.toDataURL("image/png");
    } else {
      // console.error("2D context not supported");
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
    } else {
      // console.error("Target element not found");
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
          audio.play();
          if (role === Role.FAN) {
            const imageDataUrl = canvas.toDataURL("image/png");
            uploadImage(imageDataUrl);
          }
        })
        .catch((error) => {
          // console.error("html2canvas error:", error);
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
        .post(`/captures/upload/${fanMeetingId}/${idolName}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          // console.log("Image uploaded successfully:", response.data);
        })
        .catch((error) => {
          // console.error("Image upload failed:", error);
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

  const signalPoseDetected = async () => {
    if (username !== "") {
      await openvidu_api.post(`/openvidu/api/signal`, {
        session: sessionId,
        type: "signal:pose_detected",
        data: username,
      });
    }
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      if (hasCapturedRef.current === false) {
        console.log(
          "📸 포즈가 아직 안 취해졌지만 시간이 얼마 안 남아서 촬영합니다!",
        );
        if (role === Role.FAN) {
          onCapture();
        }
        setHasCaptured(true);
        updateShowOverlay(false);
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    console.log("MotionDetector component mounted!");
    const loadScripts = async () => {
      // TensorFlow 및 Teachable Machine Pose 스크립트 로드 완료 후 초기화
      if (motionType === "bigHeart") {
        init();
      } else if (motionType === "halfHeart") {
        init2();
      }
    };

    loadScripts();
  }, [canvasRef.current, labelContainerRef.current, motionType]);

  const init = async () => {
    console.log("MotionDetector init() called");
    if (canvasRef.current && labelContainerRef.current) {
      const URL = "/my-pose-model/";
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      model = await tmPose.load(modelURL, metadataURL);

      maxPredictions = model.getTotalClasses();
      const size = 200;
      const flip = true;
      const webcam = new tmPose.Webcam(size, size, flip);
      await webcam.setup();
      await webcam.play();

      webcamRef.current = webcam;

      canvasRef.current.width = size;
      canvasRef.current.height = size;

      labelContainerRef.current.innerHTML = ""; // 레이블 컨테이너 초기화
      for (let i = 0; i < maxPredictions; i++) {
        labelContainerRef.current.appendChild(document.createElement("div"));
      }
      window.requestAnimationFrame(loop);
    }
  };

  const init2 = async () => {
    console.log("MotionDetector init2() called");
    if (canvasRef.current && labelContainerRef2.current) {
      const URL2 = "/my-pose-model2/";
      const modelURL2 = URL2 + "model.json";
      const metadataURL2 = URL2 + "metadata.json";

      model2 = await tmPose.load(modelURL2, metadataURL2);

      maxPredictions2 = model2.getTotalClasses();

      const size = 200;
      const flip = true;
      const webcam = new tmPose.Webcam(size, size, flip);
      await webcam.setup();
      await webcam.play();

      webcamRef.current = webcam;

      canvasRef.current.width = size;
      canvasRef.current.height = size;

      labelContainerRef2.current.innerHTML = ""; // 레이블 컨테이너 초기화
      for (let i = 0; i < maxPredictions2; i++) {
        labelContainerRef2.current.appendChild(document.createElement("div"));
      }
      window.requestAnimationFrame(loop);
    }
  };

  const loop = () => {
    if (!hasDetected) {
      const webcam = webcamRef.current;
      if (webcam) {
        webcam.update();
        if (motionType === "bigHeart") {
          predict();
        } else if (motionType === "halfHeart") {
          predict2();
        }
        window.requestAnimationFrame(loop);
      }
    }
  };

  useEffect(() => {
    if (
      partnerPose &&
      myPoseRef.current === true &&
      hasCapturedRef.current === false
    ) {
      console.log("📸📸 사진촬영!!!!!📸📸", myPose);
      if (role === Role.FAN) {
        onCapture();
      }
      setHasCaptured(true);
      updateShowOverlay(false);
    }
  }, [partnerPose, myPose, hasCaptured]);

  const predict2 = async () => {
    const webcam = webcamRef.current;

    if (model2 && webcam && labelContainerRef2.current) {
      try {
        const { pose, posenetOutput } = await model2.estimatePose(
          webcam.canvas,
        );

        const prediction = await model2.predict(posenetOutput);
        let detected = false;

        for (let i = 0; i < maxPredictions2; i++) {
          const classPrediction =
            prediction[i].className +
            ": " +
            prediction[i].probability.toFixed(2);

          labelContainerRef2.current.childNodes[i].innerHTML = classPrediction;

          if (
            role === Role.FAN &&
            prediction[i].className == "Class 1" &&
            prediction[i].probability > 0.9
          ) {
            detected = true;
          } else if (
            role === Role.IDOL &&
            prediction[i].className == "Class 2" &&
            prediction[i].probability > 0.9
          ) {
            detected = true;
          }
        }
        if (detected && myPoseRef2.current === false) {
          // console.log("내가 시그널을 보냈어요", myPose);
          setMyPose2(true);
          myPoseRef2.current = true;
          await signalPoseDetected();
        }
      } catch (error) {
        // console.error("Prediction error:", error);
      }
    } else {
      // console.log("Model or webcam is not available!");
    }
  };

  const predict = useCallback(async () => {
    const webcam = webcamRef.current;

    if (model && webcam) {
      try {
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

        const prediction = await model.predict(posenetOutput);
        let detected = false;

        for (let i = 0; i < maxPredictions; i++) {
          const classPrediction =
            prediction[i].className +
            ": " +
            prediction[i].probability.toFixed(2);

          labelContainerRef.current.childNodes[i].innerHTML = classPrediction;

          if (
            prediction[i].className == "Class 1" &&
            prediction[i].probability > 0.9
          ) {
            detected = true;
          }
        }
        if (detected && myPoseRef.current === false) {
          setMyPose(true);
          myPoseRef.current = true;
          await signalPoseDetected();
        }
      } catch (error) {
        // console.error("Prediction error:", error);
      }
    } else {
      // console.log("Model or webcam is not available!");
    }
  }, [model, webcamRef, labelContainerRef, maxPredictions, myPose]);

  return (
    <div>
      <div hidden={true}>
        <canvas ref={canvasRef}></canvas>
      </div>
      <div hidden={true} ref={labelContainerRef}></div>
      <div hidden={true} ref={labelContainerRef2}></div>
      <PhotoFrame fanImgSrc={fanImgSrc} idolImgSrc={idolImgSrc} />
    </div>
  );
};

export default MotionDetector;
