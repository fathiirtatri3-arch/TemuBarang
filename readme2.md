# 🎒 TemuBarang — Dokumentasi Teknis Lengkap

> **Dokumentasi ini adalah versi ekstensif dari `README.md`.**
> `README.md` berisi ringkasan & changelog naratif. Berkas `readme2.md` ini
> berisi penjelasan **teknis, mendetail, dan terstruktur** atas cara TemuBarang
> benar-benar bekerja: arsitektur, basis data, algoritma AI, alur kerja,
> konfigurasi, dan batasan yang sudah diverifikasi langsung terhadap kode
> sumber.

| | |
|---|---|
| **Nama Proyek** | TemuBarang |
| **Tagline** | Sistem Informasi Barang Hilang & Barang Temuan Berbasis AI dan Geolokasi |
| **Wilayah** | Kecamatan Sambikerep, Surabaya, Jawa Timur |
| **Versi Framework** | Laravel 12 (`^12.0`), PHP `^8.2` |
| **Repositori** | `https://github.com/fathiirtatri3-arch/TemuBarang.git` |
| **Lisensi** | MIT (untuk keperluan pembelajaran/pilot project) |
| **Terakhir Diperbarui** | 24 November 2026 |

---

## 📑 Daftar Isi

1. [Gambaran Umum Proyek](#1-gambaran-umum-proyek)
2. [Latar Belakang & Masalah yang Diselesaikan](#2-latar-belakang--masalah-yang-diselesaikan)
3. [Visi, Misi, dan Prinsip Desain](#3-visi-misi-dan-prinsip-desain)
4. [Cakupan Wilayah](#4-cakupan-wilayah)
5. [Arsitektur Sistem](#5-arsitektur-sistem)
6. [Teknologi & Dependency](#6-teknologi--dependency)
7. [Peran Pengguna & Matriks Hak Akses (RBAC)](#7-peran-pengguna--matriks-hak-akses-rbac)
8. [Struktur Proyek Detail](#8-struktur-proyek-detail)
9. [Basis Data](#9-basis-data)
10. [Alur Kerja Utama (End-to-End)](#10-alur-kerja-utama-end-to-end)
11. [Modul 1 — Autentikasi & Manajemen Pengguna](#11-modul-1--autentikasi--manajemen-pengguna)
12. [Modul 2 — Pelaporan Barang Hilang & Temuan](#12-modul-2--pelaporan-barang-hilang--temuan)
13. [Modul 3 — Pencocokan Cerdas Berbasis AI](#13-modul-3--pencocokan-cerdas-berbasis-ai)
14. [Modul 4 — Privasi Foto & Deteksi Data Pribadi (PII)](#14-modul-4--privasi-foto--deteksi-data-pribadi-pii)
15. [Modul 5 — Nomor Seri / IMEI](#15-modul-5--nomor-seri--imei)
16. [Modul 6 — Sistem Klaim & Serah Terima](#16-modul-6--sistem-klaim--serah-terima)
17. [Modul 7 — Siklus Barang Temuan 30 Hari & Berita Acara](#17-modul-7--siklus-barang-temuan-30-hari--berita-acara)
18. [Modul 8 — Multi-Wilayah & Peta Interaktif](#18-modul-8--multi-wilayah--peta-interaktif)
19. [Modul 9 — Notifikasi](#19-modul-9--notifikasi)
20. [Modul 10 — Dashboard, Pencarian & Moderasi](#20-modul-10--dashboard-pencarian--moderasi)
21. [Modul 11 — Papan Barang Temuan Publik](#21-modul-11--papan-barang-temuan-publik)
22. [Referensi API](#22-referensi-api)
23. [Panduan Instalasi Menyeluruh](#23-panduan-instalasi-menyeluruh)
24. [Konfigurasi Environment](#24-konfigurasi-environment)
25. [Pengujian & Menjaga Kualitas](#25-pengujian--menjaga-kualitas)
26. [Operasional, Scheduler & Perawatan](#26-operasional-scheduler--perawatan)
27. [Pengoptimalan Performa](#27-pengoptimalan-performa)
28. [Keamanan & Privasi](#28-keamanan--privasi)
29. [Known Issues & Batasan](#29-known-issues--batasan)
30. [Roadmap](#30-roadmap)
31. [Kamus Istilah](#31-kamus-istilah)
32. [Kontributor](#32-kontributor)

---

## 1. Gambaran Umum Proyek

**TemuBarang** adalah platform web yang menghubungkan **warga yang kehilangan
barang** dengan **warga yang menemukan barang** di dalam satu ekosistem
digital yang terpusat, aman, dan mudah diakses.

Berbeda dengan sekadar "papan pengumuman" barang hilang, TemuBarang
menghadirkan empat kemampuan yang biasanya terpisah:

| Kemampuan | Masalah yang dipecahkan |
|---|---|
| **Pencocokan otomatis (AI)** | Secara manual membandingkan ratusan laporan tidak realistis. AI mencocokkan foto + teks setiap kali laporan diverifikasi. |
| **Bukti kepemilikan terverifikasi (IMEI)** | "Ciri khusus" saja bisa ditebak atau dibocorkan. Nomor seri perangkat + checksum Luhn adalah bukti yang jauh lebih kuat. |
| **Perlindungan privasi foto otomatis** | Foto KTP/dompet yang diunggah warga bisa membocorkan data pribadi. Deteksi PII via OCR + Haar Cascade otomatis menutupinya. |
| **Siklus barang temuan yang tertutup** | Barang temuan butuh aturan: disimpan berapa lama, apa yang terjadi kalau tidak ada yang mengklaim, dan bagaimana bukti pelepasannya. |

Seluruh sistem dirancang untuk **pilot project** di **Kecamatan Sambikerep,
Surabaya** — 4 kelurahan dengan ± 50.000–60.000 jiwa — tetapi arsitekturnya
sengaja dibuat modular agar bisa direplikasi ke kecamatan lain.

### Angka Singkat Proyek

| Metrik | Nilai |
|---|---|
| Baris kode PHP (`app/`, `database/`, `routes/`, `config/`, `tests/`) | ± 10.200 baris |
| Baris kode JS/JSX (`resources/js/`) | ± 13.100 baris |
| Baris kode Python (`multiverse/python/`) | 522 baris (244 matcher + 278 detektor PII) |
| Jumlah tabel domain | 7 (`users`, `regions`, `reports`, `claims`, `notifications`, `match_results`, `report_followups`) |
| Jumlah halaman Inertia/React | 27 |
| Jumlah migration | 26 |
| Jumlah test | 45+ (28 test siklus klaim + 17 test autentikasi Breeze) |
| Kategori barang | 13 |
| Model AI | MobileNetV2 ONNX (14 MB, embedding 1000-dim) |
| Algoritma CV | AKAZE, ORB, HOG, Histogram HSV |

---

## 2. Latar Belakang & Masalah yang Diselesaikan

### 2.1 Realitas sebelum TemuBarang

Di lingkungan RT/kelurahan, barang hilang diproses secara manual:

```
Warga kehilangan dompet
        ↓
Warga melapor ke RT
        ↓
RT membuat pengumuman di grup WhatsApp
        ↓
Penemu barang melihat pengumuman (mungkin berminggu-minggu kemudian)
        ↓
Penemu menghubungi pelapor secara pribadi
        ↓
Tidak ada verifikasi kepemilikan → risiko salah orang
```

**Lima masalah struktural** muncul dari alur ini:

1. **Ketidakjelasan status.** Tidak ada yang tahu apakah barang masih ada, sudah
   diambil orang yang salah, atau sudah dibuang.
2. **Tidak ada jejak.** Setelah barang diserahkan, tidak ada catatan siapa yang
   menerimanya, kapan, dan atas dasar apa.
3. **Cakupan terbatas.** Hanya warga di dalam satu grup WhatsApp yang tahu.
   Warga yang baru pindah atau pendatang tidak pernah tahu.
4. **Tidak ada privasi.** Foto KTP/ATM/uang yang dikirim ke grup WhatsApp
   tersebar permanen dan tidak bisa ditarik.
5. **Tidak ada akuntabilitas.** Kalau barang hilang atau salah orang, tidak ada
   yang bisa ditunjuk.

### 2.2 Bagaimana TemuBarang menjawabnya

| Masalah lama | Solusi TemuBarang | Implementasi konkrit |
|---|---|---|
| Pencocokan manual | AI pencocokan foto + teks otomatis | `MatchScoreService` + `multiverse/python/image_matcher/main.py` |
| Bukti kepemilikan lemah | Nomor seri / IMEI + checksum Luhn | `ImeiService`, kolom `reports.reported_imei` |
| Foto bocor data pribadi | Deteksi PII otomatis + blur + disk privat | `PhotoPrivacyService` + `multiverse/python/pii_detector/main.py` |
| Barang temuan menggantung | Siklus 30 hari + berita acara | `ClaimWindowService` + tabel `report_followups` |
| Tidak ada jejak | Riwayat status, notifikasi, berita acara | `reports.status`, `notifications`, `report_followups` |
| Cakupan terbatas | Papan barang temuan **publik** tanpa login | `PublicBoardController` → `/barang-temuan` |

---

## 3. Visi, Misi, dan Prinsip Desain

### 3.1 Visi

> Menjadi platform rujukan warga Kecamatan Sambikerep dalam pengembalian barang
> hilang kepada pemiliknya yang sah, dengan memanfaatkan teknologi AI dan
> geolokasi.

### 3.2 Misi

1. Mempermudah warga melaporkan barang hilang dan temuan dalam satu platform.
2. Mempercepat proses pencocokan barang menggunakan AI (computer vision +
   text matching).
3. Memfasilitasi komunikasi antara pemilik barang dan penemu melalui sistem
   notifikasi dan klaim terverifikasi.
4. Menyediakan data statistik bagi pemerintah kecamatan untuk pengambilan
   keputusan.
5. Membangun kepercayaan warga melalui verifikasi berjenjang dan moderasi
   konten.

### 3.3 Prinsip Desain (yang benar-benar diimplementasikan di kode)

Prinsip-prinsip ini bukan slogan — setiap poin merujuk ke kode nyata:

| # | Prinsip | Wujud di Kode |
|---|---|---|
| 1 | **Privacy by default** | Properti `$hidden` pada model `Report` menyembunyikan `secret_feature`, `reported_imei`, `photo_original`, `serial_number`, `pii_reasons` dari serialisasi JSON. |
| 2 | **Fail-safe, bukan fail-open** | Detektor PII yang gagal → foto **tetap disamarkan** (`PiiDetectionService` mengembalikan `detected => true` + pesan error). |
| 3 | **Satu sumber kebenaran untuk skor** | `MatchScoreService` adalah satu-satunya tempat menghitung skor; dipakai bersama oleh halaman Pencocokan, modal "Cari Kecocokan", dan notifikasi kecocokan. |
| 4 | **Otorisasi berbasis wilayah, bukan role saja** | `User::canManageRegion()` — admin kelurahan hanya boleh mengelola laporan dengan `region_id` miliknya. |
| 5 | **Operasi destruktif terbatas** | Penghapusan massal & perubahan role dibatasi oleh `canManageRegion()` dan `isSuperAdmin()`. |
| 6 | **Sistem tidak pernah mengklaim barang "milik negara"** | Tidak ada status tersebut; barang hanya bisa `expired` → `released` melalui berita acara. |
| 7 | **Tidak ada data yang hilang diam-diam** | Penghapusan data sensitif hanya terjadi saat barang benar-benar dilepas, dan tercatat via `Log::info`. |
| 8 | **Idempoten** | `sendOnce()` / `sendOncePerReport()` mencegah notifikasi ganda; `openWindow()` aman dipanggil berulang. |

---

## 4. Cakupan Wilayah

**Kecamatan Sambikerep, Surabaya, Jawa Timur**

| Aspek | Data |
|---|---|
| Kecamatan | Sambikerep |
| Kota | Surabaya |
| Provinsi | Jawa Timur |
| Luas | ± 12,5 km² |
| Populasi | ± 50.000–60.000 jiwa |
| Kelurahan | **4** — Made, Bringin, Lontar, Sambikerep |
| Batas Utara | Kecamatan Tandes / Benowo |
| Batas Selatan | Kecamatan Wiyung / Karang Pilang |
| Batas Timur | Kecamatan Lakarsantri |
| Batas Barat | Kecamatan Benowo / Menganti (Gresik) |

### 4.1 Struktur `regions` (hierarkis & self-referencing)

Tabel `regions` dirancang generik agar bisa diskalakan ke struktur administratif
bertingkat:

```php
// type = 'kecamatan' → 1 baris: "Kecamatan Sambikerep" (parent_id = null)
// type = 'kelurahan' → 4 baris: "Kelurahan Made", dll. (parent_id → id kecamatan)
// type = 'rw'        → disiapkan untuk RW/RT (parent_id → id kelurahan)
```

Kolom koordinat & batas peta disimpan langsung di tabel agar **peta bisa
mengekspor batas wilayah tanpa API Regions tambahan**:

| Kolom | Tipe | Fungsi |
|---|---|---|
| `latitude`, `longitude` | `decimal(10,7)` | Titik tengah wilayah (untuk zoom ke wilayah) |
| `bounds_north/south/east/west` | `decimal(10,7)` | Batas wilayah (untuk `restriction.latLngBounds` di Google Maps) |
| `kecamatan` | `varchar` | Default `"Sambikerep"` |
| `kota` | `varchar` | Default `"Surabaya"` |

### 4.2 Titik pusat peta

```javascript
// resources/js/Components/GoogleMap.jsx & GoogleMapView.jsx
center: { lat: -7.2745, lng: 112.6585 }
zoom: 14
```

---

## 5. Arsitektur Sistem

### 5.1 Diagram Arsitektur Lapisan

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        LAPISAN PRESENTASI (Browser)                         │
│  React 18 + Inertia 2 + Tailwind CSS 3 + Framer-Motion + GSAP + Lenis     │
│                                                                            │
│  Welcome  Dashboard  ReportsList  Create/Edit/Detail Report  MatchesList   │
│  MatchResult  SearchPage  FoundBoard  Admin/{Dashboard,Claims,ClaimDetail, │
│  Users,UserDetail,ReportFollowup}  Notifications/Index  Auth/*  Profile/* │
└────────────────────────────────┬───────────────────────────────────────────┘
                                 │  Inertia Protocol (JSON props + redirect)
                                 │  + Axios ke /api/* (JSON)
┌────────────────────────────────▼───────────────────────────────────────────┐
│                     LAPISAN APLIKASI (Laravel 12 / PHP 8.2)                 │
│                                                                            │
│  ┌── Middleware ────────────────────────────────────────────────────────┐  │
│  │ HandleInertiaRequests (share auth user, flash, nav)                │  │
│  │ AdminMiddleware (alias 'admin')  │  auth  │  verified                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌── Controllers ──────────────────────────────────────────────────────┐  │
│  │ Web:  ReportController  ClaimController  MatchingPageController     │  │
│  │       PublicBoardController  NotificationController  ProfileController│  │
│  │ Admin: Admin/{UserController, ReportFollowupController}             │  │
│  │ Api:   Api/{MatchingController, DashboardController,                 │  │
│  │              SearchController, AdditionalApiController,              │  │
│  │              NotificationController, ReportController}              │  │
│  │ Auth:  Auth/* (Breeze: register, login, verify, password reset)     │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌── Services (Domain Logic) ──────────────────────────────────────────┐  │
│  │ MatchScoreService      → orkestrator skor (TEKS + FOTO + IMEI)      │  │
│  │ ImageMatchingService   → bridge PHP → Python (proc_open + JSON)    │  │
│  │ ImeiService            → normalisasi, Luhn, banding 3 sumber        │  │
│  │ PhotoPrivacyService    → blur, disk privat, deteksi PII, EXIF scrub │  │
│  │ PiiDetectionService    → bridge PHP → Python (fail-safe)           │  │
│  │ ClaimWindowService     → masa klaim, kedaluwarsa, berita acara     │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌── Helpers / Traits ─────────────────────────────────────────────────┐  │
│  │ NotificationHelper (send, sendToRegionAdmins, sendOnce,             │  │
│  │                    sendOncePerReport, adminsOfRegion,                │  │
│  │                    checkAndNotifyMatches)                           │  │
│  │ BadWords (filter kata kasar)  │  ApiResponseTrait                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌── Console Commands ─────────────────────────────────────────────────┐  │
│  │ reports:check-expiry     (harian 06:15)                             │  │
│  │ users:delete-unverified  (Senin & Kamis 02:00)                      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────┬──────────────────────────────────────────────┬────────────────────┘
       │                                              │
┌──────▼────────────────────┐          ┌──────────────▼────────────────────┐
│      LAPISAN DATA         │          │      LAPISAN AI (Python 3.14)     │
│  MySQL 8 (7 tabel domain) │          │  venv: multiverse/python/venv     │
│  + cache + sessions + jobs│          │                                    │
│  + Redis (opsional)       │          │  image_matcher/main.py             │
│  + Google Maps JS API     │          │   ├─ MobileNetV2 ONNX (embedding)  │
└───────────────────────────┘          │   ├─ AKAZE  (35%)                 │
                                       │   ├─ ORB   (25%)                 │
                                       │   ├─ HOG   (15%)                 │
                                       │   └─ HSV Histogram (25%)          │
                                       │                                    │
                                       │  pii_detector/main.py             │
                                       │   ├─ Tesseract OCR (NIK/kartu)    │
                                       │   ├─ Kata kunci dokumen identitas  │
                                       │   └─ Haar Cascade (deteksi wajah) │
                                       │                                    │
                                       │  DIBANGUN DENGAN: Tesseract-OCR   │
                                       │  (binary eksternal, bukan pip)     │
                                       └────────────────────────────────────┘
```

### 5.2 Arsitektur AI — Alur Data Detail

```
 Laporan baru diverifikasi admin
             │
             ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  NotificationHelper::checkAndNotifyMatches($report)          │
 │  ───────────────────────────────────────────────────────────  │
 │  1. Ambil laporan VERIFIED dengan type berlawanan            │
 │  2. Untuk tiap pasangan:                                    │
 │      a. Cek cache MatchResult (report_id_1/2 ternormalisasi) │
 │      b. Kalau belum cache → panggil Python                   │
 │  3. Skip cepat bila text_score*0.5 + 50 < 60                │
 │      (skor foto maksimum 50, jadi mustahil mencapai ambang)   │
 │  4. Kirim notifikasi ke pemilik laporan yang hilang           │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  ImageMatchingService::compareWithCache()                    │
 │  ───────────────────────────────────────────────────────────  │
 │  Cache hit  → return photo_score dari match_results          │
 │  Cache miss → compare() → Python → simpan ke match_results   │
 └──────────────────────────────┬───────────────────────────────┘
                                │  proc_open("python.exe" "main.py")
                                │  stdin: {"image1_path":"...","image2_path":"..."}
                                │  stdout: JSON
                                │  timeout: 20 detik (SIGKILL)
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  Python: image_matcher/main.py                               │
 │  ───────────────────────────────────────────────────────────  │
 │  load_image()  → resize menjaga rasio (MAX_SIDE = 512)       │
 │  extract_features():                                         │
 │    • grayscale → bilateralFilter(5,40,40) → CLAHE(2.0,(8,8)) │
 │    • AKAZE (MLDB, threshold .001, 4 octave × 4 layer)        │
 │    • ORB (1000 fitur)                                        │
 │    • HSV Histogram (center-crop 60%, kanal H+S, 18×16 bin)   │
 │    • HOG (128×128, win 16×16, block 8×8, 9 bin)              │
 │    • MobileNetV2 ONNX → 1000-dim embedding (L2-normalized)   │
 │                                                              │
 │  combine:                                                   │
 │    classic = AKAZE·0.35 + ORB·0.25 + HIST·0.25 + HOG·0.15  │
 │    photo   = CNN·0.60 + classic·0.40                         │
 │    (kalau CNN gagal → photo = classic saja)                  │
 └──────────────────────────────┬───────────────────────────────┘
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │  MatchScoreService::score($a, $b)                            │
 │  ───────────────────────────────────────────────────────────  │
 │  IF imeiMatches($a,$b) → score 100 (short-circuit)          │
 │  ELSE:                                                     │
 │    text  = (nama 20 + kategori 20 + warna 10) × 2  (max 100) │
 │    photo = hasil Python (0–100)                             │
 │    score = round(text×0.50 + photo×0.50, 2)                 │
 │                                                              │
 │  label: ≥65 "sangat_mirip" | ≥35 "mungkin_cocok" | else     │
 └──────────────────────────────────────────────────────────────┘
```

### 5.3 Arsitektur Privasi Foto — Dual-Disk

```
        📤 Unggah foto
             │
             ▼
   Storage::disk('public') → storage/app/public/reports/{uuid}.jpg
             │
             ├──┬─ Kategori SENSITIF (Dokumen & Surat, Kartu & Identitas, Uang)
             │  │      → protect($report, hardLock: true)
             │  │
             │  └──┬─ Kategori biasa & foto baru diunggah
             │     │      → detectPersonalData() → PiiDetectionService
             │     │           ├─ detected = true  → protect($report, hardLock: false)
             │     │           └─ detected = false → sanitize() (buang EXIF/GPS)
             │     │
             │     └──┬─ Semua kategori, tanpa PII
             │            → sanitize()
             │
             ▼
   protect():
     1) Salin binary → Storage::disk('local') → storage/app/private/private-photos/{uuid}.jpg
        ↑ TIDAK punya URL publik. Hanya bisa dibaca lewat route terotorisasi.
     2) Buat versi buram → Storage::disk('public') → storage/app/public/reports/blur_{uuid}.jpg
     3) Hapus file asli dari disk publik
     4) Update: photo=blur, photo_original=privat, photo_blurred=true, photo_sensitive=hardLock
```

**Konsekuensi yang harus dipahami:**

- Foto publik yang sedang ditampilkan = versi buram (40 px downscale → 640 px
  upscale → 4× Gaussian blur → JPEG q60).
- Original tetap utuh di disk privat supaya admin bisa mengoreksi kesalahan
  deteksi.
- Foto asli **tidak pernah** diekspos lewat `public/storage`.
- AI pencocokan memakai **foto asli privat** bila tersedia
  (`MatchScoreService::photoPath()`), sehingga privasi tidak mengorbankan
  kualitas pencocokan.

### 5.4 Struktur Folder Tree

```
temubarang/
├── app/
│   ├── Console/Commands/
│   │   ├── CheckReportExpiry.php        # Peringatan H-5, kedaluwarsa, eskalasi
│   │   └── DeleteUnverifiedUsers.php    # Bersihkan akun tak terverifikasi
│   ├── Helpers/
│   │   ├── BadWords.php                 # Filter kata kasar (23 kata)
│   │   └── NotificationHelper.php       # Pusat notifikasi + pencocokan otomatis
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                    # Breeze: 9 controller
│   │   │   ├── Admin/
│   │   │   │   ├── ReportFollowupController.php  # Berita acara pelepasan
│   │   │   │   └── UserController.php            # Manajemen user + role
│   │   │   ├── Api/                     # 6 controller REST
│   │   │   ├── ClaimController.php      # Klaim + serah terima
│   │   │   ├── MatchingPageController.php
│   │   │   ├── NotificationController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── PublicBoardController.php # Papan barang temuan publik
│   │   │   └── ReportController.php
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php
│   │   │   └── HandleInertiaRequests.php
│   │   └── Requests/
│   │       ├── Auth/LoginRequest.php
│   │       └── ProfileUpdateRequest.php
│   ├── Models/                         # 7 model
│   ├── Providers/AppServiceProvider.php
│   ├── Services/                       # 6 service domain
│   └── Traits/ApiResponseTrait.php
├── bootstrap/app.php                   # Routing + middleware
├── config/
│   ├── temubarang.php                  # ★ Konfigurasi siklus klaim
│   └── services.php                    # ★ Konfigurasi Tesseract
├── database/
│   ├── migrations/                     # 26 migration
│   └── seeders/                        # 3 seeder
├── multiverse/python/
│   ├── image_matcher/main.py           # 244 baris — pencocokan AI
│   ├── models/mobilenetv2-10.onnx      # 14 MB — model CNN
│   ├── pii_detector/main.py            # 278 baris — deteksi PII
│   ├── requirements.txt
│   └── venv/                           # Python virtual environment
├── resources/js/
│   ├── Components/                     # 21 komponen (termasuk GoogleMap)
│   ├── Layouts/                        # AuthenticatedLayout, GuestLayout
│   ├── Pages/                          # 27 halaman
│   ├── services/api.js                 # Axios instance + endpoint helpers
│   └── services/imei.js                # Validasi IMEI di browser (sinkron backend)
├── routes/
│   ├── api.php  web.php  auth.php  console.php
├── storage/app/{public,private}/        # Penyimpanan foto
├── tests/{Feature,Unit}/
├── .env.example
├── composer.json  package.json
├── erd-diagram.mmd / .xml              # Diagram ERD (Mermaid + draw.io)
├── use-case-diagram.mmd / .dio         # Diagram use case
└── README.md  readme2.md
```

---

## 6. Teknologi & Dependency

### 6.1 Backend (PHP)

```json
"require": {
    "php": "^8.2",
    "inertiajs/inertia-laravel": "^2.0",
    "intervention/image": "^3.11",
    "laravel/breeze": "^2.4",
    "laravel/framework": "^12.0",
    "laravel/sanctum": "^4.3",
    "laravel/tinker": "^2.10.1",
    "madeiteasytools/multiverse": "^2.1",
    "tightenco/ziggy": "^2.0"
},
"require-dev": {
    "doctrine/dbal": "^4.4",
    "fakerphp/faker": "^1.23",
    "laravel/pail": "^1.2.2",
    "laravel/pint": "^1.13",
    "laravel/sail": "^1.41",
    "mockery/mockery": "^1.6",
    "nunomaduro/collision": "^8.6",
    "phpunit/phpunit": "^11.5.3"
}
```

| Package | Peran dalam Proyek |
|---|---|
| `laravel/framework ^12.0` | Inti aplikasi: Eloquent, validation, scheduler, queue, mail, storage |
| `inertiajs/inertia-laravel ^2.0` | Adapter Inertia — merender halaman React sebagai JSON props, bukan HTML penuh |
| `laravel/breeze ^2.4` | Scaffolding autentikasi: register, login, verify email, reset password, confirm password, edit profil |
| `laravel/sanctum ^4.3` | Token API (`/api/user` memakai `auth:sanctum`) |
| `intervention/image ^3.11` | Manipulasi gambar (blur & re-encode) |
| `tightenco/ziggy ^2.0` | Route helper `route()` yang tersedia di sisi React |
| `madeiteasytools/multiverse ^2.1` | Package scaffolding pihak ketiga |
| `phpunit ^11.5.3` | Test runner |
| `laravel/pint` | Formatter kode PHP (StyleCI preset `laravel`) |

### 6.2 Frontend (JavaScript)

```json
"devDependencies": {
    "@headlessui/react": "^2.0.0",
    "@inertiajs/react": "^2.0.0",
    "@tailwindcss/forms": "^0.5.3",
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.12",
    "axios": "^1.17.0",
    "concurrently": "^9.0.1",
    "laravel-vite-plugin": "^1.2.0",
    "postcss": "^8.4.31",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.2.1",
    "vite": "^6.0.11"
},
"dependencies": {
    "@react-google-maps/api": "^2.20.8",
    "framer-motion": "^12.41.0",
    "gsap": "^3.15.0",
    "lenis": "^1.3.23",
    "lodash": "^4.18.1",
    "motion": "^12.41.0",
    "react-icons": "^5.6.0",
    "react-router-dom": "^7.16.0"
}
```

| Package | Peran |
|---|---|
| `react ^18.2.0` + `react-dom` | Library UI. **Inertia** yang mengatur navigasi halaman utama (bukan React Router) |
| `@inertiajs/react ^2.0.0` | Integrasi Inertia: `usePage()`, `router.visit()`, `<Link>` |
| `tailwindcss ^3.2.1` + `@tailwindcss/vite ^4.0.0` | Utility-first CSS; font `Figtree`; plugin `@tailwindcss/forms` |
| `@react-google-maps/api ^2.20.8` | Peta interaktif (Maps JavaScript API, demo key) |
| `framer-motion ^12` / `motion ^12` | Animasi transisi & scroll reveal |
| `gsap ^3.15` + `lenis ^1.3` | Smooth scrolling & animasi hero section |
| `axios ^1.17` | HTTP client untuk `/api/*` (dengan `X-CSRF-TOKEN` & `withCredentials`) |
| `react-icons ^5.6` | Ikon |
| `react-router-dom ^7.16` | Routing tambahan di dalam halaman (tab/modal) |
| `vite ^6.0.11` | Bundler, dev server, HMR |

### 6.3 AI / Python

```txt
# multiverse/python/requirements.txt
numpy==2.5.0
opencv-python==4.13.0.92
onnxruntime==1.30.0
pytesseract==0.3.13
Pillow==13.0.0
```

| Komponen | Versi | Peran |
|---|---|---|
| Python | 3.14.6 | Runtime AI |
| OpenCV | 4.13.0.92 | AKAZE, ORB, HOG, histogram HSV, Haar Cascade, CLAHE, bilateral filter |
| NumPy | 2.5.0 | Operasi vektor, normalisasi, dot product |
| onnxruntime | 1.30.0 | Menjalankan model MobileNetV2 (`CPUExecutionProvider`) |
| pytesseract | 0.3.13 | **Wrapper** saja — butuh binary Tesseract eksternal |
| Pillow | 13.0.0 | Pembantu pemrosesan citra untuk OCR |
| MobileNetV2 ONNX | `mobilenetv2-10.onnx` (14 MB) | Embedding 1000-dimensi |

> ⚠️ **Tesseract OCR harus diinstal terpisah** (bukan `pip install`). Lihat
> [§23.5](#235-instalasi-tesseract-ocr-wajib).

### 6.4 Infrastruktur & Database

| Komponen | Peran |
|---|---|
| **MySQL 8.0** | Database utama — 7 tabel domain + `sessions`, `cache`, `jobs` |
| `SESSION_DRIVER=database` | Session disimpan di DB (cocok untuk shared hosting) |
| `CACHE_STORE=database` | Cache di DB (tabel `cache`, `cache_locks`) |
| `QUEUE_CONNECTION=sync` | Antrean sinkron (cocok untuk single-server) |
| **Redis** | Disediakan di `.env.example` untuk scaling ke multi-worker |
| **Google Maps JavaScript API** | Peta interaktif (demo key, tanpa billing) |
| **Tesseract OCR** | Deteksi teks pada foto (instal di level OS) |

### 6.5 Tool Pengembangan

| Tool | Versi | Kegunaan |
|---|---|---|
| VS Code | — | Editor utama; daftar ekstensi tercatat di `ekstensi.txt` |
| Composer | 2.x | Dependency PHP |
| Node.js / npm | 18+ | Dependency JS & Vite |
| MySQL | 8.0 | Database |
| Python + venv | 3.14 | Runtime AI |
| Git | — | Version control |
| Postman | — | Testing API |
| XAMPP / Laragon | — | Stack PHP lokal |

---

## 7. Peran Pengguna & Matriks Hak Akses (RBAC)

### 7.1 Tiga Peran Aktif

| Peran | Nilai `role` | Deskripsi |
|---|---|---|
| **Warga** | `user` | Default. Membuat laporan, mencari, mengklaim, dan menebus barang. |
| **Admin Kelurahan** | `admin_kelurahan` | Verifikasi, tolak, catat penerimaan, putuskan klaim, berita acara — **hanya di `region_id` miliknya**. |
| **Super Admin (Admin Kecamatan)** | `super_admin` | Semua wewenang admin + manajemen user + ubah role + akses seluruh kecamatan. |

> Catatan: enum `users.role` di database **masih menyimpan nilai legacy** `admin`
> dan `student` (lihat migration
> `2026_09_28_034353_update_role_enum_in_users_table.php`), tetapi **aplikasi
> hanya memakai tiga nilai di atas**. Jangan menambah role baru tanpa
> memperbarui `User::isAdmin()`, `isSuperAdmin()`, dan `isAdminKelurahan()`.

### 7.2 Definisi Role di Kode (`app/Models/User.php`)

```php
public function isSuperAdmin(): bool
{
    return $this->role === 'super_admin';
}

public function isAdminKelurahan(): bool
{
    return $this->role === 'admin_kelurahan';
}

public function isAdmin(): bool
{
    return $this->isSuperAdmin() || $this->isAdminKelurahan();
}

/**
 * Boleh mengelola (verifikasi / edit / hapus / putuskan klaim)
 * data milik wilayah tertentu?
 */
public function canManageRegion($regionId): bool
{
    if ($this->isSuperAdmin()) {
        return true;
    }

    return $this->isAdminKelurahan()
        && $this->region_id !== null
        && $regionId !== null
        && (int) $this->region_id === (int) $regionId;
}

/**
 * Boleh melihat foto ASLI (tanpa blur) sebuah laporan?
 * Pemilik laporan, admin wilayah laporan, atau admin wilayah yang memutuskan
 * klaim yang merujuk laporan hilang ini.
 */
public function canViewOriginalPhoto(Report $report): bool
{
    if ($report->user_id === $this->id || $this->canManageRegion($report->region_id)) {
        return true;
    }

    if ($this->isAdminKelurahan() && $this->region_id) {
        return Claim::where('lost_report_id', $report->id)
            ->whereHas('report', fn ($q) => $q->where('region_id', $this->region_id))
            ->exists();
    }

    return false;
}
```

### 7.3 Scope `Report::visibleTo()` — Pembatas Data Terpusat

```php
/**
 * Batasi laporan sesuai role:
 * - super_admin     : semua laporan
 * - admin_kelurahan : laporan di wilayahnya (+ laporan miliknya sendiri)
 * - warga           : laporan miliknya sendiri
 */
public function scopeVisibleTo($query, User $user)
{
    if ($user->isSuperAdmin()) {
        return $query;
    }

    if ($user->isAdminKelurahan() && $user->region_id) {
        return $query->where(function ($q) use ($user) {
            $q->where('region_id', $user->region_id)
              ->orWhere('user_id', $user->id);
        });
    }

    return $query->where('user_id', $user->id);
}
```

Scope ini dipakai di hampir setiap query daftar laporan (dashboard warga,
dashboard admin, daftar laporan), sehingga **filter wilayah tidak pernah lupa**
ditegakkan di level repository.

### 7.4 Matriks Hak Akses Ringkas

| Aksi | Warga | Admin Kelurahan | Super Admin |
|---|:---:|:---:|:---:|
| Register + verifikasi email Gmail | ✅ | ✅ | ✅ |
| Buat laporan hilang / temuan | ✅ | ✅ | ✅ |
| Edit / hapus laporan sendiri | ✅ | ✅ | ✅ |
| Edit / hapus laporan **milik orang lain** | ❌ | ✅ (wilayahnya) | ✅ (semua) |
| Lihat daftar laporan | ✅ (miliknya) | ✅ (wilayah + miliknya) | ✅ (semua) |
| Verifikasi laporan | ❌ | ✅ | ✅ |
| Tolak laporan (wajib alasan) | ❌ | ✅ | ✅ |
| Catat penerimaan barang di kantor kelurahan | ❌ | ✅ | ✅ |
| Catat nomor seri dari perangkat fisik | ❌ | ✅ | ✅ |
| Samarkan / buka samaran foto | ❌ | ✅ (non-sensitif) | ✅ (non-sensitif) |
| Buat klaim barang temuan | ✅ | ✅ | ✅ |
| Putuskan klaim (approve/reject) | ❌ | ✅ (wilayah barang) | ✅ |
| Catat serah terima barang | ❌ | ✅ | ✅ |
| Catat berita acara pelepasan | ❌ | ✅ | ✅ |
| Ubah role user | ❌ | ❌ | ✅ |
| Hapus user | ❌ | ❌ | ✅ |
| Lihat papan barang temuan publik | ✅ (tanpa login) | ✅ | ✅ |

### 7.5 Prinsip Otorisasi yang Berlaku

1. **Wilayah lebih ketat daripada role.** Admin kelurahan tidak bisa memproses
   laporan yang `region_id`-nya NULL maupun milik kelurahan lain — `canManageRegion()`
   selalu menyaring.
2. **Pemutus klaim ditentukan oleh lokasi barang, bukan lokasi penglaim.**
   `ClaimController::verify()` menolak dengan pesan
   *"Keputusan klaim ini ada di admin Kelurahan {nama}"* bila admin tidak
   memegang wilayah barang temuan.
3. **Admin wilayah laporan hilang hanya "informasi"**, bukan pemutus. Ia
   menerima notifikasi dengan atribut `can_decide = false` dan tidak bisa
   menyetujui klaim.
4. **Cek ulang di server pada setiap aksi.** Kondisi di frontend bukan
   pengganti; setiap route memanggil `canManageRegion()` / `isAdmin()` lagi.

---

## 8. Struktur Proyek Detail

### 8.1 `app/Models/` — Tujuh Model

| Model | Tabel | Ringkasan Relasi & Scope |
|---|---|---|
| `User` | `users` | `hasMany` reports, `hasMany` notifications, `belongsTo` region. Methods: `isSuperAdmin()`, `isAdminKelurahan()`, `isAdmin()`, `canManageRegion()`, `canViewOriginalPhoto()`. Implementasi `MustVerifyEmail` + `HasApiTokens`. |
| `Report` | `reports` | `belongsTo` user, `belongsTo` region, `belongsTo` receiver (`received_by`), `belongsTo` releaser (`released_by`), `hasMany` followups. Scope `visibleTo()`. Accessor `is_photo_blurred`, `has_original_photo`, `has_reported_imei`, `imei_formatted`. Hook `deleting` → hapus foto asli di disk privat. |
| `Region` | `regions` | Self-referencing `parent`/`children` (kecamatan → kelurahan → RW). Dipakai `belongsTo` dari `User` dan `Report`. |
| `Claim` | `claims` | `belongsTo` report (barang temuan), `belongsTo` lostReport (`lost_report_id`), `belongsTo` claimant, `belongsTo` owner, `belongsTo` verifier, `belongsTo` handedOverBy. |
| `Notification` | `notifications` | `belongsTo` user. Kolom `type` (success/error/info/match/claim/warning), `link`, `is_read`. |
| `MatchResult` | `match_results` | Cache pasangan laporan. Kolom `report_id_1`, `report_id_2` (selalu urut min/max), `photo_score`, `text_score`, `final_score`, `label`. |
| `ReportFollowup` | `report_followups` | `belongsTo` report, `belongsTo` creator (admin). Menyimpan berita acara pelepasan barang. |

### 8.2 `$hidden` pada `Report` — Payload Aman

```php
protected $hidden = [
    'secret_feature',      // ciri khusus pembeda
    'rejection_reason',    // alasan penolakan admin
    'photo_original',      // path foto ASLI di disk privat
    'serial_number',       // nomor seri dibaca admin dari fisik
    'reported_imei',       // IMEI yang dilaporkan pelapor
    'imei_unreadable',
    'imei_verified_at',
    'pii_reasons',         // alasan deteksi PII
    'pii_check_error',
    'privacy_override_by',
    'privacy_override_at',
    'released_by',
];
```

Data-data ini **tidak pernah** ikut ke browser sebagai bagian dari objek
`report`. GovernorYr dikirim secara eksplisit sebagai prop terpisah hanya
pada halaman yang memang berhak (lihat `routes/web.php` → `reports.show`).

```php
protected $appends = ['has_original_photo', 'has_reported_imei', 'is_photo_blurred'];
```

Tiga atribut turunan ini hanya memberi **boolean penanda** — bukan nilai
sensitifnya — sehingga frontend bisa menampilkan badge tanpa pernah menerima
IMEI mentah.

### 8.3 `app/Services/` — Enam Service Domain

| Service | Tanggung jawab | Metode utama |
|---|---|---|
| `MatchScoreService` | Sumber tunggal perhitungan skor kecocokan | `textScore()`, `photoScore()`, `score()`, `imeiMatches()`, `label()` |
| `ImageMatchingService` | Bridge PHP → Python untuk pencocokan foto | `compare()`, `compareWithCache()`, `errorResult()` |
| `ImeiService` | Normalisasi, checksum Luhn, banding 3 sumber nomor seri | `normalize()`, `luhnValid()`, `isValidImei()`, `validationMessage()`, `matches()`, `compare()`, `format()` |
| `PhotoPrivacyService` | Blur, disk privat, deteksi PII, scrub EXIF | `process()`, `detectPersonalData()`, `protect()`, `restorePublic()`, `sanitize()`, `reencode()`, `blurImage()` |
| `PiiDetectionService` | Bridge PHP → Python untuk deteksi PII (fail-safe) | `detect()` |
| `ClaimWindowService` | Siklus hidup barang temuan | `openWindow()`, `windowDays()`, `daysRemaining()`, `isExpired()`, `isExpiringSoon()`, `isClaimable()`, `recommendedAction()`, `actionOptions()`, `markExpired()`, `expire()`, `syncExpired()`, `syncExpiredCollection()`, `markReleased()`, `purgeSensitiveData()` |

### 8.4 `app/Helpers/`

**`BadWords`** — daftar 23 kata terlarang:

```php
protected static $words = [
    'babi', 'anjing', 'kontol', 'memek', 'ngentot',
    'goblok', 'bodoh', 'tolol', 'idiot', 'sial',
    'kampret', 'jahanam', 'brengsek', 'bangsat',
    'anjay', 'asu', 'kirik', 'tai', 'ampas',
    'setan', 'iblis', 'neraka', 'silit',
];
```

Dua API: `contains($text)` (boolean, dengan `stripos` case-insensitive) dan
`filter($text)` (mengganti kata dengan `*` sebanyak panjang kata).

> ⚠️ `contains()` memakai `stripos` **tanpa batas kata**, sehingga kata pendek
> seperti `"tai"` bisa ikut cocok di kata lain. Ini daftar moderator internal,
> bukan filter comprehensive — remains perlu diperluas bila akan dipakai
> publik luas.

**`NotificationHelper`** — API publik:

| Metode | Kegunaan |
|---|---|
| `send($userId, $title, $message, $type, $link)` | Kirim 1 notifikasi (in-app + email opsional) |
| `adminsOfRegion($regionId)` | Ambil admin kelurahan pada suatu wilayah |
| `sendToRegionAdmins($regionId, ...)` | Broadcast ke admin wilayah tersebut |
| `sendOnce(...)` | Kirim hanya bila belum ada notifikasi identik (dedup global) |
| `sendOncePerReport($userId, $title, ..., $link)` | Dedup **per laporan** — dipakai untuk peringatan kedaluwarsa agar tidak spam tiap hari |
| `checkAndNotifyMatches($newReport)` | Pencocokan otomatis + notifikasi kecocokan |

### 8.5 `app/Console/Commands/`

| Command | Signature | Jadwal | Fungsi |
|---|---|---|---|
| `reports:check-expiry` | `handle(): int` | `dailyAt('06:15')` | Peringatan H-5, tandai kedaluwarsa, eskalasi ke super admin |
| `users:delete-unverified` | `handle()` | `cron('0 2 * * 1,4')` | Hapus akun yang belum verifikasi email (Senin & Kamis) |

### 8.6 `resources/js/Pages/` — 27 Halaman

| Halaman | Baris | Fungsi |
|---|---:|---|
| `Welcome.jsx` | 536 | Landing page publik: hero dengan efek ketik, section keunggulan, orbit kelurahan, CTA |
| `Dashboard.jsx` | 437 | Dashboard warga: statistik, laporan terbaru |
| `Reports/ReportsList.jsx` | 609 | Daftar semua laporan (terfilter role), bulk delete, badge status |
| `Reports/CreateReport.jsx` | 843 | Form laporan: peta interaktif, kategori, IMEI, ciri khusus |
| `Reports/EditReport.jsx` | 678 | Form edit + resubmit laporan yang ditolak |
| `Reports/ReportDetail.jsx` | 1098 | Detail laporan: peta read-only, panel IMEI, panel privasi, modal klaim |
| `Matching/MatchesList.jsx` | 265 | Halaman Pencocokan: daftar pasangan dengan skor |
| `Matching/MatchResult.jsx` | 339 | Modal/hasil "Cari Kecocokan" |
| `Search/SearchPage.jsx` | 667 | "Cari Barang": pencarian + filter kategori & kelurahan |
| `Public/FoundBoard.jsx` | 300 | Papan barang temuan publik (tanpa login) |
| `Admin/Dashboard.jsx` | 834 | Dashboard admin: verifikasi, filter, sorting, bulk action |
| `Admin/Claims.jsx` | 448 | Daftar klaim + statistik |
| `Admin/ClaimDetail.jsx` | 1198 | Detail klaim: 3 sumber nomor seri, putuskan, serah terima |
| `Admin/Users.jsx` | 456 | Manajemen user (super admin) |
| `Admin/UserDetail.jsx` | 334 | Detail user + ubah role |
| `Admin/ReportFollowup.jsx` | 404 | Form berita acara pelepasan |
| `Notifications/Index.jsx` | 332 | Kotak masuk notifikasi |
| `Auth/*` (6 halaman) | — | Login, Register, ForgotPassword, ResetPassword, VerifyEmail, ConfirmPassword |
| `Profile/Edit.jsx` + `Partials/*` (3) | — | Edit profil, ubah password, hapus akun |

### 8.7 `resources/js/Components/` — 21 Komponen

**Komponen khusus proyek:**

| Komponen | Fungsi |
|---|---|
| `GoogleMap.jsx` | Peta interaktif untuk form (klik → simpan koordinat) |
| `GoogleMapView.jsx` | Peta read-only untuk halaman detail |
| `OrbitImages.jsx` | Gambar memutar (dipakai untuk menampilkan 4 kantor kelurahan) |
| `TextType.jsx` | Efek mengetik untuk judul hero |
| `AnimatedContent.jsx` | Animasi muncul saat scroll |
| `ScrollStack.jsx` | Susunan section yang menempel saat scroll |
| `TrueFocus.jsx` | Animasi fokus |
| `CardNav.jsx` | Navigasi berbentuk kartu |

**Komponen bawaan Breeze:** `ApplicationLogo`, `Checkbox`, `DangerButton`,
`Dropdown`, `InputError`, `InputLabel`, `Modal`, `NavLink`, `PrimaryButton`,
`ResponsiveNavLink`, `SecondaryButton`, `TextInput`.

### 8.8 `resources/js/services/`

**`api.js`** — instance Axios dengan konfigurasi:

```javascript
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
    },
    withCredentials: true,
    withXSRFToken: true,
});

api.interceptors.request.use(async (config) => {
    await axios.get('/sanctum/csrf-cookie');
    return config;
});
```

Helper yang tersedia: `searchReports()`, `getSearchCategories()`, `getReports()`,
`getMyReports()`, `getReport()`, `createReport()`, `updateReport()`,
`deleteReport()`, `matchReport()`, `getStats()`, `getRecentReports()`.

**`imei.js`** — validasi IMEI di sisi browser, **harus selalu sinkron** dengan
`ImeiService::luhnValid()` di backend. Dua tempat, satu kebenaran.

---

## 9. Basis Data

### 9.1 Peta Relasi

```
        REGIONS (self-referencing: kecamatan → kelurahan → rw)
            │
            ├──┬──< USERS >────────────┐
            │       (region_id FK)     │
            │         │                │
            │         │<───────────────┘
            │         │
            │      REPORTS (user_id FK, region_id FK)
            │         │  ├── photo / photo_original / reported_imei / ...
            │         │  ├── received_by ──> users
            │         │  └── released_by ──> users
            │         │
            │         ├──< CLAIMS >────────────┐
            │         │    report_id FK        │
            │         │    lost_report_id FK ──┤ (ke reports)
            │         │    claimant_id ────────┤ (ke users)
            │         │    owner_id ───────────┤ (ke users)
            │         │    verified_by ────────┤ (ke users)
            │         │    handed_over_by ─────┘ (ke users)
            │         │
            │         ├──< MATCH_RESULTS (report_id_1, report_id_2)
            │         └──< REPORT_FOLLOWUPS (report_id, created_by)
            │
            └──< USERS
```

### 9.2 Tabel `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | Primary key |
| `name` | varchar(255) | Nama lengkap warga |
| `email` | varchar(255) | Unik — **verifikasi hanya Gmail** |
| `email_verified_at` | timestamp | Wajib terisi untuk akses dashboard (`verified` middleware) |
| `password` | varchar(255) | Hash bcrypt (`casts: hashed`) |
| `remember_token` | varchar(100) | Token remember-me |
| `role` | enum | `super_admin` \| `admin_kelurahan` \| `user` (default `user`); DB masih menyimpan legacy `admin`, `student` |
| `region_id` | bigint FK → `regions.id` | `onDelete set null`; NULL untuk super_admin |
| `phone` | varchar(255) | Nomor HP untuk notifikasi |
| `is_verified` | boolean | Verifikasi manual oleh admin |
| `created_at`, `updated_at` | timestamp | |

### 9.3 Tabel `regions`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | PK |
| `name` | varchar | Contoh: `"Kelurahan Made"` |
| `type` | enum | `kecamatan` \| `kelurahan` \| `rw` |
| `parent_id` | bigint FK → `regions.id` | Self-reference, `onDelete cascade` |
| `latitude`, `longitude` | decimal(10,7) | Titik tengah peta |
| `bounds_north/south/east/west` | decimal(10,7) | Batas peta (`restriction.latLngBounds`) |
| `kecamatan` | varchar | Default `"Sambikerep"` |
| `kota` | varchar | Default `"Surabaya"` |
| `created_at`, `updated_at` | timestamp | |

### 9.4 Tabel `reports` — Tabel Terpenting

**Kolom inti:**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | PK |
| `user_id` | bigint FK → `users.id` | Pelapor, `onDelete cascade` |
| `type` | enum | `lost` (barang hilang) \| `found` (barang temuan) |
| `item_name` | varchar(255) | Nama barang |
| `category` | varchar(100) | 1 dari 13 kategori |
| `description` | text | Kronologi / ciri umum |
| `secret_feature` | text | **Ciri khusus pembeda — TERKUNCI** (tidak dikirim ke publik) |
| `color` | varchar(50) | Warna barang |
| `location` | varchar(255) | Nama tempat kejadian |
| `location_detail` | varchar(255) | Alamat detail |
| `date` | date | Tanggal kejadian |
| `latitude`, `longitude` | decimal | Koordinat dari peta |
| `region_id` | bigint FK → `regions.id` | `onDelete set null` |
| `photo` | varchar | Path foto **publik** (versi buram bila perlu) |
| `status` | enum | `pending` \| `verified` \| `matched` \| `resolved` \| `rejected` \| `expired` |

**Kolom privasi foto & PII (ditambahkan 2026-11-12 dan 2026-11-16):**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `photo_original` | varchar | Path foto ASLI di **disk privat** (tanpa URL publik) |
| `photo_blurred` | boolean | Foto publik saat ini adalah versi buram |
| `photo_sensitive` | boolean | Kategori sensitif → kunci keras, tidak bisa dibuka |
| `serial_number` | varchar(100) | Nomor seri/IMEI **dibaca admin dari fisik** |
| `reported_imei` | varchar(20) | IMEI yang **dilaporkan** pelapor (indexed) |
| `imei_unreadable` | boolean | Penemu menandai tidak bisa membaca |
| `imei_verified_at` | timestamp | Waktu admin memverifikasi IMEI |
| `pii_detected` | boolean | Hasil deteksi data pribadi |
| `pii_reasons` | json | Array alasan yang terdeteksi |
| `pii_status` | varchar(20) | `none` \| `detected` \| `cleared` \| `forced` |
| `pii_checked_at` | timestamp | Waktu pemeriksaan terakhir |
| `pii_check_error` | varchar(255) | Alasan detektor gagal |
| `privacy_override_by` | bigint FK → `users.id` | Admin yang melakukan koreksi |
| `privacy_override_at` | timestamp | Waktu koreksi |

**Kolom siklus barang temuan (ditambahkan 2026-11-06, 2026-11-09, 2026-11-18):**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `received_at` | timestamp | Waktu barang diterima di kantor kelurahan |
| `received_by` | bigint FK → `users.id` | Admin penerima barang |
| `rejection_reason` | text | Alasan penolakan (wajib diisi admin) |
| `claim_deadline` | timestamp | Batas akhir masa klaim (30 hari) |
| `expired_at` | timestamp | Waktu became kedaluwarsa |
| `released_at` | timestamp | Waktu barang benar-benar dilepas |
| `resolution_type` | enum | `claimed` \| `return_to_issuer` \| `hand_to_authority` \| `donated` \| `destroyed` |
| `released_by` | bigint FK → `users.id` | Admin pelepas barang |

### 9.5 Tabel `claims`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | PK |
| `report_id` | bigint FK → `reports.id` | Laporan **temuan** yang diklaim |
| `lost_report_id` | bigint FK → `reports.id` | Laporan **HILANG** milik penglaim (nullable; kini wajib saat membuat klaim) |
| `claimant_id` | bigint FK → `users.id` | Pengklaim, cascade |
| `owner_id` | bigint FK → `users.id` | Penemu asli / pemilik barang |
| `status` | enum | `pending` \| `approved` \| `rejected` (default `pending`) |
| `is_redemption` | boolean | Klaim tebus barang yang sudah kedaluwarsa |
| `redeemed_at` | timestamp | Waktu penebusan |
| `message` | text | Pesan dari penglaim |
| `claimant_proof` | text | Bukti kepemilikan: ciri khusus / jawaban ciri |
| `claimant_serial` | varchar(100) | Nomor seri/IMEI yang diklaim |
| `admin_note` | text | Catatan keputusan admin |
| `verified_at` | timestamp | Waktu diputuskan |
| `verified_by` | bigint FK → `users.id` | Admin pemutus |
| `handed_over_at` | timestamp | Waktu serah terima barang |
| `handed_over_by` | bigint FK → `users.id` | Admin penetrus |
| `receiver_name` | varchar(100) | Nama penerima barang saat serah terima |
| `receiver_id_type` | varchar(30) | `KTP` \| `KK` \| `SIM` \| `Kartu Pelajar` \| `Lainnya` |
| `handover_note` | text | Catatan serah terima |

### 9.6 Tabel `notifications`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | PK |
| `user_id` | bigint FK → `users.id` | Penerima, cascade |
| `title` | varchar(255) | Judul (contoh: `"📦 Barang Diterima di Kantor Kelurahan"`) |
| `message` | text | Isi pesan |
| `type` | varchar | `success` \| `error` \| `info` \| `match` \| `claim` \| `warning` |
| `link` | varchar | URL tujuan, mis. `/reports/1` |
| `is_read` | boolean | Badge di navbar |
| `created_at`, `updated_at` | timestamp | |

### 9.7 Tabel `match_results` (Cache)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | PK |
| `report_id_1` | bigint FK → `reports.id` | ID **lebih kecil** (selalu ternormalisasi) |
| `report_id_2` | bigint FK → `reports.id` | ID **lebih besar** |
| `photo_score` | decimal(5,2) | Skor computer vision 0–100 |
| `text_score` | decimal(5,2) | Skor pencocokan teks 0–100 |
| `final_score` | decimal(5,2) | Skor gabungan 50% foto + 50% teks |
| `label` | varchar | `sangat_mirip` \| `mungkin_cocok` \| `tidak_cocok` |

> ⚠️ **Cache harus di-reset setiap kali algoritma diubah**:
> `App\Models\MatchResult::truncate();` — kalau tidak, skor lama yang sudah
> ter-cache akan terus muncul dan menutupi hasil algoritma baru.

### 9.8 Tabel `report_followups` (Berita Acara)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint | PK |
| `report_id` | bigint FK → `reports.id` | Barang temuan, cascade |
| `action` | enum | `return_to_issuer` \| `hand_to_authority` \| `donated` \| `destroyed` |
| `document_no` | varchar(100) | Nomor berita acara |
| `recipient_name` | varchar(150) | Nama penerima barang |
| `recipient_org` | varchar(150) | Instansi / lembaga penerima |
| `recipient_contact` | varchar(100) | Kontak penerima |
| `recipient_id_number` | varchar(100) | NIK / identitas penerima |
| `witness_name` | varchar(150) | **Saksi 1 — wajib** |
| `witness_name_2` | varchar(150) | Saksi 2 (wajib bila `MINIMUM_WITNESSES=2`) |
| `witness_phone` | varchar(30) | No. HP saksi |
| `note` | text | Keterangan tindak lanjut (wajib, min 10 karakter) |
| `photo` | varchar | Foto bukti berita acara |
| `created_by` | bigint FK → `users.id` | Admin pencatat |
| `executed_at` | timestamp | Waktu pelaksanaan |
| `created_at`, `updated_at` | timestamp | |

### 9.9 Tabel Infrastruktur Laravel

`users`, `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`,
`job_batches`, `failed_jobs`.

---

## 10. Alur Kerja Utama (End-to-End)

### 10.1 Alur A — Barang Hilang (Warga → Admin)

```
Warga buka /reports/create
  │
  ├─ Pilih tipe: "Barang Hilang" (lost)
  ├─ Isi nama barang (min 5 char), kategori (13 pilihan), deskripsi (min 20)
  ├─ Isi warna, lokasi, tanggal kejadian
  ├─ Pilih kelurahan (dropdown) → maps ke region_id
  ├─ Klik peta → koordinat latitude/longitude terisi
  ├─ Unggah foto (wajib, maks 2 MB, format image)
  ├─ [Opsional] isi nomor seri/IMEI
  │
  ▼
POST /reports  →  ReportController@store
  │
  ├─ Validasi (lihat §12.2)
  ├─ Filter kata kasar pada item_name & description
  ├─ Normalisasi + validasi checksum IMEI (bila diisi)
  ├─ Simpan foto → Storage::disk('public')/reports
  ├─ Report::create() dengan status = 'pending'
  ├─ PhotoPrivacyService::process() → deteksi PII / blur / scrub EXIF
  └─ Notifikasi ke admin kelurahan pemilik region_id
        "📋 Laporan Baru Perlu Diverifikasi"
  │
  ▼
Redirect → /reports (flash: "Laporan berhasil dibuat!")
```

### 10.2 Alur B — Verifikasi Admin

```
Admin Kelurahan membuka /admin
  │
  ├─ Melihat daftar laporan dengan scope visibleTo() (hanya wilayahnya)
  ├─ Filter: status, kategori, kelurahan; Sorting; Bulk action
  │
  ▼
PUT /admin/reports/{id}/verify  { status: 'verified' }
  │
  ├─ Cek isAdmin()                                        → 403 bila bukan admin
  ├─ Cek canManageRegion($report->region_id)               → 403 bila luar wilayah
  ├─ Cek transisi status: pending → verified (atau verified → resolved)
  ├─ Tolak 'resolved' untuk laporan TEMUAN
  │     "Laporan temuan hanya bisa diselesaikan lewat serah terima klaim"
  ├─ Jika 'verified' + type=found → ClaimWindowService::openWindow()
  ├─ Jika 'verified' → NotificationHelper::checkAndNotifyMatches($report)
  │     └─ Pencocokan AI otomatis + notifikasi kecocokan ke pemilik
  └─ Notifikasi ke pelapor: "✅ Laporan Terverifikasi"
```

**Aturan transisi status:**

```
   pending ──verify──> verified ──handover/berita acara──> resolved
      │
      └──reject (wajib alasan)──> rejected ──edit oleh pemilik──> pending
                                                                            │
   verified ──masa klaim habis──> expired ──tebus───────────────────────┘
                                    │
                                    └──berita acara──> resolved
```

### 10.3 Alur C — Barang Temuan & Pencocokan AI

```
Penemu membuat laporan "found" (dengan ciri khusus / IMEI)
  → status pending → diverifikasi admin → status verified
  → masa klaim 30 HARI dibuka (openWindow)
  → AI mencocokkan dengan semua laporan 'lost' yang verified
  → Notifikasi "🎯 Kemiripan Tinggi" ke pemilik barang hilang
  │
  ▼
Pemilik barang hilang membuka /matches
  ├─ Melihat daftar pasangan dengan skor + label
  ├─ Klik "Lihat Detail" → /reports/{id_temuan}?lost_report_id={id_hilang}
  └─ Klik "📦 Klaim Barang Ini" → popup pilih laporan hilang
        (otomatis ter-selected bila datang dari ?lost_report_id=)
  │
  ▼
POST /claims/{reportId}  { lost_report_id, claimant_proof, claimant_serial, message }
```

### 10.4 Alur D — Klaim & Serah Terima

```
Pengklaim mengirim klaim
  │
  ├─ Server: syncExpired() → jika lewat masa klaim → is_redemption = true
  ├─ Cek: type harus 'found', bukan pelapor sendiri, status verified/expired
  ├─ Cek: belum ada klaim pending/approved sebelumnya untuk barang ini
  ├─ Cek: maksimal 3 klaim yang DITOLAK per akun untuk barang yang sama
  ├─ Cek: lost_report_id milik penglaim, type 'lost', status verified/matched
  ├─ Cek: lost_report_id belum dipakai klaim pending/approved lain
  ├─ Cek: kategori Elektronik → claimant_serial wajib IMEI valid (15 digit + Luhn)
  ├─ Cek: secret_feature ada → claimant_proof wajib (min 5 char)
  └─ Simpan klaim status 'pending' → notifikasi admin wilayah barang
        (+ notifikasi "info" ke admin wilayah laporan hilang bila berbeda)
  │
  ▼
Admin buka /admin/claims/{id}
  ├─ "Aksi Cepat": Lihat Profil Penglaim | Lihat Barang Hilang Penglaim
  ├─ Panel 3 sumber nomor seri berdampingan:
  │      dilaporkan penemu │ dibaca admin │ jawaban penglaim
  ├─ K010: banding reported vs admin → ⚠️ peringatan jika BERBEDA
  └─ Putuskan:
        PUT /admin/claims/{id}  { status: approved|rejected, admin_note }
        │
        ├─ SYARAT approve:
        │     • report.received_at terisi (barang sudah diterima di kantor)
        │     • untuk Elektronik: report.serial_number terisi
        │     • status klaim masih 'pending'
        │
        ├─ Jika approved:
        │     • laporan temuan    → 'matched'
        │     • laporan hilang    → 'matched'
        │     • klaim lain yang masih pending untuk barang ini → otomatis DITOLAK
        │       + notifikasi ke penglaimnya
        │
        └─ Notifikasi: penglaim, penemu, admin wilayah laporan hilang
  │
  ▼
PUT /admin/claims/{id}/handover  { receiver_name, receiver_id_type, handover_note }
  │
  ├─ Cek: status klaim 'approved', belum pernah di-handover
  ├─ Validasi: receiver_name min 3 char; receiver_id_type ∈ {KTP,KK,SIM,Kartu Pelajar,Lainnya}
  ├─ Simpan handed_over_at / handed_over_by / receiver_name / receiver_id_type
  ├─ Laporan temuan → 'resolved' + resolution_type='claimed' + released_at
  ├─ Laporan hilang → 'resolved'
  └─ Notifikasi: penglaim, penemu ("🎉 Barang Temuan Anda Kembali ke Pemiliknya")
```

### 10.5 Alur E — Siklus Barang Temuan 30 Hari

```
Hari 0    Barang ditemukan, laporan dibuat (status pending)
          ↓
Hari 0    Admin verifikasi → status 'verified' → openWindow()
          ↓
Hari 0+   Barang diterima di kantor kelurahan → 'received_at' terisi
          → openWindow() dipanggil LAGI → deadline DIJANGKAR ULANG ke received_at
          ↓
Hari 25   reports:check-expiry (H-5) → notifikasi admin + penemu
          "📦 Barang Temuan Kedaluwarsa - Perlu Tindak Lanjut"
          ↓
Hari 30   Masa klaim habis → status 'expired' + expired_at
          ⚠️ BUKAN "hilang", BUKAN "milik negara"
          Barang MASIH di kantor kelurahan, pemilik masih bisa MENEBUS
          ↓
Hari 30+  Pengklaim asli datang → klaim TEbus (is_redemption = true)
          → admin approve → handover → resolved (resolution_type='claimed')
          ↓
          ATAU
          ↓
Hari 37+  Eskalasi: admin wilayah tidak menindaklanjuti → super admin diberi tahu
          (CLAIM_ESCALATION_DAYS = 7)
          ↓
Tahap akhir  Berita acara (ReportFollowupController@store)
          → pilih tindakan: return_to_issuer | hand_to_authority | donated | destroyed
          → isi penerima, saksi (wajib), keterangan, foto bukti
          → markReleased() → status 'resolved' + released_at + resolution_type
          → purgeSensitiveData(): hapus foto asli privat, serial_number,
            reported_imei, secret_feature, pii_reasons
          → foto publik versi buram TETAP disimpan sebagai arsip
```

### 10.6 Alur F — Papan Barang Temuan Publik (Tanpa Login)

```
Pengunjung buka https://host/barang-temuan
  │
  ├─ Query: type='found', status IN (verified, expired), released_at IS NULL
  ├─ Filter opsional: ?category=… & ?region_id=… & ?remaining=… (sisa hari ≥ N)
  ├─ syncExpired() per laporan → status 'expired' langsung tampil
  └─ Render Public/FoundBoard.jsx
        │
        ├─ Tampilkan: nama, kategori, warna, lokasi, kelurahan, tanggal,
        │              foto (buram bila perlu), sisa hari, badge expired
        ├─ TIDAK tampilkan: secret_feature, reported_imei, serial_number,
        │                  pii_reasons, rejection_reason, koordinat presisi
        └─ can_claim  = status 'verified'
           can_redeem = status 'expired' && released_at kosong
```

---

## 11. Modul 1 — Autentikasi & Manajemen Pengguna

### 11.1 Pendaftaran dengan Verifikasi Email **Hanya Gmail**

Aturan ini ada untuk mencegah akun bot dan akun classrooms yang tidak punya
email asli. Implementasinya di
`app/Http/Controllers/Auth/RegisteredUserController.php`:

```php
$request->validate([
    'name'     => ['required', 'string', 'max:255'],
    'email'    => ['required', 'string', 'email', 'max:255', 'unique:users', new GmailEmail],
    'password' => ['required', 'confirmed', Rules\Password::defaults()],
]);
```

Field email ditolak bila domain-nya bukan `gmail.com` (dan varian
`googlemail.com`). Pesan error yang muncul ke pengguna:

> "Registrasi hanya untuk akun Gmail."

Test yang menjamin aturan ini ada di `tests/Feature/Auth/RegistrationTest.php`:

```php
public function test_registration_rejects_non_gmail_email(): void
```

### 11.2 Peran Default

Akun baru selalu dibuat dengan `role = 'user'`. **Tidak ada** pendaftaran
sebagai admin — admin dibuat oleh super admin melalui
`Admin/UserController::updateRole()` atau langsung via seeder/Tinker.

### 11.3 Verifikasi Email

`User` mengimplementasikan `MustVerifyEmail`, dan seluruh rute yang sensitif
dibungkus middleware `['auth', 'verified']`:

| Rute | Butuh verifikasi email |
|---|:---:|
| `/dashboard` | ✅ |
| `/reports` (semua) | ✅ |
| `/claims/*` | ✅ |
| `/matches` | ✅ |
| `/notifications` | ✅ |
| `/barang-temuan` (publik) | ❌ |
| `/` (Welcome) | ❌ |

### 11.4 Manajemen User oleh Super Admin

`Admin/UserController` menyediakan 4 operasi:

| Route | Method | Fungsi |
|---|---|---|
| `/admin/users` | GET | Daftar user + filter + statistik |
| `/admin/users/{id}` | GET | Detail user |
| `/admin/users/{id}/role` | PUT | Ubah role |
| `/admin/users/{id}` | DELETE | Hapus user |

Aturan penting:

- Hanya `super_admin` yang boleh mengakses (admin kelurahan mendapat 403).
- Tidak boleh mengubah role **diri sendiri** (mencegah admin mengunci dirinya
  keluar).
- Penghapusan user ikut menghapus laporan, klaim, dan notifikasinya (cascade).
- Role hanya boleh bernilai dari daftar yang dikenal: `super_admin`,
  `admin_kelurahan`, `user`.

### 11.5 Keamanan Password

`LoginRequest` bawaan Breeze sudah menangani:

- Rate limiting login (5 percobaan per menit per email+IP).
- Lockout sementara dengan pesan "Too many login attempts".
- Hash password otomatis via `casts: ['password' => 'hashed']`.
- Konfirmasi password untuk aksi sensitif (`password.confirm`).

---

## 12. Modul 2 — Pelaporan Barang Hilang & Temuan

### 12.1 Form Pelaporan

Field yang diminta (dari `ReportController@store`):

| Field | Wajib | Aturan Validasi |
|---|:---:|---|
| `type` | ✅ | `in:lost,found` |
| `item_name` | ✅ | `string|min:5|max:255` |
| `category` | ✅ | `string|max:100` (harus salah satu dari 13 kategori) |
| `description` | — | `nullable|string|min:20` |
| `color` | — | `nullable|string|max:50` |
| `location` | ✅ | `string|max:255` |
| `date` | ✅ | `date` |
| `photo` | ✅ | `image|max:2048` (2 MB) |
| `region_id` | ✅ | `exists:regions,id` |
| `latitude` | ✅ | `numeric|between:-90,90` |
| `longitude` | ✅ | `numeric|between:-180,180` |
| `secret_feature` | — | `nullable|string|min:5|max:255` (kondisional, lihat §12.4) |
| `reported_imei` | — | `nullable|string|max:25` (kondisional, lihat §15.3) |
| `imei_unreadable` | — | `nullable|boolean` |

### 12.2 Aturan Kondisional (Business Rules)

Beberapa aturan hanya berlaku untuk kombinasi tertentu:

```php
// 1) Ciri khusus WAJIB untuk laporan temuan NON-elektronik
if ($validated['type'] !== 'found' || $isElectronics) {
    $validated['secret_feature'] = null;   // dikosongkan
} elseif (empty($validated['secret_feature'])) {
    return back()->withErrors([
        'secret_feature' => 'Ciri khusus barang wajib diisi agar penemu lain tidak bisa mengklaim barang Anda.',
    ]);
}

// 2) IMEI WAJIB untuk penemu barang ELEKTRONIK — atau tandai "tidak bisa membaca"
if ($validated['type'] === 'found' && $isElectronics) {
    if (!$imeiUnreadable && $reportedImei === null) {
        return back()->withErrors([
            'reported_imei' => 'Isi nomor seri/IMEI perangkat, atau tandai "tidak bisa membaca" jika perangkat mati atau terkunci.',
        ]);
    }
}

// 3) Latitude/longitude WAJIB saat membuat, OPSIONAL saat edit
//    (perbedaan nyata antara rule store() dan update())
```

### 12.3 Daftar 13 Kategori Barang

```php
$categories = [
    'Elektronik',
    'Dokumen & Surat',
    'Pakaian & Aksesoris',
    'Alat Tulis',
    'Perlengkapan Makan & Minum',
    'Dompet & Tas',
    'Kartu & Identitas',
    'Kunci',
    'Perhiasan & Aksesoris',
    'Kendaraan & Aksesoris',
    'Anak & Bayi',
    'Uang',
    'Lainnya',
];
```

Kategori diambil dari `/api/categories` (dengan daftar fallback hard-coded di
frontend bila API gagal).

**Tiga kategori sensitif** (foto selalu disamarkan, kunci keras):
`Dokumen & Surat`, `Kartu & Identitas`, `Uang`.

**Kategori yang wajib IMEI saat dilaporkan penemu:** `Elektronik`.

### 12.4 Ciri Khusus (`secret_feature`) sebagai Kunci Klaim

Untuk laporan **temuan non-elektronik**, penemu wajib mengisi satu ciri
spesifik yang **hanya diketahui penemu** — misalnya "ada coretan biru di
sudut bawah tutup". Field ini:

- Disimpan di `reports.secret_feature`.
- Ada di `$hidden` model → tidak pernah terkirim ke browser pengguna lain.
- Hanya dikirim ke admin pemutus klaim melalui prop `secretFeature`.
- Wajib dijawab penglaim (minimal 5 karakter) saat mengirim klaim.

Ini adalah mekanisme anti-"claim seenak" untuk barang non-elektronik yang tidak
punya nomor seri.

### 12.5 Moderasi Konten

Setiap laporan dicek `BadWords::contains()` pada `item_name` dan `description`:

```php
if (BadWords::contains($request->item_name)) {
    return back()->withErrors(['item_name' => 'Nama barang mengandung kata yang tidak diperbolehkan.']);
}
if (BadWords::contains($request->description ?? '')) {
    return back()->withErrors(['description' => 'Deskripsi mengandung kata yang tidak diperbolehkan.']);
}
```

Pengecekan dilakukan **sebelum** penyimpanan — bukan setelah.

### 12.6 Edit & Pengajuan Ulang

Laporan yang ditolak admin (`status = rejected`) bisa diperbaiki pemiliknya.
Saat di-update, status otomatis kembali menjadi `pending` dan
`rejection_reason` dikosongkan:

```php
$resubmitted = $report->status === 'rejected' && $report->user_id === $user->id;
if ($resubmitted) {
    $validated['status'] = 'pending';
    $validated['rejection_reason'] = null;
}
```

Admin di wilayah laporan tersebut diberi tahu: `"📋 Laporan Diajukan Ulang"`.

> ⚠️ **Masa klaim TIDAK bergeser** ketika laporan diedit — dijamin oleh
> `ClaimWindowService::openWindow()` yang tidak menggeser `claim_deadline`
> yang sudah ada. Ini mencegah pemilik kehilangan haknya tanpa pernah diberi
> tahu. Ada test khusus untuk hal ini:
> `test_claim_window_is_not_shifted_when_the_report_is_edited`.

### 12.7 Penghapusan Laporan

Penghapusan oleh pemilik atau admin berwenang (`routes/web.php`):

```php
Route::delete('/reports/{id}', function ($id) {
    $report = Report::findOrFail($id);
    $user = auth()->user();
    if ($report->user_id !== $user->id && !$user->canManageRegion($report->region_id)) {
        abort(403);
    }
    if ($report->photo) {
        Storage::disk('public')->delete($report->photo);
    }
    $report->delete();
    ...
});
```

Hook `deleting` pada model `Report` juga menghapus `photo_original` di disk
privat.

**Bulk delete** (`DELETE /reports/bulk-delete`):

```php
$query = \App\Models\Report::whereIn('id', $ids)->visibleTo($user);
$reports = $query->get();
foreach ($reports as $report) {
    if ($report->photo) {
        Storage::disk('public')->delete($report->photo);
    }
}
```

→ Scope `visibleTo()` menjadi **penjaga**: user tidak bisa menghapus laporan
orang lain hanya dengan meng-ID-nya.

---

## 13. Modul 3 — Pencocokan Cerdas Berbasis AI

### 13.1 Prinsip: Satu Sumber Kebenaran

`MatchScoreService` adalah satu-satunya tempat menghitung skor. Semua
permukaan (halaman Pencocokan, tombol "Cari Kecocokan", notifikasi) memakai
service yang sama. Ini memperbaiki bug historis di mana dua akun melihat skor
yang berbeda (selisih 10 poin) dan dua halaman melihat selisih 30 poin.

### 13.2 Rumus Skor

```php
// app/Services/MatchScoreService.php
public function score(Report $a, Report $b): array
{
    // Nomor seri/IMEI yang sama = bukti kepemilikan paling kuat.
    // Langsung 100% tanpa perlu melihat nama atau foto.
    if ($this->imeiMatches($a, $b)) {
        return [
            'score'            => 100.0,
            'text_score'       => 100.0,
            'photo_score'      => 0.0,
            'label'            => $this->label(100.0),
            'matched_criteria' => ['imei'],
            'imei_match'       => true,
        ];
    }

    $text  = $this->textScore($a, $b);
    $photo = $this->photoScore($a, $b);

    $final = round(($text['score'] * 0.50) + ($photo * 0.50), 2);

    return [
        'score'            => $final,
        'text_score'       => $text['score'],
        'photo_score'      => $photo,
        'label'            => $this->label($final),
        'matched_criteria' => $text['criteria'],
        'imei_match'       => false,
    ];
}
```

### 13.3 Skor Teks (0–100)

```php
public function textScore(Report $a, Report $b): array
{
    $points   = 0;
    $criteria = [];

    // Nama barang → 20 poin (saling mengandung)
    $name1 = strtolower(trim((string) $a->item_name));
    $name2 = strtolower(trim((string) $b->item_name));
    if ($name1 !== '' && $name2 !== '' &&
        (str_contains($name1, $name2) || str_contains($name2, $name1))) {
        $points += 20;
        $criteria[] = 'name';
    }

    // Kategori → 20 poin
    if (!empty($a->category) && !empty($b->category) &&
        strtolower($a->category) === strtolower($b->category)) {
        $points += 20;
        $criteria[] = 'category';
    }

    // Warna → 10 poin (saling mengandung)
    if (!empty($a->color) && !empty($b->color)) {
        $c1 = strtolower(trim($a->color));
        $c2 = strtolower(trim($b->color));
        if ($c1 !== '' && $c2 !== '' &&
            (str_contains($c1, $c2) || str_contains($c2, $c1))) {
            $points += 10;
            $criteria[] = 'color';
        }
    }

    return ['score' => min($points * 2, 100), 'criteria' => $criteria];
}
```

**Poin maksimum dari 3 kriteria = 50**, lalu dikalikan 2 agar rentang jadi
0–100. Konsekuensinya: satu kriteria saja (mis. hanya warna) menghasilkan
skor 20, bukan 10.

> **Perbaikan penting:** pencocokan warna dicek **dua arah**. Versi lama hanya
> `str_contains($c1, $c2)` sehingga "biru" vs "biru tua" dianggap cocok dari
> satu sisi saja — penyebab selisih 10 poin antar akun.

### 13.4 Ambang & Label

```php
public function label(float $score): string
{
    if ($score >= 65) return 'sangat_mirip';
    if ($score >= 35) return 'mungkin_cocok';
    return 'tidak_cocok';
}
```

| Skor | Label | Tampil di |
|---|---|---|
| ≥ 65 | `sangat_mirip` — "Sangat Cocok" | Pencocokan, notifikasi |
| 35–64 | `mungkin_cocok` — "Mungkin Cocok" | Pencocokan |
| < 35 | `tidak_cocok` | **Disembunyikan** dari halaman Pencocokan |

Ambang notifikasi otomatis: `MatchScoreService::NOTIFY_THRESHOLD = 60`.

### 13.5 Algoritma Python — `image_matcher/main.py`

**Konstanta & bobot:**

```python
MAX_SIDE = 512
CLAHE = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

W_AKAZE = 0.35
W_ORB   = 0.25
W_HIST  = 0.25
W_HOG   = 0.15
```

**Pemuatan gambar (perbaikan v2):** file dibaca **sekali** dan di-resize
**menjaga rasio aspek** (sebelumnya dipaksa 640×640 sehingga rasio rusak):

```python
def load_image(path):
    img = cv2.imread(path)
    h, w = img.shape[:2]
    scale = MAX_SIDE / max(h, w)
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
    return cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=interp)
```

**Pre-processing:**

```python
gray    = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray    = cv2.bilateralFilter(gray, 5, 40, 40)   # denoise, pertahankan tepi
gray_eq = CLAHE.apply(gray)                      # ratakan pencahayaan
```

**Ekstraksi ciri:**

| Ciri | Parameter | Tujuan |
|---|---|---|
| **AKAZE** | `AKAZE_DESCRIPTOR_MLDB`, `threshold=0.001`, `nOctaves=4`, `nOctaveLayers=4`, `descriptor_channels=3` | Titik unik & deskriptor tahan sudut |
| **ORB** | `nfeatures=1000` | Cadangan bila AKAZE lemah (benda mulus) |
| **Histogram HSV** | center-crop 60%, kanal H+S saja, `mask = inRange(hsv,(0,40,40),(180,255,255))`, bin `18×16`, normalisasi L1 | Distribusi warna; piksel pucat/gelap diabaikan |
| **HOG** | window `128×128`, winStride `16×16`, block `8×8`, cell `8×8`, 9 bin, Gaussian blur `(5,5)` | Bentuk & tepi umum |
| **CNN** | MobileNetV2 ONNX, input `224×224×3` RGB, normalisasi ImageNet | Embedding semantik 1000-dim |

**CNN embedding:**

```python
def cnn_embedding(img_bgr):
    rgb = cv2.cvtColor(
        cv2.resize(img_bgr, (224, 224), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB
    ).astype(np.float32) / 255.0
    rgb = (rgb - MEAN) / STD     # MEAN=[.485,.456,.406], STD=[.229,.224,.225]
    tensor = np.transpose(rgb, (2, 0, 1))[np.newaxis, ...].astype(np.float32)
    sess = get_session()
    out = sess.run(None, {sess.get_inputs()[0].name: tensor})[0]
    vec = out.flatten().astype(np.float32)
    vec -= vec.mean()             # pusatkan
    n = np.linalg.norm(vec)
    return vec / n if n > 0 else None   # L2-normalisasi
```

**Kalibrasi skor CNN:**

```python
def cnn_score(f1, f2):
    a, b = f1.get("cnn"), f2.get("cnn")
    if a is None or b is None:
        return None, None
    sim = float(np.dot(a, b))     # cosine similarity
    # Dikalibrasi dari 2 titik data: beda total ~0.55 -> 0 poin, sama ~0.90 -> 100 poin
    score = max((sim - 0.55) / 0.35, 0.0) * 100
    return round(min(score, 100.0), 2), round(sim, 4)
```

**Skor pencocokan fitur biner (AKAZE/ORB):**

```python
def feature_match_score(kp1, des1, kp2, des2):
    bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    matches = bf.knnMatch(des1, des2, k=2)
    good = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.75 * m[1].distance]
    n = len(good)
    min_kp = min(len(kp1), len(kp2))
    # Cocok 15% keypoint sudah dianggap penuh
    ratio_score = min(n / max(min_kp * 0.15, 1), 1.0)
    count_score = min(n / 100.0, 1.0)
    score = (ratio_score * 0.7 + count_score * 0.3) * 100
    # Redam jika match terlalu sedikit (rawan kebetulan)
    if n < 8:
        score *= n / 8.0
    return round(min(score, 100.0), 2), n
```

> Perbaikan penting: rasio lama `good / min_kp` membuat skor AKAZE **selalu
> kecil**, sehingga foto yang sama tetapi berbeda sudut hampir tidak pernah
> mencapai skor tinggi. Rumus baru memakai `min_kp * 0.15` sebagai "penuh".

**Skor histogram dengan kasus khusus:**

```python
def histogram_score(f1, f2):
    low1 = f1["colored_ratio"] < 0.1
    low2 = f2["colored_ratio"] < 0.1
    # Barang hitam/putih/abu: Hue tidak bermakna
    if low1 and low2:
        return 70.0
    if low1 != low2:
        return 20.0
    correl = max(cv2.compareHist(f1["hist"], f2["hist"], cv2.HISTCMP_CORREL), 0.0)
    bhat   = 1.0 - cv2.compareHist(f1["hist"], f2["hist"], cv2.HISTCMP_BHATTACHARYYA)
    return round(max((correl + bhat) / 2, 0.0) * 100, 2)
```

**Skor HOG:**

```python
def hog_score(f1, f2):
    a, b = f1["hog"], f2["hog"]
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    sim = float(np.dot(a, b) / norm)
    # Skala ulang 0.5-1.0 -> 0-100
    return round(max((sim - 0.5) / 0.5, 0.0) * 100, 2)
```

**Penggabungan akhir:**

```python
classic = akaze_s * W_AKAZE + orb_s * W_ORB + hist_s * W_HIST + hog_s * W_HOG
cnn_s, cnn_cos = cnn_score(f1, f2)
# CNN 60% + CV klasik 40%. Kalau CNN gagal dimuat, pakai CV klasik saja.
photo = classic if cnn_s is None else (cnn_s * 0.6 + classic * 0.4)
```

### 13.6 Output JSON Python

```json
{
  "photo_score": 68.43,
  "classic_score": 54.12,
  "cnn_score": 78.30,
  "cnn_cosine": 0.8237,
  "cnn_error": null,
  "akaze_score": 61.20,
  "orb_score": 48.55,
  "histogram_score": 71.30,
  "hog_score": 35.42,
  "total_matches": 42,
  "orb_matches": 31,
  "keypoints_1": 812,
  "keypoints_2": 764,
  "message": "success"
}
```

### 13.7 Bridge PHP → Python (`ImageMatchingService`)

```php
private int $timeoutSeconds = 20;

public function __construct()
{
    $this->pythonPath = base_path('multiverse/python/venv/Scripts/python.exe');
    $this->scriptPath = base_path('multiverse/python/image_matcher/main.py');
}
```

> ⚠️ **Penting:** path Python menggunakan `venv/Scripts/python.exe` — ini
> **khusus Windows**. Di Linux/macOS harus `venv/bin/python`. Lihat
> [§29 Known Issues](#29-known-issues--batasan).

Mekanismenya:

```php
$input = json_encode([
    'image1_path' => str_replace('\\', '/', $imagePath1),
    'image2_path' => str_replace('\\', '/', $imagePath2),
]);

$process = proc_open(
    "\"{$this->pythonPath}\" \"{$this->scriptPath}\"",
    $descriptors,
    $pipes
);

stream_set_blocking($pipes[1], false);
fwrite($pipes[0], $input);
fclose($pipes[0]);

// Poll non-blocking + terminate kalau lewat 20 detik
while (true) {
    $chunk = fread($pipes[1], 8192);
    if ($chunk !== false) { $output .= $chunk; }

    $status = proc_get_status($process);
    if (!$status['running']) { break; }

    if ((time() - $startTime) > $this->timeoutSeconds) {
        proc_terminate($process, 9);   // SIGKILL
        return $this->errorResult('Timeout — proses terlalu lama');
    }

    usleep(50000);
}
```

Penanganan error: file tidak ada, Python tidak terinstal, output kosong, JSON
tidak valid, atau Python mengembalikan `{"error": ...}` → semuanya menghasilkan
`['success' => false, 'photo_score' => 0.0, 'error' => '...']`.

### 13.8 Cache Hasil Pencocokan

```php
public function compareWithCache(int $reportId1, int $reportId2, string $imagePath1, string $imagePath2): array
{
    $idA = min($reportId1, $reportId2);   // ← normalisasi urutan
    $idB = max($reportId1, $reportId2);

    $cached = MatchResult::where('report_id_1', $idA)
        ->where('report_id_2', $idB)
        ->first();

    if ($cached) {
        return ['success' => true, 'photo_score' => $cached->photo_score, 'from_cache' => true];
    }

    $result = $this->compare($imagePath1, $imagePath2);
    if ($result['success']) {
        MatchResult::updateOrCreate(
            ['report_id_1' => $idA, 'report_id_2' => $idB],
            ['photo_score' => $result['photo_score']]
        );
    }
    return $result;
}
```

Normalisasi `min`/`max` memastikan pasangan (A,B) dan (B,A) memakai baris cache
yang sama.

### 13.9 Pencocokan Otomatis saat Verifikasi

`NotificationHelper::checkAndNotifyMatches($report)` dipanggil setelah laporan
diverifikasi. Ia mencari laporan berlawanan yang juga `verified`, menghitung
skor, dan mengirim notifikasi bila ambang tercapai.

**Optimasi penting:** karena skor foto maksimum 50 dan bobotnya 50%, skor
maksimum bila teks = 0 adalah 25. Maka sebelum memanggil Python, sistem
memeriksa apakah `text_score * 0.5 + 50 >= 60`. Bila tidak, pasangan langsung
dilewati — **menghemat proses Python yang mahal**.

### 13.10 Mode Uji Manual dari Terminal

```bash
cd multiverse/python
venv/Scripts/activate
python image_matcher/main.py foto1.jpg foto2.jpg
```

Script mendeteksi `len(sys.argv) == 3` dan langsung mencetak JSON hasil
perbandingan tanpa perlu Laravel.

### 13.11 Hasil Pengujian yang Tercatat

| Pasangan | Skor Foto Lama | Skor Foto Baru | Status |
|---|---:|---:|---|
| Tumbler vs Tumbler (sudut berbeda) | ± 52 | **68.43** | ✅ naik 16 poin |
| Tumbler vs Rokok (beda total) | belum diukur | **1.93** | ✅ sangat rendah |

Di halaman Pencocokan:
- Rokok vs Rokok Humer: **100%** (foto identik + teks cocok)
- Tumbler: **83.96%**
- Rokok lain: **82.84%**
- Pasangan beda total: **tidak muncul**

### 13.12 Batasan Algoritma yang Diketahui

| # | Batasan | Dampak |
|---|---|---|
| 1 | Kalibrasi CNN hanya dari 2 titik data | Dua barang berbeda tapi mirip (dua botol biru) bisa lolos |
| 2 | Sudut sangat ekstrem | Cosine bisa < 0.55 → skor 0 |
| 3 | Target 80–90% untuk foto saja belum tercapai | Sekarang ~68%; skor akhir tinggi dibantu teks |
| 4 | Skor 100% pada dokumen identik | Wajar karena foto identik + teks cocok |

---

## 14. Modul 4 — Privasi Foto & Deteksi Data Pribadi (PII)

### 14.1 Kategori Sensitif (Kunci Keras)

```php
public const SENSITIVE_CATEGORIES = [
    'Dokumen & Surat',
    'Kartu & Identitas',
    'Uang',
];
```

Foto kategori ini **selalu** disamarkan dan **tidak bisa** dibuka samarannya
oleh admin — termasuk super admin.

> **Elektronik sengaja TIDAK ada di daftar ini.** Alasan: foto barang
> elektronik umumnya hanya menunjukkan bodi barang (bodi HP, casing, kabel),
> bukan identitas pemilik. Blur lama terlalu ekstrem — foto diperkecil ke
> **40 piksel** sehingga hanya menyisakan gumpalan warna dan barang sama sekali
> tidak bisa dikenali oleh warga yang mencarinya. Laporan jadi tidak berguna.
>
> Privasi tetap terjaga karena foto elektronik yang ternyata memuat data
> pribadi (mis. layar menampilkan KTP) **tetap disamarkan otomatis** oleh
> detektor PII — dan admin **boleh** membuka samaran kalau hasilnya keliru.

### 14.2 Matriks Perlakuan Foto

| Kategori | Perlakuan foto | Bisa dibuka admin? |
|---|---|:---:|
| **Elektronik** | Tampil normal; dicek detektor PII | ✅ (bila bukan kategori sensitif) |
| **Dokumen & Surat** | Blur keras | ❌ |
| **Kartu & Identitas** | Blur keras | ❌ |
| **Uang** | Blur keras | ❌ |
| Semua kategori lain | Tampil normal, **tapi dicek detektor PII** | ✅ ("Buka samaran") |

### 14.3 Empat Skenario Hasil Deteksi

| Hasil | Tindakan | Kolom DB |
|---|---|---|
| Tidak ada data pribadi | Foto tampil normal; metadata EXIF/GPS dibuang | `pii_detected=false`, `pii_status='none'` |
| Data pribadi terdeteksi | Foto disamarkan; asli disimpan di **disk privat**; alasan dicatat | `pii_detected=true`, `pii_status='detected'`, `pii_reasons=[...]`, `photo_original=<path privat>` |
| Detektor gagal | Foto **tetap disamarkan** demi keamanan (*fail-safe*) | `pii_check_error=<pesan>`, `pii_status='detected'` |
| Admin membuka samaran | Foto asli dikembalikan ke disk publik | `pii_status='cleared'`, `pii_detected=false`, `photo_original=null` |

### 14.4 Algoritma Deteksi PII (`pii_detector/main.py`)

**Empat jenis data pribadi yang dideteksi:**

| Jenis | Cara Deteksi |
|---|---|
| **NIK** (16 digit) | Regex `(?<!\d)\d{16}(?!\d)` pada hasil OCR |
| **Nomor kartu bank** (13–19 digit) | Regex + **checksum Luhn** |
| **Kata kunci dokumen identitas** | Minimal **2** kata kunci berbeda dari daftar |
| **Wajah** | OpenCV Haar Cascade (`haarcascade_frontalface_default.xml`) |

**Daftar kata kunci dokumen:**

```python
DOCUMENT_KEYWORDS = [
    "ktp", "kartu tanda penduduk", "kk", "kartu keluarga",
    "sim", "surat izin mengemudi", "npwp",
    "akta kelahiran", "akta nikah", "paspor",
    "surat keterangan", "ijazah",
    "kartu potongan pajak", "bpjs", "kartu bpjs",
]
```

Kata kunci "lemah" (`kk`, `sim`, `npwp`) tidak boleh dihitung sendiri sebagai
satu dari "dua kata kunci", agar false positive diminimalkan.

**OCR:**

```python
for psm in (6, 11, 3):
    text = pytesseract.image_to_string(
        preprocess_for_ocr(img),
        lang="eng",
        config="--psm %d" % psm,
        timeout=12,
    )
    if len(text) > len(best): best = text
    if len(best.strip()) > 40: break   # cukup, jangan coba lagi
```

Pre-processing OCR: grayscale → upscale 2× (supaya angka kecil terbaca) →
threshold Otsu.

**Deteksi wajah:**

```python
faces = cascade.detectMultiScale(
    gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
)
```

### 14.5 Fail-Safe di Level PHP

`PiiDetectionService` mengembalikan hasil dengan aman:

| Kondisi | Hasil |
|---|---|
| Deteksi sukses, ada PII | `detected => true`, `reasons => [...]` |
| Deteksi sukses, tidak ada PII | `detected => false`, `reasons => []` |
| **Deteksi GAGAL** (Tesseract belum ada, timeout, file rusak) | `detected => true` (fail-safe!), `error => <pesan>` |
| `PII_DETECTION_ENABLED=false` | `detected => false`, `pii_status='none'` |

Karena `PhotoPrivacyService::detectPersonalData()` memakai nilai balik
`detected`, kegagalan detektor otomatis berarti **foto disamarkan** — bukan
diteruskan apa adanya.

### 14.6 Algoritma Blur

```php
public function blurImage(string $binary): ?string
{
    $tinyW = 40;
    $tinyH = max(1, (int) round($h * ($tinyW / $w)));
    // 1) Perkecil ke 40px
    // 2) Perbesar kembali ke 640px
    // 3) 4× IMG_FILTER_GAUSSIAN_BLUR
    // 4) JPEG quality 60
}
```

Bentuk dan warna umum masih terlihat, tetapi teks/angka **tidak terbaca**.

> Jika GD tidak tersedia, `blurImage()` mengembalikan `null` → `protect()` tidak
> membuat file publik sama sekali. **Lebih aman menyembunyikan daripada
> membocorkan.**

### 14.7 Scrub Metadata EXIF/GPS

Semua foto (bahkan yang tanpa PII) diproses `sanitize()`:

```php
public function reencode(string $binary, int $maxWidth = 1600): ?string
{
    $exif        = @exif_read_data('data://image/jpeg;base64,' . base64_encode($binary));
    $orientation = (int) ($exif['Orientation'] ?? 1);
    $angle       = [3 => 180, 6 => -90, 8 => 90][$orientation] ?? 0;
    // putar sesuai orientasi, resize max 1600px, re-encode JPEG q85
}
```

Orientasi EXIF diterapkan **lebih dulu** supaya foto dari HP tidak miring
setelah metadatanya dibuang. GPS/EXIF juga terhapus — penting karena foto
handphone sering menyimpan koordinat rumah.

### 14.8 Melihat Foto Asli (Route Terotorisasi)

```php
Route::get('/reports/{id}/photo-original', function ($id) {
    $report = Report::findOrFail($id);

    if (!auth()->user()->canViewOriginalPhoto($report) || !$report->photo_original) {
        abort(404);
    }

    $path = Storage::disk('local')->path($report->photo_original);
    if (!file_exists($path)) { abort(404); }

    return response()->file($path, ['Cache-Control' => 'private, no-store']);
})->name('reports.photo-original');
```

Header `Cache-Control: private, no-store` mencegah browser/CDN menyimpan foto
sensitif.

### 14.9 Koreksi Manual oleh Admin

| Tombol | Route | Efek |
|---|---|---|
| **Samarkan foto** | `PUT /admin/reports/{id}/privacy/blur` | `protect($report, false)` → `pii_status='forced'`, `pii_reasons=['Disamarkan manual oleh admin']` |
| **Buka samaran** | `PUT /admin/reports/{id}/privacy/unblur` | `restorePublic($report)` → `pii_status='cleared'`, `pii_detected=false` |

Keduanya **ditolak** bila `photo_sensitive = true` (kategori sensitif).

---

## 15. Modul 5 — Nomor Seri / IMEI

### 15.1 Mengapa IMEI

"Ciri khusus" (seperti "ada coretan di sudut") bisa ditebak atau bocor. Nomor
seri perangkat adalah **bukti kepemilikan yang jauh lebih kuat**, dan bisa
divalidasi secara matematis.

IMEI = **15 digit** dengan **checksum Luhn** → satu digit salah ketik langsung
ketahuan, tanpa perlu menghubungi siapa pun.

### 15.2 Implementasi Checksum Luhn

```php
public function luhnValid(string $number): bool
{
    if ($number === '' || !ctype_digit($number)) {
        return false;
    }

    $sum    = 0;
    $parity = strlen($number) % 2;

    for ($i = 0; $i < strlen($number); $i++) {
        $digit = (int) $number[$i];

        if ($i % 2 === $parity) {
            $digit *= 2;
            if ($digit > 9) {
                $digit -= 9;
            }
        }

        $sum += $digit;
    }

    return $sum % 10 === 0;
}
```

Contoh:
- `352099001761481` → **valid**
- `352099001761482` → **tidak valid** (checksum salah)

> ⚠️ Implementasi Luhn ada di **dua tempat** dan harus selalu sama:
> `app/Services/ImeiService.php` (backend) dan `resources/js/services/imei.js`
> (browser). Kalau keduanya berbeda, validasi akan terasa "aneh" bagi pengguna.

### 15.3 Normalisasi, Validasi & Format

```php
public function normalize(?string $value): ?string
{
    if ($value === null) { return null; }
    $digits = preg_replace('/\D/', '', $value);
    return $digits === '' ? null : $digits;
}

public function isValidImei(?string $value): bool
{
    $digits = $this->normalize($value);
    if ($digits === null || strlen($digits) !== self::IMEI_LENGTH) {
        return false;
    }
    return $this->luhnValid($digits);
}

public function format(?string $value): ?string
{
    // 352099001761481 → 35-209900-176148-1
    return implode('-', [
        substr($digits, 0, 2),
        substr($digits, 2, 6),
        substr($digits, 8, 6),
        substr($digits, 14, 1),
    ]);
}
```

Pesan error yang ramah:

| Situasi | Pesan |
|---|---|
| Kosong | "Nomor seri wajib diisi." |
| Panjang ≠ 15 | "Nomor seri/IMEI harus terdiri dari 15 digit (sekarang N digit)." |
| Checksum salah | "Nomor seri/IMEI tidak valid (checksum salah). Periksa ulang digit yang diketik." |

### 15.4 Kewajiban IMEI per Peran

| Peran | Kewajiban | Validasi |
|---|---|---|
| **Penemu** (temuan, kategori Elektronik) | Wajib mengisi nomor seri/IMEI, **atau** mencentang "Tidak bisa membaca" | 15 digit + checksum Luhn → salah ketik langsung ketahuan |
| **Penemu** (perangkat mati/terkunci) | Memilih checkbox "Tidak bisa membaca" | Tidak wajib isi angka; admin yang membaca dari fisik |
| **Admin kelurahan** | Membaca nomor seri dari **fisik perangkat** saat mencatat "Terima Barang" | Otomatis dibandingkan dengan yang dilaporkan penemu. **Beda → peringatan** |
| **Pemilik** (laporan barang hilang) | **Opsional** mengisi IMEI | Kalau sama → pencocokan langsung 100% + notifikasi "🎯 Nomor Seri Cocok" |
| **Pengklaim** | Wajib menyebut nomor seri | Admin melihat **tiga nilai berdampingan** |

### 15.5 Efek Nomor Seri pada Pencocokan

```
IMEI kedua laporan identik  →  skor = 100% (sangat_mirip)
                                tanpa perlu melihat nama atau foto
                                + notifikasi "🎯 Nomor Seri Cocok"
```

Implementasi di `MatchScoreService::imeiMatches()`:

```php
public function imeiMatches(Report $a, Report $b): bool
{
    if (!$a->hasReportedImei() || !$b->hasReportedImei()) {
        return false;
    }
    return app(ImeiService::class)->matches($a->reported_imei, $b->reported_imei);
}
```

### 15.6 Perbandingan Tiga Sumber

`ImeiService::compare()` membandingkan tiga nilai sekaligus:

```php
public function compare(?string $reported, ?string $admin, ?string $claimant): array
{
    // ...
    return [
        'reported'             => $r,
        'admin'                => $a,
        'claimant'             => $c,
        'reported_vs_admin'    => $reportedVsAdmin,
        'reported_vs_claimant' => $reportedVsClaimant,
        'admin_vs_claimant'    => $adminVsClaimant,
        'all_match'            => $allMatch,
        'has_data'             => $r !== null || $a !== null || $c !== null,
    ];
}
```

UI (`Admin/ClaimDetail.jsx`) menampilkan tiga kolom berdampingan:
**dilaporkan penemu** │ **dibaca admin** │ **dibclaimer penglaim** — dengan
penanda ✅/❌ per pasangan dan peringatan bila ketiganya tidak sama.

### 15.7 Validasi pada Alur Penerimaan Barang

`PUT /admin/reports/{id}/receive` menerapkan aturan berbeda untuk elektronik
dan non-elektronik:

```php
if ($report->category === 'Elektronik') {
    if (!$imeiService->isValidImei($serial)) {
        return redirect()->back()->with('error', $imeiService->validationMessage($serial));
    }
} elseif ($serial !== '' && mb_strlen($serial) < 5) {
    return redirect()->back()->with('error', 'Nomor seri minimal 5 karakter. Kosongkan saja kalau barang ini tidak punya nomor seri.');
}
```

> **Perbaikan penting:** aturan lama memaksa minimal 5 karakter untuk semua
> kategori, sehingga barang seperti tumbler/jaket/payung (yang umumnya **tidak
> punya nomor seri**) tidak pernah bisa dicatat "diterima" — artinya masa
> klaim juga tidak pernah ter-anchor ke waktu penerimaan.

Setelah mencatat, sistem membandingkan nomor seri yang dibaca admin dengan
yang dilaporkan penemu:

```php
if ($report->reported_imei && $serial && !$imeiService->matches($report->reported_imei, $serial)) {
    return redirect()->back()->with('warning', '⚠️ Nomor seri yang dibaca dari perangkat BERBEDA dengan yang dilaporkan penemu. Mohon verifikasi ulang sebelum menyetujui klaim.');
}
```

### 15.8 Privasi IMEI

`reported_imei` ada di `$hidden` model `Report` → **tidak pernah** ikut
terkirim ke browser publik. Admin/pemilik memperolehkannya lewat prop khusus
di halaman detail:

```php
'reportedImei'          => $canManage ? $report->reported_imei : null,
'reportedImeiFormatted' => $canManage ? $imeiService->format($report->reported_imei) : null,
'imeiUnreadable'       => $canManage ? (bool) $report->imei_unreadable : false,
'imeiVerifiedAt'       => $canManage ? $report->imei_verified_at : null,
```

---

## 16. Modul 6 — Sistem Klaim & Serah Terima

### 16.1 Prinsip: Klaim Selalu Terikat ke Satu Laporan Hilang

Sejak pembaruan Oktober 2026, **setiap klaim wajib menunjuk satu laporan
barang HILANG milik penglaim**. Ini menggantikan model lama di mana klaim
hanya menunjuk barang temuan — sehingga admin tidak bisa membandingkan barang
temuan dengan laporan hilang yang diklaim.

Tombol "📦 Klaim Barang Ini" tidak lagi langsung mengirim klaim; ia membuka
popup:

```
Klik "Klaim Barang Ini"
        ↓
Popup: daftar laporan HILANG milik user sendiri
        ↓
User memilih 1 laporan hilang
        ↓
Klik "Kirim Klaim" → klaim tersimpan dengan lost_report_id
        ↓
Admin melihat laporan hilang tersebut di halaman detail klaim
```

**Perilaku modal:**

- Bila user datang dari halaman Pencocokan (`?lost_report_id=XX`), laporan yang
  cocok langsung **terpilih otomatis**.
- Tombol "Kirim Klaim" nonaktif sampai satu laporan dipilih.
- Bila user belum punya laporan hilang, popup menampilkan ajakan
  "Buat Laporan Hilang".

### 16.2 Syarat-Syarat Server (`ClaimController@store`)

Pemeriksaan dilakukan berurutan; pesan error dikembalikan sebagai HTTP 422:

| # | Syarat | Pesan |
|---|---|---|
| 1 | Tipe laporan = `found` | "Hanya laporan temuan yang bisa diklaim." |
| 2 | Bukan pelapor sendiri | "Anda tidak bisa mengklaim barang sendiri." |
| 3 | Status ∈ {`verified`, `expired`} | "Laporan ini tidak bisa diklaim saat ini." |
| 4 | Belum ada klaim pending/approved | "Anda sudah pernah mengklaim barang ini." |
| 5 | Maksimal **3** klaim ditolak per akun | "Anda telah mencapai batas percobaan klaim untuk barang ini. Silakan hubungi kantor kelurahan." |
| 6 | `lost_report_id` milik user, tipe `lost`, status ∈ {`verified`, `matched`} | "Pilih laporan barang hilang Anda yang sudah terverifikasi." |
| 7 | `lost_report_id` belum dipakai klaim aktif | "Laporan barang hilang ini sedang digunakan untuk klaim lain." |
| 8 | Kategori Elektronik → `claimant_serial` wajib | "Sebutkan nomor seri/IMEI perangkat ini." |
| 9 | Kategori Elektronik → IMEI harus valid (15 digit + Luhn) | pesan dari `ImeiService::validationMessage()` |
| 10 | `secret_feature` ada → `claimant_proof` wajib | "Sebutkan ciri khusus barang yang hanya Anda Anda ketahui." |

**Penanganan klaim tebus:**

```php
// Masa klaim yang sudah lewat -> tandai Kedaluwarsa dulu.
app(\App\Services\ClaimWindowService::class)->syncExpired($report);
$report->refresh();

$isRedemption = $report->status === 'expired';
```

Klaim tebus ditandai `is_redemption = true` dan `redeemed_at = now()`, sehingga
admin tahu ini pelepasan barang yang tertunda, bukan klaim biasa.

### 16.3 Notifikasi Saat Klaim Masuk

```php
// Admin wilayah barang temuan (pemutus)
NotificationHelper::send(
    $admin->id,
    $isRedemption ? '📦 Permintaan Tebus Barang' : '📦 Permintaan Klaim Barang',
    ...,
    'claim',
    "/admin/claims/{$claim->id}"
);

// Admin wilayah laporan hilang (info), bila berbeda wilayah
NotificationHelper::send(
    $admin->id,
    '📦 Warga Anda Mengajukan Klaim',
    ...,
    'claim',
    "/admin/claims/{$claim->id}"
);
```

### 16.4 Keputusan Klaim (`verify`)

**Syarat approve:**

```php
// Barang harus tercatat diterima di kantor kelurahan sebelum klaim disetujui
if ($request->status === 'approved' && !$claim->report->received_at) {
    return redirect()->back()->with('error', 'Catat dulu penerimaan barang di kantor kelurahan sebelum menyetujui klaim.');
}

// Barang elektronik: nomor seri/IMEI harus sudah dicatat dari fisik perangkat
if ($request->status === 'approved' && $claim->report->category === 'Elektronik' && empty($claim->report->serial_number)) {
    return redirect()->back()->with('error', 'Catat nomor seri/IMEI perangkat sebelum menyetujui klaim.');
}
```

**Efek saat disetujui:**

```php
$claim->report->update(['status' => 'matched']);           // laporan temuan
Report::where('id', $claim->lost_report_id)
    ->where('user_id', $claim->claimant_id)
    ->update(['status' => 'matched']);                       // laporan hilang

// Klaim lain yang masih menunggu untuk barang yang sama otomatis ditolak
$competing = Claim::where('report_id', $claim->report_id)
    ->where('id', '!=', $claim->id)
    ->where('status', 'pending')
    ->get();

foreach ($competing as $other) {
    $other->update([
        'status'      => 'rejected',
        'admin_note'  => 'Barang ini telah disetujui untuk pengklaim lain.',
        'verified_at' => now(),
        'verified_by' => auth()->id(),
    ]);
    NotificationHelper::send($other->claimant_id, '❌ Klaim Ditolak', ...);
}
```

**Penolakan wajib beralasan:**

```php
$request->validate([
    'status'    => 'required|in:approved,rejected',
    'admin_note' => 'required_if:status,rejected|nullable|string|max:500',
], [
    'admin_note.required_if' => 'Alasan penolakan wajib diisi.',
]);
```

### 16.5 Serah Terima (`handover`)

Serah terima dicatat **setelah** klaim disetujui, dan signifies barang benar-benar
berpindah tangan.

```php
$validated = $request->validate([
    'receiver_name'   => 'required|string|min:3|max:100',
    'receiver_id_type' => 'required|in:KTP,KK,SIM,Kartu Pelajar,Lainnya',
    'handover_note'    => 'nullable|string|max:500',
], [
    'receiver_name.required'   => 'Nama pengambil wajib diisi.',
    'receiver_name.min'        => 'Nama pengambil minimal 3 karakter.',
    'receiver_id_type.required' => 'Pilih jenis identitas yang ditunjukkan.',
    'receiver_id_type.in'       => 'Jenis identitas tidak valid.',
]);
```

Efek samping serah terima:

```php
$claim->update([
    'handed_over_at'  => now(),
    'handed_over_by'  => $user->id,
    'receiver_name'   => $validated['receiver_name'],
    'receiver_id_type' => $validated['receiver_id_type'],
    'handover_note'   => $validated['handover_note'] ?? null,
]);

$claim->report->update([
    'status'          => 'resolved',
    'resolution_type' => 'claimed',
    'released_at'     => now(),
    'released_by'     => $user->id,
]);
```

> **Catatan penting:** pada jalur klaim normal, data sensitif (IMEI, ciri
> rahasia, foto asli) **TIDAK** dihapus di sini — laporan ini masih menjadi
> riwayat kasus yang sah. Penghapusan data sensitif hanya berlaku untuk barang
> yang lewat masa klaim dan dilepas lewat berita acara tindak lanjut.

### 16.6 Halaman Detail Klaim Admin

`Admin/ClaimDetail.jsx` (1.198 baris) menyediakan:

- **Aksi Cepat**: "Lihat Profil Penglaim" → `/admin/users/{id}`, dan
  "Lihat Barang Hilang Pengklaim" → `/reports/{lost_report_id}` (menampilkan
  foto kecil dan nama barang hilang).
- Fallback: bila tidak ada laporan hilang terkait, tombol tampil nonaktif
  dengan pesan "Tidak Ada Laporan Hilang Terkait".
- **Panel tiga sumber nomor seri** berdampingan.
- **Panel privasi foto** dengan tombol "Samarkan foto" / "Buka samaran".
- **Panel status & riwayat** termasuk `handed_over_at`, `receiver_name`,
  `receiver_id_type`.

### 16.7 Halaman Daftar Klaim Admin

`Admin/Claims.jsx` menampilkan statistik (pending / approved / rejected) dan
tabel klaim. Setiap baris diberi atribut `can_decide`:

```php
$claim->setAttribute('can_decide', $user->canManageRegion($claim->report?->region_id));
```

Artinya admin wilayah laporan hilang melihat klaim sebagai informasi, bukan
tindakan yang bisa iaEksekusi.

---

## 17. Modul 7 — Siklus Barang Temuan 30 Hari & Berita Acara

### 17.1 Pertanyaan yang Memicu Fitur Ini

> "Kalau ada laporan penemuan, misal 30 hari tidak ada yang klaim, mau diapakan
> barang ini? Apakah laporan penemuan yang 30 hari tidak ada yang klaim akan
> hilang, barangnya disimpan di kelurahan, atau jadi milik negara?"

### 17.2 Tiga Prinsip yang Dijaga

1. **Barang temuan TIDAK pernah jadi "milik negara".** Konsep itu milik
   kepabeanan (barang yang tidak diambil pemilik dalam batas waktu). Untuk
   barang warga, "milik negara" tanpa prosedur formal justru membuka masalah:
   siapa yang bertanggung jawab, dan dasar hukumnya apa.
2. **Barang TIDAK pernah hilang.** Status "kedaluwarsa" hanya berarti masa klaim
   sudah habis — barangnya masih ada di kantor kelurahan.
3. **Barang tidak boleh kembali ke penemu.** Kalau barangnya sudah lewat masa
   klaim lalu dikembalikan ke yang menemukannya, secara hukum berisiko masuk
   ranah pengambilan barang milik orang lain. Jadi pelepasan hanya lewat
   berita acara.

### 17.3 Konfigurasi (`config/temubarang.php`)

```php
return [
    'claim_window_days'          => (int) env('CLAIM_WINDOW_DAYS', 30),
    'expiry_reminder_days'      => (int) env('CLAIM_EXPIRY_REMINDER_DAYS', 5),
    'escalation_days'            => (int) env('CLAIM_ESCALATION_DAYS', 7),
    'purge_sensitive_on_release' => (bool) env('PURGE_SENSITIVE_ON_RELEASE', true),
    'minimum_witnesses'          => (int) env('MINIMUM_WITNESSES', 1),
];
```

### 17.4 Perhitungan Masa Klaim

```php
public function openWindow(Report $report): void
{
    if ($report->type !== 'found' || !empty($report->released_at)) {
        return;
    }

    // Barang sudah diterima di kantor -> jangkar ke waktu penerimaan.
    if (!empty($report->received_at)) {
        $report->update([
            'claim_deadline' => $report->received_at->copy()->addDays($this->windowDays($report)),
        ]);
        return;
    }

    // Belum diterima: jangkar ke waktu verifikasi. Kalau deadline sudah
    // ada, biarkan - jangan geser karena updated_at bisa berubah kapan saja.
    if (!empty($report->claim_deadline)) {
        return;
    }

    $start = $report->updated_at ?? now();
    $report->update(['claim_deadline' => $start->copy()->addDays($this->windowDays($report))]);
}
```

**Dua jangkar:**

| Situasi | Deadline dihitung dari |
|---|---|
| Barang sudah diterima di kantor kelurahan | `received_at` (waktu penerimaan) |
| Barang belum diterima | waktu verifikasi |

**Aturan penting:** kalau `claim_deadline` sudah ada dan barang belum
diterima, **deadline tidak digeser ulang**. Tanpa aturan ini, setiap kali
laporan diedit (`updated_at` berubah) masa klaim ikut bergeser dan pemilik
bisa kehilangan haknya tanpa pernah diberi tahu.

Ada test yang mengunci perilaku ini:
`test_claim_window_is_not_shifted_when_the_report_is_edited`.

### 17.5 Sinkronisasi On-Read (Desain Robust)

Masa klaim **tidak bergantung pada scheduler**. `syncExpired()` dipanggil saat:

- Halaman detail laporan dibuka
- Daftar laporan dibuka
- Papan barang temuan publik dibuka
- Pengajuan klaim dikirim
- Command `reports:check-expiry` dijalankan

```php
public function syncExpired(Report $report): bool
{
    if ($report->type !== 'found')  { return false; }
    if ($report->status !== 'verified') { return false; }
    if (empty($report->claim_deadline)) { return false; }
    if (!$this->isExpired($report)) { return false; }

    return $this->expire($report);
}
```

Tanpa ini, laporan yang sudah lewat 30 hari tetap berstatus "verified",
sehingga:

- Penglaim mengirim klaim biasa, bukan klaim tebus
- Admin tidak melihat tombol "Tindak Lanjut"
- Papan publik menampilkan sisa hari yang negatif

### 17.6 Notifikasi Kedaluwarsa (Sekali Saja)

`expire()` adalah **satu-satunya jalan resmi** menuju status "Kedaluwarsa",
dan notifikasi ikut di dalamnya. Karena itu perpindahan status hanya terjadi
**SEKALI** — siapa pun yang memicu lebih dulu, orang lain tidak akan menerima
notifikasi yang sama lagi.

```php
// 1) Admin kelurahan yang bertanggung jawab
NotificationHelper::sendOncePerReport(
    $admin->id,
    '📦 Barang Temuan Kedaluwarsa - Perlu Tindak Lanjut',
    "Masa klaim barang temuan \"{$report->item_name}\" ... telah habis. " .
    "Barang TIDAK dianggap hilang dan TIDAK menjadi milik negara - barang masih tersimpan di kantor kelurahan " .
    "dan pemilik masih bisa menebusnya. Mohon catat berita acara tindak lanjut ...",
    'warning',
    "/admin/reports/{$report->id}/followup"
);

// 2) Penemu diberi tahu bahwa barangnya sudah kedaluwarsa (bukan hilang)
NotificationHelper::sendOncePerReport(
    $report->user_id,
    '📦 Masa Klaim Barang Temuan Anda Berakhir',
    "Masa klaim untuk \"{$report->item_name}\" telah berakhir. Barang masih tersimpan di kantor kelurahan " .
    "dan belum dilepas. Pemilik masih bisa menebusnya di kantor kelurahan.",
    'info',
    "/reports/{$report->id}"
);
```

### 17.7 Matriks Rekomendasi Tindak Lanjut

Rekomendasi hanya **saran** yang ditampilkan ke admin. Admin tetap memutuskan,
dan pilihannya dicatat pada berita acara.

```php
public const RECOMMENDED_ACTIONS = [
    'Kartu & Identitas'     => 'return_to_issuer',
    'Dokumen & Surat'       => 'return_to_issuer',
    'Uang'                  => 'hand_to_authority',
    'Elektronik'            => 'hand_to_authority',
    'Dompet & Tas'          => 'hand_to_authority',
    'Kendaraan & Aksesoris' => 'hand_to_authority',
    'Perhiasan & Aksesoris' => 'hand_to_authority',
    'Pakaian & Aksesoris'   => 'donated',
    'Perlengkapan Makan & Minum' => 'donated',
    'Alat Tulis'            => 'donated',
    'Kunci'                 => 'donated',
    'Anak & Bayi'           => 'donated',
    'Lainnya'               => 'donated',
];
```

| Jenis Barang | Tindak Lanjut | Penjelasan (ACTION_HINTS) |
|---|---|---|
| KTP, SIM, kartu pelajar, kartu ATM | **Dikembalikan ke penerbitnya** (`return_to_issuer`) | Dikembalikan ke penerbitnya (Dukcapil, kepolisian, bank, sekolah) atau dimusnahkan dengan saksi. **Bukan "milik negara"** |
| HP, laptop, dompet berisi uang | **Diserahkan ke instansi berwenang** (`hand_to_authority`) | Diserahkannya ke instansi yang berwenang (kep arresting atau pemerintah kota) lewat berita acara |
| Barang bernilai rendah (tumbler, jaket, payung) | **Dihibahkan** (`donated`) | Dihibahkan ke lembaga sosial dengan berita acara |
| Barang rusak atau berisi data pribadi | **Dimusnahkan dengan saksi** (`destroyed`) | Dimusnahkan dengan saksi |

---

## 18. Modul 8 — Multi-Wilayah & Peta Interaktif

### 18.1 Dua Komponen Peta

| Komponen | Dipakai di | Interaktif? |
|---|---|:---:|
| `Components/GoogleMap.jsx` | `CreateReport.jsx`, `EditReport.jsx` | ✅ — klik untuk menandai lokasi |
| `Components/GoogleMapView.jsx` | `ReportDetail.jsx` | ❌ — read-only |

Keduanya berbasis `@react-google-maps/api` dan memakai **Google Maps Demo Key**
(gratis, tanpa billing).

### 18.2 Konfigurasi Peta

| Aspek | Nilai |
|---|---|
| Titik pusat | `{ lat: -7.2745, lng: 112.6585 }` |
| Zoom | `14` |
| Batas | `restriction.latLngBounds` — batas Kecamatan Sambikerep |
| Marker | `<Marker>` pada koordinat terpilih |
| Event | `onClick` → simpan `latitude`/`longitude` ke state form |

### 18.3 Alur Input Koordinat

```
User klik peta
   → event onClick berisi lat/lng
   → state `coordinates` di Update
   → formData.append('latitude', lat)
   → formData.append('longitude', lng)
   → POST/PUT /reports
   → ReportController memvalidasi: numeric|between:-90,90 & -180,180
   → disimpan di reports.latitude / reports.longitude
```

> **Bug yang sudah diperbaiki:** sebelumnya `latitude`/`longitude` selalu NULL
> saat submit karena `useForm` tidak menyalin nilai. Perbaikannya: struktur
> `useForm` diperbaiki dan `formData.append` dipakai eksplisit.

### 18.4 Edit Lokasi

`EditReport.jsx` menerima prop `initialMarker` (koordinat yang sudah ada) dan
menyediakan `onLocationSelect` sehingga user dapat memindahkan marker ke lokasi
baru. Ini penting karena **masa klaim tidak bergeser** meski lokasi diubah.

### 18.5 Filter Berdasarkan Kelurahan

Setiap laporan punya `region_id` yang menunjuk ke `regions` bertipe
`kelurahan`. Filter di halaman admin, pencarian, dan papan publik bekerja
lewat kolom ini — dengan `region_id` NULL diperlakukan sebagai "tidak
terlindungi" dan tidak lolos ke admin kelurahan mana pun.

### 18.6 Tampilan pada Halaman Publik

Papan barang temuan menampilkan **nama kelurahan**, bukan titik GPS presisi.
Ini keputusan sadar: publik tidak butuh koordinat persis, dan koordinat bisa
membantu menebak alamat rumah pelapor.

---

## 19. Modul 9 — Notifikasi

### 19.1 Kanal

| Kanal | Implementasi | Status |
|---|---|---|
| In-app | Tabel `notifications` + badge di navbar | ✅ Aktif |
| Email | Laravel Mail (SMTP Gmail) | ✅ Aktif |
| Real-time | Laravel Echo / WebSocket | 📅 Rencana |

### 19.2 Tipe Notifikasi

| Tipe | Warna di UI | Contoh |
|---|---|---|
| `success` | Hijau | "✅ Laporan Terverifikasi", "✅ Klaim Disetujui" |
| `error` | Merah | "❌ Laporan Ditolak", "❌ Klaim Ditolak" |
| `info` | Biru | "📋 Laporan Baru Perlu Diverifikasi" |
| `match` | Ungu | "🎯 Nomor Seri Cocok", notifikasi kecocokan |
| `claim` | Oranye | "📦 Permintaan Klaim Barang" |
| `warning` | Kuning | "📦 Barang Temuan Kedaluwarsa - Perlu Tindak Lanjut" |

### 19.3 Katalog Notifikasi yang Dipicu Sistem

| Pemicu | Judul | Penerima |
|---|---|---|
| Laporan dibuat | "📋 Laporan Baru Perlu Diverifikasi" | Admin kelurahan wilayah |
| Laporan diverifikasi | "✅ Laporan Terverifikasi" | Pelapor |
| Laporan ditolak | "❌ Laporan Ditolak" | Pelapor (dengan alasan) |
| Laporan diajukan ulang | "📋 Laporan Diajukan Ulang" | Admin kelurahan |
| Barang diterima di kantor | "📦 Barang Diterima di Kantor Kelurahan" | Penemu |
| Nomor seri beda | "⚠️ Nomor seri yang dibaca dari perangkat BERBEDA…" | Admin (flash warning) |
| Kecocokan ditemukan | "🎯 Nomor Seri Cocok" / notifikasi kecocokan | Pemilik barang hilang |
| Klaim diajukan | "📦 Permintaan Klaim Barang" / "📦 Permintaan Tebus Barang" | Admin wilayah barang |
| Klaim diajukan (lintas wilayah) | "📦 Warga Anda Mengajukan Klaim" | Admin wilayah laporan hilang |
| Klaim disetujui | "✅ Klaim Disetujui" | Penglaim |
| Klaim ditolak | "❌ Klaim Ditolak" | Penglaim (dengan catatan admin) |
| Klaim disetujui (penemu) | "📦 Klaim atas Barang Temuan Anda Disetujui" | Penemu |
| Klaim ditolak (penemu) | "ℹ️ Klaim atas Barang Temuan Anda Ditolak" | Penemu |
| Klaim ditolak otomatis | "❌ Klaim Ditolak" (barang sudah disetujui untuk orang lain) | Penglaim lain |
| Serah terima | "✅ Barang Telah Diserahkannya" | Penglaim |
| Serah terima | "🎉 Barang Temuan Anda Kembali ke Pemiliknya" | Penemu |
| Masa klaim habis | "📦 Barang Temuan Kedaluwarsa - Perlu Tindak Lanjut" | Admin (+ warning) |
| Masa klaim habis | "📦 Masa Klaim Barang Temuan Anda Berakhir" | Penemu |
| Tindak lanjut | "📦 Barang Temuan Anda Sudah Ditindaklanjuti" | Penemu |
| Eskalasi | (ke super admin) | Super admin |

### 19.4 Deduplikasi

Dua mekanisme mencegah spam:

| Metode | Semantik | Dipakai untuk |
|---|---|---|
| `sendOnce(...)` | Dedup global berdasarkan kombinasi pesan | Notifikasi umum |
| `sendOncePerReport(...)` | Dedup per laporan | Peringatan kedaluwarsa (diberi tiap hari oleh scheduler, tapi hanya sekali terkirim) |

`sendOncePerReport()` penting karena scheduler berjalan harian — tanpa dedup,
setiap hari admin menerima notifikasi yang sama.

### 19.5 Endpoint Notifikasi

| Route | Method | Fungsi |
|---|---|---|
| `/notifications` | GET | Halaman kotak masuk |
| `/notifications/{id}/read` | PUT | Tandai satu sebagai dibaca |
| `/notifications/read-all` | PUT | Tandai semua sebagai dibaca |
| `/notifications/{id}` | DELETE | Hapus notifikasi |
| `/api/notifications` | GET | List (JSON) |
| `/api/notifications/unread-count` | GET | Jumlah belum dibaca (badge) |

---

## 20. Modul 10 — Dashboard, Pencarian & Moderasi

### 20.1 Dashboard Warga (`/dashboard`)

Statistik dihitung dengan scope `visibleTo()`:

```php
$totalReports    = Report::visibleTo($user)->count();
$pendingReports  = Report::visibleTo($user)->where('status', 'pending')->count();
$resolvedReports = Report::visibleTo($user)->where('status', 'resolved')->count();
$recentReports   = Report::visibleTo($user)->with('user:id,name')->latest()->take(5)->get();
```

### 20.2 Dashboard Admin (`/admin`)

- Hanya `super_admin` dan `admin_kelurahan` (403 untuk lainnya).
- Daftar laporan dengan scope `visibleTo()`.
- `regionName` dikirim sebagai prop supaya UI menampilkan konteks wilayah.
- Kemampuan: **filter** (status, kategori, kelurahan), **sorting**, **bulk
  action** (verifikasi massal, hapus massal).
- Badge khusus: "Foto sensitif", "Data pribadi terdeteksi", "IMEI".

### 20.3 Pencarian ("Cari Barang", `/search`)

`Api/SearchController` menyediakan:

| Endpoint | Fungsi |
|---|---|
| `GET /api/search` | Pencarian laporan dengan parameter (kata kunci, kategori, wilayah, tipe) |
| `GET /api/search-categories` | Daftar kategori yang terpakai (dinormalisasi) |

Kategori dinormalisasi untuk data lama — misalnya kategori yang dulu disebut
"Elektronik & Gadget" dinormalisasi menjadi "Elektronik".

### 20.4 Moderasi Konten

`BadWords::contains()` dipakai pada `item_name` dan `description`, baik saat
membuat maupun mengedit laporan. Daftar saat ini berisi 23 kata.

**Saran perbaikan (belum diimplementasikan):** gunakan *word boundary*
(`\b...\b`) alih-alih `stripos` agar kata pendek seperti `"tai"` tidak ikut
cocok di dalam kata lain.

---

## 21. Modul 11 — Papan Barang Temuan Publik

### 21.1 Mengapa Harus Publik

> "Tanpa pengumuman ini, masa klaim 30 hari tidak bermakna: tidak ada yang tahu
> barang tersebut ada, sehingga 'tidak ada yang mengklaim' bukan berarti tidak
> ada pemiliknya."

Route: `GET /barang-temuan` — **tanpa perlu login**.

### 21.2 Query yang Dipakai

```php
$query = Report::with(['region:id,name'])
    ->where('type', 'found')
    ->whereIn('status', ['verified', 'expired'])
    ->whereNull('released_at')
    ->latest('received_at');
```

Filter opsional via query string:

| Parameter | Fungsi |
|---|---|
| `?category=` | Filter kategori |
| `?region_id=` | Filter kelurahan |
| `?remaining=N` | Hanya yang sisa masanya ≥ N hari |

### 21.3 Yang Ditampilkan vs Yang Disembunyikan

| Ditampilkan | Disembunyikan |
|---|---|
| Nama barang, kategori, warna | `secret_feature` (ciri khusus) |
| Nama kelurahan (bukan koordinat) | `reported_imei`, `serial_number` |
| Tanggal kejadian | `pii_reasons`, `rejection_reason` |
| Foto (buram bila sensitif) | Lokasi detail / koordinat presisi |
| Sisa hari masa klaim | Data pelapor di luar nama & role |
| Badge kedaluwarsa | |

### 21.4 Foto pada Papan Publik

```php
public const PUBLIC_PHOTO_CATEGORIES = [
    'Elektronik', 'Pakaian & Aksesoris', 'Alat Tulis',
    'Perlengkapan Makan & Minum', 'Dompet & Tas', 'Kunci',
    'Perhiasan & Aksesoris', 'Kendaraan & Aksesoris',
    'Anak & Bayi', 'Lainnya',
];
```

Kategori di luar daftar ini otomatis memakai foto buram (bila ada).

### 21.5 Indikator Klaim

```php
'can_claim'  => $report->status === 'verified',
'can_redeem' => $report->status === 'expired' && empty($report->released_at),
```

Barang kedaluwarsa **tetap ditautkan** ke halaman laporan, bukan sekadar
diarahkan ke kantor kelurahan — supaya pemilik bisa mengajukan klaim tebus.

### 21.6 Test yang Menjaga Privasi

`tests/Feature/ClaimWindowTest.php` memuat test khusus:

```php
public function test_public_board_lists_verified_found_items_without_login(): void
public function test_public_board_never_leaks_sensitive_data(): void
public function test_public_board_hides_released_items(): void
```

---

## 22. Referensi API

### 22.1 Konfigurasi Routing

```php
// bootstrap/app.php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

### 22.2 Endpoint API

Semua endpoint API (kecuali `/api/user`) memakai middleware `['web', 'auth']`
— jadi **bukan** token Sanctum, melainkan session cookie browser. Ini
memudahkan frontend Inertia memanggilnya langsung.

| Method | Endpoint | Controller | Fungsi |
|---|---|---|---|
| GET | `/api/user` | closure | User yang login (`auth:sanctum`) |
| GET | `/api/regions` | closure (web.php) | Daftar kelurahan |
| GET | `/api/categories` | `AdditionalApiController@categories` | 13 kategori barang |
| GET | `/api/recommendations` | `AdditionalApiController@recommendations` | Rekomendasi untuk pengguna |
| GET | `/api/activities` | `AdditionalApiController@activities` | Aktivitas terkini |
| GET | `/api/dashboard/stats` | `DashboardController@stats` | Statistik dashboard |
| GET | `/api/dashboard/recent-reports` | `DashboardController@recentReports` | 5 laporan terakhir |
| GET | `/api/search` | `SearchController@search` | Pencarian laporan |
| GET | `/api/search-categories` | `SearchController@getCategories` | Kategori yang terpakai |
| GET | `/api/reports/{report}/match` | `MatchingController@match` | Hasil pencocokan satu laporan |
| GET | `/api/notifications` | `NotificationController@index` | List notifikasi |
| GET | `/api/notifications/unread-count` | `NotificationController@unreadCount` | Badge count |
| PUT | `/api/notifications/{notification}/read` | `NotificationController@markAsRead` | Tandai dibaca |
| GET | `/api/reports` | `Api\ReportController@index` | List laporan |
| POST | `/api/reports` | `Api\ReportController@store` | Buat laporan |
| GET | `/api/reports/{report}` | `Api\ReportController@show` | Detail laporan |
| PUT | `/api/reports/{report}` | `Api\ReportController@update` | Update laporan |
| DELETE | `/api/reports/{report}` | `Api\ReportController@destroy` | Hapus laporan |
| GET | `/api/user/reports` | `Api\ReportController@userReports` | Laporan milik saya |
| PUT | `/api/reports/{report}/verify` | `Api\ReportController@verify` | Verifikasi laporan |

### 22.3 Format Respons

`ApiResponseTrait` menyediakan pembungkus standar:

```php
$this->success($data);            // { success: true, data: ... }
$this->error($message, $code);    // { success: false, message: ... }
```

> **Known issue:** tidak semua controller memakai trait ini — `DashboardController`
> mengembalikan JSON mentah. Standardisasi ini masih menjadi pekerjaan
> terbuka (lihat `API_INTEGRATION_REPORT.md`).

### 22.4 Contoh Permintaan

```bash
# Pencarian (butuh login — session cookie)
curl -b cookies.txt "http://127.0.0.1:8000/api/search?query=tumbler&region_id=2"

# Kategori
curl -b cookies.txt http://127.0.0.1:8000/api/categories

# Pencocokan
curl -b cookies.txt http://127.0.0.1:8000/api/reports/1/match
```

### 22.5 Daftar Route Web (Ringkas)

| Method | URI | Nama | Akses |
|---|---|---|---|
| GET | `/` | `welcome` | Publik |
| GET | `/barang-temuan` | `board.found` | Publik |
| GET | `/dashboard` | `dashboard` | auth + verified |
| GET | `/reports` | `reports.index` | auth + verified |
| GET | `/reports/create` | `reports.create` | auth + verified |
| POST | `/reports` | `reports.store` | auth + verified |
| GET | `/reports/{id}` | `reports.show` | auth + verified |
| GET | `/reports/{id}/edit` | `reports.edit` | auth + verified |
| PUT | `/reports/{id}` | `reports.update` | auth + verified |
| DELETE | `/reports/{id}` | `reports.destroy` | auth + verified |
| DELETE | `/reports/bulk-delete` | `reports.bulk-delete` | auth + verified |
| GET | `/reports/{id}/photo-original` | `reports.photo-original` | auth + verified + otorisasi foto |
| GET | `/reports/{id}/match` | `reports.match` | auth + verified |
| GET | `/search` | `search` | auth + verified |
| GET | `/matches` | `matches.index` | auth + verified |
| GET | `/notifications` | `notifications.index` | auth + verified |
| PUT | `/notifications/{id}/read` | `notifications.read` | auth + verified |
| PUT | `/notifications/read-all` | `notifications.read-all` | auth + verified |
| DELETE | `/notifications/{id}` | `notifications.destroy` | auth + verified |
| POST | `/claims/{reportId}` | `claims.store` | auth + verified |
| GET | `/admin` | `admin.dashboard` | auth + verified + admin |
| PUT | `/admin/reports/{id}/verify` | `admin.verify` | admin |
| PUT | `/admin/reports/{id}/receive` | `admin.reports.receive` | admin |
| PUT | `/admin/reports/{id}/privacy/blur` | `admin.reports.privacy.blur` | admin |
| PUT | `/admin/reports/{id}/privacy/unblur` | `admin.reports.privacy.unblur` | admin |
| PUT | `/admin/reports/{id}/reject` | `admin.reports.reject` | admin |
| GET | `/admin/reports/{id}/followup` | `admin.reports.followup` | admin |
| POST | `/admin/reports/{id}/followup` | `admin.reports.followup.store` | admin |
| GET | `/admin/claims` | `admin.claims` | admin |
| GET | `/admin/claims/{id}` | `admin.claims.show` | admin |
| PUT | `/admin/claims/{id}` | `admin.claims.verify` | admin (pemutus wilayah) |
| PUT | `/admin/claims/{id}/handover` | `admin.claims.handover` | admin |
| GET | `/admin/users` | `admin.users` | super admin |
| GET | `/admin/users/{id}` | `admin.users.show` | super admin |
| PUT | `/admin/users/{id}/role` | `admin.users.role` | super admin |
| DELETE | `/admin/users/{id}` | `admin.users.destroy` | super admin |
| GET/PATCH/DELETE | `/profile` | `profile.*` | auth |
| — | `/test-email` | — | auth (utility) |

---

## 23. Panduan Instalasi Menyeluruh

### 23.1 Prasyarat

| Kebutuhan | Versi Minimum | Catatan |
|---|---|---|
| PHP | 8.2 | Ekstensi wajib: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `curl`, `gd`, `fileinfo`, `zip` |
| Composer | 2.x | |
| Node.js | 18+ | |
| MySQL | 8.0 | |
| Python | 3.14 | Untuk AI |
| Tesseract OCR | 5.x | **Wajib** untuk deteksi PII |

> Ekstensi PHP `gd` wajib — tanpa itu `blurImage()` dan `reencode()` tidak
> berfungsi, dan kategori sensitif tidak bisa dilindungi.

### 23.2 Clone & Install Dependency

```bash
git clone https://github.com/fathiirtatri3-arch/TemuBarang.git temubarang
cd temubarang

composer install
npm install
```

### 23.3 Konfigurasi `.env`

```bash
cp .env.example .env
php artisan key:generate
```

Isi `.env` (lihat [§24](#24-konfigurasi-environment) untuk daftar lengkap):

```dotenv
APP_NAME=TemuBarang
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=temubarang_db
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=emailanda@gmail.com
MAIL_PASSWORD=app_password_16_huruf
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="emailanda@gmail.com"
MAIL_FROM_NAME="TemuBarang"
```

Buat database:

```sql
CREATE DATABASE temubarang_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 23.4 Migration & Seeder

```bash
php artisan migrate
php artisan db:seed --class=RegionSeeder
php artisan db:seed --class=AdminUserSeeder
```

`RegionSeeder` membuat 1 kecamatan + 4 kelurahan beserta koordinat dan batas
petanya. `AdminUserSeeder` membuat satu akun admin.

> ⚠️ **Penting — urutan migrate & seed.** `AdminUserSeeder` membuat akun dengan
> `role => 'admin'` (nilai legacy). Role tersebut **tidak** dikenali aplikasi:
> `isSuperAdmin()` hanya menerima `'super_admin'` dan `isAdminKelurahan()` hanya
> menerima `'admin_kelurahan'`. Akun dengan role `'admin'` praktis **tidak
> punya hak admin sama sekali**.
>
> Konversi `'admin'` → `'super_admin'` dilakukan oleh migration
> `2026_09_28_034353_update_role_enum_in_users_table.php` pada method `up()`:
> ```php
> DB::table('users')->where('role', 'admin')->update(['role' => 'super_admin']);
> ```
> Karena migration berjalan **sebelum** seeder, akun hasil seeder tidak ikut
> terkonversi. Perbaikannya: jalankan `migrate` dulu, lalu `seed`, lalu **perbaiki
> role-nya secara manual** (lihat [§23.8](#238-akun-admin-kelurahan--super-admin)),
> atau ubah `AdminUserSeeder` agar langsung memakai `'super_admin'`.

### 23.5 Instalasi Tesseract OCR (Wajib)

Tesseract **harus diinstal di level sistem operasi** — `pip install pytesseract`
hanya memasang *wrapper*, bukan engine-nya.

**Windows:**
1. Unduh dari https://github.com/UB-Mannheim/tesseract/wiki
2. Install ke `C:\Program Files\Tesseract-OCR\`
3. Tambahkan ke PATH, atau tulis path di `.env`
4. Restart terminal + `php artisan config:clear`

**Ubuntu/Debian:**
```bash
sudo apt install tesseract-ocr
```

**macOS:**
```bash
brew install tesseract
```

Konfigurasi `.env`:

```dotenv
PII_DETECTION_ENABLED=true
TESSERACT_CMD="C:/Program Files/Tesseract-OCR/tesseract.exe"
```

> ⚠️ Tulis path dengan **garis miring** (`/`). Backslash (`\`) membuat Laravel
> gagal membaca `.env`.
>
> Default di `config/services.php`:
> ```php
> 'tesseract' => [
>     'path'    => env('TESSERACT_CMD', 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'),
>     'enabled' => (bool) env('PII_DETECTION_ENABLED', true),
> ],
> ```

### 23.6 Setup Python Virtual Environment

```bash
cd multiverse/python
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
```

Verifikasi:

```bash
python image_matcher/main.py foto1.jpg foto2.jpg
```

Bila keluar JSON berisi `photo_score`, setup berhasil.

> **Windows only:** `ImageMatchingService` meng-hardcode
> `multiverse/python/venv/Scripts/python.exe`. Di Linux/macOS ubah ke
> `venv/bin/python`.

### 23.7 Storage & Aset

```bash
php artisan storage:link
npm run build          # atau npm run dev untuk pengembangan
```

### 23.8 Akun Admin Kelurahan

Admin kelurahan tidak bisa didaftarkan sendiri. Buat lewat Tinker:

```bash
php artisan tinker
```

```php
App\Models\User::create([
    'name' => 'Admin Kelurahan Made',
    'email' => 'admin.made@temubarang.com',
    'password' => bcrypt('password123'),
    'role' => 'admin_kelurahan',
    'region_id' => 2,
    'email_verified_at' => now(),
]);
exit;
```

Ulangi untuk 4 kelurahan (region_id 2, 3, 4, 5).

### 23.9 Menjalankan Aplikasi

```bash
# Terminal 1 — Laravel
php artisan serve

# Terminal 2 — Vite
npm run dev
```

Buka `http://127.0.0.1:8000`.

**Atau gunakan script `composer dev`** yang menjalankan 4 proses sekaligus
(server, queue listener, pail logs, vite):

```bash
composer dev
```

### 23.10 Verifikasi Instalasi

```bash
php artisan route:list --path=reports   # cek route utama
php artisan schedule:list                # cek scheduler
php artisan test                         # jalankan test
```

---

## 24. Konfigurasi Environment

### 24.1 Daftar Lengkap `.env.example`

| Key | Default | Fungsi |
|---|---|---|
| `APP_NAME` | `TemuBarang` | Nama aplikasi |
| `APP_ENV` | `local` | Environment |
| `APP_KEY` | — | Generate dengan `php artisan key:generate` |
| `APP_DEBUG` | `true` | Mode debug (**matikan di production**) |
| `APP_URL` | `http://localhost` | URL dasar |
| `APP_LOCALE` / `APP_FALLBACK_LOCALE` | `en` | Bahasa |
| `APP_MAINTENANCE_DRIVER` | `file` | Mode maintenance |
| `PHP_CLI_SERVER_WORKERS` | `4` | Jumlah worker CLI server |
| `BCRYPT_ROUNDS` | `12` | Iterasi hashing password |
| `LOG_CHANNEL` / `LOG_STACK` | `stack` / `single` | Channel logging |
| `LOG_LEVEL` | `debug` | Level log |
| `DB_CONNECTION` | `mysql` | Driver database |
| `DB_HOST` / `DB_PORT` | `127.0.0.1` / `3306` | Koneksi database |
| `DB_DATABASE` | `temubarang_db` | Nama database |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / (kosong) | Kredensial database |
| `SESSION_DRIVER` | `database` | Penyimpanan session |
| `SESSION_LIFETIME` | `120` | Masa session (menit) |
| `SESSION_ENCRYPT` | `false` | Enkripsi payload session |
| `BROADCAST_CONNECTION` | `log` | Driver broadcast |
| `FILESYSTEM_DISK` | `local` | Disk default storage |
| `QUEUE_CONNECTION` | `sync` | Driver antrean |
| `CACHE_STORE` | `database` | Driver cache |
| `REDIS_*` | — | Konfigurasi Redis (untuk scaling) |
| `MAIL_MAILER` | `smtp` | Driver mail |
| `MAIL_HOST` / `MAIL_PORT` | `smtp.gmail.com` / `587` | Server SMTP |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | — | Kredensial SMTP (Gunakan *App Password*) |
| `MAIL_ENCRYPTION` | `tls` | Enkripsi SMTP |
| `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME` | — | Pengirim |
| `AWS_*` | — | Bucket S3 (opsional, untuk foto) |
| `VITE_APP_NAME` | `${APP_NAME}` | Nama untuk Vite |
| `PII_DETECTION_ENABLED` | `true` | Aktifkan deteksi data pribadi |
| `TESSERACT_CMD` | `C:/Program Files/Tesseract-OCR/tesseract.exe` | Path binary Tesseract |
| `CLAIM_WINDOW_DAYS` | `30` | Lama masa klaim (hari) |
| `CLAIM_EXPIRY_REMINDER_DAYS` | `5` | Peringatan H-5 |
| `CLAIM_ESCALATION_DAYS` | `7` | Eskalasi ke super admin (0 = mati) |
| `PURGE_SENSITIVE_ON_RELEASE` | `true` | Hapus data sensitif setelah barang dilepas |
| `MINIMUM_WITNESSES` | `1` | Minimal jumlah saksi pada berita acara |

### 24.2 Google Maps API Key

```dotenv
VITE_GOOGLE_MAPS_API_KEY=AIza...DEMO_KEY
```

- **Jenis:** Google Maps **Demo Key** (gratis, tanpa billing).
- **Didukung:** Maps JavaScript API, markers, klik peta.
- **Tidak didukung:** Geocoding (reverse geocoding).
- **Batasan:** kuota harian; key harus dibatasi pada domain yang sucked.

### 24.3 Catatan Keamanan `.env`

- `APP_DEBUG=true` **tidak boleh** aktif di production.
- `MAIL_PASSWORD` untuk Gmail harus berupa **App Password** (16 karakter), bukan
  password akun biasa.
- `.env` **tidak boleh** di-commit. Sudah tercakup `.gitignore`.
- `storage/` dan `vendor/` juga tidak di-commit.
- Semua nilai default di `.env.example` sengaja dikosongkan.

---

## 25. Pengujian & Menjaga Kualitas

### 25.1 Menjalankan Test

```bash
# Semua test
php artisan test

# Test siklus klaim saja
php artisan test tests/Feature/ClaimWindowTest.php

# Test HTTP klaim
php artisan test tests/Feature/ClaimWindowHttpTest.php

# Test autentikasi
php artisan test tests/Feature/Auth/
```

### 25.2 Konfigurasi PHPUnit

```xml
<php>
    <env name="APP_ENV" value="testing"/>
    <env name="BCRYPT_ROUNDS" value="4"/>
    <env name="CACHE_STORE" value="array"/>
    <env name="MAIL_MAILER" value="array"/>
    <env name="QUEUE_CONNECTION" value="sync"/>
    <env name="SESSION_DRIVER" value="array"/>
    <env name="TELESCOPE_ENABLED" value="false"/>
</php>
```

Catatan: baris `DB_CONNECTION=sqlite` / `DB_DATABASE=:memory:` sengaja
dikomentari — test berjalan terhadap **MySQL** karena fitur `claim_deadline`,
enum, dan JSON butuh dukungan MySQL.

### 25.3 Test Suite Autentikasi (`tests/Feature/Auth/`)

| File | Test |
|---|---|
| `AuthenticationTest.php` | Login screen, autentikasi berhasil, password salah ditolak, logout |
| `RegistrationTest.php` | Registration screen, registrasi berhasil, **email non-Gmail ditolak** |
| `EmailVerificationTest.php` | Verification screen, verifikasi berhasil, hash invalid ditolak |
| `PasswordConfirmationTest.php` | Confirm screen, konfirmasi berhasil, password salah ditolak |
| `PasswordResetTest.php` | Link reset diminta, screen reset, reset dengan token valid |
| `PasswordUpdateTest.php` | Update password, password lama wajib benar |

### 25.4 Test Suite Siklus Klaim (`tests/Feature/ClaimWindowTest.php`, 26 test)

**Perilaku masa klaim:**

| Test | Mengunci |
|---|---|
| `test_verifying_a_found_report_opens_a_30_day_claim_window` | Verifikasi membuka jendela 30 hari |
| `test_claim_window_is_reanchored_when_item_is_received_at_kelurahan` | Deadline di-anchor ke waktu penerimaan |
| `test_claim_window_is_not_shifted_when_the_report_is_edited` | Edit laporan tidak menggeser deadline |
| `test_command_sends_warning_5_days_before_the_claim_window_ends` | Peringatan H-5 |
| `test_command_marks_report_as_expired_when_the_window_passes` | Penandaan kedaluwarsa |
| `test_expired_report_is_still_claimable_so_owner_can_redeem_it` | Barang kedaluwarsa masih bisa ditebus |
| `test_claim_on_an_overdue_item_is_flagged_as_redemption_without_the_command` | Klaim tebus dikenali tanpa scheduler |
| `test_expiry_notification_is_sent_only_once_even_if_command_runs_repeatedly` | Notifikasi sekali saja |
| `test_escalation_notification_is_not_repeated_every_day` | Eskalasi tidak spam |
| `test_command_escalates_to_super_admin_when_admin_does_not_follow_up` | Eskalasi ke super admin |
| `test_report_is_marked_expired_when_viewed_even_without_running_the_command` | Sinkronisasi on-read |
| `test_expired_report_is_marked_when_listed_in_public_board` | Sinkronisasi di papan publik |

**Rekomendasi & berita acara:**

| Test | Mengunci |
|---|---|
| `test_recommended_action_follows_the_category_matrix` | Matriks kategori → tindakan |
| `test_item_with_personal_data_is_recommended_for_destruction` | PII → disarankan dimusnahkan |
| `test_admin_can_open_the_followup_page_for_an_expired_report` | Admin boleh buka halaman berita acara |
| `test_admin_outside_the_region_cannot_open_the_followup_page` | Admin luar wilayah ditolak |
| `test_followup_requires_a_witness_and_a_note` | Saksi + keterangan wajib |
| `test_followup_records_the_event_and_releases_the_item` | Berita acara menyimpan & melepas barang |
| `test_followup_is_blocked_while_a_claim_is_still_active` | Pelepasan diblokir bila ada klaim aktif |

**Tebus & papan publik:**

| Test | Mengunci |
|---|---|
| `test_owner_can_redeem_an_expired_item_and_the_claim_is_flagged_as_redemption` | Klaim tebus ditandai |
| `test_redeemed_item_is_resolved_with_claimed_resolution_type` | `resolution_type='claimed'` |
| `test_public_board_lists_verified_found_items_without_login` | Papan publik tanpa login |
| `test_public_board_never_leaks_sensitive_data` | Tidak ada data sensitif bocor |
| `test_public_board_hides_released_items` | Barang yang sudah dilepas tidak tampil |

### 25.5 Test HTTP (`tests/Feature/ClaimWindowHttpTest.php`, 2 test)

| Test | Mengunci |
|---|---|
| `test_full_cycle_works_without_the_scheduler_running` | Siklus penuh jalan tanpa scheduler |
| `test_owner_can_redeem_an_item_whose_window_passed_without_running_the_command` | Tebus tanpa scheduler |

### 25.6 Uji Manual AI

```bash
cd multiverse/python
venv/Scripts/activate
python image_matcher/main.py foto1.jpg foto2.jpg
```

Di aplikasi: buka detail laporan → klik "Cari Kecocokan" → lihat skor.

### 25.7 Uji Manual Deteksi PII

Buat dua gambar uji: satu berisi NIK + kata kunci "KARTU TANDA PENDUDUK" /
"Kartu Keluarga", satu gambar biasa. Lalu unggah ke laporan kategori biasa
(mis. "Dompet & Tas"):

| Perilaku yang diharapkan | Cara cek |
|---|---|
| Gambar bersih → tidak buram | Foto tampil normal |
| Gambar NIK → otomatis buram | `pii_detected=true`, `photo_blurred=true`, `photo_original` terisi (privat) |
| Buka samaran → kembali normal | `pii_status='cleared'`, `photo_original=null` |
| IMEI salah checksum ditolak | Isi 15 digit dengan digit terakhir diubah → error validasi |
| Elektronik wajib IMEI | Pilih Elektronik tanpa isi IMEI & tanpa centang "tidak bisa membaca" → ditolak |
| Notifikasi IMEI cocok | Buat 2 laporan (1 lost, 1 found) dengan `reported_imei` sama → notifikasi "🎯 Nomor Seri Cocok" |

### 25.8 Uji Manual Siklus 30 Hari

```bash
# Paksa masa klaim hampir habis (dalam 3 hari)
php artisan tinker --execute="App\Models\Report::find(49)->update(['claim_deadline' => now()->addDays(3)]);"

# Jalankan pengecekan (kirim peringatan)
php artisan reports:check-expiry

# Paksa lewat masa klaim
php artisan tinker --execute="App\Models\Report::find(49)->update(['claim_deadline' => now()->subDay()]);"
php artisan reports:check-expiry
```

Lalu buka `/admin/reports/49/followup` sebagai admin kelurahan untuk mencatat
berita acara.

### 25.9 Pipeline CI

Folder `.github/workflows/` berisi:

| Workflow | Fungsi |
|---|---|
| `tests.yml` | Menjalankan test suite pada push/PR |
| `pull-requests.yml` | Pemeriksaan pada pull request |
| `issues.yml` | Automasi issue |
| `update-changelog.yml` | Pembaruan `CHANGELOG.md` otomatis |

---

## 26. Operasional, Scheduler & Perawatan

### 26.1 Scheduler (`routes/console.php`)

```php
// Bersihkan akun yang belum verifikasi email
Schedule::command('users:delete-unverified')->cron('0 2 * * 1,4');

// Masa klaim barang temuan: peringatan H-5, kedaluwarsa, eskalasi
Schedule::command('reports:check-expiry')->dailyAt('06:15');
```

Menjalankan scheduler (butuh satu proses berjalan terus-menerus):

```bash
php artisan schedule:work
```

atau tambahkan ke crontab server:

```cron
* * * * * cd /path/ke/temubarang && php artisan schedule:run >> /dev/null 2>&1
```

> **Penting:** meskipun `reports:check-expiry` berjalan harian, sistem tetap
> benar tanpa scheduler karena `syncExpired()` dipanggil on-read. Scheduler
> hanya memastikan notifikasi peringatan H-5 terkirim tepat waktu.

### 26.2 Command `reports:check-expiry`

Tiga tahap:

1. **Peringatan H-5** — laporan yang masa klaimnya tinggal ≤
   `CLAIM_EXPIRY_REMINDER_DAYS` hari diberi tahu admin + penemu (sekali saja
   via `sendOncePerReport`).
2. **Penandaan kedaluwarsa** — laporan yang `claim_deadline` sudah terlewat
   di-*expire*-kan: `status = 'expired'`, `expired_at = now()`.
3. **Eskalasi** — laporan yang sudah kedaluwarsa dan tidak ditindaklanjuti
   selama `CLAIM_ESCALATION_DAYS` hari ⇒ super admin diberi tahu.

### 26.3 Command `users:delete-unverified`

Menghapus akun yang mendaftarkan diri tetapi tidak pernah memverifikasi email.
Menjalankan Senin (hari ke-1) & Kamis (hari ke-4) pukul 02:00 — cukup
ruang bagi user untuk menyelesaikan verifikasi.

### 26.4 Rutinitas Pemeliharaan

| Frekuensi | Pekerjaan |
|---|---|
| Harian | Cek `storage/logs/laravel.log` untuk error |
| Harian | Pastikan scheduler berjalan (`php artisan schedule:list`) |
| Mingguan | Backup database (`mysqldump`) |
| Mingguan | Review laporan yang statusnya `pending` terlalu lama |
| Bulanan | Bersihkan cache (`php artisan cache:clear`) & expired file |
| Bulanan | Review akun admin yang sudah tidak relevan |
| Setelah mengubah algoritma AI | `App\Models\MatchResult::truncate()` |

### 26.5 Penyimpanan Foto

| Disk | Path | Isi |
|---|---|---|
| `public` | `storage/app/public/` | Foto publik: `reports/` (foto normal & buram), `followups/` (bukti berita acara) |
| `local` | `storage/app/private/` | `private-photos/` — foto asli yang disamarkan |

Backup `storage/app/` **wajib** — di dalamnya ada bukti barang temuan yang
sudah tercatat di laporan.

### 26.6 Perintah Artisan yang Berguna

```bash
php artisan migrate:fresh --seed       # Reset total + seeder
php artisan migrate:status             # Status migration
php artisan db:seed --class=RegionSeeder
php artisan optimize:clear             # Bersihkan semua cache
php artisan storage:link               # Symlink public/storage
php artisan route:list --path=admin    # Lihat route admin
php artisan tinker                     # REPL
```

---

## 27. Pengoptimalan Performa

### 27.1 Cache Pencocokan

Tabel `match_results` menyimpan skor foto per pasangan laporan (dengan
urutan ID ternormalisasi). Ini Hindari memanggil Python berulang-ulang untuk
pasangan yang sama.

**Trade-off:** kalau algoritma AI diubah, cache lama **menutupi** hasil baru.
Karena itu, setiap kali algoritma diubah:

```bash
php artisan tinker --execute="App\Models\MatchResult::truncate();"
```

### 27.2 Skip Cepat Sebelum Memanggil Python

Karena skor foto maksimum 50 (bobot 50%), skor maksimum saat teks = 0 adalah
25. Maka sebelum memanggil Python, sistem memeriksa apakah
`text_score * 0.5 + 50 >= 60`. Bila tidak, pasangan langsung dilewati.
Ini menghemat sebagian besar proses Python yang mahal.

### 27.3 Timeout

| Proses | Timeout | Mekanisme |
|---|---|---|
| Pencocokan foto | 20 detik | `proc_terminate($process, 9)` (SIGKILL) |
| Deteksi PII | 30 detik | Batas proses Python |
| OCR Tesseract | 12 detik per PSM | `pytesseract` timeout |

### 27.4 Query yang Dioptimalkan

| Teknik | Lokasi |
|---|---|
| Eager loading | `with('user:id,name', 'region')` — menghindari N+1 |
| Select kolom minimal | `with('user:id,name,role')` — tidak mengirim email/telepon |
| Scope `visibleTo()` di level query | Bukan filter manual di PHP |
| Index | `reports.region_id`, `reports.status`, `reports.reported_imei`, `claims.report_id`, `claims.lost_report_id` |
| `distinct()->pluck()` | Daftar kategori di papan publik |

### 27.5 Beban AI

Deteksi PII menambah **± 3–8 detik** per unggah (OCR + Haar Cascade).
Untuk volume unggahan yang banyak, pertimbangkan:

- Memindahkan deteksi ke queue job.
- Menyoroti AI ke queue.
- Cache hasil deteksi per hash file.

### 27.6 Batas Skala Saat Ini

| Aspek | Batas | Solusi Scaling |
|---|---|---|
| Concurrency | `QUEUE_CONNECTION=sync` | Pindah ke `redis` + worker |
|AI | `proc_open` blocking | Pindah ke queue/job + batch |
| Session/Cache | Database | Pindah ke Redis |
| Pencarian | `LIKE` pada MySQL | Tambahkan FULLTEXT index atau Meilisearch |
| Peta | Demo key, kuota harian | Beralih ke billing key |

---

## 28. Keamanan & Privasi

### 28.1 Ringkasan Lapisan Pertahanan

| Lapisan | Mekanisme |
|---|---|
| Autentikasi | Breeze + session + `MustVerifyEmail` + hanya Gmail |
| Otorisasi | `isAdmin()`, `canManageRegion()`, `canViewOriginalPhoto()` |
| Validasi input | `FormRequest` / `request->validate()` di setiap aksi tulis |
| Mass assignment | `$fillable` eksplisit di setiap model |
| Serialisasi | `$hidden` di `Report` untuk 12 kolom sensitif |
| Upload | Validasi `image\|max:2048`, nama file di-randomize (`Str::uuid()`) |
| File privat | Disk `local` (tanpa URL publik) + route `/reports/{id}/photo-original` dengan `Cache-Control: private, no-store` |
| SQL injection | Eloquent + binding parameter |
| XSS | React escaping default; Inertia mengirim data sebagai JSON |
| CSRF | `@csrf` di form + `X-CSRF-TOKEN` di Axios |
| Brute force | Rate limiting login bawaan Breeze |
| Content moderation | `BadWords::contains()` |
| Fail-safe privacy | Detektor PII gagal → foto tetap disamarkan |

### 28.2 Prinsip "Never Trust the Client"

Semua pemeriksaan otorisasi diulang di server. Though frontend menyembunyikan
tombol "Verifikasi" untuk warga, route `PUT /admin/reports/{id}/verify` tetap
memeriksa `isAdmin()` dan `canManageRegion()` — bukan sekadar mengandalkan
tombol yang disembunyikan.

### 28.3 Data yang Tidak Pernah Dikirim ke Browser Publik

| Data | Mekanisme proteksi |
|---|---|
| `secret_feature` | `$hidden` + hanya dikirim ke prop `secretFeature` bila `canManage` |
| `reported_imei` | `$hidden` + prop `reportedImei` |
| `serial_number` | `$hidden` + prop `serialNumber` |
| `photo_original` | `$hidden` + route terpisah + `private, no-store` |
| `pii_reasons` | `$hidden` + prop `piiReasons` |
| `rejection_reason` | `$hidden` + prop `rejectionReason` |
| Email & telepon pelapor | Select kolom `user:id,name,role` saja |

### 28.4 Audit Trail

| Yang dicatat | Di mana |
|---|---|
| Perubahan status laporan | `reports.status` + `updated_at` |
| Keputusan klaim | `claims.status`, `admin_note`, `verified_at`, `verified_by` |
| Serah terima | `claims.handed_over_at`, `handed_over_by`, `receiver_name`, `receiver_id_type` |
| Pelepasan barang | `reports.released_at`, `released_by`, `resolution_type` |
| Berita acara | Tabel `report_followups` (dokumen no, penerima, saksi, foto) |
| Penghapusan data sensitif | `Log::info` di `purgeSensitiveData()` |
| Moderasi | `Log::info` di `BadWords::contains()` |

---

## 29. Known Issues & Batasan

### 29.1 Batasan Teknis

| No | Masalah | Dampak | Solusi |
|---|---|---|---|
| 1 | **Path Python hardcode Windows** (`venv/Scripts/python.exe`) | Tidak jalan di Linux/macOS | Ubah ke `venv/bin/python` atau buat detection based on OS |
| 2 | **Tidak ada rate limiting di API** | Potensi abuse | Tambahkan `throttle:60,1` di `routes/api.php` |
| 3 | **Format respons API tidak seragam** | `DashboardController` tidak memakai `ApiResponseTrait` | Konsistenkan semua controller |
| 4 | **Duplikasi `recommendations()`** | Ada di `AdditionalApiController` dan `MatchingController` | Konsolidasi ke satu |
| 5 | **OCR hanya bahasa Inggris** (`lang="eng"`) | Teks dokumen Indonesia kurang terbaca | Tambahkan paket `tesseract-ocr-ind` |
| 6 | **Kata kunci dokumen butuh ≥ 2** | Foto KTP dengan satu kata kunci bisa lolos | Admin bisa menanganinya manual |
| 7 | **`BadWords` tanpa word boundary** | `"tai"` bisa cocok di dalam kata lain | Gunakan regex `\b...\b` |
| 8 | **Kalibrasi CNN dari 2 titik data** | Barang mirip bisa lolos | Uji lebih banyak pasangan |
| 9 | **Skor foto ~68%, target 80–90%** | Skor akhir bergantung pada teks | Fine-tune model / dataset lokal |
| 10 | **`users.role` masih punya nilai legacy** | `admin`, `student` menganggur di DB | Bersihkan lewat migration |
| 11 | **Tidak ada reverse geocoding** | Alamat tidak terisi otomatis | Butuh API key berbayar |
| 12 | **Klaim lama bisa `lost_report_id = NULL`** | Tombol "Lihat Barang Hilang" nonaktif | Perbaiki via Tinker |
| 13 | **`QUEUE_CONNECTION=sync`** | Proses berat memblokir request | Pindah ke Redis + worker |

### 29.2 Batasan Domain

| No | Batasan | Penjelasan |
|---|---|---|
| 1 | Tidak ada chat langsung | Komunikasi lewat notifikasi + kontak manual |
| 2 | Tidak ada verifikasi identitas wajah | Admin memverifikasi manual saat serah terima |
| 3 | Satu admin kelurahan per kelurahan | Skala di atas 4 kelurahan butuh model multi-admin |
| 4 | Barang yang "melewati" masa klaim tidak otomatis biting |oom — remained di kantor kelurahan sampai berita acara |
| 5 | Tidak ada export PDF/Excel | Direncanakan |

### 29.3 Catatan Privasi yang Perlu Disadari

- **Foto asli tidak pernah hilang** setelah disamarkan — sengaja disimpan di
  disk privat supaya admin bisa mengoreksi. Ini berarti storage bertambah.
- **Data yang sudah dihapus** (saat barang dilepas) **tidak bisa dipulihkan**
  — penghapusan bersifat permanen.
- **Google Maps Demo Key** memiliki kuota harian dan tidak cocok untuk
  produksi dengan trafik tinggi.

---

## 30. Roadmap

### 30.1 Status per Fase

| Fase | Cakupan | Status | Persentase |
|---|---|---|---|
| Fase 1 | Fondasi (migration, model, auth, CRUD laporan) | ✅ Selesai | 100% |
| Fase 2 | Admin & verifikasi | ✅ Selesai | 100% |
| Fase 3 | Notifikasi & klaim | ✅ Selesai | 100% |
| Fase 4 | Pencocokan berbasis AI (teks) | ✅ Selesai | 100% |
| Fase 5 | Multi-wilayah (4 kelurahan + role berjenjang) | ✅ Selesai | 100% |
| Fase 6 | Peta interaktif | ✅ Selesai | 100% |
| Fase 7 | AI Photo Matching v2 (CNN) | ✅ Selesai | 95% |
| Fase 8 | IMEI + deteksi PII otomatis | ✅ Selesai | 100% |
| Fase 9 | Siklus barang temuan 30 hari & berita acara | ✅ Selesai | 100% |
| Fase 10 | Fitur lanjutan (export, chat, PWA) | 📅 Rencana | 0% |
| | **TOTAL** | | **≈ 92%** |

### 30.2 Rencana Prioritas

| Prioritas | Fitur | Estimasi |
|---|---|---|
| 🔴 Tinggi | Filter radius di halaman pencarian | 1 hari |
| 🔴 Tinggi | Export laporan ke PDF/Excel | 1 hari |
| 🔴 Tinggi | Jalur Python lintas-platform (Windows/Linux/macOS) | 0,5 hari |
| 🟡 Sedang | Log aktivitas admin (audit trail UI) | 1 hari |
| 🟡 Sedang | Notifikasi real-time (Laravel Echo) | 1 hari |
| 🟡 Sedang | Rate limiting + standardisasi respons API | 0,5 hari |
| 🟡 Sedang | OCR bahasa Indonesia (`tesseract-ocr-ind`) | 0,5 hari |
| 🟢 Rendah | Marker clustering di peta | 0,5 hari |
| 🟢 Rendah | PWA / Mobile App | 2 hari |
| 🟢 Rendah | Integrasi WhatsApp Business | 2 hari |
| 🟢 Rendah | Chat penemu–pemilik | 3 hari |
| 🟢 Rendah | Pembersihan enum `role` legacy | 0,5 hari |

### 30.3 Arah Pengembangan ke Depan

1. **Kalibrasi AI lebih baik** — kumpulkan pasangan foto barang dari warga
   Sambikerep sebagai dataset, lalu fine-tune atau setel ulang ambang kalibrasi.
2. **Skala ke kecamatan lain** — struktur `regions` sudah hierarkis; yang perlu
   ditambah adalah|region seeder generik dan konfigurasi batas peta per
   kecamatan.
3. **Integrasi dengan sistem kelurahan** —misalnya API Dukcapil untuk
   verifikasi identitas, atau sistem pendataan aset kelurahan.
4. **Aplikasi mobile native** — PWA lebih dulu (biaya rendah), native
  .android/iOS untuk notifikasi push yang lebih andal.

---

## 31. Kamus Istilah

| Istilah | Arti |
|---|---|
| **Wilayah / Region** | Entitas administratif dalam `regions` — kecamatan, kelurahan, atau RW |
| **Laporan hilang (lost)** | Laporan barang yang hilang dibuat oleh pemiliknya |
| **Laporan temuan (found)** | Laporan barang yang ditemukan dibuat oleh penemunya |
| **Ciri khusus** | Detail pembeda yang hanya diketahui penemu — menjadi kunci klaim |
| **Nomor seri / IMEI** | 15 digit nomor identitas perangkat, divalidasi checksum Luhn |
| **Pen skor Tekstual** | 0–100 dari perbandingan nama, kategori, dan warna |
| **Skor Foto** | 0–100 dari perbandingan visual (CNN + CV klasik) |
| **Skor Akhir** | Gabungan 50% teks + 50% foto (kecuali IMEI cocok → 100) |
| **Sangat Mirip** | Label untuk skor ≥ 65 |
| **Mungkin Cocok** | Label untuk skor 35–64 |
| **PII** | *Personally Identifiable Information* — data pribadi yang terdeteksi pada foto |
| **Fail-safe** | Bila detektor gagal, sistem bertindak seolah-olah data pribadi terdeteksi |
| **Blur keras** | Buram permanen untuk kategori sensitif — tidak bisa dibuka admin |
| **Disk privat** | `storage/app/private/` — tanpa URL publik |
| **Masa Klaim** | Periode 30 hari sejak barang diterima di kantor kelurahan |
| **Kedaluwarsa (expired)** | Masa klaim habis; barang masih tersimpan, masih bisa ditebus |
| **Tebus (redemption)** | Klaim atas barang yang sudah kedaluwarsa |
| **Berita Acara** | Dokumen pelepasan barang dengan penerima, saksi, dan bukti foto |
| **Tindak Lanjut** | Proses после masa klaim habis: lepas ke penerbit / instansi / hibah / musnah |
| **Cekung (scope) `visibleTo`** | Pembatas query laporan berdasarkan role & wilayah |
| **Hard Lock** | Kategori sensitif yang samaran fotonya tidak bisa dibuka |
| **Demo Key** | Kunci Google Maps gratis tanpa billing, kuota terbatas |

---

## 32. Kontributor

| Peran | Nama |
|---|---|
| **Pengembang** | Faathirta Tri Tedsa |
| **Institusi** | SMKN 2 Surabaya |
| **Wilayah implementasi** | Kecamatan Sambikerep, Surabaya, Jawa Timur |

### Aset Proyek

| Aset | Lokasi |
|---|---|
| Logo TemuBarang | `public/images/logo_temubarang_bg.png` |
| Logo Kota Surabaya | `public/images/logo-surabaya.png` |
| Foto kantor kelurahan | `public/images/kelurahan/{made,bringin,lontar,sambikerep}.png` |
| Gambar section keunggulan | `public/images/{pencocokan-cerdas,notifikasi-realtime,keamanan-terjamin,titik-lokasi}.*` |
| Diagram ERD | `erd-diagram.mmd` (Mermaid) dan `erd-diagram.xml` (draw.io) |
| Diagram use case | `use-case-diagram.mmd` (Mermaid) dan `use-case-diagram.dio` (draw.io) |
| Daftar ekstensi VS Code | `ekstensi.txt` |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **pembelajaran** dan **pilot project** di
Kecamatan Sambikerep, Surabaya. Framework Laravel berada di bawah lisensi MIT.

---

## 📞 Kontak

- **Repositori:** https://github.com/fathiirtatri3-arch/TemuBarang
- **Wilayah:** Kecamatan Sambikerep, Surabaya, Jawa Timur

---

**© 2026 TemuBarang. All rights reserved.**

---

> **Catatan untuk AI / Developer:**
>
> Berkas `readme2.md` ini adalah dokumentasi teknis lengkap proyek TemuBarang.
> Jika kamu adalah AI yang membaca ini, pahami konteksnya:
>
> - Ini adalah sistem pelaporan barang hilang & temuan berbasis web dengan
>   AI computer vision (OpenCV + MobileNetV2 ONNX), multi-wilayah (Kecamatan
>   Sambikerep dengan 4 kelurahan), dan role berjenjang (`super_admin`,
>   `admin_kelurahan`, `user`).
> - **Tiga hal yang tidak boleh dilanggar** saat mengubah kode:
>   1. **Skor kecocokan harus dihitung di `MatchScoreService` saja** — jangan
>      duplikasi rumus di controller atau frontend.
>   2. **Kolom sensitif harus tetap di `$hidden`** model `Report` dan dikirim
>      eksplisit sebagai prop terpisah.
>   3. **Kegagalan detektor PII harus tetap fail-safe** (foto disamarkan).
> - Fokus pengembangan saat ini: filter radius, export PDF/Excel, dan
>   kompatibilitas lintasan Python lintas-platform.
