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
        $targetType = $report->type === 'lost' ? 'found' : 'lost';

        $matches = Report::where('type', $targetType)
            ->where('status', 'verified')
            ->where('id', '!=', $report->id)
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
        // ── Skor Teks ────────────────────────────────────
        $textScore   = 0;
        $criteria    = [];

        // Nama barang (40 poin)
        $nameSim = $this->calculateStringSimilarity($report1->item_name, $report2->item_name);
        if ($nameSim >= 70) {
            $textScore += 40;
            $criteria[] = 'name';
        } elseif ($nameSim >= 50) {
            $textScore += 20;
            $criteria[] = 'name_partial';
        }

        // Kategori (25 poin)
        if (!empty($report1->category) && !empty($report2->category) &&
            strtolower($report1->category) === strtolower($report2->category)) {
            $textScore += 25;
            $criteria[] = 'category';
        }

        // Warna (20 poin)
        if (!empty($report1->color) && !empty($report2->color)) {
            $colorSim = $this->calculateStringSimilarity($report1->color, $report2->color);
            if ($colorSim >= 70) {
                $textScore += 20;
                $criteria[] = 'color';
            } elseif ($colorSim >= 50) {
                $textScore += 10;
                $criteria[] = 'color_partial';
            }
        }

        // Lokasi (15 poin)
        if (!empty($report1->location) && !empty($report2->location) &&
            (str_contains(strtolower($report1->location), strtolower($report2->location)) ||
             str_contains(strtolower($report2->location), strtolower($report1->location)))) {
            $textScore += 15;
            $criteria[] = 'location';
        }

        // Cap text score maksimal 100
        $textScore = min($textScore, 100);

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