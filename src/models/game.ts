import { Ship, dbGames } from "../database/db";

let id = 0;

export enum AttackResults {
  Miss = "miss",
  Killed = "killed",
  Shot = "shot",
}

export const create = (playerIds: number[]) => {
  const [id1, id2] = playerIds;

  dbGames[++id] = {
    id,
    playerIds,
    ships: { [id1]: [], [id2]: [] },
    attacks: { [id1]: [], [id2]: [] },
  };

  return dbGames[id];
};

export const addShips = (
  data: { gameId: number; ships: Ship[] },
  playerId: number,
) => {
  dbGames[data.gameId].ships[playerId] = data.ships;
  return dbGames[data.gameId];
};

export const get = (id: number) => dbGames[id];

export const attack = (
  gameId: number,
  playerId: number,
  x: number,
  y: number,
) => {
  const position = { x, y };

  dbGames[gameId].attacks[playerId].push(position);
  const opponentId = dbGames[gameId].playerIds.find((id) => id !== playerId)!;

  return attackResult(
    dbGames[gameId].ships[opponentId],
    position.x,
    position.y,
  );
};

const attackResult = (ships: Ship[], shotX: number, shotY: number) => {
  console.table(ships);
  console.log(shotX, shotY);

  for (let i = 0; i < ships.length; i++) {
    const ship = ships[i];
    const { position, direction, length } = ship;

    const shipCoordinates = [];
    for (let j = 0; j < length; j++) {
      if (direction) {
        shipCoordinates.push({ x: position.x, y: position.y + j });
      } else {
        shipCoordinates.push({ x: position.x + j, y: position.y });
      }
    }

    for (const coord of shipCoordinates) {
      if (coord.x === shotX && coord.y === shotY) {
        if (!ship.hits) {
          ship.hits = [];
        }
        ship.hits.push({ x: shotX, y: shotY });

        if (ship.hits.length === length) {
          return AttackResults.Killed;
        } else {
          return AttackResults.Shot;
        }
      }
    }
  }

  return AttackResults.Miss;
};
