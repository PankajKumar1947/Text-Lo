import mongoose, { Document, model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  email: string;
  password: string;
  plan: 'free' | 'paid';
  planExpiresAt: Date | null;
}

export interface IUserDocument extends IUser, Document { }

const userSchema = new mongoose.Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free',
  },
  planExpiresAt: {
    type: Date,
    default: null,
  },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const UserModel = model<IUserDocument>('User', userSchema);

export default UserModel;
