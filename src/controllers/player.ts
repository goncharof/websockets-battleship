export const cmdTypes = ['reg', 'update_winners']
import { randomUUID } from "crypto";
import { type WebSocket } from "ws";

const players = [];

export const cmds = {
  reg: (ws: WebSocket, data: Record<string, any>) => {
    players.push({ ...data.data, id: randomUUID()});

    delete data.data.password;
    data.index = players.length - 1;
    data.error = false;
    data.errorText = '';

    ws.send(JSON.stringify(data));
  },
}