-- ==============================================================================
-- SKEMA DATABASE CLOUD GIA'S PATISSERIE (SUPABASE POSTGRESQL)
-- Salin dan jalankan seluruh skrip SQL ini di SQL Editor Supabase Anda.
-- ==============================================================================

-- 1. TABEL TRANSAKSI KEUANGAN
create table if not exists public.transaksi (
  id text primary key,
  jenis text not null check (jenis in ('masuk', 'keluar')),
  nominal bigint not null,
  keterangan text not null default '',
  kategori text,
  waktu bigint not null,
  dibuat bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indeks untuk pencarian dan filter cepat
create index if not exists idx_transaksi_waktu on public.transaksi (waktu desc);
create index if not exists idx_transaksi_jenis on public.transaksi (jenis);
create index if not exists idx_transaksi_kategori on public.transaksi (kategori);

-- 2. TABEL KATEGORI TRANSAKSI
create table if not exists public.kategori (
  id text primary key,
  nama text not null,
  lingkup text not null check (lingkup in ('masuk', 'keluar', 'umum')),
  bawaan boolean default false not null
);

-- Seed kategori awal jika belum ada
insert into public.kategori (id, nama, lingkup, bawaan) values
  ('bawaan-penjualan', 'Penjualan', 'masuk', true),
  ('bawaan-bahan-baku', 'Bahan Baku', 'keluar', true),
  ('bawaan-kemasan', 'Kemasan', 'keluar', true),
  ('bawaan-operasional', 'Operasional', 'keluar', true),
  ('bawaan-lainnya', 'Lainnya', 'umum', true)
on conflict (id) do nothing;

-- 3. TABEL RESEP KUE & BAHAN
create table if not exists public.resep (
  id text primary key,
  nama text not null,
  kategori text not null,
  foto_url text,
  porsi text,
  bahan jsonb default '[]'::jsonb not null,
  langkah jsonb default '[]'::jsonb not null,
  catatan text,
  modal_bahan bigint,
  harga_jual bigint,
  dibuat bigint not null,
  diubah bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. KEAMANAN & AKSES (Row Level Security / RLS)
alter table public.transaksi enable row level security;
alter table public.kategori enable row level security;
alter table public.resep enable row level security;

-- Izinkan akses penuh (SELECT, INSERT, UPDATE, DELETE) untuk koneksi publik dengan API Key Anonim
create policy "Akses publik penuh transaksi" on public.transaksi
  for all using (true) with check (true);

create policy "Akses publik penuh kategori" on public.kategori
  for all using (true) with check (true);

create policy "Akses publik penuh resep" on public.resep
  for all using (true) with check (true);

-- 5. AKTIFKAN REALTIME REPLICATION (Opsional untuk sinkronisasi otomatis antar ponsel)
alter publication supabase_realtime add table public.transaksi;
alter publication supabase_realtime add table public.kategori;
alter publication supabase_realtime add table public.resep;
