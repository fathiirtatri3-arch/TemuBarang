<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Services\ImageMatchingService;
use Illuminate\Http\Request;

class MatchingController extends Controller
{
    private ImageMatchingService $imageService;

    public function __construct(ImageMatchingService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function match(Report $report)
    {
        $user = auth()->user();
        $isAdmin = in_array($user->role, ['super_admin', 'admin_kelurahan', 'admin']);

        // Hanya pemilik laporan (atau admin) yang boleh mencari kecocokan
        if ($report->user_id !== $user->id && !$isAdmin) {
            abort(403, 'Anda tidak berhak mencari kecocokan untuk laporan ini');
        }

        $targetType = $report->type === 'lost' ? 'found' : 'lost';

        $matches = Report::where('type', $targetType)
            ->where('status', 'verified')
            ->where('id', '!=', $report->id)
            ->where('user_id', '!=', $report->user_id)
            ->get()
            ->map(function ($targetReport) use ($report) {
                $result = $this->calculateFinalScore($report, $targetReport);

                return [
                    'id'               => $targetReport->id,
                    'item_name'        => $targetReport->item_name,
                    'category'         => $targetReport->category,
                    'color'            => $targetReport->color,
                    'location'         => $targetReport->location,
                    'date'             => $targetReport->date,
                    'description'      => $targetReport->description,
                    'photo'            => $targetReport->photo,
                    'user_id'          => $targetReport->user_id,
                    'user'             => $targetReport->user,
                    'match_score'      => $result['score'],
                    'text_score'       => $result['text_score'],
                    'photo_score'      => $result['photo_score'],
                    'label'            => $result['label'],
                    'matched_criteria' => $result['matched_criteria'],
                ];
            })
            ->filter(fn($item) => $item['match_score'] >= 35)
            ->sortByDesc('match_score')
            ->values();

        return response()->json($matches);
    }

    private function calculateFinalScore($report1, $report2): array
    {
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

        // ── Skor Foto via Python ──────────────────────────
        $photoScore = 0.0;


        if (!empty($report1->photo) && !empty($report2->photo)) {
            $path1  = storage_path('app/public/' . $report1->photo);
            $path2  = storage_path('app/public/' . $report2->photo);
            $result = $this->imageService->compareWithCache(
                $report1->id,
                $report2->id,
                $path1,
                $path2
            );

            if ($result['success']) {
                $photoScore = $result['photo_score'];
            }
        }

        // ── Gabungkan 50% + 50% ───────────────────────────
        $finalScore = round(($textScore * 0.50) + ($photoScore * 0.50), 2);

        return [
            'score'            => $finalScore,
            'text_score'       => $textScore,
            'photo_score'      => $photoScore,
            'label'            => $this->getLabel($finalScore),
            'matched_criteria' => $criteria,
        ];
    }

    private function getLabel(float $score): string
    {
        if ($score >= 65) return 'sangat_mirip';
        if ($score >= 35) return 'mungkin_cocok';
        return 'tidak_cocok';
    }

    private function calculateStringSimilarity($str1, $str2): float
    {
        $str1 = strtolower($str1);
        $str2 = strtolower($str2);

        if ($str1 === $str2) return 100.0;

        if (str_contains($str1, $str2) || str_contains($str2, $str1)) {
            $shorter = min(strlen($str1), strlen($str2));
            $longer  = max(strlen($str1), strlen($str2));
            return ($shorter / $longer) * 100;
        }

        $words1      = explode(' ', $str1);
        $words2      = explode(' ', $str2);
        $commonWords = array_intersect($words1, $words2);

        if (count($commonWords) > 0) {
            $maxWords = max(count($words1), count($words2));
            return (count($commonWords) / $maxWords) * 100;
        }

        return 0.0;
    }
}