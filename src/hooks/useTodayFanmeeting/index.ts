import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { BackendResponse } from "@/types";

const fetchTodayFanmeeting = async (): Promise<BackendResponse<any>> => {
  const response = await axios
    .get(`/api/today-fanmeeting`)
    .then((response: AxiosResponse) => {
      if (response.status === 404) {
        return null;
      } else {
        return response.data;
      }
    })
    .catch((e) => console.error(e));
  return response.data;
};

const useTodayFanmeeting = () => {
  return useQuery({
    queryKey: ["fanMeetings", "today"],
    queryFn: () => fetchTodayFanmeeting(),
  });
};

export { fetchTodayFanmeeting, useTodayFanmeeting };
