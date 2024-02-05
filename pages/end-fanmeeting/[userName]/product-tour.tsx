import ProductTour from "@/components/product-tour/ProductTour";
import React from "react";
import { Callback } from "react-joyride";

interface Props {
  callback: Callback;
}

export default function EndFanMeetingTour({ callback }: Props) {
  return (
    <ProductTour
      run={true}
      callback={callback}
      steps={[
        {
          target: "#fan-meeting-photo-carousel",
          content:
            "함께 찍은 사진과 녹화된 팬미팅 영상을 다운로드 및 공유할 수 있어요.",
          disableBeacon: true,
          placement: "left",
        },
        {
          target: "#end-fanmeeting-page",
          content: "자! 이제 돌돌밋을 즐기러 가볼까요? 🚀",
          disableBeacon: true,
          placement: "center",
        },
      ]}
    />
  );
}
