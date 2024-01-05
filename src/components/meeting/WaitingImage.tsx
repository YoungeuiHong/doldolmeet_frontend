import React from "react";
import { TypographyOnImage } from "@/components/typography/TypographyOnImage";
import { Role } from "@/types";

interface Props {
  waitingFor: Role; // 누구를 기다리고 있는지
  name?: string;
}

const WaitingImage = ({ waitingFor, name }: Props) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <TypographyOnImage variant="h4" sx={{ width: "100%" }}>
        {waitingFor === Role.IDOL ? name + "님" : "팬"}이 들어올 때까지
        <br />
        조금만 기다려주세요!
      </TypographyOnImage>
      <img
        src={waitingFor === Role.IDOL ? "/hi.gif" : "/fan.webp"}
        alt="조금만 기다려주세요"
        style={{
          maxWidth: "95%",
          height: "68vh",
          borderRadius: 20,
          objectFit: "cover",
          position: "relative",
          zIndex: 0,
        }}
      />
    </div>
  );
};

export default WaitingImage;
