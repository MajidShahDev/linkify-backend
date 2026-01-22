import mongoose from "mongoose";

export default async function connectMongoDb(url) {
  return mongoose.connect(url);
}
