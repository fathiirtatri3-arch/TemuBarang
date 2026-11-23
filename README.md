# 📄 README.md — TemuBarang

Berikut file `README.md` lengkap dari awal hingga akhir. Copy paste seluruhnya ke file `README.md` di root proyek kamu.

---

```markdown
# 🎒 TemuBarang

**Sistem Informasi Barang Hilang dan Barang Temuan Berbasis Web dengan AI dan Geolokasi**

---

## 📖 Deskripsi Proyek

**TemuBarang** adalah platform web berbasis kecerdasan buatan (AI) dan geolokasi yang dirancang untuk membantu warga **Kecamatan Sambikerep, Surabaya** dalam melaporkan, mencari, dan mengembalikan barang hilang kepada pemiliknya yang sah.

Sistem ini menghubungkan **pelapor kehilangan** dengan **penemu barang** dalam satu ekosistem digital yang terpusat, aman, dan mudah diakses. Dengan memanfaatkan **computer vision** untuk mencocokkan foto barang secara otomatis, serta **peta interaktif** untuk memvisualisasikan lokasi kejadian, TemuBarang mempercepat proses pengembalian barang yang selama ini dilakukan secara manual dan tidak terstruktur.

Proyek ini merupakan **pilot project** yang dapat direplikasi ke kecamatan lain di Surabaya.

---

## 🎯 Visi & Misi

**Visi:**
Menjadi platform rujukan warga Kecamatan Sambikerep dalam pengembalian barang hilang kepada pemiliknya yang sah, dengan memanfaatkan teknologi AI dan geolokasi.

**Misi:**
1. Mempermudah warga melaporkan barang hilang dan temuan dalam satu platform.
2. Mempercepat proses pencocokan barang menggunakan AI (computer vision + text matching).
3. Memfasilitasi komunikasi antara pemilik barang dan penemu melalui sistem notifikasi dan klaim terverifikasi.
4. Menyediakan data statistik bagi pemerintah kecamatan untuk pengambilan keputusan.
5. Membangun kepercayaan warga melalui verifikasi berjenjang dan moderasi konten.

---

## 🏘️ Cakupan Wilayah

**Kecamatan Sambikerep, Surabaya, Jawa Timur**

| Aspek | Data |
|-------|------|
| Kecamatan | Sambikerep |
| Kota | Surabaya |
| Provinsi | Jawa Timur |
| Luas | ± 12,5 km² |
| Populasi | ± 50.000–60.000 jiwa |
| Kelurahan | 4 (Made, Bringin, Lontar, Sambikerep) |
| Batas Utara | Kecamatan Tandes / Benowo |
| Batas Selatan | Kecamatan Wiyung / Karang Pilang |
| Batas Timur | Kecamatan Lakarsantri |
| Batas Barat | Kecamatan Benowo / Menganti (Gresik) |

**Titik Pusat Peta:**
```javascript
center: { lat: -7.2745, lng: 112.6585 }
zoom: 14
```

---

## 🛠️ Teknologi yang Digunakan

### Backend
- **Laravel 12** (PHP 8.2+)
- REST API + Inertia.js
- Laravel Breeze (Autentikasi)
- Laravel Sanctum (Token)
- Eloquent ORM
- Queue & Job (untuk proses berat)

### Frontend
- **React.js** (via Inertia.js)
- **Tailwind CSS** (styling)
- Material Symbols (icon)
- Axios (HTTP client)
- Google Maps JavaScript API *(rencana)*

### AI / Computer Vision
- **Python 3.14**
- **OpenCV 4.13**
- **NumPy 2.5**
- Algoritma: AKAZE, HOG, Color Histogram (HSV)

### Database
- **MySQL 8.0**

### Tools
- VS Code, Git, Composer, npm
- XAMPP / Laragon
- Postman
- python venv (virtual environment)

---

## 📁 Struktur Proyek

```
temubarang/
├── app/
│   ├── Helpers/
│   │   ├── BadWords.php                # Filter kata kasar
│   │   └── NotificationHelper.php      # Helper notifikasi
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── ReportController.php    # Web - CRUD Laporan
│   │   │   ├── NotificationController.php
│   │   │   ├── ClaimController.php
│   │   │   ├── MatchingPageController.php
│   │   │   ├── Admin/
│   │   │   │   └── UserController.php  # Manajemen User
│   │   │   └── Api/
│   │   │       ├── DashboardController.php
│   │   │       ├── MatchingController.php
│   │   │       ├── AdditionalApiController.php
│   │   │       ├── SearchController.php
│   │   │       └── NotificationController.php
│   │   └── Middleware/
│   │       ├── AdminMiddleware.php
│   │       └── HandleInertiaRequests.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Report.php
│   │   ├── Region.php                  # Wilayah
│   │   ├── Notification.php
│   │   ├── Claim.php
│   │   └── MatchResult.php
│   ├── Services/
│   │   └── ImageMatchingService.php    # Service AI
│   └── Traits/
│       └── ApiResponseTrait.php
├── database/
│   ├── migrations/
│   │   ├── create_users_table.php
│   │   ├── create_reports_table.php
│   │   ├── create_notifications_table.php
│   │   ├── create_claims_table.php
│   │   ├── create_match_results_table.php
│   │   ├── create_regions_table.php    # Multi-wilayah
│   │   ├── add_role_to_users_table.php
│   │   ├── add_region_id_to_users_table.php
│   │   ├── add_region_id_to_reports_table.php
│   │   └── update_role_enum_in_users_table.php
│   └── seeders/
│       ├── AdminUserSeeder.php
│       ├── RegionSeeder.php            # 4 kelurahan
│       └── DatabaseSeeder.php
├── multiverse/
│   └── python/
│       ├── venv/                       # Virtual environment
│       └── image_matcher/
│           └── main.py                 # Script AI OpenCV
├── resources/
│   └── js/
│       ├── Layouts/
│       │   └── AuthenticatedLayout.jsx
│       ├── Pages/
│       │   ├── Dashboard.jsx
│       │   ├── Welcome.jsx
│       │   ├── Admin/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Claims.jsx
│       │   │   ├── ClaimDetail.jsx
│       │   │   ├── Users.jsx
│       │   │   └── UserDetail.jsx
│       │   ├── Reports/
│       │   │   ├── ReportsList.jsx
│       │   │   ├── CreateReport.jsx
│       │   │   ├── EditReport.jsx
│       │   │   ├── ReportDetail.jsx
│       │   │   └── MatchResult.jsx
│       │   ├── Notifications/
│       │   │   └── Index.jsx
│       │   ├── Matching/
│       │   │   └── MatchesList.jsx
│       │   ├── Search/
│       │   │   └── SearchPage.jsx
│       │   ├── Auth/
│       │   └── Profile/
│       └── services/
│           └── api.js
├── routes/
│   ├── web.php
│   ├── api.php
│   └── auth.php
└── README.md
```

---

## ✨ Fitur Utama

### 1. Autentikasi & Manajemen Pengguna
- Registrasi dengan verifikasi email (hanya Gmail)
- Login / Logout
- Lupa password via email
- Edit profil
- Role berjenjang: `super_admin`, `admin_kelurahan`, `user`

### 2. Pelaporan Barang Hilang & Temuan
- Form pelaporan dengan upload foto
- Validasi: minimal karakter, filter kata kasar, foto wajib
- Penentuan lokasi dengan dropdown kelurahan
- Status: `pending`, `verified`, `matched`, `resolved`, `rejected`

### 3. Pencocokan Cerdas Berbasis AI
- **Analisis visual** (OpenCV):
  - AKAZE (45%) — deteksi titik unik tahan sudut
  - HOG (30%) — analisis bentuk & tepi
  - Color Histogram (25%) — distribusi warna
- **Analisis tekstual**: nama barang, kategori, warna, lokasi
- **Skor gabungan**: 50% foto + 50% teks
- **Threshold**: ≥65% sangat cocok, 35–64% mungkin cocok
- **Caching** di tabel `match_results`

### 4. Multi-Wilayah (Kecamatan Sambikerep)
- 4 kelurahan: Made, Bringin, Lontar, Sambikerep
- Setiap laporan terhubung ke `region_id`
- Admin kelurahan hanya verifikasi wilayahnya
- Super admin lihat semua

### 5. Notifikasi Real-time
- Notifikasi in-app dengan badge
- Notifikasi email
- Notifikasi berbasis wilayah
- Tandai dibaca / tandai semua

### 6. Sistem Klaim
- User klaim barang temuan
- Admin verifikasi klaim
- Titik temu: kantor kelurahan
- Status klaim: `pending`, `approved`, `rejected`

### 7. Dashboard & Analitik
- Dashboard user: statistik, rekomendasi, aktivitas
- Dashboard admin: verifikasi, filter, sorting, bulk action
- Dashboard super admin: manajemen user, statistik kecamatan

### 8. Moderasi Konten
- Filter kata kasar otomatis (`BadWords` helper)
- Validasi minimal karakter
- Foto wajib
- Hapus massal (bulk delete)

### 9. Manajemen Klaim & User
- Admin kelola klaim
- Super admin kelola user (ubah role, hapus)

---

## 🗄️ Struktur Database

### Tabel `users`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | Primary key |
| name | varchar(255) | Nama lengkap |
| email | varchar(255) | Unique |
| password | varchar(255) | Hashed |
| role | enum | `super_admin`, `admin_kelurahan`, `admin`, `student`, `user` |
| region_id | bigint | FK ke `regions` (nullable untuk super_admin) |
| phone | varchar(255) | Nomor HP (nullable) |
| is_verified | boolean | Status verifikasi |
| email_verified_at | timestamp | |
| created_at, updated_at | timestamp | |

### Tabel `regions`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | Primary key |
| name | varchar | Contoh: "Kelurahan Made" |
| type | enum | `kecamatan`, `kelurahan`, `rw` |
| parent_id | bigint | FK ke `regions` |
| latitude, longitude | decimal | Koordinat |
| bounds_north, bounds_south, bounds_east, bounds_west | decimal | Batas peta |
| kecamatan | varchar | Default: Sambikerep |
| kota | varchar | Default: Surabaya |

### Tabel `reports`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | Primary key |
| user_id | bigint | FK ke `users` |
| type | enum | `lost`, `found` |
| item_name | varchar | Nama barang |
| category | varchar | Kategori |
| description | text | Deskripsi |
| color | varchar | Warna |
| location | varchar | Lokasi detail |
| location_detail | varchar | Detail lokasi |
| date | date | Tanggal kejadian |
| photo | varchar | Path foto |
| status | enum | `pending`, `verified`, `matched`, `resolved`, `rejected` |
| region_id | bigint | FK ke `regions` |
| latitude, longitude | decimal | Koordinat (rencana) |

### Tabel `notifications`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | Primary key |
| user_id | bigint | FK ke `users` |
| title | varchar | Judul |
| message | text | Pesan |
| type | varchar | `success`, `match`, `claim`, `error`, `info` |
| link | varchar | URL terkait |
| is_read | boolean | Status baca |

### Tabel `claims`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | Primary key |
| report_id | bigint | FK ke `reports` |
| claimant_id | bigint | FK ke `users` (pengklaim) |
| owner_id | bigint | FK ke `users` (pemilik) |
| status | enum | `pending`, `approved`, `rejected` |
| message | text | Pesan pengklaim |
| admin_note | text | Catatan admin |
| verified_at | timestamp | |
| verified_by | bigint | FK ke `users` |

### Tabel `match_results` (Cache)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | bigint | Primary key |
| report_id_1 | bigint | FK ke `reports` |
| report_id_2 | bigint | FK ke `reports` |
| photo_score | decimal | Skor foto |
| text_score | decimal | Skor teks |
| final_score | decimal | Skor akhir |

---

## 🔄 Alur Kerja Sistem

```
1. User A kehilangan barang → buat laporan hilang + foto + pilih kelurahan
                                    ↓
