<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Services\ImageMatchingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatchingPageController extends Controller
{
    private ImageMatchingService $imageService;

    public function __construct(ImageMatchingService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index()
    {
        $user = auth()->user();
        $userReports = Report::where('user_id', $user->id)->get();
        $matches = [];

        foreach ($userReports as $userReport) {
            $oppositeType = $userReport->type === 'lost' ? 'found' : 'lost';

            $potentialMatches = Report::where('type', $oppositeType)
                ->where('status', 'verified')
                ->where('user_id', '!=', $user->id)
                ->get();

            foreach ($potentialMatches as $match) {
                $finalScore = $this->calculateFinalScore($userReport, $match);

                // Hanya tampilkan jika skor >= 35%
                if ($finalScore['score'] >= 35) {
                    $matches[] = [
                        'user_report_id'    => $userReport->id,
                        'user_report_name'  => $userReport->item_name,
                        'user_report_type'  => $userReport->type,
                        'user_report_photo' => $userReport->photo,
                        'matched_report_id' => $match->id,
                        'matched_report_name' => $match->item_name,
                        'matched_report_type' => $match->type,
                        'matched_photo'     => $match->photo,
                        'matched_location'  => $match->location,
                        'matched_date'      => $match->date,
                        'match_score'       => $finalScore['score'],
                        'photo_score'       => $finalScore['photo_score'],
                        'text_score'        => $finalScore['text_score'],
                        'label'             => $finalScore['label'],
                        'status'            => $match->status,
                    ];
                }
            }
        }

        $matches = collect($matches)
            ->sortByDesc('match_score')
            ->values();

        return Inertia::render('Matching/MatchesList', [
            'matches' => $matches,
            'stats'   => [
                'total_matches'  => $matches->count(),
                'high_score'     => $matches->filter(fn($m) => $m['match_score'] >= 65)->count(),
                'medium_score'   => $matches->filter(fn($m) => $m['match_score'] >= 35 && $m['match_score'] < 65)->count(),
            ],
        ]);
    }

    private function calculateFinalScore($report1, $report2): array
    {
        // ── Skor Teks (50%) ──────────────────────────────
        $textScore = 0;

        // Nama barang cocok → 20 poin
        if (str_contains(strtolower($report1->item_name), strtolower($report2->item_name)) ||
            str_contains(strtolower($report2->item_name), strtolower($report1->item_name))) {
            $textScore += 20;
        }

        // Kategori sama → 20 poin
        if ($report1->category === $report2->category) {
            $textScore += 20;
        }

        // Warna cocok → 10 poin
        if (!empty($report1->color) && !empty($report2->color)) {
            $c1 = strtolower(trim($report1->color));
            $c2 = strtolower(trim($report2->color));
            if (str_contains($c1, $c2) || str_contains($c2, $c1)) {
                $textScore += 10;
            }
        }

        // Skala teks ke 0-100 (poin di atas maksimal 50)
        $textScore = min($textScore * 2, 100);

        // ── Skor Foto (50%) via Python ───────────────────
        $photoScore = 0.0;

        if (!empty($report1->photo) && !empty($report2->photo)) {
            $path1 = storage_path('app/public/' . $report1->photo);
            $path2 = storage_path('app/public/' . $report2->photo);

            $result = $this->imageService->compareWithCache(
                $report1->id,
                $report2->id,
                $path1,
                $path2
            );
            $photoScore = $result['photo_score'] ?? 0.0;
        }

        // ── Gabungkan ────────────────────────────────────
        $finalScore = round(($textScore * 0.50) + ($photoScore * 0.50), 2);

        return [
            'score'       => $finalScore,
            'text_score'  => $textScore,
            'photo_score' => $photoScore,
            'label'       => $this->getLabel($finalScore),
        ];
    }

    private function getLabel(float $score): string
    {
        if ($score >= 65) return 'sangat_mirip';
        if ($score >= 35) return 'mungkin_cocok';
        return 'tidak_cocok';
    }
}