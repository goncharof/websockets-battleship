import { dbGames } from "../database/db";

let id = 0;

export const create = (playerIds: number[]) => {
  dbGames[++id] = {
    id,
    playerIds,
  };

  return dbGames[id];
};
