"use client";

import React, { ChangeEvent, useRef, useState } from "react";
import { backend_api } from "@/utils/api";
import GradientButton from "@/components/button/GradientButton";
import { Button, Stack, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const CreateFanMeeting = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadedFile] = useState<File>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [fanMeetingImgUrl, setFanMeetingImgUrl] = useState("");
  const [fanMeetingName, setFanMeetingName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [capacity, setCapacity] = useState("");

  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFormSubmit = async (): Promise<string | null> => {
    // const formData = new FormData(event.target);
    const formData = new FormData();
    if (uploadFile !== undefined) {
      formData.append("multipartFile", uploadFile);
    }

    try {
      const response = await backend_api().post("/s3/file", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": `multipartFile/form-data;`,
        },
      });

      if (response.status === 200 && response.data) {
        return response.data[0];
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }

    return null;
  };
  const submit = async (s3FileName: string | null) => {
    try {
      // 팬미팅 정보를 저장
      const response = await backend_api().post("/fanMeetings", {
        fanMeetingName,
        // startTime: "2024-11-20T15:00:00",
        // endTime: "2024-12-01T10:00:00",
        startTime: startDate?.toISOString() || "",
        endTime: endDate?.toISOString() || "",
        capacity,
        teamName,
        fanMeetingImgUrl:
          "https://s3.ap-northeast-2.amazonaws.com/doldolmeet.test/" +
          s3FileName,
      });

      console.log("Fan Meeting Creation Response:", response);

      // 성공적으로 저장한 후 폼 필드 초기화
      setFanMeetingName("");
      setCapacity("");
      setTeamName("");
      setFanMeetingImgUrl("");
      setStartDate(null);
      setEndDate(null);

      alert("팬미팅이 성공적으로 생성되었습니다!");
      // }
    } catch (error) {
      console.error("Error creating fan meeting:", error.message);
      alert("팬미팅 생성 중 오류가 발생했습니다.");
    }
  };

  const handleRegister = async () => {
    await handleFormSubmit().then(async (s3FileName) => {
      await submit(s3FileName);
    });
  };

  const handleButtonClick = () => {
    // Trigger file input click
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Stack
      direction={"column"}
      spacing={2}
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant={"h2"}>🤡 팬미팅 생성 페이지 🤡</Typography>

      <TextField
        value={fanMeetingName}
        label="Fan meeting name"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setFanMeetingName(event.target.value);
        }}
        sx={{ width: "20vw" }}
      />

      <TextField
        value={teamName}
        label="Team name"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setTeamName(event.target.value);
        }}
        sx={{ width: "20vw" }}
      />
      <TextField
        value={capacity}
        label="Capacity"
        required
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setCapacity(event.target.value);
        }}
        sx={{ width: "20vw" }}
      />
      <DatePicker
        selected={startDate}
        onChange={(date: Date | null) => setStartDate(date)}
        showTimeSelect
        dateFormat="Pp"
        placeholderText="Start Date and Time"
        sx={{ width: "20vw" }}
      />

      <DatePicker
        label="Basic date picker"
        selected={endDate}
        onChange={(date: Date | null) => setEndDate(date)}
        showTimeSelect
        dateFormat="Pp"
        placeholderText="End Date and Time"
        sx={{ width: "20vw" }}
      />
      {uploadFile ? (
        <div>{uploadFile.name}</div>
      ) : (
        <div>선택된 파일이 없습니다.</div>
      )}
      <input
        type="file"
        name="file"
        ref={inputRef}
        onChange={onChangeFile}
        style={{ display: "none" }}
      />
      <GradientButton
        fullWidth={1}
        sx={{ width: "20vw" }}
        onClick={handleButtonClick}
      >
        Choose File
      </GradientButton>
      <GradientButton
        fullWidth={1}
        sx={{ width: "20vw" }}
        onClick={handleRegister}
      >
        팬미팅 생성
      </GradientButton>
    </Stack>
  );
};
export default CreateFanMeeting;
