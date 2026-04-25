import express, { type Application } from "express";
import path from "node:path";
import storeRoutes from "./store/store.routes.js";
import authRoutes from "./auth/auth.routes.js";
import { errorHandler } from "./common/middleware/error-handler.js";
import { guestUser } from "./auth/auth.middleware.js";

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

  app.get("/login", guestUser, (_, res) => {
    return res.sendFile(path.resolve("public", "pages", "login.html"));
  });

  app.get("/register", guestUser, (_, res) => {
    return res.sendFile(path.resolve("public", "pages", "register.html"));
  });

  app.get("/start", (_, res) => {
    return res.sendFile(path.resolve("public", "pages", "index.html"));
  });

  app.get("/dashboard", (_, res) => {
    return res.sendFile(path.resolve("public", "pages", "dashboard.html"));
  });

  app.use("/api/v1/auth", authRoutes);
  app.use(storeRoutes);

  app.use(errorHandler);

  return app;
}