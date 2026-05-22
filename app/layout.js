import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Event Slayer | Bandung Pop Culture & Anime Events Hub",
  description: "Daftar terlengkap event Jejepangan, Cosplay, Comic Con, dan Festival di kota Bandung yang diekstrak langsung dengan teknologi Gemini AI.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-black dark:bg-black dark:text-white" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        {/* Simple Monochrome Footer */}
        <footer className="w-full bg-white border-t border-black py-8 select-none dark:bg-black dark:border-white">
          <div className="max-w-7xl mx-auto px-4 text-center font-mono text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} EVENT SLAYER. SHARP BORDERS & MONOCHROME SPECIFICATION.
          </div>
        </footer>
      </body>
    </html>
  );
}