2. Sistem simpan laporan → status "pending"
                                    ↓
3. Admin kelurahan verifikasi → status "verified"
                                    ↓
4. User B menemukan barang → buat laporan temuan + foto + pilih kelurahan
                                    ↓
5. Admin kelurahan verifikasi → status "verified"
                                    ↓
6. AI mencocokkan foto & teks laporan A dan B
   → Skor 85% → "Sangat Cocok"
                                    ↓
7. Notifikasi ke User A & User B → ada kecocokan!
                                    ↓
8. User A klaim barang → notifikasi ke admin kelurahan
                                    ↓
9. Admin verifikasi klaim → titik temu: Kantor Kelurahan
                                    ↓
10. Status laporan → "resolved"
```

---

## 🤖 Sistem AI Feature Matching

### Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│                  AI MATCHING - TEMUBARANG                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  User Upload Foto (Laporan Hilang/Temuan)                    │
│         ↓                                                     │
│  Laravel Controller (MatchingPageController)                 │
│         ↓                                                     │
│  ImageMatchingService.php                                    │
│         ↓                                                     │
│  ┌────────────────────────────────────────────────────┐      │
│  │  1. Cek Cache (match_results table)                │      │
│  │  2. Jika tidak ada → panggil Python script         │      │
│  │  3. Proc_open dengan timeout 10 detik              │      │
│  │  4. Parse JSON output → photo_score                │      │
│  │  5. Gabung dengan text_score (50%:50%)             │      │
│  │  6. Simpan hasil ke cache                          │      │
│  └────────────────────────────────────────────────────┘      │
│         ↓                                                     │
│  Python Script (multiverse/python/image_matcher/main.py)     │
│  ┌────────────────────────────────────────────────────┐      │
│  │  - AKAZE (45%) → titik unik, tahan sudut          │      │
│  │  - HOG (30%) → bentuk & tepi                       │      │
│  │  - Color Histogram (25%) → distribusi warna        │      │
│  └────────────────────────────────────────────────────┘      │
│         ↓                                                     │
│  Hasil: Photo Score + Text Score = Final Score               │
│         ↓                                                     │
│  UI: "Sangat Cocok" (≥65%), "Mungkin Cocok" (35-64%)         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Algoritma

| Algoritma | Bobot | Fungsi |
|-----------|-------|--------|
| **AKAZE** | 45% | Deteksi titik unik yang tahan terhadap perubahan sudut pandang |
| **HOG** | 30% | Analisis distribusi bentuk dan tepi objek |
| **Color Histogram (HSV)** | 25% | Analisis distribusi warna dengan center crop |

**Skor Gabungan:** `photo_score` (50%) + `text_score` (50%)

**Threshold:**
- ≥ 65% → Sangat Cocok
- 35–64% → Mungkin Cocok
- < 35% → Tidak Ditampilkan

### Setup AI

**1. Install Python 3.14+**

**2. Buat virtual environment:**
```bash
cd multiverse/python
python -m venv venv
venv\Scripts\Activate  # Windows
source venv/bin/activate  # Linux/Mac
```

**3. Install dependencies:**
```bash
pip install opencv-python numpy
```

**4. Test script:**
```bash
python image_matcher/main.py
```

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- Python 3.14+ (untuk AI)

### Langkah Instalasi

**1. Clone & install:**
```bash
git clone <repo-url> temubarang
cd temubarang
composer install
npm install
```

**2. Konfigurasi `.env`:**
```env
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

**3. Generate key & migrate:**
```bash
php artisan key:generate
php artisan migrate
php artisan db:seed --class=RegionSeeder
php artisan db:seed --class=AdminUserSeeder
```

**4. Buat akun admin kelurahan (via Tinker):**
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

**5. Setup storage & AI:**
```bash
php artisan storage:link

cd multiverse/python
python -m venv venv
venv\Scripts\Activate
pip install opencv-python numpy
cd ../..
```

**6. Jalankan server:**
```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite
npm run dev
```

**7. Akses:**
```
http://127.0.0.1:8000
```

---

## 🔑 Akun Default

| Role | Email | Password |
|------|-------|----------|
| **super_admin** | `admin@temubarang.com` | `password123` |
| **admin_kelurahan (Made)** | `admin.made@temubarang.com` | `password123` |
| **admin_kelurahan (Bringin)** | `admin.bringin@temubarang.com` | `password123` |
| **admin_kelurahan (Lontar)** | `admin.lontar@temubarang.com` | `password123` |
| **admin_kelurahan (Sambikerep)** | `admin.sambikerep@temubarang.com` | `password123` |

---

## 📋 Checklist Fitur

### ✅ Fase 1: Fondasi
- [x] Migration `users`, `reports`, `notifications`, `claims`
- [x] Model & relasi
- [x] Autentikasi (Breeze)
- [x] CRUD Laporan dasar

### ✅ Fase 2: Admin & Verifikasi
- [x] Admin panel
- [x] Verifikasi laporan
- [x] Filter, sorting, bulk action

### ✅ Fase 3: Notifikasi & Klaim
- [x] Notifikasi in-app + email
- [x] Sistem klaim
- [x] Admin verifikasi klaim

### ✅ Fase 4: AI Feature Matching
- [x] Python + OpenCV
- [x] AKAZE + HOG + Histogram
- [x] Integrasi Laravel (ImageMatchingService)
- [x] Caching (match_results)

### ✅ Fase 5: Multi-Wilayah
- [x] Tabel `regions`
- [x] Seeder 4 kelurahan
- [x] Role `super_admin` & `admin_kelurahan`
- [x] Filter kelurahan di admin
- [x] Dropdown kelurahan di create/edit

### 🔄 Fase 6: Peta Interaktif (Dalam Pengembangan)
- [ ] Google Maps JavaScript API
- [ ] Batas kecamatan & kelurahan
- [ ] Filter radius
- [ ] Marker clustering

### 📅 Fase 7: Fitur Lanjutan (Rencana)
- [ ] Export PDF/Excel
- [ ] Chat penemu-pemilik
- [ ] Mobile App / PWA
- [ ] Integrasi WhatsApp

---

## 🧪 Testing

### Test Database & Seeder
```bash
php artisan tinker
App\Models\Region::where('type', 'kelurahan')->get();
exit;
```

### Test API
```bash
# Login dulu di browser, lalu akses:
http://127.0.0.1:8000/api/regions
http://127.0.0.1:8000/api/categories
```

### Test AI
```bash
cd multiverse/python
venv\Scripts\Activate
python image_matcher/main.py
```

---

## 🐛 Known Issues

| No | Masalah | Status |
|----|---------|--------|
| 1 | Auto-refresh setelah aksi kadang tidak konsisten | ⚠️ Minor |
| 2 | Peta interaktif belum diimplementasikan | 🔄 Rencana |
| 3 | Belum ada export PDF/Excel | 📅 Rencana |

