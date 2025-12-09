export const JWT_SECRET = process.env.JWT_SECRET || "!123123";
// Read MongoDB connection string from env; fall back to local Mongo for dev
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/brainly";
// Frontend origin for CORS. Set to '*' to allow any origin, or set to your frontend URL (e.g. http://localhost:5173)
export const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://brain-1.vercel.app,http://localhost:5173,http://localhost:5174";
// Google Gemini API Key for AI summarization
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
