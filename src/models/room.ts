import { dbRoom } from "../database/db";
import { Player } from "./player";

let roomId = 0;

export interface Room {
  roomId: number;
  roomUsers: {
    index: number;
    name: string;
  }[];
}

export const create = (): Room => {
  return (dbRoom[++roomId] = {
    roomId,
    roomUsers: [],
  });
};

export const add_player = (player: Player, indexRoom: number): Room => {
  Object.values(dbRoom).forEach((room) => {
    room.roomUsers = room.roomUsers.filter(
      (user) => user.index !== player.index,
    );
  });

  dbRoom[indexRoom].roomUsers.push({
    index: player.index,
    name: player.name,
  });

  return dbRoom[indexRoom];
};

export const all = () => {
  Object.values(dbRoom).forEach((room) => {
    if (room.roomUsers.length === 0) {
      delete dbRoom[room.roomId];
    }
  });

  return Object.values(dbRoom).filter((room) => room.roomUsers.length === 1);
};

export const disconect = (index: number) => {
  Object.values(dbRoom).forEach((room) => {
    room.roomUsers = room.roomUsers.filter((user) => user.index !== index);
  });
};