---

## 🛣️ Roadmap

| Fase | Fitur | Target |
|------|-------|--------|
| Fase 1–5 | Fondasi sampai Multi-Wilayah | ✅ Selesai |
| Fase 6 | Peta Interaktif Sambikerep | 🔄 |
| Fase 7 | Export & Statistik Lanjutan | 📅 |
| Fase 8 | Mobile App / PWA | 📅 |

---

## 👥 Kontributor

- **Pengembang:** [Faathirta Tri Tedsa]
- **Pembimbing:** [-]
- **Institusi:** [SMKN 2 Surabaya]

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **pembelajaran** dan **pilot project** di Kecamatan Sambikerep, Surabaya.

---

## 📞 Kontak

- **Email:** [email kamu]
- **GitHub:** [github kamu]
- **Lokasi:** Kecamatan Sambikerep, Surabaya, Jawa Timur

---

**© 2026 TemuBarang. All rights reserved.**

---

> **Catatan untuk AI/Developer:** 
> 
> File README ini adalah dokumentasi lengkap proyek TemuBarang. Jika kamu seorang AI yang membaca ini, pahami konteks proyek: ini adalah sistem pelaporan barang hilang berbasis web dengan AI computer vision (OpenCV), multi-wilayah (Kecamatan Sambikerep dengan 4 kelurahan), dan role berjenjang (`super_admin`, `admin_kelurahan`, `user`). Fokus pengembangan saat ini: peta interaktif dan penyempurnaan fitur multi-wilayah.
```

---

## 📌 Update Progres Terbaru (September 2026)

> **Catatan:** Bagian ini adalah catatan progres terbaru setelah README utama dibuat. Tidak mengubah bagian atas, hanya menambahkan update.

### 🗺️ Fase 6: Peta Interaktif (Selesai Sebagian)

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Google Maps API (Demo Key) | ✅ Selesai | Menggunakan `@react-google-maps/api` |
| Komponen `GoogleMap.jsx` | ✅ Selesai | Untuk form input (CreateReport) |
| Komponen `GoogleMapView.jsx` | ✅ Selesai | Untuk tampilan read-only (ReportDetail) |
| Batas peta Sambikerep | ✅ Selesai | Menggunakan `restriction.latLngBounds` |
| Klik peta untuk tandai lokasi | ✅ Selesai | Event `onClick` → simpan koordinat |
| Marker di peta | ✅ Selesai | Menggunakan komponen `<Marker>` |
| Simpan `latitude` & `longitude` ke database | ✅ Selesai | Kolom di tabel `reports` |
| Tampilkan peta di halaman detail | ✅ Selesai | `GoogleMapView.jsx` di `ReportDetail.jsx` |
| Edit titik lokasi di halaman edit | ✅ Selesai | `initialMarker` + `onLocationSelect` di `EditReport.jsx` |
| Reverse geocoding | ❌ Belum | Tidak didukung Demo Key |
| Filter radius | ❌ Belum | Rencana berikutnya |
| Marker clustering | ❌ Belum | Rencana |

### 🔧 Perubahan Teknis Terbaru

| No | File | Perubahan |
|----|------|-----------|
| 1 | `.env` | Tambah `VITE_GOOGLE_MAPS_API_KEY` |
| 2 | `resources/js/Components/GoogleMap.jsx` | **Baru** — peta interaktif (bisa diklik) |
| 3 | `resources/js/Components/GoogleMapView.jsx` | **Baru** — peta read-only (hanya tampil) |
| 4 | `CreateReport.jsx` | Tambah peta + state `coordinates` + kirim `latitude`/`longitude` |
| 5 | `EditReport.jsx` | Tambah peta + state `coordinates` + `initialMarker` + kirim `latitude`/`longitude` |
| 6 | `ReportDetail.jsx` | Tambah komponen `<PetaSambikerepView />` |
| 7 | `ReportController.php` | Validasi `latitude` & `longitude` di `store()` dan `update()` |
| 8 | `ReportController.php` | Tambah `location_detail` di `update()` |
| 9 | `app/Models/Report.php` | Tambah `latitude`, `longitude`, `location_detail` di `$fillable` |

### 🐛 Bug yang Sudah Diperbaiki

| No | Bug | Solusi |
|----|-----|--------|
| 1 | `latitude`/`longitude` NULL saat submit | Perbaiki `useForm` + `formData.append` |
| 2 | Error sintaks di `CreateReport.jsx` | Perbaiki struktur `useForm` |
| 3 | Filter kelurahan tidak akurat | Isi `region_id` NULL + perbaiki logic filter |
| 4 | Edit laporan tidak update lokasi | Tambah `location_detail` di `update()` |
| 5 | Redirect setelah aksi tidak konsisten | Ganti ke `window.location.href` |

### 🎯 Rencana Selanjutnya

| Prioritas | Fitur | Estimasi |
|-----------|-------|----------|
| 🔴 Tinggi | Filter radius di halaman pencarian | 1 hari |
| 🔴 Tinggi | Export laporan ke PDF/Excel | 1 hari |
| 🟡 Sedang | Log aktivitas admin | 1 hari |
| 🟡 Sedang | Notifikasi real-time (Laravel Echo) | 1 hari |
| 🟢 Rendah | Marker clustering | 0.5 hari |
| 🟢 Rendah | PWA / Mobile App | 2 hari |

### 📊 Status Proyek Terkini

| Fase | Status | Persentase |
|------|--------|------------|
| Fase 1: Fondasi | ✅ Selesai | 100% |
| Fase 2: Admin & Verifikasi | ✅ Selesai | 100% |
| Fase 3: Notifikasi & Klaim | ✅ Selesai | 100% |
| Fase 4: AI Feature Matching | ✅ Selesai | 100% |
| Fase 5: Multi-Wilayah | ✅ Selesai | 100% |
| Fase 6: Peta Interaktif | 🔄 Sebagian | 70% |
| Fase 7: Fitur Lanjutan | 📅 Rencana | 0% |
| **TOTAL** | | **± 85%** |

### 🔑 Catatan API Key

- **Jenis:** Google Maps Demo Key
- **Fitur didukung:** Maps JavaScript API, markers, klik peta
- **Fitur tidak didukung:** Reverse geocoding
- **Kuota:** Harian, aman untuk pengembangan & presentasi
- **Biaya:** Gratis (tanpa billing)

### 📝 Catatan untuk Presentasi (Februari 2027)

- ✅ Semua fitur inti sudah berjalan
- ✅ Peta interaktif sudah terintegrasi
- ✅ AI Feature Matching sudah berfungsi
- ✅ Multi-wilayah Sambikerep sudah siap
- ⏳ Yang perlu diselesaikan: filter radius, export laporan, polish UI

---

**Update terakhir:** 29 September 2026

---

---

## 🔄 Changelog: Refactor Skala Sekolah → Kecamatan Sambikerep

> **Tanggal:** September 2026  
> **Tujuan:** Mengubah skala proyek dari **sekolah (SMKN 2 Surabaya)** menjadi **Kecamatan Sambikerep, Surabaya**  
> **Alasan:** Proyek diperluas untuk mencakup seluruh warga kecamatan, bukan hanya siswa sekolah

---

### 📋 Ringkasan Perubahan

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Skala** | SMKN 2 Surabaya (sekolah) | Kecamatan Sambikerep (kecamatan) |
| **Pengguna** | Siswa & guru | Warga kecamatan |
| **Cakupan** | 1 sekolah | 4 kelurahan (Made, Bringin, Lontar, Sambikerep) |
| **Identitas** | "Sistem Resmi SMKN 2 Surabaya" | "Sistem Resmi Kecamatan Sambikerep" |
| **Logo** | Logo SMKN 2 | Logo TemuBarang (baru) |

---

### 1️⃣ Halaman Welcome (`Welcome.jsx`)

**File:** `resources/js/Pages/Welcome.jsx`

Halaman Welcome adalah halaman pertama yang direfactor karena merupakan **wajah utama** aplikasi.

#### a. Navbar & Identitas

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| **Tab Title** | `TemuBarang - SMKN 2 Surabaya Lost & Found` | `TemuBarang - Sistem Barang Hilang Kecamatan Sambikerep` |
| **Logo** | Logo SMKN 2 (URL Google) | Logo TemuBarang lokal (`/images/logo_temubarang.png`) |
| **Favicon** | Logo Laravel (default) | Logo TemuBarang |
| **Subtitle** | "Sistem Barang Hilang" | "Kecamatan Sambikerep" |

#### b. Hero Section

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| **Badge** | "Sistem Resmi SMKN 2 Surabaya" | "Sistem Resmi Kecamatan Sambikerep" |
| **Judul** | "...di SMKN 2 Surabaya" | "...di Kecamatan Sambikerep" |
| **Subjudul** | "...warga SMKN 2 Surabaya" | "...warga Kecamatan Sambikerep, Surabaya" |
| **Ilustrasi** | Foto siswa sekolah | Ilustrasi warga + peta + laptop |

#### c. Stats Section

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| **Label 2** | "Siswa Terbantu" | "Warga Terbantu" |
| **Nilai 3** | "SMK" | "4" |
| **Label 3** | "PK Unggulan" | "Kelurahan Terlayani" |

#### d. Section "Mengapa Memilih TemuBarang?"

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| **Subjudul** | "...pencarian barang hilang **di sekolah**" | "...pencarian barang hilang **di lingkungan kecamatan**" |

#### e. Section Keunggulan (4 Fitur)

| Fitur | Perubahan |
|-------|-----------|
| **Pencocokan Cerdas** | Deskripsi tetap, gambar diganti dengan foto Pexels |
| **Notifikasi Real-time** | Tambah konteks "di wilayah kecamatan", gambar diganti |
| **Keamanan Terjamin** | Deskripsi tetap, gambar diganti |
| **✨ Titik Lokasi (BARU)** | Fitur baru: peta interaktif dengan titik koordinat |

**Layout:** Format selang-seling (foto kiri → foto kanan) menggunakan `ScrollStack`.

#### f. Section Kelurahan (Sebelumnya "Tim Admin")

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| **Judul** | "Tim Admin Kami" | "Kelurahan di Kecamatan Sambikerep" |
| **Subjudul** | "Guru BK SMKN 2 Surabaya..." | "Melayani 4 kelurahan..." |
| **Orbit Images** | 5 foto guru BK | 4 foto kantor kelurahan |
| **Center Orbit** | Text "BK SMKN 2" | **Logo Kota Surabaya** |
| **Bentuk Orbit** | Oval pipih (`ellipse`) | Oval pipih (`ellipse`) dengan foto lingkaran sempurna |
| **Quote** | "Kami siap membantu..." | "Bersama warga, kita wujudkan..." |

#### g. CTA Section

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| **Subjudul** | "...ratusan **siswa SMKN 2 Surabaya**..." | "...ratusan **warga Kecamatan Sambikerep**..." |

#### h. Footer

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| **Logo** | Logo SMKN 2 | Logo TemuBarang |
| **Copyright** | "© 2024 TemuBarang SMKN 2 Surabaya" | "© 2024 TemuBarang Kecamatan Sambikerep" |

---

### 2️⃣ Komponen yang Diperbarui

#### a. `OrbitImages.jsx`

**File:** `resources/js/Components/OrbitImages.jsx`

| Perubahan | Detail |
|-----------|--------|
| **`OrbitItem`** | Tambah `borderRadius: '9999px'` + `overflow: 'hidden'` agar foto jadi lingkaran sempurna |
| **`items.map`** | Ganti `object-contain` → `object-cover` agar foto tidak gepeng |
| **Shape** | Support `ellipse`, `circle`, `infinity`, `wave`, dll |

#### b. `TextType.jsx`

**File:** `resources/js/Components/TextType.jsx`

Efek mengetik untuk judul Hero Section, berjalan urut (bukan acak).

#### c. `GuestLayout.jsx`

**File:** `resources/js/Layouts/GuestLayout.jsx`

| Perubahan | Detail |
|-----------|--------|
| **Logo** | Ganti icon SVG → logo TemuBarang (`/images/logo_temubarang.png`) |
| **Import** | Hapus `ApplicationLogo` (tidak dipakai) |

#### d. `AuthenticatedLayout.jsx`

**File:** `resources/js/Layouts/AuthenticatedLayout.jsx`

| Perubahan | Detail |
|-----------|--------|
| **Logo Sidebar** | Ganti icon SVG → logo TemuBarang |
| **Subtitle** | "Sistem Barang Hilang" → "Kecamatan Sambikerep" |
| **Role User** | `super_admin`, `admin_kelurahan`, `user` |
| **Menu Admin** | Tambah "Kelola User" (khusus super_admin) |

---

### 3️⃣ File & Folder Baru

#### Gambar/Foto
public/images/
├── kelurahan/
│   ├── bringin.png
│   ├── lontar.png
│   ├── made.png
│   └── sambikerep.png
├── keamanan-terjamin.png
├── logo_temubarang_bg.png
├── logo-surabaya.png
├── notifikasi-realtime.png
├── pencocokan-cerdas.png
├── revisi-utama.jpeg
└── titik-lokasi.jpg


#### Komponen React Bits
resources/js/Components/
├── TextType.jsx ← Efek mengetik
├── AnimatedContent.jsx ← Animasi scroll
├── OrbitImages.jsx ← Gambar berputar
├── ScrollStack.jsx ← Stack scroll
├── TrueFocus.jsx ← Focus animasi
└── CardNav.jsx ← Navbar card


---

### 4️⃣ Fitur Baru yang Ditambahkan

| Fitur | Status | Keterangan |
|-------|--------|------------|
| **Titik Lokasi** | ✅ | Peta interaktif dengan titik koordinat di section Keunggulan |
| **Google Maps API** | ✅ | Terintegrasi dengan Demo Key |
| **Multi-Wilayah** | ✅ | 4 kelurahan dengan role berjenjang |
| **Logo Surabaya** | ✅ | Center orbit kelurahan |
| **Peta Interaktif** | ✅ | Di `CreateReport`, `EditReport`, `ReportDetail` |

---

### 5️⃣ Dependencies yang Ditambahkan

```json
{
  "gsap": "^3.x",
  "framer-motion": "^11.x",
  "motion": "^11.x",
  "lenis": "^1.x"
}

