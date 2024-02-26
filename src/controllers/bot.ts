import { create as createGame } from "../models/game";
import { get } from "../models/player";
import { WsMsgTypes, sendWsMessage } from "../utils/networkHelpers";
import { onAddShips } from "./game";

export const botShips = [
  { position: { x: 1, y: 6 }, direction: false, type: "huge", length: 4 },
  { position: { x: 8, y: 0 }, direction: true, type: "large", length: 3 },
  { position: { x: 2, y: 1 }, direction: true, type: "large", length: 3 },
  { position: { x: 7, y: 7 }, direction: false, type: "medium", length: 2 },
  { position: { x: 3, y: 8 }, direction: true, type: "medium", length: 2 },
  { position: { x: 0, y: 2 }, direction: true, type: "medium", length: 2 },
  { position: { x: 4, y: 1 }, direction: false, type: "small", length: 1 },
  { position: { x: 6, y: 0 }, direction: true, type: "small", length: 1 },
  { position: { x: 5, y: 3 }, direction: true, type: "small", length: 1 },
  { position: { x: 8, y: 5 }, direction: false, type: "small", length: 1 },
];

const BOT_ID = -1;

export enum TYPES {
  SinglePlay = "single_play",
}

export const start = (idPlayer: number) => {
  const game = createGame([idPlayer, BOT_ID], true);

  onAddShips({
    gameId: game.id,
    indexPlayer: -1,
    ships: botShips,
  });

  sendWsMessage(get(idPlayer).ws, WsMsgTypes.CreateGame, {
    idGame: game.id,
    idPlayer,
  });
};
