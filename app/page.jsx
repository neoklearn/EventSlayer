"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full flex-1 flex flex-col bg-white dark:bg-black select-none">
      {/* Hero Section (Manga Grid Style) */}
      <section className="relative w-full border-b-2 border-black dark:border-white manga-grid-bg py-32 md:py-48 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex gap-2 items-center bg-black text-white px-4 py-1.5 border border-black font-mono text-xs font-bold tracking-[0.2em] mb-8 dark:bg-white dark:text-black dark:border-white">
            <Sparkles className="h-4 w-4" /> POP CULTURE HUB
          </div>
          
          <h1 className="font-sans text-6xl sm:text-8xl md:text-[12rem] font-black tracking-tighter leading-tight text-black dark:text-white uppercase mb-12 flex flex-col items-center">
            <span className="block">EVENT</span>
            <span className="bg-black text-white px-6 py-4 block mt-2 dark:bg-white dark:text-black">SLAYER</span>
          </h1>

          <div className="max-w-2xl border-t border-b border-black py-8 mb-12 dark:border-white">
            <p className="font-mono text-sm md:text-lg font-bold text-black dark:text-white leading-relaxed uppercase tracking-tight">
              Platform monitoring dan kurasi event anime, cosplay, dan pop culture di Kota Bandung. 
              Didukung oleh teknologi ekstraksi AI untuk jadwal yang presisi dan terstruktur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <a
              href="https://wa.me/6281234567890" // Placeholder WhatsApp Admin
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white text-center font-mono text-base font-bold tracking-widest px-12 py-6 border-2 border-black hover:bg-white hover:text-black transition-all duration-0 dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white"
            >
              [JOIN US]
            </a>
            <Link
              href="/schedule"
              className="bg-white text-black text-center font-mono text-base font-bold tracking-widest px-12 py-6 border-2 border-black hover:bg-black hover:text-white transition-all duration-0 dark:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center gap-3"
            >
              VIEW SCHEDULE <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="font-sans text-3xl font-black uppercase mb-8 tracking-tight">Visi & Pergerakan</h2>
        <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400 leading-loose">
          Event Slayer hadir sebagai pusat informasi taktis bagi komunitas kreatif di Bandung. 
          Kami percaya bahwa setiap festival, kompetisi cosplay, dan pasar doujin adalah nadi dari 
          ekosistem pop culture yang harus terus dijaga keteraturannya. Dengan sistem ekstraksi data 
          otomatis, kami memastikan tidak ada agenda yang terlewatkan oleh para slayer.
        </p>
      </section>
    </div>
  );
}