install
npm install gsap framer-motion motion lenis

---

## 📌 Update Progres Terbaru (Oktober 2026) — AI Photo Matching v2

> **Catatan:** Bagian ini adalah catatan progres terbaru setelah README utama dibuat. Tidak mengubah bagian atas, hanya menambahkan update.

### 🎯 Tujuan Update

Memperbaiki AI Photo Matching yang sebelumnya **terlalu kaku** (exact match) menjadi **fleksibel** seperti penglihatan manusia — bisa mengenali objek yang sama meski beda sudut, pencahayaan, dan background.

### 🐛 Masalah yang Ditemukan (Investigasi)

| No | Temuan | Dampak |
|----|--------|--------|
| 1 | Di `main.py`, `hist_score` dipakai **dua kali** dan HOG dihitung tetapi **tidak dipakai** | Skor lama pada dasarnya hanya menilai "sama-sama biru" |
| 2 | File gambar dibaca **4 kali**, di-resize paksa ke 640×640 | Boros I/O, dan rasio aspek foto rusak |
| 3 | Tidak ada **pemerataan cahaya** dan **pengurangan noise** | Sensitif terhadap pencahayaan |
| 4 | `ratio = good / min_kp` membuat skor AKAZE **selalu kecil** | Foto sama beda sudut hampir tidak pernah dapat skor tinggi |
| 5 | `MatchingPageController` memberi skor teks maksimal 50, lalu dikalikan 0.5 | Teks yang cocok sempurna hanya menyumbang **25 dari 100 poin** |
| 6 | CV klasik (AKAZE/ORB) **lemah pada benda mulus** seperti tumbler | Perlu pendekatan lain untuk "mengenali objek yang sama" |

### 🔧 Perbaikan yang Dilakukan

#### 1. `multiverse/python/image_matcher/main.py` (Ditulis Ulang Total)

| Komponen | Sebelum | Sesudah |
|----------|---------|---------|
| **Preprocessing** | Resize paksa 640×640 | ✅ Resize jaga rasio + denoise (bilateral) + CLAHE |
| **File dibaca** | 4× (boros) | ✅ 1× per gambar |
| **ORB** | ❌ Tidak ada | ✅ Ditambahkan sebagai backup AKAZE |
| **Histogram HSV** | RGB (sensitif cahaya) | ✅ Hanya H & S, abaikan piksel pucat/gelap |
| **HOG** | Dihitung tapi tidak dipakai | ✅ Dipakai dengan blur & rescale |
| **CNN Embedding** | ❌ Tidak ada | ✅ **MobileNetV2 via ONNX Runtime** |
| **Bobot** | AKAZE 45% + Histogram 55% | ✅ **CNN 60% + CV klasik 40%** |
| **Fallback** | - | ✅ Jika CNN gagal → pakai CV klasik saja |
| **Mode test terminal** | ❌ Tidak ada | ✅ `python main.py foto1.jpg foto2.jpg` |

#### 2. Kalibrasi Skor CNN

- **Masalah awal:** Rentang 0.2-0.8 → tumbler vs rokok dapat skor **36.8%** (false positive).
- **Solusi:** Rentang disetel dari data nyata:
  - **Cosine 0.55 → 0 poin**
  - **Cosine 0.90 → 100 poin**

#### 3. `MatchingPageController.php`

- **Masalah:** Skor teks maksimal 50, lalu dikali 0.5 → teks cocok sempurna cuma dapat 25/100.
- **Solusi:** Skor teks diskalakan ke 0-100 (`min($textScore * 2, 100)`).

#### 4. `ImageMatchingService.php`

- ✅ Tambah `orb_score` di hasil
- ✅ Timeout naik 10 → 20 detik

#### 5. `NotificationHelper.php` (Opsional)

- ✅ Sinonim pakai word boundary (`\b...\b`)
- ✅ `tas` tidak lagi cocok dengan `stasiun`

### 📊 Hasil Pengujian

| Pasangan | Skor Foto Lama | Skor Foto Baru | Status |
|----------|----------------|----------------|--------|
| Tumbler vs Tumbler (sudut beda) | ±52 | **68.43** | ✅ Naik 16 poin |
| Tumbler vs Rokok (beda total) | Belum diukur | **1.93** | ✅ Sangat rendah |

