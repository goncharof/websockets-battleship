import { type Player } from "../models/player";
import { Room } from "../models/room";

interface Winner {
  name: string;
  wins: number;
}

export const dbPlayer: Record<number, Player> = {};
export const winnersDb: Winner[] = [];
export const dbRoom: Record<number, Room> = {};
export const dbGames: Record<number, { id: number; playerIds: number[] }> = {};

export default {
  dbPlayer,
  winnersDb,
  dbGames,
  dbRoom,
};
