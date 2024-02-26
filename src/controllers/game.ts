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
import { update_winners } from "./player";

export enum TYPES {
  AddShips = "add_ships",
  Attack = WsMsgTypes.Attack,
  RandomAttack = WsMsgTypes.RandomAttack,
}

export const add_ships = (data: {
  gameId: number;
  indexPlayer: number;
  ships: [];
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

    turn(game.id);
  }
};

export const turn = (gameId: number) => {
  const { playerIds, currentPlayer } = get(gameId);

  playerIds.forEach((playerId) => {
    sendWsMessage(getPlayer(playerId).ws, WsMsgTypes.Turn, { currentPlayer });
  });
};

export const onAttack = ({
  gameId,
  indexPlayer,
  x,
  y,
}: {
  gameId: number;
  indexPlayer: number;
  x?: number;
  y?: number;
}) => {
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

  if (results.some((result) => result.status === AttackResults.Finish)) {
    game.playerIds.forEach((playerId) => {
      sendWsMessage(getPlayer(playerId).ws, WsMsgTypes.Finish, {
        winPlayer: game.currentPlayer,
      });
    });

    rm(gameId);

    update_winners(game.currentPlayer);

    return;
  }

  if (results.every((result) => result.status === AttackResults.Miss)) {
    nextPlayer(gameId);
  }

  turn(gameId);
};

export const onPlayerDissconect = (playerId: number) => {
  const winPlayer = disconect(playerId);

  if (winPlayer) {
    sendWsMessage(getPlayer(winPlayer).ws, WsMsgTypes.Finish, { winPlayer });
    update_winners(winPlayer);
  }
};
