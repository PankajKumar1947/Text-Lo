import jsonwebtoken from "jsonwebtoken";
import { dotEnv } from "../config/dotenv.js";
import type { IUser } from "../../auth/user.model.js";

const generateAccessToken = (user: IUser) => {
  return jsonwebtoken.sign({ user }, dotEnv.JWT_SECRET, { expiresIn: "1d" });
}

const verifyToken = (token: string) => {
  return jsonwebtoken.verify(token, dotEnv.JWT_SECRET) as { user: IUser };
}

const generateRefreshToken = (user: IUser) => {
  return jsonwebtoken.sign({ user }, dotEnv.JWT_SECRET, { expiresIn: "7d" });
}

export { generateAccessToken, verifyToken, generateRefreshToken };