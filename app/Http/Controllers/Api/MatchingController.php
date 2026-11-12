<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Services\MatchScoreService;
use Illuminate\Http\Request;

class MatchingController extends Controller
{
    private MatchScoreService $scorer;

    public function __construct(MatchScoreService $scorer)
    {
        $this->scorer = $scorer;
    }

    public function match(Report $report)
    {
        $user = auth()->user();

        // Hanya pemilik laporan, atau admin yang berwenang atas wilayah laporan ini
        if ($report->user_id !== $user->id && !$user->canManageRegion($report->region_id)) {
            abort(403, 'Anda tidak berhak mencari kecocokan untuk laporan ini');
        }

        // Pencocokan hanya untuk laporan yang sudah terverifikasi
        if ($report->status !== 'verified') {
            return response()->json([]);
        }

        $targetType = $report->type === 'lost' ? 'found' : 'lost';

        $matches = Report::where('type', $targetType)
            ->where('status', 'verified')
            ->where('id', '!=', $report->id)
            ->where('user_id', '!=', $report->user_id)
            ->get()
            ->map(function ($targetReport) use ($report) {
                $result = $this->scorer->score($report, $targetReport);

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
                    'user'             => $targetReport->user
                        ? ['id' => $targetReport->user->id, 'name' => $targetReport->user->name]
                        : null,
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
}