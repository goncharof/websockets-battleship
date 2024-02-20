import { dbRoom } from "../database/db";
import { Player } from "./player";

let indexRoom = 0;

export interface Room {
  indexRoom: number;
  roomUsers: {
    index: number;
    name: string;
  }[];
}

export const create = (): Room => {
  return (dbRoom[++indexRoom] = {
    indexRoom,
    roomUsers: [],
  });
};

export const add_player = (player: Player, indexRoom: number) => {
  dbRoom[indexRoom].roomUsers.push({
    index: player.index,
    name: player.name,
  });
};

export const all = () =>
  Object.values(dbRoom).filter((room) => room.roomUsers.length === 1);
