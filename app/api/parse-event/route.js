import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Fallback to local env variables if needed
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    const { rawCaption, sourceUrl } = await req.json();

    if (!rawCaption) {
      return NextResponse.json(
        { status: "error", message: "Caption is required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "mock",
          is_anime_event: true,
          event_data: {
            title: "[MOCK EVENT] Cosplay Festival Bandung 2026",
            description: "Silakan masukkan GEMINI_API_KEY di file .env untuk mengaktifkan AI asli. Ini adalah data demo.",
            location_name: "Bandung Electronic Center (BEC)",
            start_date: "2026-06-15",
            end_date: "2026-06-16",
            source_url: sourceUrl || ""
          }
        }
      );
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Ekstrak caption Instagram berikut ini:\n\n${rawCaption}`,
      config: {
        systemInstruction:
          "Kamu adalah Event Slayer Analyzer, asisten AI yang bertugas mengekstrak dan merapikan informasi event anime dari teks caption media sosial (Instagram) menjadi data terstruktur JSON yang siap dimasukkan ke database.\n\n" +
          "Aturan Output:\n" +
          "1. Fokus Konten: Hanya proses event anime, jejepangan, cosplay, dan pop culture. Set is_anime_event = false jika caption bukan event komunitas jejepangan.\n" +
          "2. Ekstraksi Tanggal: Ubah format tanggal menjadi ISO Standar (YYYY-MM-DD). Jika tahun tidak disebutkan, asumsikan tahun 2026.\n" +
          "3. Ekstraksi Lokasi: Ambil nama tempat spesifik.\n" +
          "4. Bahasa: Gunakan Bahasa Indonesia yang jelas dan informatif untuk deskripsi.\n" +
          "5. KOTA BANDUNG ONLY: Khususkan hanya untuk event di wilayah Bandung dan sekitarnya. Jika event di luar Bandung, set is_anime_event = false.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            status: { type: "STRING" },
            is_anime_event: { type: "BOOLEAN" },
            event_data: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                description: { type: "STRING" },
                location_name: { type: "STRING" },
                start_date: { type: "STRING" },
                end_date: { type: "STRING" },
              },
              required: ["title", "location_name", "start_date"],
            },
          },
          required: ["is_anime_event"],
        },
      },
    });

    const result = JSON.parse(response.text);

    if (result.event_data) {
      result.event_data.source_url = sourceUrl || "";
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
