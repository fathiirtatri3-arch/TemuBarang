<?php

namespace App\Services;

use App\Models\Report;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Melindungi foto laporan.
 *
 * - Kategori sensitif : foto ASLI dipindah ke disk PRIVAT (tidak punya URL publik),
 *   sedangkan publik hanya melihat salinan yang sudah diburamkan. Tidak bisa
 *   dibuka kembali oleh admin (kunci keras). Hanya untuk kategori yang berisi
 *   identitas penting (KTP, KK, SIM, akta, kartu, uang).
 * - Kategori biasa    : dicek otomatis apakah ada data pribadi (NIK, kartu bank,
 *   kata kunci dokumen, wajah) memakai Tesseract OCR + Haar Cascade.
 *   Kalau ada -> diperlakukan sama seperti kategori sensitif, TAPI admin boleh
 *   membukanya kembali lewat koreksi manual.
 * - Semua foto        : metadata (EXIF/GPS) dibuang dan ukurannya dibatasi.
 *
 * Kolom reports.photo        = foto yang aman untuk PUBLIK (buram bila disamarkan)
 * Kolom reports.photo_original = path foto asli di disk privat (bila ada)
 * Kolom reports.photo_sensitive = true -> kunci keras (kategori sensitif)
 * Kolom reports.photo_blurred   = true -> foto publik saat ini adalah versi buram
 */
class PhotoPrivacyService
{
    /**
     * Kategori yang fotonya selalu disamarkan untuk publik.
     *
     * Hanya kategori yang isinya benar-benar berisi IDENTITAS PRIBADI orang:
     * KTP, KK, SIM, akta, kartu, dan uang (yang Sometimes ada nama pemiliknya
     * tertulis).
     *
     * "Elektronik" SENGAJA TIDAK ada di sini. Foto barang elektronik umumnya
     * hanya menampilkan bodi barangnya, bukan data pribadi pemilik. Kalau
     * ternyata ada data pribadi (mis. layar menampilkan KTP), itu ditangani
     * oleh detektor PII otomatis, bukan dengan blur permanen per kategori.
     */
    public const SENSITIVE_CATEGORIES = [
        'Dokumen & Surat',
        'Kartu & Identitas',
        'Uang',
    ];

    public static function isSensitiveCategory(?string $category): bool
    {
        return in_array($category, self::SENSITIVE_CATEGORIES, true);
    }

    /**
     * Dipanggil setelah laporan dibuat / diedit.
     * $newUpload = true jika foto baru saja diunggah.
     */
    public function process(Report $report, bool $newUpload = false): void
    {
        if (empty($report->photo) || $report->photo_sensitive) {
            return;
        }

        @ini_set('memory_limit', '256M');

        if (self::isSensitiveCategory($report->category)) {
            $this->protect($report, true);
            return;
        }

        if (!$newUpload) {
            return;
        }

        // Kategori biasa -> cek data pribadi otomatis
        if ($this->detectPersonalData($report)) {
            $this->protect($report, false);
            return;
        }

        // Tidak ada data pribadi -> tetap buang metadata EXIF/GPS
        $this->sanitize($report);
    }

    /**
     * Jalankan detektor PII. Mengembalikan true bila foto harus disamarkan.
     * Kalau detektor gagal, hasilnya tetap "harus disamarkan" (fail-safe)
     * dan alasannya dicatat di laporan.
     */
    public function detectPersonalData(Report $report): bool
    {
        if (!config('services.tesseract.enabled', true)) {
            $report->update([
                'pii_checked_at' => now(),
                'pii_detected'   => false,
                'pii_reasons'    => [],
                'pii_status'     => 'none',
                'pii_check_error' => null,
            ]);

            return false;
        }

        $path = $this->publicPath($report);

        if ($path === null) {
            return false;
        }

        $result = app(PiiDetectionService::class)->detect($path);

        $report->update([
            'pii_checked_at'  => now(),
            'pii_detected'    => (bool) $result['detected'],
            'pii_reasons'     => $result['reasons'],
            'pii_status'      => $result['detected'] ? 'detected' : 'none',
            'pii_check_error' => $result['error'],
        ]);

        return (bool) $result['detected'];
    }

    /**
     * Pindahkan foto asli ke disk privat dan buat salinan buram untuk publik.
     *
     * $hardLock = true  -> kategori sensitif, admin TIDAK boleh membuka samaran
     * $hardLock = false -> hasil deteksi PII, admin boleh mengoreksi
     */
    public function protect(Report $report, bool $hardLock = true): void
    {
        $public = Storage::disk('public');

        if (empty($report->photo) || !$public->exists($report->photo)) {
            return;
        }

        $binary = $public->get($report->photo);

        // 1) Simpan ORIGINAL di disk privat (tidak bisa dibuka lewat URL publik)
        $extension   = pathinfo($report->photo, PATHINFO_EXTENSION) ?: 'jpg';
        $privatePath = 'private-photos/' . Str::uuid() . '.' . $extension;
        Storage::disk('local')->put($privatePath, $binary);

        // 2) Salinan buram untuk publik. Jika GD tidak tersedia: tidak ada foto publik
        //    (lebih aman menyembunyikan daripada membocorkan).
        $blurred    = $this->blurImage($binary);
        $publicPath = null;

        if ($blurred !== null) {
            $publicPath = 'reports/blur_' . Str::uuid() . '.jpg';
            $public->put($publicPath, $blurred);
        }

        // 3) Hapus foto asli dari disk publik
        $public->delete($report->photo);

        $report->update([
            'photo'           => $publicPath,
            'photo_original'  => $privatePath,
            'photo_sensitive' => $hardLock,
            'photo_blurred'   => true,
        ]);
    }

