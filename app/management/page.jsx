"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Sparkles, Lock, ShieldCheck, Trash2, 
  Edit3, CheckCircle, AlertTriangle, Clock,
  Search, Upload, Image as ImageIcon
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
  const [activeTab, setActiveTab] = useState("queue"); // "queue" or "live"
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [rawCaption, setRawCaption] = useState("");

  // Image Preview & Crop States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, cropX: 50, cropY: 50 });
  const containerRef = useRef(null);

  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Session & Inactivity Timer
  const resetSession = useCallback(() => {
    setIsAdmin(false);
    setPassword("");
    setEditingEvent(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRawCaption("");
    setPublicForm({ title: "", date: "", location: "", source: "" });
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
    window.addEventListener("mousedown", activityHandler);
    window.addEventListener("touchstart", activityHandler);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", activityHandler);
      window.removeEventListener("keydown", activityHandler);
      window.removeEventListener("mousedown", activityHandler);
      window.removeEventListener("touchstart", activityHandler);
    };
  }, [isAdmin, resetSession]);

  // 2. Data Fetching
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/events?admin=true");
      const data = await res.json();
      if (data.status === "success") {
        setEvents(data.data);
      }
    } catch (err) {
      // Error handled via silent failure for production stability
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchEvents();
  }, [isAdmin]);

  // 3. Image Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (editingEvent) {
        setEditingEvent({ ...editingEvent, cropX: 50, cropY: 50 });
      }
    }
  };

  const handleMouseDown = (e) => {
    if (!previewUrl && !editingEvent?.posterUrl) return;
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    dragStart.current = { 
      x: clientX, 
      y: clientY, 
      cropX: editingEvent?.cropX || 50, 
      cropY: editingEvent?.cropY || 50 
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !editingEvent) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    
    // Sensitivity factor
    const sensitivity = 0.2;
    
    let nextX = dragStart.current.cropX - (deltaX * sensitivity);
    let nextY = dragStart.current.cropY - (deltaY * sensitivity);
    
    // Clamp 0-100
    nextX = Math.max(0, Math.min(100, nextX));
    nextY = Math.max(0, Math.min(100, nextY));
    
    setEditingEvent({ ...editingEvent, cropX: nextX, cropY: nextY });
  };

  const stopDragging = () => setIsDragging(false);

  // 4. Actions
  const handlePublicSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", publicForm.title);
      formData.append("start_date", publicForm.date);
      formData.append("end_date", publicForm.date);
      formData.append("location_name", publicForm.location);
      formData.append("source_url", publicForm.source);
      formData.append("approved", "false");

      const res = await fetch("/api/events", {
        method: "POST",
        body: formData
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

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (data.status === "success" && data.authenticated) {
        setIsAdmin(true);
        setShowPasswordModal(false);
        setTimeLeft(300);
        setMessage({ type: "success", text: "Akses Admin Diberikan." });
      } else {
        setMessage({ type: "error", text: "Kata sandi salah." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menghubungkan ke server." });
    }
  };

  const handleApprove = async (id) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("approved", "true");

      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "x-admin-token": password },
        body: formData
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Event diterbitkan!" });
        fetchEvents();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menyetujui event." });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus event ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { 
        method: "DELETE",
        headers: { "x-admin-token": password }
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Event berhasil dihapus." });
        if (editingEvent?.id === id) {
          setEditingEvent(null);
          setPreviewUrl(null);
          setSelectedFile(null);
        }
        fetchEvents();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menghapus event." });
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(editingEvent).forEach(key => {
        if (editingEvent[key] !== null) {
          formData.append(key, editingEvent[key]);
        }
      });
      if (selectedFile) {
        formData.append("poster", selectedFile);
      }

      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "x-admin-token": password },
        body: formData
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Perubahan berhasil disimpan!" });
        setEditingEvent(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchEvents();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Gagal menyimpan perubahan." });
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
        const formData = new FormData();
        Object.keys(data.event_data).forEach(key => {
          formData.append(key, data.event_data[key]);
        });
        formData.append("approved", "false");

        const saveRes = await fetch("/api/events", {
          method: "POST",
          body: formData
        });
        if (saveRes.ok) {
          setMessage({ type: "success", text: "AI berhasil mengekstrak data ke antrean." });
          setRawCaption("");
          fetchEvents();
        }
      } else {
        setMessage({ type: "error", text: "AI tidak menemukan data event anime yang valid." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "AI Gagal memproses data." });
    } finally {
      setScanning(false);
    }
  };

  const filteredEvents = events.filter(item => 
    activeTab === "queue" ? !item.approved : item.approved
  );

  if (!isAdmin) {
    return (
      <div className="flex-1 w-full bg-white text-black dark:bg-black dark:text-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="border-b-2 border-black pb-6 mb-12 dark:border-white flex justify-between items-end">
            <div>
              <span className="font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase">Public Submission</span>
              <h1 className="font-sans text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mt-2">
                SUBMIT <span className="bg-black text-white px-2 dark:bg-white dark:text-black">PANEL</span>
              </h1>
            </div>
          </div>

          {message.text && (
            <div className="border border-black p-4 mb-12 flex items-center justify-between dark:border-white animate-in fade-in">
               <div className="flex items-center gap-3">
                 {message.type === "error" ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                 <span className="font-mono text-xs font-bold uppercase tracking-tight">{message.text}</span>
               </div>
               <button onClick={() => setMessage({type:"", text:""})} className="font-mono text-[10px] underline">DISMISS</button>
            </div>
          )}

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
                  <button onClick={() => setShowPasswordModal(false)} className="mt-8 font-mono text-[10px] underline uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">Return</button>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-white text-black dark:bg-black dark:text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="border-b-2 border-black pb-6 mb-12 dark:border-white flex justify-between items-end">
          <div>
            <span className="font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase" suppressHydrationWarning>
              ADMIN SESSION [{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}]
            </span>
            <h1 className="font-sans text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mt-2">
              MANAGEMENT <span className="bg-black text-white px-2 dark:bg-white dark:text-black">PANEL</span>
            </h1>
          </div>
          <button onClick={resetSession} className="bg-black text-white px-4 py-2 font-mono text-xs font-bold border border-black hover:bg-white hover:text-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white transition-all">
            [LOGOUT]
          </button>
        </div>

        {message.text && (
          <div className="border border-black p-4 mb-12 flex items-center justify-between dark:border-white animate-in fade-in">
             <div className="flex items-center gap-3">
               {message.type === "error" ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
               <span className="font-mono text-xs font-bold uppercase tracking-tight">{message.text}</span>
             </div>
             <button onClick={() => setMessage({type:"", text:""})} className="font-mono text-[10px] underline">DISMISS</button>
          </div>
        )}

        <div className="space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="border border-black p-8 dark:border-white bg-zinc-50 dark:bg-zinc-900">
               <div className="flex justify-between items-center border-b border-black pb-4 mb-6 dark:border-white">
                  <h3 className="font-mono text-sm font-black tracking-widest uppercase flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> AI Scanner Center
                  </h3>
                  <div className="h-3 w-3 bg-black dark:bg-white" />
               </div>
               <form onSubmit={handleScan} className="space-y-4">
                  <textarea 
                    value={rawCaption} onChange={e => setRawCaption(e.target.value)}
                    placeholder="Tempel Caption Instagram untuk ekstraksi otomatis..."
                    className="w-full border border-black p-4 font-mono text-xs outline-none focus:ring-1 focus:ring-black dark:border-white dark:bg-black min-h-[150px]"
                  />
                  <button disabled={scanning} className="w-full bg-black text-white px-8 py-4 font-mono text-xs font-bold border border-black hover:bg-white hover:text-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white transition-all">
                    {scanning ? "PROCESSING..." : "RUN SCANNER"}
                  </button>
               </form>
            </div>

            <div className="border-4 border-black p-8 dark:border-white">
               <div className="flex justify-between items-center border-b border-black pb-4 mb-6 dark:border-white">
                  <h3 className="font-mono text-sm font-black tracking-widest uppercase flex items-center gap-2">
                    <Edit3 className="h-4 w-4" /> {editingEvent ? "EDIT EVENT" : "EVENT EDITOR"}
                  </h3>
                  {editingEvent && (
                    <button onClick={() => {
                      setEditingEvent(null);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }} className="font-mono text-[10px] underline uppercase">Cancel Edit</button>
                  )}
               </div>
               
               {editingEvent ? (
                 <form onSubmit={handleUpdateEvent} className="space-y-6">
                    <div className="space-y-4">
                      <label className="font-mono text-[8px] font-bold uppercase block">Interactive Poster Crop (Drag to Pan)</label>
                      <div 
                        ref={containerRef}
                        className="aspect-square w-full border border-black overflow-hidden relative cursor-move bg-zinc-100 dark:bg-zinc-900 group"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={stopDragging}
                        onMouseLeave={stopDragging}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={stopDragging}
                      >
                        {(previewUrl || editingEvent.posterUrl) ? (
                          <img 
                            src={previewUrl || editingEvent.posterUrl}
                            alt="Crop Preview"
                            className="object-cover w-full h-full pointer-events-none select-none transition-transform duration-75"
                            style={{ objectPosition: `${editingEvent.cropX}% ${editingEvent.cropY}%` }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
                            <ImageIcon className="h-12 w-12" />
                            <span className="font-mono text-[10px]">No Poster Uploaded</span>
                          </div>
                        )}
                        <div className="absolute inset-0 border-[20px] border-black/10 pointer-events-none" />
                        <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 font-mono text-[8px] dark:bg-white dark:text-black">
                           X: {Math.round(editingEvent.cropX)}% | Y: {Math.round(editingEvent.cropY)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex-1 border border-black p-3 font-mono text-[10px] font-bold uppercase cursor-pointer hover:bg-black hover:text-white transition-all text-center dark:border-white dark:hover:bg-white dark:hover:text-black">
                          <Upload className="h-3 w-3 inline mr-2" /> {selectedFile ? "Change File" : "Upload Poster"}
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                        {selectedFile && (
                          <span className="font-mono text-[8px] text-zinc-500 uppercase truncate max-w-[15ch]">{selectedFile.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="font-mono text-[8px] font-bold uppercase mb-1 block">Title</label>
                        <input 
                          type="text" required value={editingEvent.title}
                          onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                          className="w-full border border-black p-2 font-mono text-xs outline-none dark:border-white dark:bg-black"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-mono text-[8px] font-bold uppercase mb-1 block">Start Date</label>
                          <input 
                            type="date" required value={editingEvent.start_date}
                            onChange={e => setEditingEvent({...editingEvent, start_date: e.target.value})}
                            className="w-full border border-black p-2 font-mono text-xs outline-none dark:border-white dark:bg-black"
                          />
                        </div>
                        <div>
                          <label className="font-mono text-[8px] font-bold uppercase mb-1 block">End Date</label>
                          <input 
                            type="date" required value={editingEvent.end_date}
                            onChange={e => setEditingEvent({...editingEvent, end_date: e.target.value})}
                            className="w-full border border-black p-2 font-mono text-xs outline-none dark:border-white dark:bg-black"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="font-mono text-[8px] font-bold uppercase mb-1 block">Location</label>
                          <input 
                            type="text" required value={editingEvent.location_name}
                            onChange={e => setEditingEvent({...editingEvent, location_name: e.target.value})}
                            className="w-full border border-black p-2 font-mono text-xs outline-none dark:border-white dark:bg-black"
                          />
                        </div>
                        <div>
                          <label className="font-mono text-[8px] font-bold uppercase mb-1 block">HTM / Tiket</label>
                          <input 
                            type="text" required value={editingEvent.htm}
                            onChange={e => setEditingEvent({...editingEvent, htm: e.target.value})}
                            className="w-full border border-black p-2 font-mono text-xs outline-none dark:border-white dark:bg-black"
                          />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-4 font-mono text-xs font-bold border border-black hover:bg-white hover:text-black dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white transition-all">
                      [SIMPAN PERUBAHAN]
                    </button>
                 </form>
               ) : (
                 <div className="py-24 text-center border border-dashed border-black dark:border-white opacity-30 flex flex-col items-center justify-center gap-4">
                    <Search className="h-8 w-8" />
                    <p className="font-mono text-[10px] uppercase max-w-[20ch]">Pilih event dari daftar di bawah untuk mengedit informasi.</p>
                 </div>
               )}
            </div>
          </div>

          <div>
             <div className="flex border-b-2 border-black dark:border-white mb-8">
                <button 
                  onClick={() => setActiveTab("queue")}
                  className={`px-8 py-4 font-mono text-xs font-black uppercase tracking-widest transition-all ${activeTab === "queue" ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
                >
                  [ANTREAN SUBMISI]
                </button>
                <button 
                  onClick={() => setActiveTab("live")}
                  className={`px-8 py-4 font-mono text-xs font-black uppercase tracking-widest transition-all ${activeTab === "live" ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
                >
                  [EVENT AKTIF / LIVE]
                </button>
             </div>

             <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans text-3xl font-black uppercase tracking-tight">
                  {activeTab === "queue" ? "Approval Queue" : "Live Database"}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase">{filteredEvents.length} Records</span>
                  <button onClick={fetchEvents} className="p-2 border border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800"><Clock className="h-4 w-4" /></button>
                </div>
             </div>

             {loadingEvents ? (
               <div className="py-20 text-center font-mono animate-pulse">RELOADING_DATA...</div>
             ) : (
               <div className="grid grid-cols-1 gap-1">
                  {filteredEvents.map(item => (
                    <div key={item.id} className={`border border-black dark:border-white p-6 flex flex-col md:flex-row justify-between items-center gap-6 ${editingEvent?.id === item.id ? "bg-zinc-100 dark:bg-zinc-800" : "bg-white dark:bg-black"}`}>
                      <div className="flex-1 w-full md:w-auto">
                         <div className="flex items-center gap-3 mb-2">
                            {!item.approved && <span className="bg-black text-white px-2 py-0.5 font-mono text-[8px] dark:bg-white dark:text-black font-bold">PENDING</span>}
                            <span className="font-mono text-[10px] text-zinc-500">{item.start_date}</span>
                            <span className="font-mono text-[10px] text-zinc-400">|</span>
                            <span className="font-mono text-[10px] text-zinc-500 uppercase">{item.htm}</span>
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
                         <button 
                          onClick={() => {
                            setEditingEvent(item);
                            setPreviewUrl(null);
                            setSelectedFile(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`p-3 border border-black dark:border-white transition-all ${editingEvent?.id === item.id ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                         >
                           <Edit3 className="h-4 w-4" />
                         </button>
                         <button onClick={() => handleDelete(item.id)} className="p-3 border border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800">
                           <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500 transition-colors" />
                         </button>
                      </div>
                    </div>
                  ))}
                  {filteredEvents.length === 0 && <div className="py-20 text-center border border-dashed border-black dark:border-white font-mono text-xs opacity-50 uppercase">NO_RECORDS_FOUND</div>}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
