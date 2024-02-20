import { ExtWebSocket } from "../wss";
import { add_player, all, create } from "../models/room";
import { get, all as allPlayers } from "../models/player";

export enum TYPES {
  CreateRoom = "create_room",
  AddUserToRoom = "add_user_to_room",
}

export const create_room = (ws: ExtWebSocket) => {
  const { roomId } = create();
  add_user_to_room(ws.playerId, roomId);
};
export const add_user_to_room = (index: number, indexRoom: number) => {
  add_player(get(index), indexRoom);
  update_room();
};

export const update_room = () => {
  allPlayers().forEach((player) => {
    player.ws.send(
      JSON.stringify({
        type: "update_room",
        id: 0,
        data: JSON.stringify(all()),
      }),
    );
  });
};
