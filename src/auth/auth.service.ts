import type { Request, Response } from "express";
import ApiError from "../common/utils/api-error.js";
import UserModel from "./user.model.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../common/utils/token.js";
import ApiResponse from "../common/utils/api-response.js";

const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const emailExist = await UserModel.findOne({ email });
  if (emailExist) {
    throw ApiError.conflict("Email Already Exist");
  }

  await UserModel.create({ email, password, plan: 'free', planExpiresAt: null });
  return ApiResponse.created(res, "User Registered");
}

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw ApiError.notFound("User Not Found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid Password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return ApiResponse.ok(res, "Login Successful", { accessToken, refreshToken });
}

const me = async (req: Request, res: Response) => {
  const user = req.user;
  return ApiResponse.ok(res, "User Fetched", user);
}

export { registerUser, loginUser, me }