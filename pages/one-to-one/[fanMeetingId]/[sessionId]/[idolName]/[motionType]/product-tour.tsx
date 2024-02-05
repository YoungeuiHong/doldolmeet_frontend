import ProductTour from "@/components/product-tour/ProductTour";
import React from "react";
import { Callback } from "react-joyride";

interface Props {
  callback: Callback;
}

export default function OneToOneTour({ callback }: Props) {
  return (
    <ProductTour
      run={true}
      callback={callback}
      steps={[
        {
          target: "#device-control-button",
          content: "마이크, 카메라, 자막, 전체 화면 모드를 키고 끌 수 있어요.",
          disableBeacon: true,
        },
        {
          target: "#fan-meeting-timer",
          content: "팬미팅 종료까지 남은 시간을 확인할 수 있어요.",
          disableBeacon: true,
        },
        {
          target: "#subtitle-bar",
          content:
            "상대방의 말이 내가 선택한 언어로 번역되어 자막으로 표시돼요.",
          disableBeacon: true,
        },
        {
          target: "#photo-time-alert",
          content:
            "아이돌과 팬 모두가 포즈를 취하면 자동으로 사진이 촬영됩니다.",
          disableBeacon: true,
        },
      ]}
    />
  );
}
