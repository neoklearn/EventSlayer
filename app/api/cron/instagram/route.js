import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock fetch logic for Instagram captions
    const mockCaptions = [
      "Datang yuk ke Bandung Anime Fest 2026 di Ciwalk tanggal 15-16 Agustus! HTM cuma 35k.",
      "Cosplay Competition at Braga City Walk, 20 September 2026. Free Entry for all!",
      "J-Rocks Live in Bandung! 10 October 2026 at Sabuga. Tickets available now."
    ];

    if (!apiKey) throw new Error("GEMINI_API_KEY missing");
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const results = [];

    for (const caption of mockCaptions) {
      const prompt = `Ekstrak data event anime dari teks ini ke JSON: ${caption}. Skema: title, description, location_name, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), time, htm.`;
      const aiResult = await model.generateContent(prompt);
      const text = aiResult.response.text().replace(/```json|```/g, "").trim();
      const eventData = JSON.parse(text);

      const saved = await prisma.event.create({
        data: {
          ...eventData,
          approved: false,
          posterUrl: "/placeholder.svg"
        }
      });
      results.push(saved);
    }

    return NextResponse.json({ status: "success", processed: results.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
