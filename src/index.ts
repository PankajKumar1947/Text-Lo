import { createServer } from "node:http";
import { Server } from "socket.io";
import dbConnect from "./common/config/db-connection.js";
import { dotEnv } from "./common/config/dotenv.js";
import { createApp } from "./app.js";
import { initializeSocketHandlers } from "./socket/socket.handler.js";

const app = createApp();
const server = createServer(app);
const io = new Server(server);

dbConnect(dotEnv.MONGO_URI);
initializeSocketHandlers(io);

server.listen(dotEnv.PORT, () => {
  console.log(`Server is running on PORT: ${dotEnv.PORT}`);
});