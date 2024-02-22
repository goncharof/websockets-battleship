import { addShips } from "../models/game";
import { get } from "../models/player";
import { WsMsgTypes, sendWsMessage } from "../utils/networkHelpers";

export enum TYPES {
  AddShips = "add_ships",
}

export const add_ships = (data: {
  gameId: number;
  indexPlayer: number;
  ships: [];
}) => {
  const game = addShips(data, data.indexPlayer);

  if (Object.keys(game.ships).length === game.playerIds.length) {
    Object.keys(game.ships).forEach((playerId) => {
      sendWsMessage(get(Number.parseInt(playerId)).ws, WsMsgTypes.StartGame, {
        ships: data.ships,
        currentPlayerIndex: Number.parseInt(playerId),
      });
    });
  }
};
