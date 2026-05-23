import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

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

    const { rawCaption } = await req.json();

    if (!rawCaption) {
      return NextResponse.json(
        { status: "error", message: "Caption is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a strict, objective Data Extraction Engine. Your sole task is to parse the provided raw text description and map the information into a structured JSON object. Do not judge, filter, or reject the input text based on its theme, category, or relevance. Whether it is an anime event, a general concert, a meeting, or random text, you MUST process it and always return the completed JSON object. If a piece of information is missing, set its value to null (or an empty array [] for performers). Do not invent fake data."
    });

    const generationConfig = {
      responseMimeType: "application/json",
      temperature: 0.1,
    };

    const prompt = `Parse the following text and extract event information into JSON format.
    
    Required JSON Schema:
    {
      "title": "String (Short descriptive title)",
      "date": "String (Event date, e.g., '24 Mei 2026')",
      "time": "String (Operational hours, e.g., '10:00 - 18:00')",
      "location": "String (Venue or address)",
      "description": "String (Concise summary)",
      "performers": ["Array of Strings (Guests, MCs, etc.)"],
      "cropX": 50,
      "cropY": 50
    }

    Input Text:
    ${rawCaption}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    let text = response.text();
    
    // Robust JSON Parsing & Sanitization
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const eventData = JSON.parse(text);
      return NextResponse.json({ 
        status: "success", 
        event_data: eventData 
      });
    } catch (parseError) {
      console.error("JSON Parsing Error in parse-event:", parseError, "Raw response text:", text);
      return NextResponse.json(
        { status: "error", message: "Failed to parse AI response as valid JSON" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Runtime Error in parse-event:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
