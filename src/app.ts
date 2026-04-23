import express, { type Application } from "express";
import path from "node:path";
import storeRoutes from "./store/store.routes.js";

export function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.resolve("public")));
  app.use(express.static('public'));

  app.set("view engine", "ejs");
  app.set("views", path.join(process.cwd(), "views"));

  app.get("/", (_, res) => {
    return res.sendFile(path.resolve("public", "index.html"));
  });

  app.use(storeRoutes);

  return app;
}