import { addShips, attack, get } from "../models/game";
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

    turn(game.id, game.playerIds[0]);
  }
};

export const turn = (gameId: number, currentPlayer: number) => {
  const game = get(gameId);

  game.playerIds.forEach((playerId) => {
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

  const { attacks } = get(gameId);

  const playerAttacks = attacks[indexPlayer];

  if (Number.isNaN(x) || Number.isNaN(y)) {
    while (true) {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      if (!playerAttacks.some((pos) => pos.x === x && pos.y === y)) {
        break;
      }
    }
  }

  console.log(attack(gameId, indexPlayer, x!, y!));
};
