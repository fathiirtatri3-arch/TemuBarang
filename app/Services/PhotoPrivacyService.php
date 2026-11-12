<?php

namespace App\Services;

use App\Models\Report;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Melindungi foto laporan.
 *
 * - Kategori sensitif: foto ASLI dipindah ke disk PRIVAT (tidak punya URL publik),
 *   sedangkan publik hanya melihat salinan yang sudah diburamkan.
 * - Foto biasa: metadata (EXIF/GPS) dibuang dan ukurannya dibatasi.
 *
 * Kolom reports.photo       = foto yang aman untuk PUBLIK (buram jika sensitif)
 * Kolom reports.photo_original = path foto asli di disk privat (hanya jika sensitif)
 */
class PhotoPrivacyService
{
    /** Kategori yang fotonya selalu disamarkan untuk publik */
    public const SENSITIVE_CATEGORIES = [
        'Elektronik',
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
            $this->protect($report);
        } elseif ($newUpload) {
            $this->sanitize($report);
        }
    }

    /**
     * Pindahkan foto asli ke disk privat dan buat salinan buram untuk publik.
     */
    public function protect(Report $report): void
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
            'photo_sensitive' => true,
        ]);
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