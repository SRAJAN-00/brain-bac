
import dotenv from "dotenv";

// Load .env file first
dotenv.config();

import { GEMINI_API_KEY } from "./config";
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("API Key loaded:", GEMINI_API_KEY ? "✅ Yes" : "❌ No");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function main() {
  const modelNames = ["models/gemini-pro", "models/gemini-1.5-flash", "models/gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"];
  
  for (const modelName of modelNames) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("who are you");
      const response = await result.response;
      console.log(`✅ Success with ${modelName}!`);
      console.log("Response:", response.text());
      break;
    } catch (error: any) {
      console.log(`❌ Failed with ${modelName}: ${error.message}`);
    }
  }
}

main();