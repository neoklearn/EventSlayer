"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, Lock, ShieldCheck, Trash2, 
  Edit3, CheckCircle, AlertTriangle, Clock,
  ArrowRight, Search
} from "lucide-react";

export default function Management() {
  const [mounted, setMounted] = useState(false);
  // Authentication & Session
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Public Form States
  const [publicForm, setPublicForm] = useState({
    title: "",
    date: "",
    location: "",
    source: ""
  });

  // Admin Dashboard States
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [rawCaption, setRawCaption] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Session & Inactivity Timer
  const resetSession = useCallback(() => {
    setIsAdmin(false);
    setPassword("");
    setMessage({ type: "info", text: "Sesi admin berakhir demi keamanan." });
  }, []);

  useEffect(() => {
    setMounted(true);
    let timer;
    if (isAdmin) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            resetSession();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }

    const activityHandler = () => setTimeLeft(300);
    window.addEventListener("mousemove", activityHandler);
    window.addEventListener("keydown", activityHandler);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", activityHandler);
      window.removeEventListener("keydown", activityHandler);
    };
  }, [isAdmin, resetSession]);

  // 2. Data Fetching
  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.status === "success") {
        setQueue(data.data);
      }
    } catch (err) {
      console.error("Queue fetch failed", err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchQueue();
  }, [isAdmin]);

  // 3. Actions
  const handlePublicSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: publicForm.title,
          start_date: publicForm.date,
          end_date: publicForm.date,
          location_name: publicForm.location,
          source_url: publicForm.source,
          approved: false
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setMessage({ type: "success", text: "Event berhasil dikirim! Menunggu persetujuan admin." });
        setPublicForm({ title: "", date: "", location: "", source: "" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal mengirim event." });
    }
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (password === "ADMIN123") { // Temporary admin code
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPassword("");
      setTimeLeft(300);
      setMessage({ type: "success", text: "Akses Admin Diberikan." });
    } else {
      setMessage({ type: "error", text: "Kata sandi salah." });
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: true })
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Event diterbitkan!" });
        fetchQueue();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menyetujui event." });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Event dihapus." });
        fetchQueue();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menghapus event." });
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    setScanning(true);
    try {
      const res = await fetch("/api/parse-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawCaption })
      });
      const data = await res.json();
      if (data.event_data) {
        // Automatically add to queue as unapproved
        const saveRes = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data.event_data, approved: false })
        });
        if (saveRes.ok) {
          setMessage({ type: "success", text: "AI berhasil mengekstrak data ke antrean." });
          setRawCaption("");
          fetchQueue();
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "AI Gagal memproses data." });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-white text-black dark:bg-black dark:text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="border-b-2 border-black pb-6 mb-12 dark:border-white flex justify-between items-end">
          <div>
            <span className="font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase" suppressHydrationWarning>
              {isAdmin ? `ADMIN SESSION [${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}]` : "Public Submission"}
            </span>
            <h1 className="font-sans text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mt-2">
              {isAdmin ? "MANAGEMENT" : "SUBMIT"} <span className="bg-black text-white px-2 dark:bg-white dark:text-black">PANEL</span>
            </h1>
          </div>
          {isAdmin && (
            <button onClick={resetSession} className="bg-black text-white px-4 py-2 font-mono text-xs font-bold border border-black hover:bg-white hover:text-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white transition-all">
              [LOGOUT]
            </button>
          )}
        </div>

        {/* Global Feedback Message */}
        {message.text && (
          <div className="border border-black p-4 mb-12 flex items-center justify-between dark:border-white animate-in fade-in slide-in-from-top-4">
             <div className="flex items-center gap-3">
               {message.type === "error" ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
               <span className="font-mono text-xs font-bold uppercase tracking-tight">{message.text}</span>
             </div>
             <button onClick={() => setMessage({type:"", text:""})} className="font-mono text-[10px] underline">DISMISS</button>
          </div>
        )}

        {!isAdmin ? (
          /* PUBLIC VIEW - FULL WIDTH LAYOUT */
          <div className="max-w-3xl mx-auto w-full space-y-12">
            <div className="space-y-8">
               <div className="border-l-4 border-black pl-6 dark:border-white">
                 <h2 className="font-sans text-3xl font-black uppercase mb-4 tracking-tight">Kirim Event Kamu</h2>
                 <p className="font-mono text-sm text-zinc-500 leading-relaxed uppercase">
                   Bantu kami memperbarui jadwal event pop culture di Bandung. Masukkan informasi dasar dan tim admin kami akan melakukan verifikasi sebelum diterbitkan.
                 </p>
               </div>

               <form onSubmit={handlePublicSubmit} className="space-y-6">
                 <div>
                    <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-2">Nama Event</label>
                    <input 
                      type="text" required value={publicForm.title}
                      onChange={e => setPublicForm({...publicForm, title: e.target.value})}
                      className="w-full border border-black p-4 font-mono text-xs focus:ring-1 focus:ring-black outline-none dark:border-white dark:bg-black"
                    />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-2">Tanggal</label>
                      <input 
                        type="date" required value={publicForm.date}
                        onChange={e => setPublicForm({...publicForm, date: e.target.value})}
                        className="w-full border border-black p-4 font-mono text-xs focus:ring-1 focus:ring-black outline-none dark:border-white dark:bg-black"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-2">Lokasi</label>
                      <input 
                        type="text" required value={publicForm.location}
                        onChange={e => setPublicForm({...publicForm, location: e.target.value})}
                        className="w-full border border-black p-4 font-mono text-xs focus:ring-1 focus:ring-black outline-none dark:border-white dark:bg-black"
                      />
                    </div>
                 </div>
                 <div>
                    <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-2">Sumber Link (Instagram/URL)</label>
                    <input 
                      type="url" required value={publicForm.source}
                      onChange={e => setPublicForm({...publicForm, source: e.target.value})}
                      className="w-full border border-black p-4 font-mono text-xs focus:ring-1 focus:ring-black outline-none dark:border-white dark:bg-black placeholder:text-zinc-300"
                      placeholder="https://..."
                    />
                 </div>
                 <button type="submit" className="w-full bg-black text-white py-6 border-2 border-black font-mono text-base font-bold tracking-widest hover:bg-white hover:text-black transition-all dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white">
                   [SUBMIT EVENT]
                 </button>
               </form>

               <div className="pt-12 text-center">
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="font-mono text-xs font-bold underline underline-offset-4 decoration-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    [SAYA ADALAH ADMIN]
                  </button>
               </div>
            </div>
          </div>
        ) : (
          /* ADMIN VIEW */
          <div className="space-y-16">
            {/* AI Scan Tool for Admin */}
            <div className="border border-black p-8 dark:border-white bg-zinc-50 dark:bg-zinc-900">
               <div className="flex justify-between items-center border-b border-black pb-4 mb-6 dark:border-white">
                  <h3 className="font-mono text-sm font-black tracking-widest uppercase flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> AI Scanner Center
                  </h3>
                  <div className="h-3 w-3 bg-black dark:bg-white" />
               </div>
               <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4">
                  <textarea 
                    value={rawCaption} onChange={e => setRawCaption(e.target.value)}
                    placeholder="Tempel Caption Instagram untuk ekstraksi otomatis..."
                    className="flex-1 border border-black p-4 font-mono text-xs outline-none focus:ring-1 focus:ring-black dark:border-white dark:bg-black"
                    rows={1}
                  />
                  <button disabled={scanning} className="bg-black text-white px-8 py-4 font-mono text-xs font-bold border border-black hover:bg-white hover:text-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white transition-all shrink-0">
                    {scanning ? "PROCESSING..." : "RUN SCANNER"}
                  </button>
               </form>
            </div>

            {/* Queue Table */}
            <div>
               <div className="border-b border-black pb-4 mb-8 dark:border-white flex items-center justify-between">
                  <h3 className="font-sans text-3xl font-black uppercase tracking-tight">Antrean Approval</h3>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase">{queue.length} Total Records</span>
                    <button onClick={fetchQueue} className="p-2 border border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800"><Clock className="h-4 w-4" /></button>
                  </div>
               </div>

               {loadingQueue ? (
                 <div className="py-20 text-center font-mono animate-pulse">RELOADING_QUEUE...</div>
               ) : (
                 <div className="grid grid-cols-1 gap-4">
                    {queue.map(item => (
                      <div key={item.id} className={`border border-black dark:border-white p-6 flex flex-col md:flex-row justify-between items-center gap-6 ${item.approved ? "bg-white" : "bg-zinc-50 dark:bg-zinc-900"}`}>
                        <div className="flex-1 w-full md:w-auto">
                           <div className="flex items-center gap-3 mb-2">
                              {!item.approved && <span className="bg-black text-white px-2 py-0.5 font-mono text-[8px] dark:bg-white dark:text-black font-bold">PENDING</span>}
                              <span className="font-mono text-[10px] text-zinc-500">{item.start_date}</span>
                           </div>
                           <h4 className="font-sans text-xl font-black uppercase tracking-tight">{item.title}</h4>
                           <p className="font-mono text-[10px] text-zinc-400 mt-1 uppercase truncate max-w-md">{item.location_name}</p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto justify-end">
                           {!item.approved && (
                             <button onClick={() => handleApprove(item.id)} className="flex-1 md:flex-none bg-black text-white px-4 py-3 border border-black font-mono text-[10px] font-bold hover:bg-white hover:text-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white transition-all flex items-center justify-center gap-2">
                               <CheckCircle className="h-3 w-3" /> APPROVE
                             </button>
                           )}
                           <button className="p-3 border border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800"><Edit3 className="h-4 w-4" /></button>
                           <button onClick={() => handleDelete(item.id)} className="p-3 border border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4 text-zinc-400" /></button>
                        </div>
                      </div>
                    ))}
                    {queue.length === 0 && <div className="py-20 text-center border border-dashed border-black dark:border-white font-mono text-xs opacity-50 uppercase">QUEUE_EMPTY</div>}
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Admin Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
             <div className="relative bg-white dark:bg-black border-4 border-black dark:border-white p-12 max-w-md w-full text-center">
                <Lock className="h-12 w-12 mx-auto mb-6" />
                <h3 className="font-sans text-3xl font-black uppercase mb-2 tracking-tight">Access Gate</h3>
                <p className="font-mono text-xs text-zinc-500 uppercase mb-8">Otoritas Admin Diperlukan</p>
                
                <form onSubmit={handleAdminAuth} className="space-y-6">
                   <input 
                    type="password" autoFocus value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="PASSWORD"
                    className="w-full border border-black p-4 font-mono text-center text-sm outline-none dark:border-white dark:bg-black"
                   />
                   <button type="submit" className="w-full bg-black text-white py-4 font-mono text-xs font-bold border border-black hover:bg-white hover:text-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white transition-all">
                     [VALIDATE_KEY]
                   </button>
                </form>

                <button onClick={() => setShowPasswordModal(false)} className="mt-8 font-mono text-[10px] underline uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">Return to public interface</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
