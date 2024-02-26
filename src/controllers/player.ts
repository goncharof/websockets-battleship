export const cmdTypes = ["reg"];
import { save, all } from "../models/player";
import { WsMsgTypes, sendWsMessage } from "../utils/networkHelpers";
import { ExtWebSocket } from "../wss";
import { update_room } from "./room";

export enum TYPES {
  Reg = WsMsgTypes.Reg,
}

export const reg = (
  ws: ExtWebSocket,
  data: Record<string, unknown> & { name: string },
) => {
  delete data.password;

  const player = save({ ...data, ws, wins: 0 });

  ws.playerId = player.index;

  update_winners();

  data.error = false;
  data.errorText = "";

  sendWsMessage(ws, WsMsgTypes.Reg, data);

  update_room();
};

export const update_winners = (winnerId?: number) => {
  const players = all();

  if (winnerId) {
    players.find((player) => player.index === winnerId)!.wins++;
  }

  players.forEach((player) => {
    sendWsMessage(
      player.ws,
      WsMsgTypes.UpdateWinners,
      players.map(({ name, wins }) => ({ name, wins })),
    );
  });
};
