"use client";

import { useEffect, useState } from "react";
import { 
  MapPin, Calendar as CalendarIcon, ExternalLink, 
  X, ChevronLeft, ChevronRight, Plus 
} from "lucide-react";

export default function Schedule() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const realCurrentDate = new Date();
  const minDate = new Date(realCurrentDate.getFullYear(), realCurrentDate.getMonth(), 1);
  const maxDate = new Date(realCurrentDate.getFullYear(), realCurrentDate.getMonth() + 6, 1);

  const canGoPrev = currentDate > minDate;
  const canGoNext = currentDate < maxDate;

  const handlePrevMonth = () => {
    if (canGoPrev) {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    }
  };

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events?approved=true");
        const data = await res.json();
        if (data.status === "success") {
          setEvents(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch approved events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getGoogleMapsUrl = (loc) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
  
  const getGoogleCalendarUrl = (event) => {
    const start = event.start_date.replace(/-/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${start}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location_name)}`;
  };

  // Calendar Logic
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust to Monday start
    const days = [];

    // Header (Mon-Sun)
    const weekDays = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

    // Padding
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} className="border border-zinc-100 dark:border-zinc-900 min-h-[150px]" />);
    }

    // Days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.start_date === dateStr);
      
      days.push(
        <div 
          key={d} 
          className={`border border-black dark:border-white min-h-[150px] p-2 relative group cursor-pointer overflow-hidden ${dayEvents.length > 0 ? "bg-zinc-50 dark:bg-zinc-900" : ""}`}
          onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
        >
          <span className="font-mono text-xs font-bold">{d}</span>
          
          {dayEvents.length > 0 && (
            <div className="absolute inset-0 z-0">
              {/* Poster Simulation (Grayscale to Color) */}
              <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 grayscale group-hover:grayscale-0 transition-all duration-300 opacity-40 group-hover:opacity-100 flex items-center justify-center p-4">
                 <div className="text-center">
                    <div className="font-sans text-[10px] font-black uppercase leading-tight line-clamp-3">{dayEvents[0].title}</div>
                 </div>
              </div>
            </div>
          )}
          
          {dayEvents.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black text-white px-1 font-mono text-[8px] dark:bg-white dark:text-black">
              +{dayEvents.length - 1} MORE
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 border-b-2 border-black dark:border-white mb-4">
          {weekDays.map(wd => (
            <div key={wd} className="py-2 text-center font-mono text-xs font-bold tracking-widest">{wd}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  if (!mounted || loading) return (
    <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
      <div className="font-mono text-xl font-bold tracking-[0.5em] animate-pulse">LOADING_DATA...</div>
    </div>
  );

  return (
    <div className="flex-1 w-full bg-white text-black dark:bg-black dark:text-white pb-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-black pb-6 mb-12 dark:border-white gap-6">
          <div className="w-full md:w-auto">
            <span className="font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase">Strategic Operation</span>
            <h1 className="font-sans text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mt-2">
              EVENT <span className="bg-black text-white px-2 dark:bg-white dark:text-black">SCHEDULE</span>
            </h1>
          </div>
          
          {mounted && !isMobile && (
            <div className="flex items-center gap-4 border border-black p-2 dark:border-white">
              <button 
                onClick={handlePrevMonth} 
                disabled={!canGoPrev}
                className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-mono text-sm font-black uppercase tracking-widest px-4 min-w-[15ch] text-center" suppressHydrationWarning>
                {currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
              </span>
              <button 
                onClick={handleNextMonth}
                disabled={!canGoNext}
                className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* View Switcher Container */}
        {mounted && (isMobile ? (
          /* Mobile View: Vertical Timeline Feed */
          <div className="space-y-12">
            {events.length === 0 ? (
              <div className="border border-black p-12 text-center dark:border-white">BELUM ADA EVENT TERJADWAL</div>
            ) : (
              events.map((event, idx) => (
                <div key={event.id} className="border border-black dark:border-white bg-white dark:bg-black overflow-hidden flex flex-col">
                  {/* Poster (Grayscale to Color on Press/Click) */}
                  <div 
                    className="h-64 bg-zinc-200 dark:bg-zinc-800 grayscale active:grayscale-0 transition-all duration-300 relative overflow-hidden"
                    onClick={() => {}} // Just to trigger CSS active state
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                       <span className="font-mono text-4xl font-black uppercase tracking-widest">POSTER</span>
                    </div>
                    <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 font-mono text-[10px] dark:bg-white dark:text-black">
                      #{String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-black dark:border-white">
                    <h2 className="font-sans text-3xl font-black uppercase tracking-tight mb-2">{event.title}</h2>
                    <p className="font-mono text-xs text-zinc-500 mb-6" suppressHydrationWarning>{formatDate(event.start_date)}</p>
                    
                    <div className="space-y-4">
                      <a href={getGoogleMapsUrl(event.location_name)} target="_blank" className="flex items-center gap-2 font-mono text-xs font-bold border-b border-black pb-2 dark:border-white">
                        <MapPin className="h-4 w-4" /> {event.location_name}
                      </a>
                      <div className="flex gap-6 pt-4">
                         <a href={getGoogleCalendarUrl(event)} target="_blank" className="font-mono text-xs font-bold underline decoration-2 underline-offset-4 hover:text-zinc-500">[+ REMINDER]</a>
                         <a href={event.source_url} target="_blank" className="font-mono text-xs font-bold underline decoration-2 underline-offset-4 hover:text-zinc-500">[SOURCE]</a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop View: Calendar Grid */
          <div className="w-full">
            {renderCalendar()}
          </div>
        ))}
      </div>

      {/* Desktop Modal Detail */}
      {mounted && selectedEvent && !isMobile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white dark:bg-black border-2 border-black dark:border-white w-full max-w-5xl h-auto max-h-[90vh] flex overflow-hidden">
            {/* Left: Poster Full Color */}
            <div className="w-1/2 bg-zinc-100 dark:bg-zinc-900 border-r-2 border-black dark:border-white relative flex items-center justify-center overflow-hidden">
               <span className="font-mono text-4xl font-black opacity-10 uppercase tracking-[1em]">FULL POSTER</span>
               <div className="absolute inset-0 bg-gradient-to-br from-zinc-200/50 to-zinc-400/50 mix-blend-multiply" />
            </div>

            {/* Right: Info */}
            <div className="w-1/2 p-12 flex flex-col justify-between overflow-y-auto">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
              >
                <X className="h-6 w-6" />
              </button>

              <div>
                <div className="inline-flex items-center gap-2 bg-black text-white px-2 py-0.5 font-mono text-[10px] mb-8 dark:bg-white dark:text-black">
                  <Plus className="h-3 w-3" /> EVENT DETAILS
                </div>
                <h2 className="font-sans text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                  {selectedEvent.title}
                </h2>
                <div className="space-y-6 mb-12">
                  <div className="flex items-center gap-3 font-mono text-sm font-bold" suppressHydrationWarning>
                    <CalendarIcon className="h-5 w-5" /> {formatDate(selectedEvent.start_date)}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-sm font-bold">
                    <MapPin className="h-5 w-5" /> {selectedEvent.location_name}
                  </div>
                </div>
                
                <div className="border-t border-black pt-6 dark:border-white">
                   <p className="font-mono text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 uppercase">
                     {selectedEvent.description}
                   </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-12">
                <a 
                  href={getGoogleMapsUrl(selectedEvent.location_name)} 
                  target="_blank" 
                  className="bg-black text-white text-center font-mono text-xs font-bold tracking-widest py-4 border border-black hover:bg-white hover:text-black transition-all dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white flex items-center justify-center gap-2"
                >
                  <MapPin className="h-4 w-4" /> OPEN IN GOOGLE MAPS
                </a>
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href={getGoogleCalendarUrl(selectedEvent)} 
                    target="_blank" 
                    className="border border-black text-center font-mono text-[10px] font-bold tracking-widest py-4 hover:bg-black hover:text-white transition-all dark:border-white dark:hover:bg-white dark:hover:text-black"
                  >
                    ADD TO CALENDAR
                  </a>
                  <a 
                    href={selectedEvent.source_url} 
                    target="_blank" 
                    className="border border-black text-center font-mono text-[10px] font-bold tracking-widest py-4 hover:bg-black hover:text-white transition-all dark:border-white dark:hover:bg-white dark:hover:text-black flex items-center justify-center gap-2"
                  >
                    SOURCE <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
