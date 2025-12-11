import 'dotenv/config';
import mongoose, { model, Schema } from "mongoose";
import { MONGODB_URI } from "./config";

// Connect using the centralized config value (reads from process.env via dotenv)
mongoose.connect(MONGODB_URI);
const userSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
});
export const UserModel = model("User", userSchema);

const contentSchema = new Schema({
  link: String,
  title: String,
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  type: String,
  notes: { type: String, default: "" },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});
export const contentModel = model("Content", contentSchema);
