# Dokumentasi Alat Keuangan Gia's Patisserie

**Waktu & Tanggal:** Sabtu, 7 November 2026 · 09:42 WIB

---

## Tentang Aplikasi
Aplikasi web *mobile-first* (PWA) untuk mencatat keuangan harian (pemasukan dan pengeluaran) toko kue **Gia's Patisserie**, sekaligus menyimpan buku resep kue. Aplikasi berjalan secara lokal di perangkat (IndexedDB tanpa server/login), bisa digunakan secara *offline*, dan dapat dipasang langsung ke Layar Utama (*Home Screen*) iPhone maupun Android.

---

## Status Pengembangan
Aplikasi ini kini telah dilengkapi dengan **Fitur Backend Serverless & Sinkronisasi Online**:
1. **Laporan Masuk Otomatis ke Email:** Setiap transaksi kasir (pemasukan & pengeluaran) otomatis mengirimkan notifikasi rincian ke `giacantik749@gmail.com`. Dilengkapi fitur kirim rekap harian dan uji coba email dari menu Pengaturan.
2. **Akses Online & Cloud Database (Supabase):** Data tidak lagi terbatas hanya di perangkat lokal. Tersedia sinkronisasi cloud dua arah (hybrid offline-first + online sync) sehingga pemilik dapat memantau keuangan toko kue dari perangkat mana saja.
3. **Penyimpanan Lokal & PWA Standalone:** Tetap dapat beroperasi offline 100% menggunakan Dexie IndexedDB dan otomatis sinkron saat online kembali.

Pengembangan lanjutan berikutnya:
- **Manajemen Bahan & Stok:** Integrasi buku resep dengan pengurangan stok bahan baku otomatis saat produksi kue.
- **Cetak & Bukti Transaksi:** Kemampuan mencetak nota atau struk ringkas untuk pesanan pelanggan via Web Bluetooth termal.
