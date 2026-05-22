## Proyek Overview & Tech Stack

- Nama Proyek: Event Slayer
- Fokus Komunitas: Event Pop Culture & Anime (Cosplay, Comic Con, J-Festival)
- Framework: Next.js (App Router) - **Strictly JavaScript (.jsx)**
- Package Manager: pnpm
- UI Library: shadcn/ui (configured via components.json)
- Database: PostgreSQL (via Prisma ORM)
- AI Engine: Google Gen AI SDK (@google/genai)
- Model: gemini-2.5-flash
- Design System: Monochrome, 1px sharp borders (as per DESIGN.md)

---

## Aturan Pengembangan (Development Rules)

1. **JavaScript Only**: Seluruh kode WAJIB ditulis dalam JavaScript (.jsx / .js). DILARANG menggunakan TypeScript atau sintaks khusus tipe.
2. **File Configuration**: Jangan berasumsi adanya `tsconfig.json` atau `next-env.d.ts`. Gunakan konfigurasi standar dari `next.config.mjs` dan `postcss.config.mjs`.
3. **Styling**: Konsisten dengan sistem desain monokrom, border tajam 1px, dan layout responsif. Gunakan Vanilla CSS atau Tailwind CSS sesuai pola yang sudah ada.
4. **Shadcn/UI**: Gunakan komponen shadcn/ui yang sudah terkonfigurasi di folder `components/ui`.

---

## Perilaku AI & System Instructions

Gunakan instruksi di bawah ini pada parameter systemInstruction saat melakukan inisialisasi Gemini API.

### System Instruction Persona
Kamu adalah Event Slayer Analyzer, asisten AI yang bertugas mengekstrak dan merapikan informasi event anime dari teks caption media sosial (Instagram) menjadi data terstruktur JSON yang siap dimasukkan ke database.

Aturan Output:
1. Fokus Konten: Kamu hanya memproses event yang berkaitan dengan komunitas anime, jejepangan, cosplay, dan pop culture. Jika teks bukan merupakan info event tersebut, kembalikan JSON kosong atau error flag.
2. Format Output: Kamu WAJIB mengembalikan data dalam format JSON murni tanpa Markdown, tanpa teks pembuka, dan tanpa teks penutup.
3. Ekstraksi Tanggal: Ubah format tanggal yang ditemukan di caption menjadi format ISO Standar (YYYY-MM-DD). Jika tahun tidak disebutkan, asumsikan tahun berjalan (2026).
4. Ekstraksi Lokasi: Ambil nama tempat spesifik untuk kebutuhan query Google Maps.
5. Bahasa: Gunakan Bahasa Indonesia yang jelas dan informatif untuk penulisan ulang deskripsi.
6. Khususkan Event yang berada di wilayah Bandung dan sekitarnya saja.

---

## Skema JSON yang Diharapkan (Structured Output)

{
"status": "success",
"is_anime_event": true,
"event_data": {
"title": "Nama Event Anime",
"description": "Deskripsi singkat yang sudah dirapikan oleh AI.",
"location_name": "Nama Tempat Spesifik",
"start_date": "YYYY-MM-DD",
"end_date": "YYYY-MM-DD",
"source_url": "URL asal"
}
}

---

## Contoh Implementasi Code (Next.js API Route)

File ini ditempatkan pada `app/api/parse-event/route.js` menggunakan fitur Structured Outputs dari Gemini.

```javascript
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { rawCaption, sourceUrl } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Ekstrak caption Instagram berikut ini:\n\n${rawCaption}`,
      config: {
        systemInstruction:
          "Kamu adalah Event Slayer Analyzer. Ekstrak data event anime dari teks menjadi JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            is_anime_event: { type: Type.BOOLEAN },
            event_data: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                location_name: { type: Type.STRING },
                start_date: { type: Type.STRING },
                end_date: { type: Type.STRING },
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
      { status: 500 },
    );
  }
}
```

---

## Integrasi Frontend (Laman Schedule)

Logika pembuatan tautan Google Maps dan Google Calendar dilakukan langsung di sisi klien/frontend untuk menghemat token AI.

1. Tautan Google Maps:
   const gMapsUrl = `[https://www.google.com/maps/search/?api=1&query=$](https://www.google.com/maps/search/?api=1&query=$){encodeURIComponent(event.location_name)}`;

2. Tautan Google Calendar:
   const start = event.start_date.replace(/-/g, "");
   const gCalUrl = `[https://calendar.google.com/calendar/render?action=TEMPLATE&text=$](https://calendar.google.com/calendar/render?action=TEMPLATE&text=$){encodeURIComponent(event.title)}&dates=${start}/${start}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location_name)}`;
