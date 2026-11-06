/**
 * Kompres gambar sebelum disimpan supaya memori perangkat tidak cepat penuh.
 * Menurunkan ukuran sisi terpanjang dan menyimpan ulang sebagai JPEG.
 */
export async function kompresGambar(file: File, maksSisi = 1280, kualitas = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const skala = Math.min(1, maksSisi / Math.max(bitmap.width, bitmap.height));
  const lebar = Math.max(1, Math.round(bitmap.width * skala));
  const tinggi = Math.max(1, Math.round(bitmap.height * skala));

  const canvas = document.createElement('canvas');
  canvas.width = lebar;
  canvas.height = tinggi;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Perangkat tidak mendukung pemrosesan gambar.');
  }
  ctx.drawImage(bitmap, 0, 0, lebar, tinggi);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Gagal memproses foto.'))),
      'image/jpeg',
      kualitas,
    );
  });
}
