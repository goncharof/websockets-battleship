import { Point } from "../database/db";
import {
  AttackResults,
  addShips,
  attack,
  disconect,
  get,
  nextPlayer,
  rm,
} from "../models/game";
import { get as getPlayer } from "../models/player";
import { WsMsgTypes, sendWsMessage } from "../utils/networkHelpers";
import { BOT_ID } from "./bot";
import { onUpdateWinners } from "./player";

export enum TYPES {
  AddShips = "add_ships",
  Attack = WsMsgTypes.Attack,
  RandomAttack = WsMsgTypes.RandomAttack,
}

export const onAddShips = (data: {
  gameId: number;
  indexPlayer: number;
  ships: {
    position: Point;
    direction: boolean;
    type: string;
    length: number;
  }[];
}) => {
  const game = addShips(data, data.indexPlayer);

  if (Object.keys(game.ships).length === game.playerIds.length) {
    Object.keys(game.ships).forEach((playerId) => {
      sendWsMessage(
        getPlayer(Number.parseInt(playerId)).ws,
        WsMsgTypes.StartGame,
        {
          ships: data.ships,
          currentPlayerIndex: Number.parseInt(playerId),
        },
      );
    });

    console.log(`Game ${data.gameId} started`);

    onTurn(game.id);
  }

  console.log(`Player ${data.indexPlayer} added ships to game ${data.gameId}`);
};

export const onTurn = (gameId: number) => {
  const { playerIds, currentPlayer } = get(gameId);

  playerIds.forEach((playerId) => {
    sendWsMessage(getPlayer(playerId).ws, WsMsgTypes.Turn, { currentPlayer });
  });

  console.log(`Player ${currentPlayer} turn`);

  if (currentPlayer == BOT_ID) {
    setTimeout(() => {
      onAttack({ gameId, indexPlayer: BOT_ID });
    }, 1000);
  }
};

export const onAttack = ({
  gameId,
  indexPlayer,
  x,
  y,
}: {
  gameId: number;
  indexPlayer?: number;
} & Partial<Point>) => {
  const game = get(gameId);

  if (game.currentPlayer !== indexPlayer) return;

  const playerAttacks = game.attacks[indexPlayer];

  if (isNaN(x!) || isNaN(y!)) {
    while (true) {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      if (!playerAttacks.some((pos) => pos.x === x && pos.y === y)) {
        break;
      }
    }
  }

  console.log(`Player ${indexPlayer} attack x:${x} y:${y}`);

  const results = attack(gameId, indexPlayer, x!, y!);

  results.forEach((result) => {
    game.playerIds.forEach((playerId) => {
      sendWsMessage(getPlayer(playerId).ws, WsMsgTypes.Attack, {
        position: result.point,
        status: result.status,
        currentPlayer: game.currentPlayer,
      });
    });
  });

  if (results.some((result) => result.finish)) {
    game.playerIds.forEach((playerId) => {
      sendWsMessage(getPlayer(playerId).ws, WsMsgTypes.Finish, {
        winPlayer: game.currentPlayer,
      });
    });

    rm(gameId);

    onUpdateWinners(game.currentPlayer);

    console.log(`Game ${gameId} finished, player ${game.currentPlayer} win`);

    return;
  }

  if (results.every((result) => result.status === AttackResults.Miss)) {
    nextPlayer(gameId);
  }

  onTurn(gameId);
};

export const onPlayerDissconect = (playerId: number) => {
  const winPlayer = disconect(playerId);

  if (winPlayer) {
    sendWsMessage(getPlayer(winPlayer).ws, WsMsgTypes.Finish, { winPlayer });
    onUpdateWinners(winPlayer === BOT_ID ? undefined : winPlayer);
  }
};
