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
    ships: {},
    attacks: { [id1]: [], [id2]: [] },
    currentPlayer: id1,
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

const attackResult = (ships: Ship[], shotX: number, shotY: number) => {
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
          if (ships.every((ship) => ship.hits?.length === ship.length)) {
            console.log("all ships are destroyed");
          }

          return [
            { status: AttackResults.Killed, point: { x: shotX, y: shotY } },
            ...getSurroundingPointsForShip(ship),
          ];
        } else {
          return [
            {
              status: AttackResults.Shot,
              point: { x: shotX, y: shotY },
            },
          ];
        }
      }
    }
  }

  return [
    {
      status: AttackResults.Miss,
      point: { x: shotX, y: shotY },
    },
  ];
};

function getSurroundingPointsForShip(ship: Ship) {
  const surroundingPoints: {
    status: AttackResults.Miss;
    point: { x: number; y: number };
  }[] = [];

  // Define horizontal and vertical offsets for adjacent points
  const adjacentOffsets = [
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // top
    { dx: 0, dy: 1 }, // bottom
  ];

  // Iterate over the length of the ship to get the adjacent points
  for (let i = 0; i < ship.length; i++) {
    // Calculate the current segment position based on direction
    const posX = ship.position.x + (ship.direction ? 0 : i);
    const posY = ship.position.y + (ship.direction ? i : 0);

    // Get adjacent points for the current segment
    adjacentOffsets.forEach((offset) => {
      const adjacentPoint = { x: posX + offset.dx, y: posY + offset.dy };
      // Check if the adjacent point is inside the board boundaries
      if (
        adjacentPoint.x >= 0 &&
        adjacentPoint.x < 10 &&
        adjacentPoint.y >= 0 &&
        adjacentPoint.y < 10
      ) {
        // Prevent duplicates by checking if the point is already in the array
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
          });
        }
      }
    });
  }

  // Get the bow and stern positions for the adjacent points
  const bowAndSternOffsets = ship.direction
    ? [
        { dx: 0, dy: -1 },
        { dx: 0, dy: ship.length },
      ] // Vertical
    : [
        { dx: -1, dy: 0 },
        { dx: ship.length, dy: 0 },
      ]; // Horizontal

  bowAndSternOffsets.forEach((offset) => {
    const bowOrSternPoint = {
      x: ship.position.x + offset.dx,
      y: ship.position.y + offset.dy,
    };
    // Check if the point is inside the board boundaries
    if (
      bowOrSternPoint.x >= 0 &&
      bowOrSternPoint.x < 10 &&
      bowOrSternPoint.y >= 0 &&
      bowOrSternPoint.y < 10
    ) {
      // Prevent duplicates by checking if the point is already in the array
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
        });
      }
    }
  });

  return surroundingPoints;
}

// function isShipDestroyed(ship: Ship): boolean {
//   if (!ship.hits || ship.hits.length < ship.length) {
//     return false;
//   }

//   // Check if all possible positions of the ship have been hit
//   const shipPoints = new Set<string>();
//   for (let i = 0; i < ship.length; i++) {
//     const point = ship.direction
//       ? `${ship.position.x}:${ship.position.y + i}`
//       : `${ship.position.x + i}:${ship.position.y}`;
//     shipPoints.add(point);
//   }

//   // Check if all points are in the hits array
//   for (const hit of ship.hits) {
//     shipPoints.delete(`${hit.x}:${hit.y}`);
//   }

//   // If all points are hit, shipPoints set should be empty
//   return shipPoints.size === 0;
// }
