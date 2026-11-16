# Catatan Proyek · Alat Keuangan Gia's Patisserie

**Tanggal Pembuatan Catatan:** Sabtu, 7 November 2026 · 09:45 WIB  
**Nama Bisnis:** Gia's Patissèrie (*Homemade with Love · Freshly Baked Cookies*)  
**Repositori GitHub:** [https://github.com/BagaskaraAP-Dev/tokogia](https://github.com/BagaskaraAP-Dev/tokogia)  
**Tautan Live Vercel:** [https://tokogia.vercel.app](https://tokogia.vercel.app)

---

## 1. Rangkuman Aplikasi
Aplikasi ini adalah web app *mobile-first* (Progressive Web App / PWA) yang dirancang khusus untuk operasional harian toko kue **Gia's Patisserie**. Aplikasi difokuskan untuk kemudahan penggunaan di ponsel (khususnya iPhone Safari dan Android) agar dapat dipasang ke Layar Utama (*Add to Home Screen*) dan dapat beroperasi 100% secara *offline* tanpa memerlukan koneksi internet, server backend, atau login akun.

---

## 2. Fitur-Fitur yang Sudah Selesai & Berfungsi Penuh

### A. Pencatatan Keuangan (Pemasukan & Pengeluaran)
- **Input Fleksibel:** Input nominal Rupiah otomatis dengan pemisah ribuan, tanggal & jam (WIB), keterangan, dan pemilihan kategori.
- **Kategori Dinamis:** Pengguna bisa menambah kategori baru langsung dari form input tanpa perlu membuka halaman pengaturan.
- **Riwayat Geser untuk Hapus:** Di daftar transaksi, pengguna dapat menggeser baris ke kiri (*swipe left*) untuk memunculkan tombol hapus, dilengkapi tombol *Undo/Urungkan* lewat toast notification.

### B. Dashboard Analitik (Beranda)
- **Carousel Ringkasan Horizontal:** Kartu saldo Hari ini, Kemarin, Bulan ini, dan Bulan lalu.
- **Indikator Tren Persentase:** Membandingkan pemasukan hari ini vs kemarin dan bulan ini vs bulan lalu (naik/turun/baru).
- **Grafik Batang 7 Hari:** Visualisasi pemasukan 7 hari terakhir secara proporsional.
- **Daftar Transaksi Terbaru:** Transaksi dikelompokkan rapi per hari kalender.

### C. Halaman Riwayat Transaksi
- **Default Otomatis ke Hari Ini:** Setiap kali membuka tab Riwayat, filter otomatis aktif di **Hari ini** (bukan bulan ini).
- **Fitur Geser ke Kanan & Fokus Pengeluaran:**
  - Kartu carousel di atas riwayat dapat digeser ke kanan (*swipe right*) untuk masuk ke **Mode Fokus Pengeluaran**.
  - Menampilkan total pengeluaran dengan warna merah/rose yang tegas, jumlah catatan, dan ringkasan per kategori.
  - Tab cepat `[Semua]` `[Pengeluaran]` `[Pemasukan]` untuk beralih mode dengan satu ketukan.
  - Filter kategori pengeluaran spesifik (misal: Bahan Baku, Kemasan, Operasional).
  - Tombol pintas `+ Catat Pengeluaran` saat belum ada pengeluaran di hari tersebut.
- **Pencarian Multi-Kriteria:** Pencarian langsung berdasarkan nama keterangan, kategori, maupun angka nominal rupiah.
- **Filter Fleksibel:** Hari ini, Kemarin, Minggu ini, Bulan ini, Bulan lalu, Semua, dan Rentang tanggal khusus (sudah dilengkapi pengaman tanggal terbalik).

### D. Buku Resep & Kalkulator Untung
- **Katalog Resep Berfoto:** Grid kartu resep kue dengan foto yang dikompresi otomatis agar hemat memori.
- **Kalkulator Untung:** Memasukkan modal bahan dan harga jual per resep, otomatis menghitung estimasi keuntungan bersih.
- **Checklist Bahan Interaktif:** Bahan-bahan resep dapat dicentang satu per satu saat proses menimbang adonan.
- **Mode Memasak (Keep Screen Awake):** Memanfaatkan Web Wake Lock API agar layar ponsel tidak mati/terkunci otomatis saat sedang memasak di dapur.

### E. Desain & Identitas Brand Resmi
- **Logo Resmi Gia's Patissèrie:** Foto stiker bulat dipotong presisi di diameter 850px tanpa bayangan (*drop-shadow*) kusam, dengan tepian lingkaran transparan halus (*anti-aliased circular mask*).
- **Header Berkarakter:** Menampilkan logo stiker dalam bingkai putih timbul, nama **Gia's Patisserie** tebal berjenis huruf serif Fraunces, dan subjudul *Catatan Keuangan*.
- **Favicon & PWA Icons Lengkap:**
  - Favicon PNG 512x512, 192x192, 48x48, 32x32, 16x16, dan `.ico` langsung menggunakan foto logo resmi.
  - Apple Touch Icon (180x180) dengan *safe margin* untuk *squircle* iOS Safari.
  - Android Maskable Icon (512x512) dengan *safe zone* 80%.

### F. Keamanan & Cadangan Data Lokal
- **Database IndexedDB via Dexie:** Data tersimpan aman di memori lokal browser perangkat pemilik.
- **Ekspor & Impor Backup JSON:** File cadangan `.json` lengkap bisa diunduh dan dipulihkan kapan saja di perangkat lain.
- **Ekspor CSV:** Rekap transaksi bisa diekspor ke format Excel / Spreadsheet CSV.
- **Pengingat Backup:** Memberikan notifikasi jika belum melakukan backup selama lebih dari 7 hari.

---

## 3. Peta Lokasi File-File Penting

| Bagian | Path File | Keterangan |
| :--- | :--- | :--- |
| **Header & Logo** | `src/components/ui/Logo.tsx` | Tampilan logo toko kue dan judul header |
| **Riwayat & Fokus Keluar** | `src/pages/RiwayatPage.tsx` | Logika filter hari ini, swipe kartu, dan fokus pengeluaran |
| **Beranda & Grafik** | `src/pages/BerandaPage.tsx` | Dashboard utama dan ringkasan |
| **Form Transaksi** | `src/components/finance/TransactionForm.tsx` | Form input pemasukan/pengeluaran |
| **Buku Resep** | `src/pages/ResepPage.tsx` | Manajemen resep kue |
| **Database Lokal** | `src/db/db.ts` | Konfigurasi tabel Dexie IndexedDB |
| **API Laporan Email** | `api/laporan.ts` | Endpoint serverless Vercel pengirim email ke giacantik749@gmail.com |
| **API Transaksi Cloud** | `api/transaksi.ts` | Endpoint REST serverless untuk simpan transaksi online & kirim notifikasi |
| **API Sinkronisasi** | `api/sync.ts` | Sinkronisasi batch dua arah antara lokal dan cloud |
| **Service Email Frontend** | `src/services/emailService.ts` | Logika pengiriman email transaksi, rekap harian, dan tes kirim |
| **Client Supabase Cloud** | `src/services/supabase.ts` | Penghubung database online Supabase & sinkronisasi data |
| **Skema SQL Cloud** | `supabase/schema.sql` | Skrip pembuatan tabel database PostgreSQL di Supabase |
| **Generator Ikon** | `scripts/generate-icons.mjs` | Script otomatis pemotong logo & pembuat favicon |
| **Konfigurasi PWA** | `vite.config.ts` | Service worker, proxy API lokal, dan manifest PWA |
| **Foto Logo Asli** | `public/logo-giaa.png` | Aset logo resmi resolusi tinggi 512x512 |

---

## 4. Fitur Backend & Online (Terselesaikan)

### A. Laporan Otomatis ke Email giacantik749@gmail.com
- **Notifikasi Transaksi Baru:** Setiap kali kasir mencatat pemasukan atau pengeluaran baru, backend otomatis merakit email HTML bernuansa Gia's Patisserie (Burgundy & Bakery Pink) dan mengirimkannya ke `giacantik749@gmail.com`.
- **Rincian Email Lengkap:** Menyajikan jenis transaksi, badge warna (hijau pemasukan / rose pengeluaran), nominal rupiah jelas, keterangan, kategori, waktu WIB, dan ringkasan saldo hari ini.
- **Kirim Rekap Hari Ini:** Di halaman Pengaturan, pemilik atau kasir dapat mengirimkan rekapitulasi harian lengkap kapan saja dengan satu ketukan.
- **Tes Kirim Email Langsung:** Tombol pengujian langsung di aplikasi untuk memastikan email berhasil diterima di `giacantik749@gmail.com`.
- **Dukungan Pengiriman:** Mendukung Gmail SMTP (Google App Password) maupun Resend API secara otomatis dengan fallback aman (tidak mengganggu jalannya aplikasi jika sedang offline).

### B. Akses Online & Sinkronisasi Multi-Perangkat (Cloud)
- **Tidak Terbatas Hanya di Perangkat Lokal:** Aplikasi tidak lagi hanya sebatas IndexedDB di satu browser. Dengan integrasi Supabase (PostgreSQL), data otomatis tersimpan di cloud.
- **Akses dari Mana Saja:** Pemilik toko kue dapat membuka `https://tokogia.vercel.app` di laptop atau ponsel pribadi di rumah dan melihat data transaksi yang diinput kasir di toko secara real-time.
- **Hybrid Local-First + Cloud:** Tetap mempertahankan kecepatan 0ms dan kemampuan offline Dexie IndexedDB. Saat koneksi online kembali, data otomatis disinkronkan ke cloud.
- **Panel Konfigurasi Supabase Mandiri:** Pemilik dapat memasukkan URL & Anon Key Supabase langsung di halaman Pengaturan tanpa harus mengubah kode program.

---

## 5. Rencana Kebutuhan Pengembangan Lanjutan (Roadmap)

1. **Manajemen Stok Bahan Baku Otomatis:**
   - Menghubungkan buku resep dengan inventaris stok: ketika kue terjual, stok bahan otomatis berkurang.
2. **Cetak Nota / Struk Bluetooth:**
   - Integrasi Web Bluetooth API untuk mencetak struk termal mini bagi pelanggan.
3. **Laporan Keuangan & Grafik Lanjutan:**
   - Pembuatan laporan laba rugi bulanan dalam format file PDF yang siap dicetak.

---

*Catatan ini dibuat untuk dokumentasi internal proyek Gia's Patisserie.*
