import ProductTour from "@/components/product-tour/ProductTour";
import React from "react";
import { Callback } from "react-joyride";

interface Props {
  callback: Callback;
}

export default function WaitingRoomTour({ callback }: Props) {
  return (
    <ProductTour
      run={true}
      callback={callback}
      steps={[
        {
          target: "#waiting-room",
          content: (
            <>
              팬미팅 대기실에 오신 것을 환영해요 🥳 <br />
              저와 함께 대기실을 둘러볼까요?
            </>
          ),
          disableBeacon: true,
          placement: "center",
        },
        {
          target: "#waiting-info",
          content: "나의 현재 대기 순서를 확인할 수 있어요.",
          disableBeacon: true,
        },
        {
          target: "#chat-tab",
          content: "팬미팅을 기다리는 동안 다른 팬들과 대화를 나눌 수 있어요.",
          disableBeacon: true,
          placement: "left",
        },
        {
          target: "#language-select-form",
          content:
            "내가 선택한 언어로 번역돼서 외국인 팬들과 소통할 수 있어요.",
          disableBeacon: true,
          placement: "left",
        },
        {
          target: "#memo-tab",
          content: "하고 싶은 말을 깜빡하지 않도록 메모해놓을 수 있어요.",
          disableBeacon: true,
          placement: "left",
        },
      ]}
    />
  );
}
