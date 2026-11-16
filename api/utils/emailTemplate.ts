export interface RingkasanInfo {
  masuk: number;
  keluar: number;
  sisa: number;
}

export interface TransaksiItem {
  id: string;
  jenis: 'masuk' | 'keluar';
  nominal: number;
  keterangan: string;
  kategori?: string;
  waktu: number;
}

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(nominal);
}

export function formatWaktuWib(epochMs: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(epochMs)) + ' WIB';
}

/**
 * Template email HTML bernuansa Gia's Patisserie
 * Warna: Burgundy (#6d0f2a), Bakery Pink (#d0346d), Pastel Cream (#fff5f8)
 */
export function buatTemplateEmailTransaksi({
  transaksi,
  ringkasanHariIni,
}: {
  transaksi: TransaksiItem;
  ringkasanHariIni?: RingkasanInfo;
}): { subjek: string; html: string; text: string } {
  const adalahPemasukan = transaksi.jenis === 'masuk';
  const jenisLabel = adalahPemasukan ? 'Pemasukan Baru' : 'Pengeluaran Baru';
  const warnaAksen = adalahPemasukan ? '#059669' : '#e11d48';
  const backgroundBadge = adalahPemasukan ? '#ecfdf5' : '#fff1f2';
  const nominalFormatted = formatRupiah(transaksi.nominal);
  const waktuFormatted = formatWaktuWib(transaksi.waktu);

  const subjek = `${adalahPemasukan ? '🍰' : '💸'} [Gia's Patisserie] ${jenisLabel}: ${nominalFormatted} (${transaksi.keterangan || transaksi.kategori || 'Tanpa keterangan'})`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjek}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fff5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff5f8; padding: 28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(109, 15, 42, 0.08); border: 1px solid #fce7f3;">
          <!-- Header Toko -->
          <tr>
            <td style="background: linear-gradient(135deg, #6d0f2a 0%, #d0346d 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">Gia's Patisserie</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #fdf2f8; opacity: 0.95;">Homemade with Love · Laporan Operasional</p>
            </td>
          </tr>

          <!-- Isi Laporan -->
          <tr>
            <td style="padding: 24px;">
              <!-- Status Badge & Nominal -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: ${backgroundBadge}; color: ${warnaAksen}; font-size: 13px; font-weight: 700; letter-spacing: 0.02em;">
                  ${jenisLabel.toUpperCase()}
                </span>
                <div style="margin-top: 10px; font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.03em;">
                  ${nominalFormatted}
                </div>
              </div>

              <!-- Tabel Detail -->
              <table role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; background-color: #fafaf9; border-radius: 12px; border: 1px solid #f4f4f5; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #f4f4f5; font-size: 13px; color: #6b7280; width: 35%;">Keterangan</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #f4f4f5; font-size: 14px; font-weight: 600; color: #1f2937;">${transaksi.keterangan || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #f4f4f5; font-size: 13px; color: #6b7280;">Kategori</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #f4f4f5; font-size: 14px; font-weight: 600; color: #1f2937;">${transaksi.kategori || 'Umum'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #6b7280;">Waktu Transaksi</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #1f2937;">${waktuFormatted}</td>
                </tr>
              </table>

              ${
                ringkasanHariIni
                  ? `
              <!-- Ringkasan Hari Ini -->
              <div style="background: #fff5f8; border-radius: 12px; padding: 14px 16px; border: 1px solid #fbcfe8; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #9d174d; text-transform: uppercase; letter-spacing: 0.04em;">Ringkasan Hari Ini</p>
                <table role="presentation" width="100%">
                  <tr>
                    <td style="font-size: 13px; color: #4b5563;">Total Pemasukan</td>
                    <td align="right" style="font-size: 13px; font-weight: 700; color: #059669;">${formatRupiah(ringkasanHariIni.masuk)}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #4b5563; padding-top: 4px;">Total Pengeluaran</td>
                    <td align="right" style="font-size: 13px; font-weight: 700; color: #e11d48; padding-top: 4px;">${formatRupiah(ringkasanHariIni.keluar)}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; font-weight: 700; color: #111827; padding-top: 6px; border-top: 1px dashed #f472b6;">Saldo Bersih</td>
                    <td align="right" style="font-size: 14px; font-weight: 800; color: #6d0f2a; padding-top: 6px; border-top: 1px dashed #f472b6;">${formatRupiah(ringkasanHariIni.sisa)}</td>
                  </tr>
                </table>
              </div>
              `
                  : ''
              }

              <!-- Tombol Akses Dashboard -->
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://tokogia.vercel.app" target="_blank" style="display: inline-block; background-color: #6d0f2a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 10px; box-shadow: 0 2px 6px rgba(109, 15, 42, 0.25);">
                  Buka Dashboard Toko Gia
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafaf9; border-top: 1px solid #f4f4f5; padding: 16px; text-align: center; font-size: 11px; color: #9ca3af;">
              Laporan otomatis dari Sistem Kasir Online Gia's Patisserie.<br>
              Dikirim ke <strong>giacantik749@gmail.com</strong>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `Gia's Patisserie - Laporan Transaksi Baru
-----------------------------------------
Jenis       : ${jenisLabel}
Nominal     : ${nominalFormatted}
Keterangan  : ${transaksi.keterangan || '-'}
Kategori    : ${transaksi.kategori || 'Umum'}
Waktu (WIB) : ${waktuFormatted}
${
  ringkasanHariIni
    ? `
