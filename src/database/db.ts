import { type Player } from "../models/player";
import { Room } from "../models/room";

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

export const dbPlayer: Record<number, Player> = {};
export const dbRoom: Record<number, Room> = {};
export const dbGames: Record<
  number,
  {
    id: number;
    playerIds: number[];
    ships: Record<number, Ship[]>;
    attacks: Record<number, { x: number; y: number }[]>;
    currentPlayer: number;
  }
> = {};

export default {
  dbPlayer,
  dbGames,
  dbRoom,
};
