import express, { type Application, type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import storeRoutes from "./store/store.routes.js";
import authRoutes from "./auth/auth.routes.js";
import { errorHandler } from "./common/middleware/error-handler.js";

export function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.resolve("public")));
  app.use(express.static('public'));

  app.set("view engine", "ejs");
  app.set("views", path.join(process.cwd(), "views"));

  app.get("/", (_, res) => {
    return res.sendFile(path.resolve("public", "pages", "index.html"));
  });

  app.get("/login", (_, res) => {
    return res.sendFile(path.resolve("public", "pages", "login.html"));
  });

  app.get("/register", (_, res) => {
    return res.sendFile(path.resolve("public", "pages", "register.html"));
  });

  app.use("/api/auth", authRoutes);
  app.use(storeRoutes);

  app.use(errorHandler);

  return app;
}