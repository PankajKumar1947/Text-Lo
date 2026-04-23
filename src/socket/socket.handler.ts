import { Server } from "socket.io";
import { getStoreContent, updateStoreContent } from "../store/store.service.js";

export function initializeSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log(`Connection Established `);

    socket.on("join-room", async (slug: string) => {
      socket.join(slug);
      console.log("Room joined with slug=" + slug);
      const prevContent = await getStoreContent(slug);
      io.to(slug).emit("receive-message", prevContent);
    });

    socket.on("send-message", async ({ slug, message }: { slug: string; message: string }) => {
      console.log("message received on server= " + message);
      await updateStoreContent(slug, message);
      io.to(slug).emit("receive-message", message);
    });
  });
}