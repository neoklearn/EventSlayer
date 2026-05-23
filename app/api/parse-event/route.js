export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Runtime Error in parse-event: GEMINI_API_KEY is not configured on Vercel");
      return NextResponse.json(
        { status: "error", message: "GEMINI_API_KEY is not configured on Vercel" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const promptText = body.rawCaption || body.promptText;

    if (!promptText) {
      return NextResponse.json(
        { status: "error", message: "Prompt text or raw caption is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    
    const systemInstruction = `You are a strict, objective Data Extraction Engine. 
    Your sole task is to parse the provided raw text description and map the information into a structured JSON object. 
    Focus on anime event details: title, date, time, location, performers, mc, coswalk.
    Always return the completed JSON object. If a piece of information is missing, set its value to null (or an empty array [] for performers). 
    Do not invent fake data. Return strictly raw JSON without markdown blocks.`;

    let lastError = null;
    let finalResultText = "";

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: systemInstruction
        });

        const generationConfig = {
          responseMimeType: "application/json",
          temperature: 0.1,
        };

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig,
        });

        const response = await result.response;
        finalResultText = response.text();
        
        if (finalResultText) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed, trying next candidate...`, err.message);
      }
    }

    if (!finalResultText) {
      console.error("All models in the array failed. Final trace:", lastError);
      return NextResponse.json(
        { status: "error", message: lastError?.message || "All fallback models failed" },
        { status: 500 }
      );
    }

    // JSON Sanitization & Output
    let sanitizedText = finalResultText.trim();
    sanitizedText = sanitizedText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const eventData = JSON.parse(sanitizedText);
      return NextResponse.json({ 
        status: "success", 
        event_data: eventData 
      });
    } catch (parseError) {
      console.error("JSON Parsing Error in parse-event:", parseError, "Raw response text:", sanitizedText);
      return NextResponse.json(
        { status: "error", message: "Failed to parse AI response as valid JSON" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Critical Runtime Error in parse-event:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
