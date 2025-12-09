import { Innertube } from "youtubei.js";

import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

import { GEMINI_API_KEY } from "../config";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function 1: Extract video ID from YouTube URL
// "https://youtu.be/_ngCLZ5Iz-0" → "_ngCLZ5Iz-0"
// "https://youtube.com/watch?v=_ngCLZ5Iz-0" → "_ngCLZ5Iz-0"
export function getVideoId(url: string): string | null {
const regex= /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/;
const match=url.match(regex)
return match ? match[1].split("?")[0] : null;


}
export async function getTranscript(vidioId:string):Promise<string>{  
    const youtube = await Innertube.create();
    const info =await youtube.getInfo(vidioId)
    const transcriptData=await info.getTranscript();
    const segments = transcriptData?.transcript?.content?.body?.initial_segments || [];
    const text=segments.map((seg:any)=>seg.snippet?.text ||"").filter((t:string)=>t.length>0).join(" ");
    return text;
}

export async function summerizeWithAI(transcript: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(`Summarize this YouTube video in 3-5 bullet points. Be clear and concise:\n\n${transcript.substring(0,10000)}`);
        const response = await result.response;
        return response.text() || "Could not generate summary";
    } catch (error) {
        console.error("AI summarization error:", error);
        throw new Error("Failed to generate AI summary");
    }
}
export async function summarizeYouTubeVideo(url:    string): Promise<string> {
    const videoId = getVideoId(url);
    if (!videoId) {
        throw new Error("Invalid YouTube URL");
    }
    const transcript = await getTranscript(videoId);
    if (!transcript) {
        throw new Error("Could not retrieve transcript");
    }
    const summary = await summerizeWithAI(transcript);
    console.log("✅ Summary generated!");
    return summary;
    
}