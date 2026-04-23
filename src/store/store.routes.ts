import express, { type Router } from "express";
import path from "node:path";
import { isSlugExist, createSlug } from "./store.service.js";

const router: Router = express.Router();

router.get("/health", (_, res) => {
  res.send("Server is Running");
});

router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  const slugExist = await isSlugExist(slug);

  if (!slugExist) {
    await createSlug(slug);
  }

  res.render("playground", { slug });
});

export default router;