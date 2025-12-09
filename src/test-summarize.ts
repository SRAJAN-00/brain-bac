import { summarizeYouTubeVideo } from "./services/summarize";

async function test() {
    // Use the URL from your database
    const url = "https://youtu.be/_ngCLZ5Iz-0?si=6xW4YrpOY4qoBYca";
    
    console.log("🚀 Testing summarization...");
    console.log("📺 URL:", url);
    console.log("---\n");
    
    try {
        const summary = await summarizeYouTubeVideo(url);
        console.log("\n📝 SUMMARY:\n");
        console.log(summary);
    } catch (error: any) {
        console.log("❌ Error:", error.message);
    }
}

test();``