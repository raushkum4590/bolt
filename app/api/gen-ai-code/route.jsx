import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const {prompt} = await req.json();
    try {
        const result = await GenAiCode.sendMessage(prompt);
        const resp = await result.response.text();
        
        // Try to parse the response as JSON, with better error handling
        let jsonResponse;
        try {
            // First try to parse the full response
            jsonResponse = JSON.parse(resp);
        } catch (parseError) {
            // If direct parsing fails, try to extract JSON from the response
            // This handles cases where the model might wrap JSON in markdown code blocks
            const jsonMatch = resp.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    jsonResponse = JSON.parse(jsonMatch[1]);
                } catch (nestedError) {
                    console.error("Failed to parse extracted JSON:", nestedError);
                    throw new Error("Invalid JSON in AI model response");
                }
            } else {
                console.error("Failed to parse AI response as JSON:", parseError);
                throw new Error("Could not extract valid JSON from AI model response");
            }
        }
        
        return NextResponse.json(jsonResponse);
    } catch(e) {
        console.error("Error generating AI code:", e);
        return NextResponse.json({ 
            error: e.message || "An error occurred",
            files: {} // Return an empty files object as a fallback
        }, { status: 500 });
    }
}