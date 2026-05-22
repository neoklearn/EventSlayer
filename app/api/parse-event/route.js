import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    const { rawCaption } = await req.json();

    if (!rawCaption) {
      return NextResponse.json(
        { status: "error", message: "Caption is required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { status: "error", message: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analisis teks berikut dan ekstrak detail event pop-culture (anime, cosplay, jejepangan). 
    Kembalikan data dalam format JSON murni tanpa markdown.
    Gunakan skema berikut:
    {
      "title": "Nama Event",
      "description": "Deskripsi singkat yang rapi",
      "location_name": "Nama Tempat Spesifik",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "time": "HH:MM - HH:MM",
      "htm": "Harga Tiket atau Gratis"
    }

    Jika tahun tidak disebutkan, asumsikan 2026.
    Teks: ${rawCaption}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    const eventData = JSON.parse(text);

    return NextResponse.json({ 
      status: "success", 
      is_anime_event: true,
      event_data: eventData 
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
