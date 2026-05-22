"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "DASHBOARD", href: "/" },
    { name: "SCHEDULE", href: "/schedule" },
    { name: "MANAGEMENT", href: "/management" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-black text-black select-none dark:bg-black dark:border-white dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Brand - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              {/* Bagian Icon diubah menggunakan Next Image */}
              <div className="p-1 transition-all duration-0">
                <Image
                  src="/logo.ico" // Tambahkan tanda '/' di awal dan hapus 'app'
                  alt="Event Slayer Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>

              <span className="font-mono text-2xl font-black tracking-tighter uppercase">
                EVENT
                <span className="bg-black text-white px-1.5 py-0.5 ml-1 dark:bg-white dark:text-black">
                  SLAYER
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links - Right Aligned */}
          <div className="hidden md:flex space-x-10 h-full items-center ml-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-mono text-sm font-bold tracking-widest relative py-2 group`}
                >
                  <span
                    className={
                      isActive
                        ? "text-black dark:text-white"
                        : "text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white"
                    }
                  >
                    {link.name}
                  </span>
                  {/* Manga-panel border-line indicator */}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[3px] bg-black dark:bg-white transform transition-transform duration-0 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="border border-black p-2 hover:bg-black hover:text-white transition-all duration-0 dark:border-white dark:hover:bg-white dark:hover:text-black"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`md:hidden fixed top-20 right-0 w-64 h-[calc(100vh-80px)] bg-white border-l border-black p-6 transform transition-transform duration-300 dark:bg-black dark:border-white z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col space-y-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`font-mono text-sm font-bold tracking-widest border-b border-black pb-4 block dark:border-white ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
