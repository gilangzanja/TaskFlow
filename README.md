# TaskFlow

TaskFlow adalah dashboard manajemen tugas pribadi untuk mencatat pekerjaan, menetapkan prioritas, dan memantau progres. Pengguna dapat membuat akun, masuk, dan menyimpan tugas di PostgreSQL melalui Supabase. Setiap pengguna hanya dapat mengakses tugas miliknya.

## Fitur

- Membuat, mengedit, dan menghapus tugas.
- Mendaftar, masuk, dan keluar menggunakan Supabase Auth.
- Menambahkan deskripsi, kategori, status, prioritas, dan tenggat waktu.
- Mengubah status dan prioritas tugas dari daftar tugas.
- Mencari tugas berdasarkan judul atau deskripsi.
- Memfilter tugas berdasarkan status dan prioritas, serta mengurutkan berdasarkan tenggat waktu.
- Melihat ringkasan jumlah tugas dan progres penyelesaian.
- Beralih antara tema terang dan gelap.
- Menggunakan dashboard melalui layout responsif untuk desktop maupun layar kecil.

## Teknologi

- HTML5
- CSS
- JavaScript ES Modules (vanilla)
- Tailwind CSS v4 (compiled by Vite)
- Node.js and Express BFF
- Supabase Auth untuk autentikasi pengguna
- PostgreSQL dengan Row Level Security (RLS) untuk data tugas
- Browser `localStorage` hanya untuk preferensi tema

## Menjalankan aplikasi

### Prasyarat

- Node.js versi 20.19+ atau 22.12+
- Proyek Supabase

### Konfigurasi Supabase

1. Buat proyek di [Supabase](https://supabase.com/).
2. Buka **Project Settings → API** dan salin Project URL serta publishable key (atau anon key).
3. Salin `.env.example` menjadi `.env.local`, lalu isi konfigurasi server:

   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-publishable-or-anon-key
   APP_ORIGIN=http://localhost:5173
   PORT=3000
   NODE_ENV=development
   ```

   Pengaturan Supabase hanya dibaca oleh backend dan tidak dimasukkan ke bundle browser. Gunakan anon/publishable key; **jangan** gunakan `service_role` key di frontend atau backend aplikasi ini.

4. Jalankan SQL pada `supabase/migrations/20261023000000_create_tasks.sql` melalui Supabase SQL Editor. Migrasi membuat tabel `tasks`, membatasi akses dengan RLS, dan hanya memberi akses tabel kepada role `authenticated`.
5. Di **Authentication → URL Configuration**, tambahkan `http://localhost:5173/` sebagai redirect URL. Tambahkan juga URL produksi ketika aplikasi dipublikasikan.
6. Atur konfirmasi email sesuai kebutuhan di pengaturan Auth Supabase. Jika konfirmasi email aktif, pengguna perlu mengonfirmasi alamat email sebelum masuk.

### Menjalankan aplikasi

Pasang dependensi lalu jalankan frontend dan backend lokal:

```bash
npm install
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173). Backend API berjalan di port `3000`; Vite meneruskan request `/api` ke backend tersebut.

Untuk membuat frontend produksi dan menjalankan backend yang menyajikannya:

```bash
npm run build
npm start
```

Di lingkungan produksi, atur `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_ORIGIN` (harus HTTPS), `PORT`, dan `NODE_ENV=production` sebagai environment variables pada hosting. Cookie sesi memakai `HttpOnly`, `SameSite=Strict`, dan `Secure` di production; aplikasi produksi harus dilayani melalui HTTPS.

Untuk menjalankan tes:

```bash
npm test
```

Jangan membuka `index.html` langsung dengan protokol `file://`; aplikasi perlu dijalankan melalui Vite dan backend API.

> CSS Tailwind dibangun secara lokal. Font aplikasi diambil dari Google Fonts, sehingga koneksi internet diperlukan untuk memuat font tersebut.

## Cara menggunakan

1. Buka halaman **My Tasks**, lalu pilih **Add Task**.
2. Isi judul dan tenggat waktu. Deskripsi dan kategori bersifat opsional; kategori kosong akan menggunakan nilai `General`.
3. Pilih status dan prioritas, lalu simpan tugas.
4. Perbarui status atau prioritas langsung dari kartu tugas. Gunakan tombol edit untuk mengubah detail tugas, atau hapus tugas setelah konfirmasi.
5. Gunakan pencarian, filter status/prioritas, dan pengurutan tenggat waktu untuk menemukan tugas tertentu. Pilih **Reset filters** untuk menghapus filter.
6. Buka **Dashboard** atau **Progress** untuk melihat ringkasan pekerjaan. Gunakan tombol tema pada header untuk mengganti tampilan terang/gelap.

Status yang tersedia: `Todo`, `In Progress`, dan `Done`. Prioritas yang tersedia: `Low`, `Medium`, dan `High`.

## Penyimpanan data

Data tugas disimpan di tabel PostgreSQL `public.tasks` pada proyek Supabase. Row Level Security memastikan setiap akun hanya dapat membaca dan mengubah baris dengan `user_id` miliknya. Preferensi tema tetap disimpan di `localStorage` dengan key `taskFlow-theme`.

Tugas yang sebelumnya tersimpan di `localStorage` tidak diimpor dan tidak dihapus oleh versi ini. Buat ulang tugas tersebut setelah masuk jika masih diperlukan.

Token sesi tidak dikirim di respons JSON atau disimpan di storage yang dapat dibaca JavaScript. Backend mengelolanya melalui cookie `HttpOnly`; cookie sesi diperbarui saat token perlu di-refresh dan dihapus saat logout. Permintaan yang mengubah data juga harus berasal dari origin aplikasi yang dikonfigurasi.

## Struktur proyek

```text
.
├── index.html
├── package.json
├── PRODUCT.md
├── server/             # BFF Express, autentikasi, cookie sesi, dan API tugas
├── supabase/
│   └── migrations/     # Skema PostgreSQL dan kebijakan RLS
├── tests/              # Tes unit dan pengamanan API
└── assets/
    ├── css/
    │   └── style.css
    ├── images/
    │   └── taskflow-logo.png
    └── js/
        ├── data/       # Klien API tugas dan pemetaan data
        ├── features/   # Auth, navigasi, modal, tema, dan sidebar
        ├── ui/         # Render daftar tugas, statistik, dan notifikasi
        ├── utils/      # Utilitas tanggal dan penyimpanan tema
        └── main.js     # Inisialisasi aplikasi dan event utama
```

## Batasan saat ini

- Aplikasi mendukung akun individual, bukan kolaborasi atau workspace tim.
- Data tugas memerlukan koneksi internet dan proyek Supabase yang telah dikonfigurasi.
- Migrasi otomatis tugas lama dari `localStorage` belum tersedia.
- Pembatasan login memakai rate limiter in-memory; untuk menjalankan beberapa instance backend, ganti dengan rate-limit store bersama.

## Kontribusi

Perubahan dan penyempurnaan dipersilakan. Untuk perubahan fitur, pertimbangkan menjaga aplikasi tetap ringan, responsif, dan mudah digunakan dengan backend seminimal mungkin.
