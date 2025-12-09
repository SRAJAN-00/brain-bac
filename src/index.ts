import express from "express";
import mongoose from "mongoose";
import { contentModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import cors from "cors";
import { userMiddleware } from "./middleware";
import { JWT_SECRET, MONGODB_URI, FRONTEND_ORIGIN } from "./config";
import { Request, Response } from "express";
import { GEMINI_API_KEY } from "./config";
import { summarizeYouTubeVideo } from "./services/summarize";

const app = express();
app.use(express.json());

// Configure CORS using FRONTEND_ORIGIN from env. Allows credentials for cookies/auth if needed.
// Allow specifying multiple origins separated by commas in FRONTEND_ORIGIN.
const allowedOrigins = (FRONTEND_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
const corsOptions: cors.CorsOptions = {
  // Use a function to validate origin strings explicitly to avoid treating
  // origin values as Express route patterns (which can trigger path-to-regexp).
  origin: function (origin, callback) {
    // Allow non-browser requests like curl/postman (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
console.log(`[server] CORS configured. allowedOrigins=${JSON.stringify(allowedOrigins)}`);
app.use(cors(corsOptions));
// Note: Removed app.options("*", ...) as it may cause path-to-regexp issues
// CORS middleware already handles preflight requests

app.post("/api/v1/signup", async (req: Request, res: Response) => {
  const username = req.body.username;
  // Do NOT log passwords
  console.log(`[api/signup] attempt - username=${username} ip=${req.ip} time=${new Date().toISOString()}`);
  try {
    await UserModel.create({
      username: username,
      password: req.body.password,
    });
    console.log(`[api/signup] success - username=${username}`);
    res.json({
      message: "User created successfully",
    });
  } catch (e: any) {
    console.error(`[api/signup] error - username=${username} error=${e?.message || e}`);
    // Preserve existing behavior but include server log for debugging
    res.status(411).json({
      message: e?.message?.includes("duplicate") ? "user already exists" : "user already exits",
    });
  }
});

app.post("/api/v1/signin", async (req: any, res: any) => {
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

console.log("[server] Gemini API Key loaded:", GEMINI_API_KEY ? "✅ Yes" : "❌ No");



app.post("/api/v1/content/:id/summarize", userMiddleware, async (req: Request, res: Response): Promise<void> => {

  const {id} = req.params;
  const userId = (req as any).userId;

  try{
    const content = await contentModel.findOne({_id:id,userId:userId})

    if(!content){
      res.status(404).json({message:"Content not found"});
      return;
    }

    if (content.type !== "youtube") {
      res.status(400).json({ message: "Content type not supported for summarization" });
      return;
    }

    // Ensure the link exists and is a string before calling the summarizer
    const link = (content as any).link;
    if (typeof link !== "string" || link.trim() === "") {
      res.status(400).json({ message: "Invalid or missing content link" });
      return;
    }

    const summary = await summarizeYouTubeVideo(link);
    
    res.json({summary:summary});
    return;

  }catch(error:any){
    console.log("summrize eorror:",error);
    res.status(500).json({
      message:"Error during summarization",
      error:error?.message||error
    });
    return;
  }
})

app.listen(3000);
