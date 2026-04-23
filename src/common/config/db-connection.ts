import mongoose from "mongoose";

async function dbConnect(uri: string) {
  try {
    if (!uri) {
      throw new Error("Mongo URI is required");
    }
    await mongoose.connect(uri);
    return mongoose.connection;

  } catch (error) {
    console.log("DB Connection Failed", error);
    process.exit(1);
  }
}

export default dbConnect;