**Di halaman Pencocokan:**
- Rokok vs Rokok Humer: **100%** (foto identik + teks cocok)
- Tumbler: **83.96%**
- Rokok lain: **82.84%**
- Pasangan beda total: **Tidak muncul** ✅

### ⚠️ Keterbatasan yang Perlu Diketahui

| No | Keterbatasan | Dampak |
|----|--------------|--------|
| 1 | **Kalibrasi dari 2 titik data** | Barang beda tapi mirip (dua botol biru) bisa lolos |
| 2 | **Sudut sangat ekstrem** | Bisa jatuh di bawah 0.55 → skor 0 |
| 3 | **Target 80-90% untuk foto saja belum tercapai** | Sekarang 68%, skor akhir tinggi dibantu teks |
| 4 | **Skor 100% di rokok** | Wajar karena foto identik + teks cocok |

### 🎯 Saran Lanjutan

| No | Saran | Prioritas |
|----|-------|-----------|
| 1 | Uji lebih banyak pasangan (**barang beda tapi mirip**) | 🔴 Tinggi |
| 2 | Jalankan `App\Models\MatchResult::truncate();` setiap kali algoritma diubah | 🔴 Tinggi |
| 3 | Samakan aturan skor teks antara `MatchingPageController`, `MatchingController`, dan `NotificationHelper` | 🟡 Sedang |

### 📋 File yang Diubah

| No | File | Perubahan |
|----|------|-----------|
| 1 | `multiverse/python/image_matcher/main.py` | ⭐ Ditulis ulang total |
| 2 | `multiverse/python/models/mobilenetv2-10.onnx` | ⭐ File model baru |
| 3 | `app/Http/Controllers/MatchingPageController.php` | Skala skor teks ke 0-100 |
| 4 | `app/Services/ImageMatchingService.php` | Tambah `orb_score`, timeout 20s |
| 5 | `app/Helpers/NotificationHelper.php` | Sinonim per kata utuh (opsional) |

### 📊 Status Proyek Terkini

| Fase | Status | Persentase |
|------|--------|------------|
| Fase 1: Fondasi | ✅ Selesai | 100% |
| Fase 2: Admin & Verifikasi | ✅ Selesai | 100% |
| Fase 3: Notifikasi & Klaim | ✅ Selesai | 100% |
| Fase 4: AI Feature Matching (Text) | ✅ Selesai | 100% |
| Fase 5: Multi-Wilayah | ✅ Selesai | 100% |
| Fase 6: Peta Interaktif | ✅ Selesai | 100% |
| **Fase 7: AI Photo Matching v2 (CNN)** | ✅ **Selesai** | **95%** |
| Fase 8: Fitur Lanjutan (Export, dll) | 📅 Rencana | 0% |
| **TOTAL** | | **± 92%** |

### 🧪 Cara Test AI Photo Matching

**Mode Terminal (Python):**
```bash
cd multiverse/python
venv\Scripts\Activate
python image_matcher/main.py foto1.jpg foto2.jpg
Mode Web (Laravel):

Buka halaman detail laporan

Klik "Cari Kecocokan"

Lihat skor kemiripan di modal

🔑 Catatan Teknis
Model: MobileNetV2 ONNX (mobilenetv2-10.onnx, 13.3 MB)

Input: Gambar 224×224 piksel, 3 channel RGB

Output: Feature vector 1000 dimensi

Metode: Cosine similarity

Kalibrasi: 0.55 → 0 poin, 0.90 → 100 poin

Bobot: CNN 60% + CV klasik 40%

Fallback: Jika CNN gagal → pakai CV klasik saja

---

## 📌 Update Progres Terbaru (Oktober 2026) — Perbaikan Konsistensi Skor

> **Catatan:** Bagian ini adalah catatan progres terbaru setelah README utama dibuat. Tidak mengubah bagian atas, hanya menambahkan update.

### 🎯 Tujuan Update

Memperbaiki **inkonsistensi skor** antara dua akun (penemu & pemilik barang) dan antara dua halaman (Halaman Pencocokan & Tombol Cari Kecocokan). Sebelum perbaikan, pasangan laporan yang sama bisa menampilkan skor yang berbeda tergantung dari mana dilihat.

### 🐛 Bug 1: Selisih 10 Poin Antara 2 Akun

**Gejala:**
- Penemu melihat skor **83.96%**
- Pemilik melihat skor **73.96%**
- **Selisih: 10 poin** (angka bulat, tanda ada aturan yang tidak simetris)

**Penyebab:**
Di `MatchingPageController.php`, aturan skor warna hanya cek **satu arah**:

```php
// ❌ Sebelum: hanya cek satu arah
if (!empty($report1->color) && !empty($report2->color) &&
    str_contains(strtolower($report1->color), strtolower($report2->color))) {
    $textScore += 10;
}
Contoh kasus:

Akun	Warna Akun	Warna Lawan	Hasil
Penemu	biru tua	biru	✅ Cocok (+10)
Pemilik	biru	biru tua	❌ Tidak cocok (0)
Solusi:

php
// ✅ Sesudah: cek dua arah
if (!empty($report1->color) && !empty($report2->color)) {
    $c1 = strtolower(trim($report1->color));
    $c2 = strtolower(trim($report2->color));
    if (str_contains($c1, $c2) || str_contains($c2, $c1)) {
        $textScore += 10;
    }
}
File: app/Http/Controllers/MatchingPageController.php

🐛 Bug 2: Selisih 30 Poin Antara 2 Halaman
Gejala:

Halaman Pencocokan (/matches) menampilkan skor 84.22%

Tombol "Cari Kecocokan" di detail laporan menampilkan skor 54.22%

Selisih: 30 poin untuk pasangan laporan yang sama

Penyebab:
Dua halaman memakai controller berbeda dengan aturan skor teks berbeda:

Komponen	MatchingPageController	MatchingController
Nama	str_contains → 20	similarity ≥50% → 40
Kategori	=== → 20	=== → 25
Warna	contain → 10	similarity ≥70% → 20
Lokasi	❌ Tidak dihitung	contain → 15
Hitungan untuk "tumbler" vs "tumbler 1 milion":

Komponen	Halaman Pencocokan	Tombol Cari Kecocokan
Nama	contain → 20	similarity 41% → 0
Kategori	sama → 20	sama → 25
Warna	contain → 10	similarity 33% → 0
Lokasi	tidak dihitung → 0	contain → 15
Total	50 × 2 = 100	40
Skor Akhir	100×0.5 + 68.43×0.5 = 84.22%	40×0.5 + 68.43×0.5 = 54.22%
Solusi:
Samakan aturan MatchingController dengan MatchingPageController (Opsi A).

File: app/Http/Controllers/Api/MatchingController.php — method calculateFinalScore()

Kode baru:

php
// ── Skor Teks (aturan sama dengan halaman Pencocokan) ──
$textScore = 0;
$criteria  = [];

// Nama barang → 20 poin (saling mengandung)
$name1 = strtolower(trim($report1->item_name));
$name2 = strtolower(trim($report2->item_name));
if ($name1 !== '' && $name2 !== '' &&
    (str_contains($name1, $name2) || str_contains($name2, $name1))) {
    $textScore += 20;
    $criteria[] = 'name';
}

// Kategori → 20 poin
if (!empty($report1->category) && !empty($report2->category) &&
    strtolower($report1->category) === strtolower($report2->category)) {
    $textScore += 20;
    $criteria[] = 'category';
}

// Warna → 10 poin (saling mengandung)
if (!empty($report1->color) && !empty($report2->color)) {
    $c1 = strtolower(trim($report1->color));
    $c2 = strtolower(trim($report2->color));
    if (str_contains($c1, $c2) || str_contains($c2, $c1)) {
        $textScore += 10;
        $criteria[] = 'color';
    }
}

// Skala ke 0-100 (poin di atas maksimal 50)
$textScore = min($textScore * 2, 100);
📊 Hasil Setelah Perbaikan
Skenario	Sebelum	Sesudah
Penemu vs Pemilik	83.96% vs 73.96%	✅ Sama
Halaman Pencocokan vs Tombol Cari	84.22% vs 54.22%	✅ Sama (84.22%)
⚠️ Catatan Teknis
1. Duplikasi Aturan di 2 Controller
Saat ini aturan skor teks masih diduplikasi di:

MatchingPageController (halaman Pencocokan)

MatchingController (tombol Cari Kecocokan)

Risiko: Kalau salah satu diubah, selisih skor bisa muncul lagi.

## 📌 Update Progres Terbaru (Oktober 2026) — Alur Klaim Berbasis Laporan Hilang

> **Catatan:** Bagian ini adalah catatan progres terbaru setelah README utama dibuat. Tidak mengubah bagian atas, hanya menambahkan update.

### 🎯 Tujuan Update

Admin harus bisa membandingkan **barang temuan yang diklaim** dengan **laporan barang hilang milik pengklaim** langsung dari halaman detail klaim. Sebelumnya, tombol "Lihat Barang Hilang" selalu nonaktif karena klaim tidak membawa informasi laporan hilang mana yang dituju. Update ini membuat setiap klaim **wajib terhubung ke satu laporan hilang** milik pengklaim.

### 🐛 Bug yang Ditemukan

