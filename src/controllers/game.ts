import { addShips, attack, get, nextPlayer } from "../models/game";
import { get as getPlayer } from "../models/player";
import { WsMsgTypes, sendWsMessage } from "../utils/networkHelpers";

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
  console.log("onAttack", { gameId, indexPlayer, x, y });

  const game = get(gameId);

  const playerAttacks = game.attacks[indexPlayer];

  if (Number.isNaN(x) || Number.isNaN(y)) {
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
      console.log('currentplayerId!!!!!', game.currentPlayer);
      
      sendWsMessage(getPlayer(playerId).ws, WsMsgTypes.Attack, {
        position: result.point,
        status: result.status,
        currentPlayer: game.currentPlayer,
      });
    });
  });

  nextPlayer(gameId);

  turn(gameId);
};
