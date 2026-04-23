import mongoose, { model } from "mongoose";

export interface IStore {
  slug: string;
  content?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const storeSchema = new mongoose.Schema<IStore>({
  slug: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: "",
  },
}, { timestamps: true })

const Store = model<IStore>('Store', storeSchema);

export { Store };