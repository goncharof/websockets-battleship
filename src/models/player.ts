import { type WebSocket } from "ws";
import { dbPlayer } from "../database/db";

export interface Player {
  index: number;
  name: string;
  ws: WebSocket;
}

let id = 0;

export const save = (data: { name: string, ws: WebSocket }) => {
  dbPlayer[++id] = { ...data, index: id };
}

export const all = () => Object.values(dbPlayer)