Ringkasan Hari Ini:
- Masuk : ${formatRupiah(ringkasanHariIni.masuk)}
- Keluar: ${formatRupiah(ringkasanHariIni.keluar)}
- Saldo : ${formatRupiah(ringkasanHariIni.sisa)}
`
    : ''
}
Akses online: https://tokogia.vercel.app
`;

  return { subjek, html, text };
}

/**
 * Template email untuk rekapitulasi harian / laporan lengkap
 */
export function buatTemplateEmailRekap({
  tanggalLabel,
  ringkasan,
  daftarTransaksi,
}: {
  tanggalLabel: string;
  ringkasan: RingkasanInfo;
  daftarTransaksi: TransaksiItem[];
}): { subjek: string; html: string; text: string } {
  const subjek = `📊 [Gia's Patisserie] Rekap Laporan Keuangan - ${tanggalLabel}`;

  const barisTransaksiHtml = daftarTransaksi
    .slice(0, 30)
    .map((t) => {
      const masuk = t.jenis === 'masuk';
      return `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f4f4f5; font-size: 13px; color: #374151;">
          <div style="font-weight: 600;">${t.keterangan || t.kategori || 'Transaksi'}</div>
          <div style="font-size: 11px; color: #9ca3af;">${formatWaktuWib(t.waktu)} · ${t.kategori || 'Umum'}</div>
        </td>
        <td align="right" style="padding: 8px 12px; border-bottom: 1px solid #f4f4f5; font-size: 13px; font-weight: 700; color: ${masuk ? '#059669' : '#e11d48'};">
          ${masuk ? '+' : '-'}${formatRupiah(t.nominal)}
        </td>
      </tr>
    `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${subjek}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fff5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff5f8; padding: 28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(109, 15, 42, 0.08); border: 1px solid #fce7f3;">
          <tr>
            <td style="background: linear-gradient(135deg, #6d0f2a 0%, #d0346d 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Gia's Patisserie</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #fdf2f8;">Rekap Laporan Keuangan · ${tanggalLabel}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px;">
              <!-- 3 Kartu Ringkasan -->
              <table role="presentation" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td width="32%" style="background-color: #ecfdf5; border-radius: 12px; padding: 12px; text-align: center; border: 1px solid #a7f3d0;">
                    <div style="font-size: 11px; color: #047857; font-weight: 700; text-transform: uppercase;">Pemasukan</div>
                    <div style="font-size: 15px; font-weight: 800; color: #065f46; margin-top: 4px;">${formatRupiah(ringkasan.masuk)}</div>
                  </td>
                  <td width="2%"></td>
                  <td width="32%" style="background-color: #fff1f2; border-radius: 12px; padding: 12px; text-align: center; border: 1px solid #fecdd3;">
                    <div style="font-size: 11px; color: #be123c; font-weight: 700; text-transform: uppercase;">Pengeluaran</div>
                    <div style="font-size: 15px; font-weight: 800; color: #9f1239; margin-top: 4px;">${formatRupiah(ringkasan.keluar)}</div>
                  </td>
                  <td width="2%"></td>
                  <td width="32%" style="background-color: #fff5f8; border-radius: 12px; padding: 12px; text-align: center; border: 1px solid #fbcfe8;">
                    <div style="font-size: 11px; color: #9d174d; font-weight: 700; text-transform: uppercase;">Saldo Bersih</div>
                    <div style="font-size: 15px; font-weight: 800; color: #6d0f2a; margin-top: 4px;">${formatRupiah(ringkasan.sisa)}</div>
                  </td>
                </tr>
              </table>

              <!-- Daftar Transaksi -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #111827;">Rincian Transaksi (${daftarTransaksi.length} Catatan)</h3>
              <table role="presentation" width="100%" style="border-collapse: collapse; border: 1px solid #f4f4f5; border-radius: 10px; overflow: hidden;">
                ${barisTransaksiHtml || '<tr><td style="padding: 16px; text-align: center; color: #9ca3af; font-size: 13px;">Tidak ada transaksi pada periode ini.</td></tr>'}
              </table>

              <div style="text-align: center; margin-top: 24px;">
                <a href="https://tokogia.vercel.app" target="_blank" style="display: inline-block; background-color: #6d0f2a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 10px;">
                  Buka Dashboard Toko Gia
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #fafaf9; border-top: 1px solid #f4f4f5; padding: 16px; text-align: center; font-size: 11px; color: #9ca3af;">
              Laporan rekapitulasi otomatis Gia's Patisserie dikirim ke <strong>giacantik749@gmail.com</strong>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `Gia's Patisserie - Rekap Laporan Keuangan (${tanggalLabel})
-----------------------------------------------------------
Total Pemasukan   : ${formatRupiah(ringkasan.masuk)}
Total Pengeluaran : ${formatRupiah(ringkasan.keluar)}
Saldo Bersih      : ${formatRupiah(ringkasan.sisa)}
Total Transaksi   : ${daftarTransaksi.length}

Akses online: https://tokogia.vercel.app
`;

  return { subjek, html, text };
}

/**
 * Template untuk uji coba (Test email)
 */
export function buatTemplateEmailUjiCoba(): { subjek: string; html: string; text: string } {
  const waktuFormatted = formatWaktuWib(Date.now());
  const subjek = `✨ [Gia's Patisserie] Uji Coba Laporan Email Sukses!`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${subjek}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fff5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff5f8; padding: 28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(109, 15, 42, 0.08); border: 1px solid #fce7f3;">
          <tr>
            <td style="background: linear-gradient(135deg, #6d0f2a 0%, #d0346d 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Gia's Patisserie</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #fdf2f8;">Uji Coba Sistem Notifikasi Laporan</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 12px;">🎉</div>
              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #111827;">Email Berhasil Terhubung!</h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                Fitur notifikasi laporan otomatis Gia's Patisserie telah berhasil dikonfigurasi. Setiap ada transaksi/laporan baru masuk di kasir, email rincian akan langsung terkirim ke alamat ini.
              </p>
              <div style="background-color: #fafaf9; border-radius: 10px; padding: 12px; font-size: 12px; color: #6b7280; border: 1px solid #f4f4f5;">
                Waktu Uji Coba: <strong>${waktuFormatted}</strong><br>
                Tujuan Email: <strong>giacantik749@gmail.com</strong>
              </div>

              <div style="margin-top: 24px;">
                <a href="https://tokogia.vercel.app" target="_blank" style="display: inline-block; background-color: #6d0f2a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 10px;">
                  Buka Aplikasi Toko Gia
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #fafaf9; border-top: 1px solid #f4f4f5; padding: 16px; text-align: center; font-size: 11px; color: #9ca3af;">
              Gia's Patisserie · Homemade with Love
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `Gia's Patisserie - Uji Coba Laporan Email Sukses!
------------------------------------------------
Sistem laporan email otomatis berhasil terhubung ke giacantik749@gmail.com.
Waktu: ${waktuFormatted}
Akses online: https://tokogia.vercel.app
`;

  return { subjek, html, text };
}
