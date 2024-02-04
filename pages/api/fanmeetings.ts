import type { NextApiRequest, NextApiResponse } from "next";
import type { FanMeeting } from "@/components/card/PostCard";
import fanMeetings from "../../src/mock/fanMeeting.json";

type ResponseData = {
  data: FanMeeting[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  res.status(200).json({ data: fanMeetings });
}
