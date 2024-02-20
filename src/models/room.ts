import { dbRoom } from "../database/db";
import { Player, get } from "./player";
import { create as createGame } from "./game";

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

export const add_player = (player: Player, indexRoom: number) => {
  Object.values(dbRoom).forEach((room) => {
    room.roomUsers = room.roomUsers.filter(
      (user) => user.index !== player.index,
    );
  });

  dbRoom[indexRoom].roomUsers.push({
    index: player.index,
    name: player.name,
  });

  if (dbRoom[indexRoom].roomUsers.length === 2) {
    const game = createGame(
      dbRoom[indexRoom].roomUsers.map((user) => user.index),
    );

    dbRoom[indexRoom].roomUsers.forEach((user) => {
      get(user.index).ws.send(
        JSON.stringify({
          type: "create_game",
          data: JSON.stringify({
            idGame: game.id,
            idPlayer: user.index,
          }),
          id: 0,
        }),
      );
    });
  }
};

export const all = () => {
  Object.values(dbRoom).forEach((room) => {
    if (room.roomUsers.length === 0) {
      delete dbRoom[room.roomId];
    }
  });

  return Object.values(dbRoom).filter((room) => room.roomUsers.length === 1);
};
