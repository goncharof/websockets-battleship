import { save, all, rm } from "../models/player";
import { disconect as disconectFromRooms } from "../models/room";
import { onPlayerDissconect as onDisconnectFromGames } from "../controllers/game";
import { WsMsgTypes, sendWsMessage } from "../utils/networkHelpers";
import { ExtWebSocket } from "../wss";
import { onUpdateRoom } from "./room";

export enum TYPES {
  Reg = WsMsgTypes.Reg,
}

export const onReg = (
  ws: ExtWebSocket,
  data: Record<string, unknown> & { name: string },
) => {
  try {
    const player = save({ ...data, ws, wins: 0 });
    ws.playerId = player.index;
    onUpdateWinners();

    sendWsMessage(ws, WsMsgTypes.Reg, {
      name: player.name,
      index: player.index,
      error: false,
      errorText: "",
    });

    onUpdateRoom();

    console.log(`Player ${player.name} registrated and rooms updated`);
  } catch (error: unknown) {
    sendWsMessage(ws, WsMsgTypes.Reg, {
      name: "",
      index: 0,
      error: true,
      errorText: (error as Error).message,
    });

    console.log((error as Error).message);
  }
};

export const onUpdateWinners = (winnerId?: number) => {
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
  onUpdateRoom();
  onUpdateWinners();
};
