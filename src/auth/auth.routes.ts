import express, { type Router } from "express";
import { registerUser, loginUser, me } from "./auth.service.js";
import { protectUser, guestUser } from "./auth.middleware.js";
import { validateZod } from "../common/middleware/validate-zod.js";
import { registerSchema, loginSchema } from "./auth.dto.js";

const router: Router = express.Router();

router.post("/register", guestUser, validateZod(registerSchema), registerUser);
router.post("/login", guestUser, validateZod(loginSchema), loginUser);
router.get("/me", protectUser, me);

export default router;