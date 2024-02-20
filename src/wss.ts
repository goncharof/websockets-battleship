import { WebSocketServer, type WebSocket } from "ws";
import { cmdTypes as playerCmdTypes, cmds as playerCmds } from "./controllers/player";


export const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  
  // Listen for messages from clients
  ws.on("message", function incoming(message: string) {
    console.log("received: %s", message);

    const data: { type: keyof typeof playerCmds, data: string } = JSON.parse(message);

    switch(true) {
      case playerCmdTypes.includes(data.type):
        playerCmds[data.type].call(undefined, ws, JSON.parse(data.data));
        break;
    }
  });

  // Send a message to the client
  // ws.send("Hello! You are connected to the server.");
});

console.log("WebSocket server is running on ws://localhost:3000");
