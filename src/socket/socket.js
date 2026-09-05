import { io } from "socket.io-client";

const URL = process.env.REACT_APP_API_URL;

let socket;

if (!socket) {
  socket = io(URL, {
    transports: ["websocket"],

    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,

    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("🟢 CONNECT:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 DISCONNECT");
  });

  socket.on("connect_error", (err) => {
    console.log("❌ SOCKET ERROR:", err.message);
  });
}

export default socket;
