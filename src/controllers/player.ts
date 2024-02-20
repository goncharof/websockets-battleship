export const cmdTypes = ["reg", "update_winners"];
import { type WebSocket } from "ws";
import { save, all } from "../models/player";

const winners: { name: string; wins: number }[] = [];

export const cmds = {
  reg: (
    ws: WebSocket,
    data: Record<string, unknown> & { name: string; ws: WebSocket },
  ) => {
    delete data.password;

    save({ ...data, ws });

    winners.push({ name: data.name, wins: 0 });

    cmds.update_winners();

    data.error = false;
    data.errorText = "";

    ws.send(
      JSON.stringify({
        type: "reg",
        id: 0,
        data: JSON.stringify(data),
      }),
    );
  },

  update_winners: () => {
    all().forEach((player) => {
      player.ws.send(
        JSON.stringify({
          type: "update_winners",
          id: 0,
          data: JSON.stringify(winners),
        }),
      );
    });
  },
};
