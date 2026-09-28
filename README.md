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

- **Pengembang:** [Nama Kamu]
- **Pembimbing:** [Nama Pembimbing]
- **Institusi:** [Nama Sekolah/Kampus]

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

## 📋 Cara Menggunakan File Ini

1. **Buka VS Code** di root proyek `temubarang`
2. **Buat file baru** bernama `README.md`
3. **Copy paste** seluruh kode di atas
4. **Simpan** (Ctrl+S)

---

**File README.md sudah lengkap dari awal hingga akhir!** 🎉

**Apakah ada bagian yang ingin ditambahkan atau disesuaikan?** 🚀