| No | Gejala | Penyebab |
|----|--------|----------|
| 1 | Tombol "Lihat Barang Hilang Pengklaim" selalu abu-abu ("Tidak Ada Laporan Hilang Terkait") | Kolom `claims.lost_report_id` bernilai `NULL` |
| 2 | `lost_report_id` kosong saat klaim lewat tombol **"📦 Klaim Barang Ini"** | `handleClaim()` dipanggil tanpa argumen `lostReportId` |
| 3 | `lost_report_id` kosong saat klaim dari halaman **Pencocokan** | Tombol "Lihat Detail" hanya membawa ID laporan temuan, ID laporan hilang user tidak ikut terbawa |
| 4 | Controller tidak mengirim data laporan hilang ke halaman admin | `ClaimController@show` hanya me-load `report`, `claimant`, `owner`, `verifier` |

### 🔧 Perbaikan yang Dilakukan

#### 1. Halaman Detail Klaim Admin (`ClaimDetail.jsx`)

- ✅ Section **"Aksi Cepat"** di kartu Informasi Pengklaim:
  - **Lihat Profil Pengklaim** → `/admin/users/{id}`
  - **Lihat Barang Hilang Pengklaim** → `/reports/{lost_report_id}` (menampilkan foto kecil dan nama barang hilang)
- ✅ Fallback: jika tidak ada laporan hilang terkait, tombol tampil nonaktif dengan pesan
- ✅ Perbaikan typo class `text-[#185FA5]` pada ikon "Verifikasi Klaim"

#### 2. Relasi & Controller Klaim

| File | Perubahan |
|------|-----------|
| `app/Models/Claim.php` | Tambah relasi `lostReport()` → `belongsTo(Report::class, 'lost_report_id')` |
| `app/Http/Controllers/ClaimController.php` → `show()` | Load relasi `lostReport` dan kirim sebagai prop `lostReport` ke `Admin/ClaimDetail` |
| `app/Http/Controllers/ClaimController.php` → `store()` | **Wajib** `lost_report_id`. Divalidasi di server: harus milik user yang klaim, bertipe `lost`, dan statusnya bukan `resolved`/`rejected`. Jika tidak valid → HTTP 422 |

#### 3. Halaman Pencocokan (`MatchesList.jsx`)

Tombol **Lihat Detail** sekarang membawa ID laporan hilang user ke halaman laporan temuan:

```
/reports/{ID_LAPORAN_TEMUAN}?lost_report_id={ID_LAPORAN_HILANG_USER}
```

Hanya berlaku jika `user_report_type === 'lost'` dan `matched_report_type === 'found'`.

#### 4. Alur Klaim Baru: Popup Pilih Laporan Hilang

Tombol hijau **"📦 Klaim Barang Ini"** di detail laporan temuan tidak lagi langsung mengirim klaim. Sekarang alurnya:

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

| File | Perubahan |
|------|-----------|
| `routes/web.php` → `/reports/{id}` | Kirim prop `myLostReports` (laporan hilang milik user login yang belum `resolved`/`rejected`) |
| `ReportDetail.jsx` | State `showClaimModal` dan `selectedLostId`, fungsi `openClaimModal()` dan `submitClaim()`, serta komponen modal pilihan laporan hilang |

**Perilaku modal:**
- Jika user datang dari halaman Pencocokan (`?lost_report_id=XX`), laporan yang cocok langsung **terpilih otomatis**
- Tombol "Kirim Klaim" nonaktif sampai satu laporan dipilih
- Jika user belum punya laporan hilang, popup menampilkan ajakan **"Buat Laporan Hilang"**

### 🗄️ Perubahan Struktur Tabel `claims`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| lost_report_id | bigint (nullable) | FK ke `reports` — laporan **HILANG** milik pengklaim yang dirujuk saat klaim. Untuk klaim baru kini selalu terisi |

### 🔄 Alur Klaim (Diperbarui)

```
1. User A punya laporan hilang (status verified)
2. User A membuka detail laporan temuan milik User B
   (dari Cari Barang, Pencocokan, atau Cari Kecocokan)
3. User A klik "Klaim Barang Ini" → popup pilih laporan hilang
4. User A memilih laporannya → klaim "pending" + lost_report_id tersimpan
5. Admin membuka detail klaim → bisa membuka:
   • Profil pengklaim
   • Detail laporan hilang pengklaim (untuk dibandingkan dengan barang temuan)
6. Admin setujui / tolak
7. Jika disetujui → laporan temuan dan laporan hilang yang dirujuk → "resolved"
```

### 📋 File yang Diubah

| No | File | Perubahan |
|----|------|-----------|
| 1 | `resources/js/Pages/Admin/ClaimDetail.jsx` | Aksi Cepat, tombol laporan hilang, perbaikan typo |
| 2 | `app/Models/Claim.php` | Relasi `lostReport()` |
| 3 | `app/Http/Controllers/ClaimController.php` | `show()` kirim `lostReport`, `store()` wajib `lost_report_id` |
| 4 | `resources/js/Pages/Matching/MatchesList.jsx` | Link "Lihat Detail" membawa `?lost_report_id=` |
| 5 | `routes/web.php` | Route `/reports/{id}` mengirim `myLostReports` |
| 6 | `resources/js/Pages/Reports/ReportDetail.jsx` | Modal pilih laporan hilang saat klaim |

### ⚠️ Catatan Teknis

| No | Catatan | Dampak |
|----|---------|--------|
| 1 | Klaim lama yang dibuat sebelum update ini bisa punya `lost_report_id = NULL` | Tombol "Lihat Barang Hilang" tampil nonaktif. Bisa diisi manual lewat Tinker: `Claim::find(ID)->update(['lost_report_id' => ID_LAPORAN])` |
| 2 | Halaman **Cari Barang** (`SearchPage.jsx`) belum dicek jika punya tombol klaim sendiri | Jika ada, tombol itu perlu diarahkan ke detail laporan atau memakai modal yang sama, karena server kini menolak klaim tanpa `lost_report_id` |
| 3 | Sempat dicoba deteksi otomatis laporan hilang yang paling mirip, tetapi **dibatalkan** | Konsep akhir: admin melihat laporan hilang yang **dipilih pengklaim**, bukan hasil tebakan sistem |

## 📋 Cara Menggunakan File Ini

1. **Buka VS Code** di root proyek `temubarang`
2. **Buat file baru** bernama `README.md`
3. **Copy paste** seluruh kode di atas
4. **Simpan** (Ctrl+S)

---

**File README.md sudah lengkap dari awal hingga akhir!** 🎉

**Apakah ada bagian yang ingin ditambahkan atau disesuaikan?** 🚀

---

---

## 🔐 Revisi dari Guru: Nomor Seri/IMEI + Deteksi Data Pribadi Otomatis

Dokumen ini menjelaskan revisi yang diminta guru atas dua aspect: **nomor seri / IMEI sebagai bukti kepemilikan** dan **deteksi data pribadi otomatis pada foto laporan**.

---

### 1️⃣ Nomor Seri / IMEI

#### Alur per peran

| Peran | Kewajiban | Validasi |
|-------|-----------|----------|
| **Penemu** (barang temuan, kategori Elektronik) | Wajib mengisi nomor seri/IMEI. Kolom "ciri rahasia" digantikan oleh kolom nomor seri. | IMEI 15 digit + checksum Luhn → salah ketik langsung ketahuan |
| **Penemu** (perangkat mati / terkunci) | Memilih checkbox **"Tidak bisa membaca"**. | Tidak wajib isi angka; admin yang membaca dari fisik |
| **Admin kelurahan** | Membaca nomor seri dari **fisik perangkat** saat mencatat "Terima Barang". | Otomatis dibandingkan dengan yang dilaporkan penemu. **Beda → peringatan** |
| **Pemilik** (laporan barang hilang) | **Opsional** mengisi IMEI | Kalau sama → pencocokan langsung 100% + notifikasi "🎯 Nomor Seri Cocok" |
| **Pengklaim** | Wajib menyebut nomor seri | Admin melihat **tiga nilai berdampingan**: dilaporkan penemu, dibaca admin, jawaban penglaim |

#### Effect_number seri pada pencocokan

```
IMEI kedua laporan identik  →  skor = 100% (sangat_mirip)
                                tanpa perlu melihat nama atau foto
                                + notifikasi "🎯 Nomor Seri Cocok"
```

Tersedia di `app/Services/MatchScoreService.php` (`imeiMatches()`) dan
`app/Helpers/NotificationHelper.php` (`checkAndNotifyMatches()`).

#### Checksum Luhn

IMEI 15 digit memakai checksum Luhn, jadi satu digit salah ketik langsung tidak valid.
Implementasi ada di dua tempat dan harus selalu sama:

| Lokasi | File |
|--------|------|
| Backend | `app/Services/ImeiService.php` |
| Browser | `resources/js/services/imei.js` |

Contoh: `352099001761481` → valid. `352099001761482` → **tidak valid** (checksum salah).

Format tampilan: `35-209900-176148-1`

---

### 2️⃣ Deteksi Data Pribadi Otomatis pada Foto

Foto di luar kategori yang selalu disamarkan sekarang **diperiksa otomatis saat diunggah**.

#### ⚙️ Aturan kategori sensitif (diperbarui)

Kategori **Elektronik sengaja TIDAK lagi** termasuk kategori sensitif.

