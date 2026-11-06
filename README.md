# Catatan Keuangan · Giaa Patisserie

Web app mobile-first untuk mencatat keuangan harian toko kue **Giaa Patisserie**, sekaligus menyimpan buku resep. Dibuat untuk dipakai di iPhone (Safari), bisa dipasang ke Home Screen dan dipakai offline.

## Fitur

- **Catatan keuangan** — pemasukan/pengeluaran dengan nominal, keterangan, kategori, tanggal & jam (WIB). Edit, geser untuk hapus, dan tombol "Urungkan".
- **Dashboard** — ringkasan Hari ini / Kemarin / Bulan ini / Bulan lalu yang bisa digeser, tren pemasukan (naik/turun), grafik batang 7 hari, dan daftar transaksi dikelompokkan per hari.
- **Riwayat** — filter (Hari ini, Kemarin, Minggu ini, Bulan ini, Bulan lalu, Rentang sendiri), pencarian, dan total otomatis.
- **Buku resep** — grid kartu berfoto, bahan bisa dicentang, langkah bernomor, estimasi untung, dan mode memasak yang menjaga layar tetap menyala (Wake Lock).
- **Keamanan data** — ekspor/impor backup `.json`, ekspor transaksi ke CSV, dan pengingat backup.
- **PWA** — manifest + service worker, bisa "Add to Home Screen" dan jalan offline.

Semua data disimpan **lokal di perangkat** (IndexedDB via Dexie). Tidak ada server dan tidak perlu login.

## Teknologi

Vite · React · TypeScript · Tailwind CSS · Dexie (IndexedDB) · vite-plugin-pwa · Vitest.

## Menjalankan

Butuh Node.js 18 atau lebih baru.

```bash
npm install        # pasang dependency
npm run dev        # jalankan di http://localhost:5173
npm run build      # build produksi ke folder dist/
npm run preview    # jalankan hasil build (service worker aktif di sini)
npm run test       # unit test perhitungan ringkasan (Vitest)
npm run icons      # regenerate ikon PWA dari public/icon.svg
```

## Deploy (Vercel / Netlify)

Aplikasi ini sepenuhnya statis, jadi tidak butuh konfigurasi khusus.

- **Build command:** `npm run build`
- **Output directory:** `dist`

**Vercel:** impor repo, pilih preset **Vite**, deploy.

**Netlify:** set build command `npm run build` dan publish directory `dist`.

Setelah live, buka di Safari iPhone lalu ketuk **Bagikan → Tambahkan ke Layar Utama**.

## Struktur

```
src/
  pages/        Beranda, Riwayat, Resep, Pengaturan
  components/   layout, ui, finance, recipes, illustrations
  db/           Dexie (transaksi, kategori, resep, meta)
  hooks/        data, hapus+undo, count-up, wake lock, reduced motion
  utils/        currency, date (WIB), summary (+ test), image, backup
```

Fungsi perhitungan ringkasan ada di `src/utils/summary.ts` dan `src/utils/date.ts`, lengkap dengan unit test di `src/utils/summary.test.ts` (termasuk kasus pergantian bulan dan tahun).
