import { type Player } from "../models/player";
import { Room } from "../models/room";

interface Winner {
  name: string;
  wins: number;
}

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  hits?: { x: number; y: number }[];
}

export const dbPlayer: Record<number, Player> = {};
export const winnersDb: Winner[] = [];
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
  winnersDb,
  dbGames,
  dbRoom,
};
