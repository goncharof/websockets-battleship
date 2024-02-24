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
  const position = { x, y };

  dbGames[gameId].attacks[playerId].push(position);
  const opponentId = dbGames[gameId].playerIds.find((id) => id !== playerId)!;

  return attackResult(
    dbGames[gameId].ships[opponentId],
    position.x,
    position.y,
  );
};

export const nextPlayer = (gameId: number) => {
  const game = get(gameId);
  dbGames[id].currentPlayer = game.playerIds.find(
    (id) => id !== game.currentPlayer,
  )!

  console.log(game.currentPlayer, 'current player');
  

  return game.currentPlayer
}

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

  for (let i = 0; i < ship.length; i++) {
    // Calculate the positions based on the direction of the ship
    const posX = ship.position.x + (ship.direction ? i : 0);
    const posY = ship.position.y + (ship.direction ? 0 : i);

    // Get all surrounding points for this segment of the ship
    const deltas = [
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: -1 }, // top
      { dx: 0, dy: 1 }, // bottom
      { dx: -1, dy: -1 }, // top-left
      { dx: 1, dy: -1 }, // top-right
      { dx: -1, dy: 1 }, // bottom-left
      { dx: 1, dy: 1 }, // bottom-right
    ];

    deltas.forEach((delta) => {
      const x = posX + delta.dx;
      const y = posY + delta.dy;
      // Check if the new coordinates are inside the board
      if (x >= 0 && y < 10 && y >= 0 && x < 10) {
        surroundingPoints.push({ status: AttackResults.Miss, point: { x, y } });
      }
    });
  }

  const bowAndSternDeltas = ship.direction
    ? [
        { dx: -1, dy: 0 },
        { dx: ship.length, dy: 0 },
      ]
    : [
        { dx: 0, dy: -1 },
        { dx: 0, dy: ship.length },
      ];

  bowAndSternDeltas.forEach((delta) => {
    const x = ship.position.x + delta.dx;
    const y = ship.position.y + delta.dy;
    // Check if the new coordinates are inside the board
    if (x >= 0 && x < 10 && y >= 0 && y < 10) {
      surroundingPoints.push({
        status: AttackResults.Miss,
        point: { x, y },
      });
    }
  });

  return surroundingPoints;
}
