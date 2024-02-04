import type { NextApiRequest, NextApiResponse } from "next";
import type { FanMeeting } from "@/components/card/PostCard";

type ResponseData = {
  data: FanMeeting;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  res.status(200).json({
    data: {
      id: 3,
      imgUrl: "/images/fanmeeting/bts_cover.jpeg",
      profileImgUrl: "/images/fanmeeting/bts_profile.jpeg",
      title: "정국 GOLDEN 발매 기념 팬미팅",
      startTime: "2023-12-15 PM 08:00",
    },
  });
}
