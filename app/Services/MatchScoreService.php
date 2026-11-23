<?php

namespace App\Services;

use App\Models\Report;
use Illuminate\Support\Facades\Storage;

/**
 * Satu-satunya tempat perhitungan skor kecocokan.
 * Dipakai oleh halaman Pencocokan, modal "Cari Kecocokan", dan notifikasi
 * kecocokan, sehingga angka persentase selalu sama di semua tempat.
 *
 * Skor akhir = 50% skor teks + 50% skor foto.
 */
class MatchScoreService
{
    /** Skor akhir minimal agar notifikasi kecocokan dikirim */
    public const NOTIFY_THRESHOLD = 60;

    private ImageMatchingService $imageService;

    public function __construct(ImageMatchingService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Skor teks 0-100:
     * nama saling mengandung = 20 poin, kategori sama = 20 poin,
     * warna saling mengandung = 10 poin, lalu dikali 2 (maksimal 100).
     */
    public function textScore(Report $a, Report $b): array
    {
        $points   = 0;
        $criteria = [];

        $name1 = strtolower(trim((string) $a->item_name));
        $name2 = strtolower(trim((string) $b->item_name));
        if ($name1 !== '' && $name2 !== '' &&
            (str_contains($name1, $name2) || str_contains($name2, $name1))) {
            $points += 20;
            $criteria[] = 'name';
        }

        if (!empty($a->category) && !empty($b->category) &&
            strtolower($a->category) === strtolower($b->category)) {
            $points += 20;
            $criteria[] = 'category';
        }

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

    /**
     * Skor foto 0-100 (CNN + CV klasik via Python, memakai cache match_results).
     */
    public function photoScore(Report $a, Report $b): float
    {
        $pathA = $this->photoPath($a);
        $pathB = $this->photoPath($b);

        if ($pathA === null || $pathB === null) {
            return 0.0;
        }

        // Urutan dibuat tetap (id kecil dulu) supaya hasil cache selalu konsisten
        [$first, $second] = $a->id <= $b->id ? [$a, $b] : [$b, $a];
        [$firstPath, $secondPath] = $a->id <= $b->id ? [$pathA, $pathB] : [$pathB, $pathA];

        $result = $this->imageService->compareWithCache(
            $first->id,
            $second->id,
            $firstPath,
            $secondPath
        );

        if (!($result['success'] ?? true)) {
            return 0.0;
        }

        return (float) ($result['photo_score'] ?? 0.0);
    }

    /**
     * Foto yang dipakai AI. Untuk foto yang disamarkan, AI memakai ORIGINAL di disk privat
     * (publik hanya melihat versi buram).
     */
    private function photoPath(Report $report): ?string
    {
        if (!empty($report->photo_original)) {
            $path = Storage::disk('local')->path($report->photo_original);
            return file_exists($path) ? $path : null;
        }

        if (!empty($report->photo)) {
            $path = storage_path('app/public/' . $report->photo);
            return file_exists($path) ? $path : null;
        }

        return null;
    }

    /**
     * Skor akhir + rinciannya.
     */
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

    /**
     * Dua laporan dianggap cocok bila nomor seri/IMEI yang dilaporkan identik.
     */
    public function imeiMatches(Report $a, Report $b): bool
    {
        if (!$a->hasReportedImei() || !$b->hasReportedImei()) {
            return false;
        }

        return app(ImeiService::class)->matches($a->reported_imei, $b->reported_imei);
    }

    public function label(float $score): string
    {
        if ($score >= 65) return 'sangat_mirip';
        if ($score >= 35) return 'mungkin_cocok';
        return 'tidak_cocok';
    }
}