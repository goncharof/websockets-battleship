import { WebSocketServer, type WebSocket } from "ws";
import { reg, TYPES as PlayerTypes } from "./controllers/player";
import { TYPES as GameTypes, add_ships } from "./controllers/game";
import {
  TYPES as RoomTypes,
  add_user_to_room,
  create_room,
} from "./controllers/room";

export interface ExtWebSocket extends WebSocket {
  playerId: number;
}

export const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (ws: ExtWebSocket) => {
  console.log("Client connected");

  // Listen for messages from clients
  ws.on("message", function incoming(message: string) {
    console.log("received: %s", message);

    const data: { type: string; data: string } = JSON.parse(message);

    switch (true) {
      case (Object.values(PlayerTypes) as string[]).includes(data.type):
        reg(ws, JSON.parse(data.data));
        break;
      case (Object.values(RoomTypes) as string[]).includes(data.type):
        switch (data.type) {
          case RoomTypes.CreateRoom:
            create_room(ws);
            break;
          case RoomTypes.AddUserToRoom:
            add_user_to_room(ws.playerId, JSON.parse(data.data).indexRoom);
            break;
          default:
            console.log(`Unknown command type: ${data.type}`);
        }
        break;
      case (Object.values(GameTypes) as string[]).includes(data.type):
        switch (data.type) {
          case GameTypes.AddShips:
            add_ships(JSON.parse(data.data));
            break;
          default:
            console.log(`Unknown command type: ${data.type}`);
        }
        break;
      default:
        console.log(`Unknown command type: ${data.type}`);
    }
  });
});

console.log("WebSocket server is running on ws://localhost:3000");
