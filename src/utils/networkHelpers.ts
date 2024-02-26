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
  ws.send(
    JSON.stringify({
      type,
      id: 0,
      data: JSON.stringify(data),
    }),
  );
};
