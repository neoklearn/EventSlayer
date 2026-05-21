# Event Slayer

Event Slayer adalah platform web agregator dan manajemen jadwal event pop culture serta anime (khususnya untuk wilayah Bandung). Proyek ini dibangun dengan fokus pada performa tinggi, responsivitas penuh di berbagai perangkat, serta gaya visual **Monokrom Murni (Manga Aesthetic)** yang tegas, minimalis, dan bersudut tajam tanpa lengkungan (*zero border-radius*).

---

## Fitur Utama

### 1. Dashboard Dinamis (Halaman Utama)
* **Hero Section:** Tipografi judul "EVENT SLAYER" raksasa yang dominan dengan latar belakang pola grid transparan yang bersih.
* **Call to Action (CTA):** Tombol interaktif `[JOIN US]` dengan efek warna invert instan saat di-hover, terhubung langsung ke WhatsApp Admin komunitas.

### 2. Kalender Jadwal Pintar (Schedule Page)
* **Desktop View:** Kalender interaktif layar penuh dengan sistem grid 7 kolom (Senin - Minggu). Tanggal yang memiliki acara akan menampilkan poster versi hitam-putih (*grayscale*) sebagai latar belakang dan berubah menjadi berwarna penuh saat kursor diarahkan (*hover*). Klik pada tanggal akan memicu jendela popup detail (*modal layout*) dengan efek *backdrop-blur*.
* **Mobile View:** Alur vertikal (*linear vertical timeline feed*) yang dioptimalkan sepenuhnya untuk navigasi satu jempol. Gambar poster bertransisi menjadi berwarna penuh ketika ditekan.
* **Logika Navigasi Bulan:** Sistem navigasi bulan dibuat statis dengan lebar tetap untuk mencegah pergeseran tata letak. Navigasi mundur dibatasi (maksimal bulan berjalan) dan navigasi maju dibatasi hingga maksimal 6 bulan ke depan untuk mengoptimalkan efisiensi pemuatan data.
* **Aksi Cepat:** Integrasi tautan minimalis menuju Google Maps untuk lokasi, Google Calendar (`[+ REMINDER]`), dan Instagram asli (`[SOURCE]`).

### 3. Panel Manajemen & Keamanan (Management Page)
* **Public Submission Form:** Formulir input mandiri bagi pengguna umum untuk mengirimkan event baru. Formulir didesain memenuhi seluruh layar (*full-width*) baik di PC maupun ponsel dengan 4 kolom input terstruktur: Nama Event, Tanggal (*sharp date picker*), Lokasi, dan Link Sumber.
* **Gerbang Autentikasi Admin:** Tombol rahasia `[SAYA ADALAH ADMIN]` yang memicu modal input kata sandi. Menggunakan kredensial kode sementara: **`ADMIN123`**.
* **Auto-Reset Keamanan:** Sistem pelacak aktivitas selama 5 menit (300 detik) di latar belakang. Jika admin tidak melakukan interaksi apa pun (gerakan mouse, klik, atau ketukan keyboard) dalam waktu 5 menit, sesi admin otomatis hangus dan halaman kembali ke menu input user umum.
* **Admin Dashboard Workspace:** Panel khusus admin untuk meninjau antrean event belum disetujui (`approved: false`), melakukan penyuntingan data tekstual, serta mengeksekusi aksi `[APPROVE]`, `[EDIT]`, atau `[DELETE]`.

---

## Spesifikasi Desain & Estetika (Design System)

Proyek ini wajib mematuhi cetak biru yang ada pada dokumen `Design.md`:
* **Palet Warna:** Hitam pekat (`#000000`), putih murni (`#FFFFFF`), dan skala abu-abu tegas (`zinc`/`slate`).
* **Gaya Pembatas:** Menggunakan garis tipis 1px (`border-zinc-200` atau `border-zinc-800`) tanpa *border-radius* di seluruh elemen kotak UI.
* **Tipografi:** Font Sans-serif tebal untuk judul utama/header dan font Monospace untuk elemen data teknis, tanggal, label, dan string kecil.

---

## Teknologi yang Digunakan

* **Framework:** Next.js (App Router)
* **Bahasa Pemrograman:** JavaScript murni (.jsx / .js) - *TypeScript dinonaktifkan*
* **Styling:** Tailwind CSS (dengan PostCSS)
* **Komponen & UI:** Konfigurasi shadcn/ui custom (bersudut tajam)
* **Package Manager:** pnpm

---

## Langkah Instalasi & Pengembangan Lokal

Pastikan Anda sudah menginstal Node.js di komputer Anda. Karena proyek ini menggunakan `pnpm`, instal `pnpm` secara global terlebih dahulu jika belum tersedia:

```bash
npm install -g pnpm

```

### 1. Kloning Repositori

```bash
git clone [https://github.com/username/event-slayer.git](https://github.com/username/event-slayer.git)
cd event-slayer

```

### 2. Instal Dependensi Proyek

Jalankan perintah berikut untuk memasang React, Next.js, Tailwind, dan modul pendukung lainnya secara otomatis:

```bash
pnpm install

```

### 3. Jalankan Server Pengembangan

Mulai server lokal untuk melihat perubahan secara langsung (*real-time*):

```bash
pnpm dev

```

Buka [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## Struktur Folder Penting

```text
├── app/
│   ├── layout.js       # Root Layout utama aplikasi (.js/.jsx)
│   ├── page.js         # Halaman utama Dashboard
│   └── globals.css     # Konfigurasi Tailwind & base styling
├── components/         # Komponen UI modular (Navigation, Calendar, dll)
├── components.json     # Konfigurasi instalasi komponen v0/shadcn
├── design.md           # Panduan token visual desain monokrom
├── package.json        # Manifest file dan daftar package dependensi
└── pnpm-lock.yaml      # Lockfile pnpm untuk konsistensi versi package
```