import express, { type Router } from "express";
import { isSlugExist, createSlug } from "./store.service.js";

const router: Router = express.Router();

router.get("/health", (_, res) => {
  res.send("----------Server is Running------------");
});

router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;

  if (slug === "js" || slug.startsWith("js/") || slug === "css" || slug.startsWith("css/") ||
    slug === "socket.io" || slug.startsWith("socket.io/")) {
    return res.status(404).send("Not Found");
  }

  const slugExist = await isSlugExist(slug);

  if (!slugExist) {
    await createSlug(slug);
  }

  res.render("playground", { slug });
});

export default router;