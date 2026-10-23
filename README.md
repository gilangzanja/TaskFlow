# TaskFlow

TaskFlow adalah dashboard manajemen tugas pribadi yang ringan untuk membantu Anda mencatat pekerjaan, menetapkan prioritas, dan memantau progres dalam satu workspace. Aplikasi berjalan langsung di browser tanpa akun atau backend; data tugas disimpan secara lokal di browser.

## Fitur

- Membuat, mengedit, dan menghapus tugas.
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
- Tailwind CSS 
- Browser `localStorage` untuk penyimpanan tugas dan preferensi tema

## Menjalankan aplikasi

Tidak diperlukan instalasi dependensi atau proses build. Karena aplikasi menggunakan JavaScript modules, jalankan melalui server lokal, bukan dengan membuka `index.html` langsung melalui protokol `file://`.

### Opsi 1: Visual Studio Code Live Server

1. Buka folder proyek di Visual Studio Code.
2. Jalankan `index.html` menggunakan ekstensi Live Server.
3. Aplikasi akan terbuka di browser.

### Opsi 2: Python

Dari direktori proyek, jalankan:

```bash
python -m http.server 8000
```

Kemudian buka [http://localhost:8000](http://localhost:8000) di browser.

> Tailwind CSS dan font aplikasi dimuat dari CDN. Koneksi internet diperlukan agar resource tersebut dapat dimuat.

## Cara menggunakan

1. Buka halaman **My Tasks**, lalu pilih **Add Task**.
2. Isi judul dan tenggat waktu. Deskripsi dan kategori bersifat opsional; kategori kosong akan menggunakan nilai `General`.
3. Pilih status dan prioritas, lalu simpan tugas.
4. Perbarui status atau prioritas langsung dari kartu tugas. Gunakan tombol edit untuk mengubah detail tugas, atau hapus tugas setelah konfirmasi.
5. Gunakan pencarian, filter status/prioritas, dan pengurutan tenggat waktu untuk menemukan tugas tertentu. Pilih **Reset filters** untuk menghapus filter.
6. Buka **Dashboard** atau **Progress** untuk melihat ringkasan pekerjaan. Gunakan tombol tema pada header untuk mengganti tampilan terang/gelap.

Status yang tersedia: `Todo`, `In Progress`, dan `Done`. Prioritas yang tersedia: `Low`, `Medium`, dan `High`.

## Penyimpanan data

Tugas disimpan di `localStorage` browser dengan key `taskFlow-tasks`, sementara preferensi tema disimpan dengan key `taskFlow-theme`. Data tidak dikirim atau disinkronkan ke server, sehingga hanya tersedia pada browser dan perangkat tempat data dibuat. Menghapus data situs/browser dapat menghapus tugas yang tersimpan.

Saat pertama kali dibuka tanpa data tersimpan, aplikasi menampilkan beberapa tugas contoh.

## Struktur proyek

```text
.
├── index.html
├── PRODUCT.md
└── assets/
    ├── css/
    │   └── style.css
    ├── images/
    │   └── taskflow-logo.png
    └── js/
        ├── data/       # Data tugas awal
        ├── features/   # Tugas, navigasi, modal, tema, dan sidebar
        ├── ui/         # Render daftar tugas, statistik, dan notifikasi
        ├── utils/      # Penyimpanan dan utilitas tanggal
        └── main.js     # Inisialisasi aplikasi dan event utama
```

## Batasan saat ini

- Aplikasi dirancang untuk penggunaan pribadi dalam satu browser.
- Belum tersedia autentikasi, kolaborasi, sinkronisasi antarperangkat, maupun penyimpanan server.
- Belum ada proses build atau test runner yang dikonfigurasi.

## Kontribusi

Perubahan dan penyempurnaan dipersilakan. Untuk perubahan fitur, pertimbangkan menjaga aplikasi tetap ringan, responsif, dan mudah digunakan tanpa backend.
