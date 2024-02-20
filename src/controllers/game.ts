import { addShips } from "../models/game";
import { get } from "../models/player";

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
      get(Number.parseInt(playerId)).ws.send(
        JSON.stringify({
          type: "start_game",
          data: JSON.stringify({
            ships: data.ships,
            currentPlayerIndex: Number.parseInt(playerId),
          }),
          id: 0,
        }),
      );
    });
  }
};
