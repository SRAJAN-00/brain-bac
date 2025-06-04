import express from "express";
import mongoose from "mongoose";
import { contentModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import cors from "cors";
import { userMiddleware } from "./middleware";
import { JWT_SECRET, MONGODB_URI } from "./config";
import { Request, Response } from "express";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    await UserModel.create({
      username: username,
      password: password,
    });
    res.json({
      message: "User created successfully",
    });
  } catch (e) {
    res.status(411).json({
      message: "user already exits",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const existingUser = await UserModel.findOne({
    username,
    password,
  });
  if (existingUser) {
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not defined" });
    }
    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_SECRET
    );
    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Invalid username or password",
    });
  }
});

app.post(
  "/api/v1/content",
  userMiddleware,
  async (req: Request, res: Response) => {
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title || "Untitled"; // Default title if not provided
    await contentModel.create({
      link,
      type,
      title,
      //@ts-ignore
      userId: req.userId,
      tags: [],
    });

    res.json({
      message: "content added",
    });
  }
);

app.get(
  "/api/v1/content",
  userMiddleware,
  async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await contentModel
      .find({
        userId: userId,
      })
      .populate("userId", "username");
    res.json({
      content,
    });
  }
);
app.delete(
  "/api/v1/content",
  userMiddleware,
  async (req: Request, res: Response) => {
    const contentId = req.body.contentId;

    await contentModel.deleteOne({
      _id: contentId, // Ensure this matches the MongoDB document's _id
      //@ts-ignore
      userId: req.userId, // Ensure userId is correctly set by userMiddleware
    });

    res.json({ message: "Deleted successfully" });
  }
);

app.listen(3000);
