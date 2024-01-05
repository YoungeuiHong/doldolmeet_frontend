"use client";
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const YoutubePlayer = () => {
  const [videoDirectory, setVideoDirectory] = useState("");
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [result, setResult] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadedFile] = useState<File>();
  const videoUrl =
    "https://s3.ap-northeast-2.amazonaws.com/doldolmeet.test/d3064509-b7d0-442d-83c9-28ce64906562.mp4";

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };
  const handleFormSubmit = async () => {
    // const formData = new FormData(event.target);
    const formData = new FormData();
    if (uploadFile !== undefined) {
      formData.append("multipartFile", uploadFile);
    }

    try {
      const response = await axios.post("/api/s3/file", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": `multipart/form-data;`,
        },
      });

      if (response.status === 200) {
        const resultText = response.data;
        setResult(resultText);
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <ReactPlayer
      url="https://www.youtube.com/watch?v=jxeJUX9z91I"
      controls
      width="100%"
      height="50vh"
      loop={true}
      volume={0.05}
    />
  );
};

export default YoutubePlayer;
