import { Point, Ship, dbGames } from "../database/db";

let id = 0;

export enum AttackResults {
  Miss = "miss",
  Killed = "killed",
  Shot = "shot",
}

export const disconect = (index: number) => {
  let winPlayer = 0;

  Object.values(dbGames).forEach((game) => {
    if (game.playerIds.includes(index)) {
      winPlayer = game.playerIds.find((id) => id !== index)!;
      rm(game.id);
      return;
    }
  });

  return winPlayer;
};

export const create = (playerIds: number[], bot = false) => {
  const [id1, id2] = playerIds;

  dbGames[++id] = {
    id,
    playerIds,
    ships: {},
    attacks: { [id1]: [], [id2]: [] },
    currentPlayer: id1,
    bot,
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
  const opponentId = dbGames[gameId].playerIds.find((id) => id !== playerId)!;

  const results = attackResult(dbGames[gameId].ships[opponentId], x, y);

  results.forEach((result) => {
    dbGames[gameId].attacks[playerId].push(result.point);
  });

  return results;
};

export const nextPlayer = (gameId: number) => {
  const game = get(gameId);
  dbGames[id].currentPlayer = game.playerIds.find(
    (id) => id !== game.currentPlayer,
  )!;

  return game.currentPlayer;
};

export const rm = (id: number) => {
  delete dbGames[id];
};

const attackResult = (ships: Ship[], x: number, y: number) => {
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
      if (coord.x === x && coord.y === y) {
        if (!ship.hits) {
          ship.hits = [];
        }
        ship.hits.push({ x, y });

        if (ship.hits.length === length) {
          if (ships.every((ship) => ship.hits?.length === ship.length)) {
            console.log("all ships are destroyed!!!!");
            return [
              { status: AttackResults.Killed, point: { x, y }, finish: true },
            ];
          }

          return [
            { status: AttackResults.Killed, point: { x, y }, finish: false },
            ...getSurroundingPointsForShip(ship),
          ];
        } else {
          return [
            {
              status: AttackResults.Shot,
              point: { x, y },
              finish: false,
            },
          ];
        }
      }
    }
  }

  return [
    {
      status: AttackResults.Miss,
      point: { x, y },
      finish: false,
    },
  ];
};

const getSurroundingPointsForShip = (ship: Ship) => {
  const surroundingPoints: {
    status: AttackResults.Miss;
    point: Point;
    finish: boolean;
  }[] = [];

  const adjacentOffsets = [
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // top
    { dx: 0, dy: 1 }, // bottom
  ];

  for (let i = 0; i < ship.length; i++) {
    const posX = ship.position.x + (ship.direction ? 0 : i);
    const posY = ship.position.y + (ship.direction ? i : 0);

    adjacentOffsets.forEach((offset) => {
      const adjacentPoint = { x: posX + offset.dx, y: posY + offset.dy };
      if (
        adjacentPoint.x >= 0 &&
        adjacentPoint.x < 10 &&
        adjacentPoint.y >= 0 &&
        adjacentPoint.y < 10 &&
        !isShipCoordinate(adjacentPoint, ship)
      ) {
        if (
          !surroundingPoints.some(
            (point) =>
              point.point.x === adjacentPoint.x &&
              point.point.y === adjacentPoint.y,
          )
        ) {
          surroundingPoints.push({
            status: AttackResults.Miss,
            point: adjacentPoint,
            finish: false,
          });
        }
      }
    });
  }

  const bowAndSternOffsets = ship.direction
    ? [
        { dx: 0, dy: -1 },
        { dx: -1, dy: -1 },
        { dx: 1, dy: -1 },
        { dx: 0, dy: ship.length },
        { dx: -1, dy: ship.length },
        { dx: 1, dy: ship.length },
      ]
    : [
        { dx: -1, dy: 0 },
        { dx: -1, dy: -1 },
        { dx: -1, dy: 1 },
        { dx: ship.length, dy: 0 },
        { dx: ship.length, dy: -1 },
        { dx: ship.length, dy: 1 },
      ];

  bowAndSternOffsets.forEach((offset) => {
    const bowOrSternPoint = {
      x: ship.position.x + offset.dx,
      y: ship.position.y + offset.dy,
    };
    if (
      bowOrSternPoint.x >= 0 &&
      bowOrSternPoint.x < 10 &&
      bowOrSternPoint.y >= 0 &&
      bowOrSternPoint.y < 10
    ) {
      if (
        !surroundingPoints.some(
          (point) =>
            point.point.x === bowOrSternPoint.x &&
            point.point.y === bowOrSternPoint.y,
        )
      ) {
        surroundingPoints.push({
          status: AttackResults.Miss,
          point: bowOrSternPoint,
          finish: false,
        });
      }
    }
  });

  return surroundingPoints;
};

const isShipCoordinate = (point: Point, ship: Ship): boolean => {
  for (let i = 0; i < ship.length; i++) {
    const shipX = ship.position.x + (ship.direction ? 0 : i);
    const shipY = ship.position.y + (ship.direction ? i : 0);
    if (point.x === shipX && point.y === shipY) {
      return true;
    }
  }
  return false;
};
