export const cmdTypes = ["reg"];
import { save, all } from "../models/player";
import { WsMsgTypes, sendWsMessage } from "../utils/networkHelpers";
import { ExtWebSocket } from "../wss";
import { update_room } from "./room";

const winners: { name: string; wins: number }[] = [];

export enum TYPES {
  Reg = WsMsgTypes.Reg,
}

export const reg = (
  ws: ExtWebSocket,
  data: Record<string, unknown> & { name: string },
) => {
  delete data.password;

  const player = save({ ...data, ws });

  ws.playerId = player.index;

  winners.push({ name: data.name, wins: 0 });

  update_winners();

  data.error = false;
  data.errorText = "";

  sendWsMessage(ws, WsMsgTypes.Reg, data);

  update_room();
};

const update_winners = () => {
  all().forEach((player) => {
    sendWsMessage(player.ws, WsMsgTypes.UpdateWinners, winners);
  });
};