| Kategori | Perlakuan foto | Bisa dibuka admin? |
|----------|----------------|--------------------|
| **Elektronik** | 🔓 Tampil normal (tajam) ke publik | — (tidak perlu dibuka) |
| **Dokumen & Surat** | 🔒 Blur keras | ❌ **tidak bisa** |
| **Kartu & Identitas** | 🔒 Blur keras | ❌ **tidak bisa** |
| **Uang** | 🔒 Blur keras | ❌ **tidak bisa** |
| Semua kategori lain | ✅ Tampil normal, **tapi dicek detektor PII** | ✅ bisa (tombol "Buka samaran") |

**Alasan:** foto barang elektronik umumnya hanya menunjukkan **bodi barangnya**
(bodi HP, casing, kabel), bukan identitas pemilik. Blur yang lama terlalu
ekstrem — foto diperkecil ke **40 piksel** sehingga hanya menyisakan gumpalan
warna dan **barang sama sekali tidak bisa dikenali** oleh warga yang
mencarinya. Laporan jadi tidak berguna.

**Tapi privasi tetap terjaga**, karena:
1. Foto elektronik yang ternyata memuat data pribadi (mis. layar menampilkan KTP)
   **tetap disamarkan otomatis** oleh detektor PII — dan admin **boleh** membuka
   samaran kalau hasilnya keliru.
2. Nomor seri/IMEI disimpan terpisah di `reports.reported_imei` yang ada di
   `$hidden` model, jadi **tidak pernah** ikut terkirim ke browser publik.

Konstanta yang mengatur: `App\Services\PhotoPrivacyService::SENSITIVE_CATEGORIES`.

#### Yang dideteksi

| Jenis | Cara deteksi |
|-------|-------------|
| **NIK** (16 digit) | Regex pada hasil OCR |
| **Nomor kartu bank** (13–19 digit) | Regex + checksum Luhn |
| **Kata kunci dokumen identitas** | Minimal **2** kata kunci berbeda (KTP, KK, SIM, NPWP, Akta Kelahiran, Paspor, dst.) |
| **Wajah** | OpenCV Haar Cascade (`haarcascade_frontalface_default.xml`) |

#### Keluarannya

| Hasil | Tindakan |
|-------|----------|
| **Tidak ada data pribadi** | Foto tampil normal. Metadata EXIF/GPS tetap dibuang. |
| **Data pribadi terdeteksi** | Foto disamarkan. Asli disimpan di disk **privat** (tanpa URL publik), publik hanya melihat versi buram. Alasan tersimpan di `reports.pii_reasons`. |
| **Detektor gagal** (Tesseract belum terpasang / timeout) | Foto **tetap disamarkan** demi keamanan (*fail-safe*), alasannya tercatat di `reports.pii_check_error`. |

#### Koreksi manual oleh admin

| Tombol | Kapan dipakai | Efek |
|--------|---------------|------|
| **Samarkan foto** | Hasil deteksi keliru (foto sebenarnya aman, tapi terblur) | Foto asli pindah ke disk privat, publik melihat versi buram |
| **Buka samaran** | Hasil deteksi keliru (foto sebenarnya ada data pribadi, tapi tidak terblur) | Foto asli dikembalikan ke disk publik, `pii_status = 'cleared'` |

> ⚠️ **Kategori sensitif** (Dokumen & Surat, Kartu & Identitas, Uang) **tidak bisa** dibuka samarannya. Aturan ini tetap berlaku.
>
> ✅ **Elektronik** sudah dikeluarkan dari daftar kategori sensitif (lihat subsection di atas). Foto elektronik boleh dibuka samarannya oleh admin kalau detektor PII keliru.

---

### 📁 File yang Ditambahkan / Diubah

#### Ditambah

| File | Isi |
|------|-----|
| `app/Services/ImeiService.php` | Validasi checksum Luhn, normalisasi, format, perbandingan 3 sumber |
| `app/Services/PiiDetectionService.php` | Memanggil detektor Python, fail-safe |
| `multiverse/python/pii_detector/main.py` | Script deteksi PII (OCR + Haar Cascade) |
| `resources/js/services/imei.js` | Validasi IMEI di browser (sinkron dengan backend) |
| `database/migrations/2026_11_16_083901_add_imei_and_pii_detection_to_reports.php` | Kolom baru di tabel `reports` |

#### Diubah

| File | Perubahan |
|------|-----------|
| `app/Services/PhotoPrivacyService.php` | Integrasi deteksi PII + `restorePublic()` untuk membuka samaran |
| `app/Services/MatchScoreService.php` | IMEI sama → skor 100% |
| `app/Helpers/NotificationHelper.php` | Notifikasi "🎯 Nomor Seri Cocok" |
| `app/Http/Controllers/ReportController.php` | Validasi IMEI + kondisi Electronics + hapus duplikasi blok |
| `app/Http/Controllers/ClaimController.php` | Validasi IMEI penglaim + kirim perbandingan 3 nilai |
| `app/Models/Report.php` | Kolom baru, `$hidden`, accessor `has_reported_imei` |
| `routes/web.php` | Catat IMEI admin + perbandingan + route koreksi samaran + data privasi ke halaman detail |
| `config/services.php` | Konfigurasi `tesseract` |
| `resources/js/Pages/Reports/CreateReport.jsx` | Kolom IMEI + checkbox "tidak bisa membaca" |
| `resources/js/Pages/Reports/EditReport.jsx` | Kolom IMEI + checkbox "tidak bisa membaca" |
| `resources/js/Pages/Reports/ReportDetail.jsx` | Panel IMEI, panel privasi foto, tombol koreksi admin |
| `resources/js/Pages/Admin/ClaimDetail.jsx` | Tiga sumber nomor seri berdampingan |
| `resources/js/Pages/Admin/Dashboard.jsx` | Badge "Foto sensitif" / "Data pribadi terdeteksi" / "IMEI" |
| `resources/js/Pages/Matching/MatchResult.jsx` | Fix `useParams` (tidak tersedia di Inertia v2) |

---

### 🗄️ Kolom Baru di Tabel `reports`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `reported_imei` | `string(20)` nullable | IMEI yang dilaporkan (penemu / pemilik) |
| `imei_unreadable` | `boolean` | Penemu menandai tidak bisa membaca |
| `imei_verified_at` | `timestamp` nullable | Waktu admin membaca IMEI dari fisik |
| `pii_detected` | `boolean` | Hasil deteksi data pribadi |
| `pii_reasons` | `json` nullable | Alasan yang terdeteksi |
| `pii_status` | `string(20)` | `none` / `detected` / `cleared` / `forced` |
| `pii_checked_at` | `timestamp` nullable | Waktu pemeriksaan |
| `pii_check_error` | `string(255)` nullable | Alasan detektor gagal |
| `photo_blurred` | `boolean` | Foto publik saat ini adalah versi buram |
| `privacy_override_by` | `foreignId` nullable | Admin yang melakukan koreksi |
| `privacy_override_at` | `timestamp` nullable | Waktu koreksi |

---

### ⚙️ Konfigurasi

#### `.env`

```dotenv
PII_DETECTION_ENABLED=true
TESSERACT_CMD="C:/Program Files/Tesseract-OCR/tesseract.exe"
```

