export const cmdTypes = ["reg"];
import { save, all } from "../models/player";
import { ExtWebSocket } from "../wss";
import { update_room } from "./room";

const winners: { name: string; wins: number }[] = [];

export enum TYPES {
  Reg = "reg",
}

export const reg = (
  ws: ExtWebSocket,
  data: Record<string, unknown> & { name: string },
) => {
  delete data.password;

  const player = save({ ...data, ws });

  ws.playerId = player.index;

  winners.push({ name: data.name, wins: 0 });

  update_winners();

  data.error = false;
  data.errorText = "";

  ws.send(
    JSON.stringify({
      type: "reg",
      id: 0,
      data: JSON.stringify(data),
    }),
  );

  update_room();
};

const update_winners = () => {
  all().forEach((player) => {
    player.ws.send(
      JSON.stringify({
        type: "update_winners",
        id: 0,
        data: JSON.stringify(winners),
      }),
    );
  });
};
