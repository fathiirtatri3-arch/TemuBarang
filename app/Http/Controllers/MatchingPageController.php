<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Services\MatchScoreService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatchingPageController extends Controller
{
    private MatchScoreService $scorer;

    public function __construct(MatchScoreService $scorer)
    {
        $this->scorer = $scorer;
    }

    public function index()
    {
        $user = auth()->user();
        // Hanya laporan milik user yang SUDAH TERVERIFIKASI yang dicocokkan
        $userReports = Report::where('user_id', $user->id)
            ->where('status', 'verified')
            ->get();
        $matches = [];

        foreach ($userReports as $userReport) {
            $oppositeType = $userReport->type === 'lost' ? 'found' : 'lost';

            $potentialMatches = Report::where('type', $oppositeType)
                ->where('status', 'verified')
                ->where('user_id', '!=', $user->id)
                ->get();

            foreach ($potentialMatches as $match) {
                $finalScore = $this->scorer->score($userReport, $match);

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
}