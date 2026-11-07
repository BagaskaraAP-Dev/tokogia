interface SumberGambar {
  lebar: number;
  tinggi: number;
  sumber: CanvasImageSource;
  bersihkan: () => void;
}

/** Muat gambar dan hitung ukuran target. createImageBitmap dulu (hormati EXIF), lalu fallback <img>. */
async function muatGambar(file: File, maksSisi: number): Promise<SumberGambar> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const skala = Math.min(1, maksSisi / Math.max(bitmap.width, bitmap.height));
      return {
        lebar: Math.max(1, Math.round(bitmap.width * skala)),
        tinggi: Math.max(1, Math.round(bitmap.height * skala)),
        sumber: bitmap,
        bersihkan: () => bitmap.close(),
      };
    } catch {
      // Lanjut ke fallback untuk Safari yang belum mendukung opsi orientasi.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal membaca gambar.'));
      el.src = url;
    });
    const skala = Math.min(1, maksSisi / Math.max(img.naturalWidth, img.naturalHeight));
    return {
      lebar: Math.max(1, Math.round(img.naturalWidth * skala)),
      tinggi: Math.max(1, Math.round(img.naturalHeight * skala)),
      sumber: img,
      bersihkan: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/**
 * Kompres gambar sebelum disimpan supaya memori perangkat tidak cepat penuh.
 * Menurunkan ukuran sisi terpanjang dan menyimpan ulang sebagai JPEG.
 */
export async function kompresGambar(file: File, maksSisi = 1280, kualitas = 0.8): Promise<Blob> {
  const { lebar, tinggi, sumber, bersihkan } = await muatGambar(file, maksSisi);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = lebar;
    canvas.height = tinggi;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Perangkat tidak mendukung pemrosesan gambar.');
    ctx.drawImage(sumber, 0, 0, lebar, tinggi);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Gagal memproses foto.'))),
        'image/jpeg',
        kualitas,
      );
    });
  } finally {
    bersihkan();
  }
}
