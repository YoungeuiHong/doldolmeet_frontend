import React, { useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import axios from "axios";

import { Button } from "@mui/material";

const ShowChat = () => {
  const roomId = "ca37eb4e-2494-44c0-ae1a-7da8d45ef179";
  const sender = "park";

  // const [message, setMessage] = useState("");

  const sock = new SockJS("https://api.doldolmeet.store/ws-stomp", null, {
    transports: ["websocket"],
    withCredentials: true,
  });
  const stompClient = Stomp.over(sock);
  let room = "";

  // axios.get("/chat/room/" + roomId).then((response) => {
  //   room = response.data;
  // });

  connect();

  function connect() {
    stompClient.connect(
      {},
      function (frame) {
        console.log("Connected: " + frame);

        // 특정 토픽 구독
        stompClient.subscribe(`/sub/chat/room/${roomId}`, function (message) {
          console.log("Received message: " + message.body);
          // 여기에서 수신한 메시지를 처리하는 로직을 추가할 수 있습니다.
        });
        stompClient.send(
          "/pub/chat/message",
          {},
          JSON.stringify({ type: "ENTER", roomId: roomId, sender: sender }),
        );
      },
      function (error) {
        console.log("Error: " + error);
      },
    );
  }

  return (
    <>
      <input type="text" />
      <button>클릭</button>
    </>
  );
};

export default ShowChat;
