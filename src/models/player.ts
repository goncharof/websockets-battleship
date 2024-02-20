import { update_room } from "../controllers/room";
import { dbPlayer } from "../database/db";
import { ExtWebSocket } from "../wss";

export interface Player {
  index: number;
  name: string;
  ws: ExtWebSocket;
}

let id = 0;

export const save = (data: { name: string; ws: ExtWebSocket }) => {
  return (dbPlayer[++id] = { ...data, index: id });
};

export const all = () => Object.values(dbPlayer);

export const get = (id: number) => dbPlayer[id];

export const rm = (id: number) => {
  delete dbPlayer[id];
  update_room();
};
