import { WebSocketServer, WebSocket } from "ws";
import { reg, TYPES as PlayerTypes, onDisconnect } from "./controllers/player";
import { TYPES as GameTypes, add_ships, onAttack } from "./controllers/game";
import {
  TYPES as RoomTypes,
  add_user_to_room,
  create_room,
} from "./controllers/room";

export interface ExtWebSocket extends WebSocket {
  playerId: number;
}

export const wss = new WebSocketServer({ port: 3000 });

wss.on("listening", () => {
  console.log("WebSocket server is running on ws://localhost:3000");
});

wss.on("connection", (ws: ExtWebSocket) => {
  console.log("Client connected");

  ws.on("message", (message: string) => {
    const data: { type: string; data: string } = JSON.parse(message);

    console.log(`server received command with type: ${data.type}`);

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
            unknownCommandDetected(data.type);
        }
        break;
      case (Object.values(GameTypes) as string[]).includes(data.type):
        switch (data.type) {
          case GameTypes.AddShips:
            add_ships(JSON.parse(data.data));
            break;
          case GameTypes.Attack:
          case GameTypes.RandomAttack:
            onAttack(JSON.parse(data.data));
            break;
          default:
            unknownCommandDetected(data.type);
        }
        break;
      default:
        unknownCommandDetected(data.type);
    }
  });

  ws.on("close", () => onDisconnect(ws.playerId));
});

process.on("exit", (code) => {
  console.log("Process beforeExit event with code: ", code);
  console.log("Closing connections...");
  closeConnections();
});

const unknownCommandDetected = (type: string) =>
  console.log(`Unknown command type: ${type}`);

const closeConnections = () =>
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1001, "server closed connection");
      console.log("Connection closed");
    }
  });
