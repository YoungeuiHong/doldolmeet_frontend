import { Device, OpenVidu, Session, StreamManager } from "openvidu-browser";
import { Role } from "@/types";
import { backend_api } from "@/utils/api";

interface JoinSessionProps {
  token: string;
  userName: string;
  role: Role;
}

interface JoinSessionReturn {
  publisher: StreamManager | undefined;
  currentVideoDevice: Device | undefined;
}

export const joinSession = async ({
  token,
  userName,
  role,
}: JoinSessionProps): Promise<JoinSessionReturn | null> => {
  const ov = new OpenVidu();
  const session = ov.initSession();

  if (session) {
    session
      .connect(token, {
        clientData: userName,
        role: role,
      })
      .then(async () => {
        const newPublisher = await ov.initPublisherAsync(undefined, {
          // properties for the publisher
          // audioSource: undefined, // The source of audio. If undefined default microphone
          // videoSource: undefined, // The source of video. If undefined default webcam
          // publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
          // publishVideo: true, // Whether you want to start publishing with your video enabled or not
          // resolution: "640x480", // The resolution of your video
          // frameRate: 30, // The frame rate of your video
          // insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
          // mirror: true, // Whether to mirror your local video or not TODO: 하트 가능하게 하려면 어떻게 해야 할지 확인 필요
        });

        session.publish(newPublisher);
        const devices = await ov.getDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );
        const currentVideoDeviceId = newPublisher.stream
          .getMediaStream()
          .getVideoTracks()[0]
          .getSettings().deviceId;
        const currentVideoDevice = videoDevices.find(
          (device) => device.deviceId === currentVideoDeviceId,
        );

        return { publisher: newPublisher, currentVideoDevice };
      })
      .catch((error) => {
        console.error(
          "There was an error connecting to the session:",
          error.code,
          error.message,
        );
      });
  }

  return null;
};

export interface EnterFanMeetingProps {
  fanMeetingId: string;
}

export interface CreatedSessionInfo {
  mainWaitRoomId: string;
  waitRoomId: string;
  teleRoomId: string;
  token: string;
}

export interface CreateSessionResponse {
  message: string;
  data: CreatedSessionInfo;
}

export interface EnterFanMeetingReturn {
  mainWaitRoomId: string;
  waitRoomId: string;
  teleRoomId: string;
  token: string;
  publisher: StreamManager | undefined;
  currentVideoDevice: Device | undefined;
}

export const enterFanmeeting = async ({
  fanMeetingId,
}: EnterFanMeetingProps): Promise<EnterFanMeetingReturn | null> => {
  console.log("💜 enter fan meeting 실행!", fanMeetingId);

  try {
    // OpenVidu 객체 생성
    const ov = new OpenVidu();

    const sessionResponse = await backend_api().get(
      `/fanMeetings/${fanMeetingId}/session`,
    );
    const token = sessionResponse?.data?.data?.token;

    if (!token) {
      console.error("Token not available");
      return null;
    }

    const mySession = ov.initSession();

    mySession.on("signal:invite", (event) => {
      const token = event.data;
      console.log("🚀 들어오세요~ ", token);
    });

    await mySession.connect(token, {
      clientData: token, // TODO: userName으로 수정 필요
    });

    console.log("💜 커넥션 성공!", token);

    const newPublisher = await ov.initPublisherAsync(undefined, {
      // properties for the publisher
      // ...
    });

    mySession.publish(newPublisher);

    const devices = await ov.getDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput",
    );
    const currentVideoDeviceId = newPublisher.stream
      .getMediaStream()
      .getVideoTracks()[0]
      .getSettings().deviceId;
    const currentVideoDevice = videoDevices.find(
      (device) => device.deviceId === currentVideoDeviceId,
    );

    const response: EnterFanMeetingReturn = {
      publisher: newPublisher,
      currentVideoDevice,
      ...sessionResponse.data.data,
    };

    console.log("💜 response!", response);

    return response;
  } catch (error) {
    console.error("Error in enterFanmeeting:", error);
    return null;
  }
};