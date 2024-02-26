import { type Player } from "../models/player";
import { Room } from "../models/room";
import { ExtWebSocket } from "../wss";

export interface Point {
  x: number;
  y: number;
}

export interface Ship {
  position: Point;
  direction: boolean;
  length: number;
  hits?: Point[];
}

export const dbPlayer: Record<number, Player> = {
  "-1": {
    index: -1,
    name: "bot",
    ws: { send: () => {} } as unknown as ExtWebSocket,
    wins: 0,
  },
};
export const dbRoom: Record<number, Room> = {};
export const dbGames: Record<
  number,
  {
    id: number;
    playerIds: number[];
    ships: Record<number, Ship[]>;
    attacks: Record<number, { x: number; y: number }[]>;
    currentPlayer: number;
    bot: boolean;
  }
> = {};

export default {
  dbPlayer,
  dbGames,
  dbRoom,
};