> Tulis path dengan **garis miring** (`/`). Backslash (`\`) akan membuat Laravel gagal membaca `.env`.

#### Prasyarat Tesseract OCR

Tesseract **harus terinstall** di sistem (bukan pip package):

1. Unduh: https://github.com/UB-Mannheim/tesseract/wiki
2. Install ke `C:\Program Files\Tesseract-OCR\` (default)
3. Restart terminal + `php artisan config:clear`

#### Python

```bash
cd multiverse/python
venv/Scripts/pip install -r requirements.txt
```

Isi `requirements.txt` sekarang mencatat semua dependensi (dulu kosong):

```
numpy==2.5.0
opencv-python==4.13.0.92
onnxruntime==1.30.0
pytesseract==0.3.13
Pillow==13.0.0
```

---

### 🧪 Cara Menguji

#### Uji IMEI (backend)

```bash
php artisan tinker --execute="require base_path('storage/app/t_imei.php');"
```

#### Uji deteksi PII

Buat dua gambar uji: satu berisi NIK + kata kunci "KARTU TANDA PENDUDUK"/"Kartu Keluarga",
satu gambar biasa. Lalu:

```bash
php artisan tinker --execute="require base_path('storage/app/t_pii.php');"
```

Hasil yang diharapkan:
- Gambar bersih → `pii_detected=false`, foto tidak buram
- Gambar NIK → `pii_detected=true`, `photo_blurred=true`, `photo_original` terisi (privat)
- `restorePublic()` → foto kembali normal, `pii_status='cleared'`

#### Cek cepat tanpa GUI

| Perilaku | Cara cek |
|----------|----------|
| IMEI salah checksum ditolak | Isi `reported_imei` 15 digit dengan digit terakhir diubah → muncul error validasi |
| Kategori Elektronik mewajibkan IMEI | Pilih Elektronik tanpa isi IMEI & tanpa centang "tidak bisa membaca" → ditolak |
| Notifikasi IMEI cocok | Buat 2 laporan (satu lost, satu found) dengan `reported_imei` sama → setelah verifikasi, muncul notifikasi "🎯 Nomor Seri Cocok" |
| Foto ber-NIK otomatis buram | Unggah foto berisi NIK ke kategori biasa (mis. Dompet & Tas) → foto otomatis buram + badge di dashboard admin |

---

### 🐛 Catatan Teknis & Batasan

| No | Catatan | Dampak |
|----|---------|--------|
| 1 | Deteksi PII menambah **±3–8 detik** per unggah (OCR + Haar Cascade) | Unggah terasa sedikit lebih lambat. Batas waktu proses Python: **30 detik** |
| 2 | Tesseract OCR hanya membaca **bahasa Inggris** (`eng`) | Teks dokumen Indonesia bisa kurang terbaca. NIK & nomor kartu tetap terdeteksi karena berupa angka |
| 3 | Kata kunci dokumen butuh **minimal 2** kata kunci | Foto KTP yang hanya terbaca satu kata kunci mungkin lolos. Admin bisa menanganinya manual lewat tombol "Samarkan foto" |
| 4 | `pytesseract` **hanya wrapper** — butuh Tesseract binary terpisah | Kalau binary tidak ada → detektor gagal → foto disamarkan (fail-safe) |
| 5 | Deteksi wajah memakai Haar Cascade frontal | Wajah samping / tertutup bisa tidak terdeteksi |
| 6 | Foto asli yang disamarkan **tidak dihapus** dari disk privat | Ini memang tujuannya — supaya admin masih bisa melihat & mengoreksi |
| 7 | `reported_imei` ada di `$hidden` model | Nilai IMEI tidak ikut terkirim ke browser. Admin/pemilik mendapatkannya lewat props khusus di halaman detail |

---

### 🗓️ Kronologi Perubahan

| Commit | Isi |
|--------|-----|
| `2026_11_16_083901` (migration) | Menambah kolom IMEI + deteksi PII di `reports` |
| — | Menambah `ImeiService`, `PiiDetectionService`, `pii_detector/main.py`, `services/imei.js` |
| — | Integrasi ke `ReportController`, `ClaimController`, `PhotoPrivacyService`, `MatchScoreService`, `NotificationHelper` |
| — | Route koreksi samaran admin + route catat IMEI fisik |
| — | Frontend: form IMEI, panel privasi foto, tiga kolom perbandingan, badge dashboard |
| — | Fix `MatchResult.jsx` (`useParams` tidak ada di Inertia v2) + route `Reports/MatchResult` → `Matching/MatchResult` |

---

## 📌 Update Progres Terbaru (November 2026) — Siklus Barang Temuan 30 Hari

### ❓ Permasalahan dari Guru

> "Kalau ada laporan penemuan, misal 30 hari tidak ada yang klaim, mau diapakan barang ini?
> Apakah laporan penemuan yang 30 hari tidak ada yang klaim akan hilang, barangnya disimpan
> di kelurahan, atau jadi milik negara?"

### 🎯 Keputusan Sistem

Sistem memakai pola **gudang kepabeanan**, dengan tiga prinsip yang dijaga:

1. **Barang temuan TIDAK pernah jadi "milik negara".** Konsep itu milik kepabeanan
   (barang yang tidak diambil pemilik dalam batas waktu). Untuk barang warga,
   "milik negara" tanpa prosedur formal justru membuka masalah: siapa yang
   bertanggung jawab, dan dasar hukumnya apa.
2. **Barang TIDAK pernah hilang.** Status "kedaluwarsa" hanya berarti masa klaim
   sudah habis — barangnya masih ada di kantor kelurahan.
3. **Barang tidak boleh kembali ke penemu.** Kalau barangnya sudah lewat masa klaim
   lalu dikembalikan ke yang menemukannya, secara hukum berisiko masuk ranah
   pengambilan barang milik orang lain. Jadi liberação hanya lewat berita acara.

### 🔄 Alur Barang Temuan

```
Hari 1..30   MASA KLAIM AKTIF
             Barang disimpan di kantor kelurahan, pemilik bisa mengklaim.
             Masa klaim dihitung dari waktu barang DITERIMA di kantor.

Hari ~25     PERINGATAN ke admin kelurahan + penemu barang.

Hari 30      MASA KLAIM DITUTUP -> status "Kedaluwarsa"
             Barang BUKAN hilang dan BUKAN milik negara.
             Pemilik masih bisa MENEBUS sampai barang benar-benar dilepas.

Hari 37+     TINDAK LANJUT -> berita acara -> barang dilepas ->
             data sensitif dihapus -> tersisa arsip ringkas.
```

### 🧩 Matriks Tindak Lanjut (rekomendasi per kategori)

| Jenis Barang | Tindak Lanjut |
|---|---|
| KTP, SIM, kartu pelajar, kartu ATM | Dikembalikan ke penerbitnya (Dukcapil, kepolisian, bank, sekolah) atau dimusnahkan dengan saksi. **Bukan "milik negara"** |
| HP, laptop, dompet berisi uang | Diserahkannya ke instansi yang berwenang (polisi atau pemerintah kota) lewat berita acara |
| Barang bernilai rendah (tumbler, jaket, payung) | Dihibahkan ke lembaga sosial dengan berita acara |
| Barang rusak atau berisi data pribadi | Dimusnahkan dengan saksi |

Rekomendasi ini hanya **saran** — admin tetap memutuskan, dan pilihan yang diambil
dicatat pada berita acara. Barang yang terdeteksi memuat data pribadi (NIK, kartu
bank, wajah) otomatis disarankan untuk dimusnahkan.

### 📋 Berita Acara

Setiap pelepasan barang WAJIB punya berita acara: jenis tindakan, siapa yang
menerima, instansi/lembaga mana, siapa saksinya, kapan, dan bukti fotonya.

Saksi minimal 1 orang (bisa dikonfigurasi). Pelepasan barang **diblokir** kalau
masih ada klaim yang pending/disetujui — klaimnya harus diselesaikan dulu.

### 🔓 Klaim Tebus (Redemption)

Kalau masa klaim sudah habis tapi pemilik asli akhirnya datang, ia tetap boleh
menebus barang di kantor kelurahan. Klaim ini ditandai `is_redemption = true`
supaya admin tahu ini pelepasan barang yang tertunda, bukan klaim biasa.
Setelah barang diserahkan, laporan ditutup dengan `resolution_type = 'claimed'`.

### 📣 Papan Barang Temuan (Publik)

Rute `/barang-temuan` — daftar publik barang temuan yang masih aktif masa
klaimnya. **Tanpa pengumuman ini, masa klaim 30 hari tidak bermakna:** tidak ada
yang tahu barang tersebut ada, sehingga "tidak ada yang mengklaim" bukan berarti
tidak ada pemiliknya.

Yang dijaga di halaman publik:
- Hanya laporan temuan yang sudah diverifikasi admin.
- Ciri khusus, nomor seri/IMEI, dan data pribadi **tidak pernah** ikut ke publik.
- Kategori berisi identitas (KTP, kartu, uang) fotonya ditampilkan buram.
- Barang yang sudah dilepas tidak muncul lagi.

### ⚙️ Konfigurasi (`.env`)

```dotenv
CLAIM_WINDOW_DAYS=30          # lama masa klaim (hari)
CLAIM_EXPIRY_REMINDER_DAYS=5  # peringatan H-5
CLAIM_ESCALATION_DAYS=7       # eskalasi ke super admin
PURGE_SENSITIVE_ON_RELEASE=true
MINIMUM_WITNESSES=1
```

Scheduler: `reports:check-expiry` dijadwalkan setiap hari pukul 06:15
(`routes/console.php`).

### 📁 File yang Ditambahkan / Diubah

| File | Isi |
|---|---|
| `app/Services/ClaimWindowService.php` | Masa klaim, kedaluwarsa, rekomendasi tindakan, pembersihan data sensitif |
| `app/Console/Commands/CheckReportExpiry.php` | Peringatan H-5, penandaan kedaluwarsa, eskalasi |
| `app/Http/Controllers/Admin/ReportFollowupController.php` | Berita acara + pelepasan barang |
| `app/Http/Controllers/PublicBoardController.php` | Papan barang temuan publik |
| `resources/js/Pages/Admin/ReportFollowup.jsx` | Form berita acara |
| `resources/js/Pages/Public/FoundBoard.jsx` | Papan barang temuan publik |
| `database/migrations/2026_11_18_120000_fix_claim_window_backfill.php` | Koreksi backfill masa klaim |
| `tests/Feature/ClaimWindowTest.php` | 18 test untuk seluruh siklus |

### 🐛 Bug yang Ditemukan & Diperbaiki

| No | Bug | Dampak |
|---|---|---|
| 1 | `openWindow()` tidak pernah dipanggil | Masa klaim tidak pernah terbuka |
| 2 | `ReportFollowupController` tidak meng-import base `Controller` | Fatal error saat halaman berita acara dibuka |
| 3 | Route berita acara tidak terdaftar di `routes/web.php` | 404 |
| 4 | `reports:check-expiry` tidak dijadwalkan | Masa klaim tidak pernah berakhir |
| 5 | Migration backfill mengisi `claim_deadline = now()` | Laporan lama langsung kedaluwarsa tanpa pernah diberi tahu |
| 6 | `is_redemption` ada di DB tapi tidak dipakai | Fitur tebus tidak bisa jalan |
| 7 | Halaman `Admin/ReportFollowup.jsx` tidak ada | Controller merender halaman yang tidak ada |

### 🧪 Cara Menguji

```bash
php artisan test tests/Feature/ClaimWindowTest.php
```

Untuk mencoba siklus penuh secara manual:

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
