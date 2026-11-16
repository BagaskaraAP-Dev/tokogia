import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export const EMAIL_TUJUAN_DEFAULT = 'giacantik749@gmail.com';

export interface KirimEmailParams {
  to?: string;
  subjek: string;
  html: string;
  text?: string;
}

export interface HasilKirimEmail {
  sukses: boolean;
  provider: 'resend' | 'smtp' | 'simulasi';
  pesanId?: string;
  catatan?: string;
}

/**
 * Mengirim email menggunakan Resend API atau Gmail SMTP.
 * Default tujuan selalu ke giacantik749@gmail.com.
 */
export async function kirimEmail({
  to = EMAIL_TUJUAN_DEFAULT,
  subjek,
  html,
  text,
}: KirimEmailParams): Promise<HasilKirimEmail> {
  const emailTujuan = to || EMAIL_TUJUAN_DEFAULT;
  const resendApiKey = process.env.RESEND_API_KEY;
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER || EMAIL_TUJUAN_DEFAULT;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  // 1. Coba lewat Resend (jika RESEND_API_KEY terkonfigurasi)
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const pengirim =
        process.env.EMAIL_FROM || "Gia's Patisserie <onboarding@resend.dev>";

      const respon = await resend.emails.send({
        from: pengirim,
        to: [emailTujuan],
        subject: subjek,
        html,
        text,
      });

      if (respon.error) {
        throw new Error(respon.error.message);
      }

      return {
        sukses: true,
        provider: 'resend',
        pesanId: respon.data?.id,
        catatan: `Email terkirim ke ${emailTujuan} melalui Resend.`,
      };
    } catch (err: unknown) {
      console.error('Gagal kirim via Resend:', err);
      // Lanjut ke opsi berikutnya jika ada
    }
  }

  // 2. Coba lewat Gmail SMTP / Nodemailer (jika password aplikasi Gmail terpasang)
  if (gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Gia's Patisserie" <${gmailUser}>`,
        to: emailTujuan,
        subject: subjek,
        html,
        text,
      });

      return {
        sukses: true,
        provider: 'smtp',
        pesanId: info.messageId,
        catatan: `Email terkirim ke ${emailTujuan} melalui Gmail SMTP.`,
      };
    } catch (err: unknown) {
      console.error('Gagal kirim via SMTP:', err);
    }
  }

  // 3. Fallback jika kredensial belum dimasukkan ke environment Vercel
  // Sistem mencatat log dan tidak membuat aplikasi kasir terhenti (graceful degradation)
  console.log(`[SIMULASI EMAIL] Dikirim ke: ${emailTujuan}`);
  console.log(`[SIMULASI EMAIL] Subjek: ${subjek}`);

  return {
    sukses: true,
    provider: 'simulasi',
    catatan: `Laporan tercatat. Untuk mengirim email langsung ke ${emailTujuan}, pasang RESEND_API_KEY atau GMAIL_APP_PASSWORD di Pengaturan Vercel.`,
  };
}
