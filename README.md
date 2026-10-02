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

## 📋 Cara Menggunakan File Ini

1. **Buka VS Code** di root proyek `temubarang`
2. **Buat file baru** bernama `README.md`
3. **Copy paste** seluruh kode di atas
4. **Simpan** (Ctrl+S)

---

**File README.md sudah lengkap dari awal hingga akhir!** 🎉

**Apakah ada bagian yang ingin ditambahkan atau disesuaikan?** 🚀