export type JenisTransaksi = 'masuk' | 'keluar';

export interface Transaksi {
  id: string;
  jenis: JenisTransaksi;
  /** Rupiah, bilangan bulat (tanpa desimal). */
  nominal: number;
  keterangan: string;
  kategori?: string;
  /** Epoch milidetik (UTC). Ditampilkan dalam zona WIB. */
  waktu: number;
  dibuat: number;
}

/** Kategori bisa khusus pemasukan, khusus pengeluaran, atau dipakai keduanya. */
export type LingkupKategori = JenisTransaksi | 'umum';

export interface Kategori {
  id: string;
  nama: string;
  lingkup: LingkupKategori;
  bawaan: boolean;
}

export interface Bahan {
  nama: string;
  takaran: string;
  satuan: string;
}

export interface Resep {
  id: string;
  nama: string;
  kategori: string;
  /** Foto terkompres disimpan sebagai Blob di IndexedDB. */
  foto?: Blob;
  porsi?: string;
  bahan: Bahan[];
  langkah: string[];
  catatan?: string;
  modalBahan?: number;
  hargaJual?: number;
  dibuat: number;
  diubah: number;
}

export interface Meta {
  /** Selalu 'app'. Tabel meta hanya punya satu baris. */
  id: string;
  backupTerakhir?: number;
}
