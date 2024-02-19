import { WebSocketServer } from "ws";

// Initialize a WebSocket server instance
export const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", function connection(ws) {
  // Listen for messages from clients
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });

  // Send a message to the client
  ws.send("Hello! You are connected to the server.");
});

console.log("WebSocket server is running on ws://localhost:3000");
