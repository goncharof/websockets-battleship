import { ExtWebSocket } from "../wss";
import { add_player, all, create } from "../models/room";
import { get, all as allPlayers } from "../models/player";
import { WsMsgTypes, sendWsMessage } from "../utils/networkHelpers";
import { create as createGame } from "../models/game";

export enum TYPES {
  CreateRoom = WsMsgTypes.CreateRoom,
  AddUserToRoom = WsMsgTypes.AddUserToRoom,
}

export const create_room = (ws: ExtWebSocket) => {
  const { roomId } = create();
  add_user_to_room(ws.playerId, roomId);
};
export const add_user_to_room = (index: number, indexRoom: number) => {
  const room = add_player(get(index), indexRoom);

  if (room.roomUsers.length === 2) {
    const game = createGame(room.roomUsers.map((user) => user.index));

    room.roomUsers.forEach((user) => {
      sendWsMessage(get(user.index).ws, WsMsgTypes.CreateGame, {
        idGame: game.id,
        idPlayer: user.index,
      });
    });
  }

  update_room();
};

export const update_room = () => {
  allPlayers().forEach((player) =>
    sendWsMessage(player.ws, WsMsgTypes.UpdateRoom, all()),
  );
};
