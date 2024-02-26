import { ExtWebSocket } from "../wss";

export enum WsMsgTypes {
  Reg = "reg",
  CreateRoom = "create_room",
  AddUserToRoom = "add_user_to_room",
  StartGame = "start_game",
  UpdateWinners = "update_winners",
  UpdateRoom = "update_room",
  CreateGame = "create_game",
  Turn = "turn",
  Attack = "attack",
  RandomAttack = "randomAttack",
  Finish = "finish",
}

export const sendWsMessage = (
  ws: ExtWebSocket,
  type: WsMsgTypes,
  data: object,
) => {
  console.log(
    `Send message to client \x1b[32m${ws.playerId}\x1b[0m: \x1b[32m${type}\x1b[0m with data: \x1b[32m${JSON.stringify(data)}\x1b[0m`,
  );

  ws.send(
    JSON.stringify({
      type,
      id: 0,
      data: JSON.stringify(data),
    }),
  );
};
