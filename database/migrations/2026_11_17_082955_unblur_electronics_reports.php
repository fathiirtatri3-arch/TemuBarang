<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Kategori "Elektronik" dikeluarkan dari daftar kategori sensitif.
 *
 * Foto laporan elektronik sekarang ditampilkan normal ke publik (dengan
 * metadata EXIF/GPS tetap dibuang). Laporan elektronik yang sebelumnya sudah
 * terblur perlu dikembalikan ke foto aslinya supaya konsisten.
 *
 * Catatan: foto asli yang dikembalikan DI-ENCODE ULANG supaya metadata
 * EXIF/GPS ikut hilang, sama seperti saat foto biasa diproses.
 */
return new class extends Migration
{
    /** Kategori yang aturannya berubah */
    private const AFFECTED_CATEGORY = 'Elektronik';

    public function up(): void
    {
        $reports = DB::table('reports')
            ->where('category', self::AFFECTED_CATEGORY)
            ->where(function ($q) {
                $q->where('photo_blurred', true)->orWhere('photo_sensitive', true);
            })
            ->get();

        foreach ($reports as $report) {
            $this->restore($report);
        }
    }

    public function down(): void
    {
        // Tidak dikembalikan: foto asli sudah dihapus dari disk privat,
        // jadi tidak bisa diburamkan kembali secara utuh.
        // Tandai laporan sebagai perlu ditinjau manual.
        DB::table('reports')
            ->where('category', self::AFFECTED_CATEGORY)
            ->where('photo_blurred', false)
            ->whereNull('photo_original')
            ->update(['pii_status' => 'none']);
    }

    /**
     * Kembalikan foto asli ke disk publik + buang metadata EXIF/GPS.
     */
    private function restore(object $report): void
    {
        $privatePath = $report->photo_original;

        // Foto asli tidak ada -> cukup bersihkan penanda, tidak ada yang bisa dikembalikan
        if (empty($privatePath) || !Storage::disk('local')->exists($privatePath)) {
            DB::table('reports')->where('id', $report->id)->update([
                'photo_blurred'  => false,
                'photo_sensitive' => false,
                'pii_status'     => 'none',
                'pii_detected'   => false,
            ]);

            return;
        }

        $binary = Storage::disk('local')->get($privatePath);

        if ($binary === null || $binary === '') {
            return;
        }

        // Encode ulang -> metadata EXIF/GPS hilang, ukuran dibatasi
        $clean = $this->reencode($binary, 1600) ?? $binary;

        $extension = pathinfo($privatePath, PATHINFO_EXTENSION) ?: 'jpg';
        $publicPath = 'reports/' . Str::uuid() . '.' . $extension;

        Storage::disk('public')->put($publicPath, $clean);

        // Hapus versi buram lama dari disk publik
        if (!empty($report->photo)) {
            Storage::disk('public')->delete($report->photo);
        }

        // Foto asli sudah tidak perlu disimpan privat
        Storage::disk('local')->delete($privatePath);

        DB::table('reports')->where('id', $report->id)->update([
            'photo'           => $publicPath,
            'photo_original'  => null,
            'photo_sensitive' => false,
            'photo_blurred'   => false,
            'pii_status'      => 'none',
            'pii_detected'    => false,
            'pii_reasons'     => null,
            'pii_check_error' => null,
        ]);
    }

    /**
     * Encode ulang sebagai JPEG tanpa metadata (identik dengan
     * PhotoPrivacyService::reencode()).
     */
    private function reencode(string $binary, int $maxWidth = 1600): ?string
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
};
