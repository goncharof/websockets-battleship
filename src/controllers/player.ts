export const cmdTypes = ["reg"];
import { save, all, rm } from "../models/player";
import { disconect as disconectFromRooms } from "../models/room";
import { onPlayerDissconect as onDisconnectFromGames } from "../controllers/game";
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
  try {
    const player = save({ ...data, ws, wins: 0 });
    ws.playerId = player.index;
    update_winners();

    sendWsMessage(ws, WsMsgTypes.Reg, {
      name: player.name,
      index: player.index,
      error: false,
      errorText: "",
    });

    update_room();
  } catch (error: unknown) {
    sendWsMessage(ws, WsMsgTypes.Reg, {
      name: "",
      index: 0,
      error: true,
      errorText: (error as Error).message,
    });
  }
};

export const update_winners = (winnerId?: number) => {
  const players = all();

  if (winnerId) players.find((player) => player.index === winnerId)!.wins++;

  players.forEach((player) => {
    sendWsMessage(
      player.ws,
      WsMsgTypes.UpdateWinners,
      players.map(({ name, wins }) => ({ name, wins })),
    );
  });
};

export const onDisconnect = (playerId?: number) => {
  if (!playerId) return;
  rm(playerId);
  disconectFromRooms(playerId);
  onDisconnectFromGames(playerId);
  update_room();
  update_winners();
};
