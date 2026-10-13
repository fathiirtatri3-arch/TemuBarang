<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Report;
use App\Helpers\NotificationHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClaimController extends Controller
{
    // User mengirim klaim
public function store(Request $request, $reportId)
{
    $user = auth()->user();
    $report = Report::with('user')->findOrFail($reportId);
    
    if ($report->type !== 'found') {
        return response()->json(['message' => 'Hanya laporan temuan yang bisa diklaim.'], 422);
    }
    
    if ($report->user_id === $user->id) {
        return response()->json(['message' => 'Anda tidak bisa mengklaim barang sendiri.'], 422);
    }

    if ($report->status !== 'verified') {
        return response()->json(['message' => 'Laporan ini tidak bisa diklaim saat ini.'], 422);
    }
    
    $existingClaim = Claim::where('report_id', $reportId)
        ->where('claimant_id', $user->id)
        ->whereIn('status', ['pending', 'approved'])
        ->first();
    
    if ($existingClaim) {
        return response()->json(['message' => 'Anda sudah pernah mengklaim barang ini.'], 422);
    }
    
    // Wajib memilih laporan HILANG milik sendiri
    $lost = Report::where('id', $request->lost_report_id)
        ->where('user_id', $user->id)
        ->where('type', 'lost')
        ->whereNotIn('status', ['resolved', 'rejected'])
        ->first();

    if (!$lost) {
        return response()->json(['message' => 'Pilih laporan barang hilang milik Anda yang valid.'], 422);
    }

    $lostReportId = $lost->id;

    $claim = Claim::create([
        'lost_report_id' => $lostReportId,
        'report_id' => $reportId,
        'claimant_id' => $user->id,
        'owner_id' => $report->user_id,
        'status' => 'pending',
        'message' => $request->message,
    ]);
    
    NotificationHelper::send(
        1,
        '📦 Permintaan Klaim Barang',
        "{$user->name} ingin mengklaim \"{$report->item_name}\".",
        'claim',
        "/admin/claims/{$claim->id}"
    );
    
    return response()->json(['message' => 'Permintaan klaim berhasil dikirim ke admin.'], 201);
}
    
    // Admin melihat semua klaim
    public function adminIndex()
    {
        $claims = Claim::with(['report', 'claimant', 'owner', 'verifier'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('Admin/Claims', [
            'claims' => $claims,
            'stats' => [
                'pending' => $claims->where('status', 'pending')->count(),
                'approved' => $claims->where('status', 'approved')->count(),
                'rejected' => $claims->where('status', 'rejected')->count(),
            ]
        ]);
    }
    
    // Admin verifikasi klaim
public function verify(Request $request, $id)
{
    $user = auth()->user();
    if (!in_array($user->role, ['super_admin', 'admin_kelurahan', 'admin'])) {
        abort(403, 'Anda tidak berhak memverifikasi klaim');
    }

    $request->validate([
        'status' => 'required|in:approved,rejected',
        'admin_note' => 'nullable|string|max:500',
    ]);
    
    $claim = Claim::with(['report', 'claimant'])->findOrFail($id);

    if ($user->role === 'admin_kelurahan' && $claim->report->region_id !== $user->region_id) {
        abort(403, 'Klaim ini di luar wilayah Anda');
    }

    if ($claim->status !== 'pending') {
        return redirect()->back()->withErrors(['error' => 'Klaim ini sudah diproses.']);
    }
    
    $claim->update([
        'status' => $request->status,
        'admin_note' => $request->admin_note,
        'verified_at' => now(),
        'verified_by' => auth()->id(),
    ]);
    
    // Jika disetujui, update status laporan
    if ($request->status === 'approved') {
        // Update laporan TEMUAN (yang diklaim)
        $claim->report->update(['status' => 'resolved']);
        
        // Update hanya laporan HILANG yang dirujuk klaim ini
        if ($claim->lost_report_id) {
            \App\Models\Report::where('id', $claim->lost_report_id)
                ->where('user_id', $claim->claimant_id)
                ->update(['status' => 'resolved']);
        }
    }
    
    // Notifikasi ke user yang mengklaim
    $title = $request->status === 'approved' ? '✅ Klaim Disetujui' : '❌ Klaim Ditolak';
    $message = $request->status === 'approved'
        ? "Klaim Anda untuk barang \"{$claim->report->item_name}\" telah disetujui. Silakan mengambil barang di BK/Admin."
        : "Klaim Anda untuk barang \"{$claim->report->item_name}\" ditolak. Catatan: {$request->admin_note}";
    
    NotificationHelper::send(
        $claim->claimant_id,
        $title,
        $message,
        $request->status === 'approved' ? 'success' : 'error',
        "/reports/{$claim->report_id}"
    );
    
    return redirect()->back()->with('success', "Klaim berhasil di{$request->status}");
}

    // Admin melihat detail klaim
    public function show($id)
    {
        $claim = Claim::with([
            'report.region',
            'report.user',
            'claimant',
            'owner',
            'verifier',
            'lostReport',
        ])->findOrFail($id);

        return Inertia::render('Admin/ClaimDetail', [
            'claim' => $claim,
            'lostReport' => $claim->lostReport,
        ]);
    }

    /**
     * Cari laporan HILANG milik pengklaim yang paling mirip
     * dengan laporan TEMUAN yang diklaim.
     */
    private function guessLostReport(Claim $claim): array
    {
        $found = $claim->report;

        $candidates = Report::where('user_id', $claim->claimant_id)
            ->where('type', 'lost')
            ->where('status', '!=', 'rejected')
            ->get();

        if (!$found || $candidates->isEmpty()) {
            return [null, null];
        }

        $best = null;
        $bestScore = -1;

        foreach ($candidates as $lost) {
            // Pakai skor yang sudah di-cache (foto + teks) kalau ada
            $cached = MatchResult::where(function ($q) use ($lost, $found) {
                    $q->where('report_id_1', $lost->id)->where('report_id_2', $found->id);
                })
                ->orWhere(function ($q) use ($lost, $found) {
                    $q->where('report_id_1', $found->id)->where('report_id_2', $lost->id);
                })
                ->first();

            if ($cached) {
                $score = (float) $cached->final_score;
                $minScore = 35; // threshold "Mungkin Cocok"
            } else {
                // Fallback: skor teks saja (aturan sama dengan halaman Pencocokan)
                $text = 0;
                $n1 = strtolower(trim($lost->item_name));
                $n2 = strtolower(trim($found->item_name));
                if ($n1 !== '' && $n2 !== '' && (str_contains($n1, $n2) || str_contains($n2, $n1))) {
                    $text += 20;
                }
                if (!empty($lost->category) && !empty($found->category)
                    && strtolower($lost->category) === strtolower($found->category)) {
                    $text += 20;
                }
                if (!empty($lost->color) && !empty($found->color)) {
                    $c1 = strtolower(trim($lost->color));
                    $c2 = strtolower(trim($found->color));
                    if (str_contains($c1, $c2) || str_contains($c2, $c1)) {
                        $text += 10;
                    }
                }
                $score = min($text * 2, 100);
                $minScore = 50; // minimal 2 kriteria cocok
            }

            if ($score >= $minScore && $score > $bestScore) {
                $best = $lost;
                $bestScore = $score;
            }
        }

        return $best ? [$best, round($bestScore, 2)] : [null, null];
    }
}