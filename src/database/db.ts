import { type Player } from "../models/player";

interface Winner {
  name: string;
  wins: number;
}

export const dbPlayer: Record<number, Player> = {};
export const winnersDb: Winner[] = [];