    /**
     * Kembalikan foto asli ke disk publik (membuka samaran).
     * Hanya untuk foto yang disamarkan karena deteksi PII, bukan kategori sensitif.
     */
    public function restorePublic(Report $report): bool
    {
        if (empty($report->photo_original)) {
            return false;
        }

        $binary = Storage::disk('local')->get($report->photo_original);

        if ($binary === null || $binary === '') {
            return false;
        }

        // Buang metadata EXIF/GPS juga saat membuka samaran
        $clean = $this->reencode($binary, 1600) ?? $binary;

        $extension = pathinfo($report->photo_original, PATHINFO_EXTENSION) ?: 'jpg';
        $publicPath = 'reports/' . Str::uuid() . '.' . $extension;

        Storage::disk('public')->put($publicPath, $clean);

        // Hapus versi buram yang tampil publik (kalau ada)
        if (!empty($report->photo)) {
            Storage::disk('public')->delete($report->photo);
        }

        // Foto asli sudah tidak perlu disimpan privat
        Storage::disk('local')->delete($report->photo_original);

        $report->update([
            'photo'           => $publicPath,
            'photo_original'  => null,
            'photo_sensitive' => false,
            'photo_blurred'   => false,
            'pii_status'      => 'cleared',
        ]);

        return true;
    }

    /**
     * Buang metadata (EXIF/GPS) dan batasi ukuran foto biasa.
     */
    public function sanitize(Report $report): void
    {
        $public = Storage::disk('public');

        if (empty($report->photo) || !$public->exists($report->photo)) {
            return;
        }

        $clean = $this->reencode($public->get($report->photo), 1600);

        if ($clean === null) {
            return; // GD/EXIF tidak tersedia: biarkan apa adanya
        }

        $newPath = 'reports/' . Str::uuid() . '.jpg';
        $public->put($newPath, $clean);
        $public->delete($report->photo);

        $report->update(['photo' => $newPath]);
    }

    /**
     * Path absolut file foto publik (untuk dikirim ke detektor PII).
     */
    public function publicPath(Report $report): ?string
    {
        if (empty($report->photo)) {
            return null;
        }

        $path = storage_path('app/public/' . $report->photo);

        return file_exists($path) ? $path : null;
    }

    /**
     * Encode ulang sebagai JPEG tanpa metadata. Orientasi EXIF diterapkan lebih dulu
     * supaya foto dari HP tidak menjadi miring setelah metadatanya dibuang.
     */
    public function reencode(string $binary, int $maxWidth = 1600): ?string
    {
        if (!function_exists('imagecreatefromstring') || !function_exists('exif_read_data')) {
            return null;
        }

        $img = @imagecreatefromstring($binary);
        if (!$img) {
            return null;
        }

        $exif        = @exif_read_data('data://image/jpeg;base64,' . base64_encode($binary));
        $orientation = (int) ($exif['Orientation'] ?? 1);
        $angle       = [3 => 180, 6 => -90, 8 => 90][$orientation] ?? 0;

        if ($angle !== 0) {
            $rotated = imagerotate($img, $angle, 0);
            if ($rotated) {
                imagedestroy($img);
                $img = $rotated;
            }
        }

        $w = imagesx($img);
        $h = imagesy($img);

        if ($w > $maxWidth) {
            $newH    = (int) round($h * ($maxWidth / $w));
            $resized = imagecreatetruecolor($maxWidth, $newH);
            imagecopyresampled($resized, $img, 0, 0, 0, 0, $maxWidth, $newH, $w, $h);
            imagedestroy($img);
            $img = $resized;
        }

        ob_start();
        imagejpeg($img, null, 85);
        $data = ob_get_clean();
        imagedestroy($img);

        return ($data !== false && $data !== '') ? $data : null;
    }

    /**
     * Buram kuat: perkecil sampai ~40px lalu perbesar kembali, lalu blur.
     * Bentuk dan warna umum masih terlihat, tetapi teks/angka tidak terbaca.
     */
    public function blurImage(string $binary): ?string
    {
        if (!function_exists('imagecreatefromstring')) {
            return null;
        }

        $src = @imagecreatefromstring($binary);
        if (!$src) {
            return null;
        }

        $w = imagesx($src);
        $h = imagesy($src);

        $tinyW = 40;
        $tinyH = max(1, (int) round($h * ($tinyW / $w)));

        $tiny = imagecreatetruecolor($tinyW, $tinyH);
        imagecopyresampled($tiny, $src, 0, 0, 0, 0, $tinyW, $tinyH, $w, $h);
        imagedestroy($src);

        $outW = 640;
        $outH = max(1, (int) round($tinyH * ($outW / $tinyW)));
        $out  = imagecreatetruecolor($outW, $outH);
        imagecopyresampled($out, $tiny, 0, 0, 0, 0, $outW, $outH, $tinyW, $tinyH);
        imagedestroy($tiny);

        for ($i = 0; $i < 4; $i++) {
            imagefilter($out, IMG_FILTER_GAUSSIAN_BLUR);
        }

        ob_start();
        imagejpeg($out, null, 60);
        $data = ob_get_clean();
        imagedestroy($out);

        return ($data !== false && $data !== '') ? $data : null;
    }
}
