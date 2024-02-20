import { dbGames } from "../database/db";

let id = 0;

export const create = (playerIds: number[]) => {
  dbGames[++id] = {
    id,
    playerIds,
    ships: {},
  };

  return dbGames[id];
};

export const addShips = (
  data: { gameId: number; ships: [] },
  playerId: number,
) => {
  dbGames[data.gameId].ships[playerId] = data.ships;
  return dbGames[data.gameId];
};
