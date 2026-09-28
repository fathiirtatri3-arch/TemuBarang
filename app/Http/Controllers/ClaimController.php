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
    
    $existingClaim = Claim::where('report_id', $reportId)
        ->where('claimant_id', $user->id)
        ->whereIn('status', ['pending', 'approved'])
        ->first();
    
    if ($existingClaim) {
        return response()->json(['message' => 'Anda sudah pernah mengklaim barang ini.'], 422);
    }
    
    $claim = Claim::create([
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
    $request->validate([
        'status' => 'required|in:approved,rejected',
        'admin_note' => 'nullable|string|max=500',
    ]);
    
    $claim = Claim::with(['report', 'claimant'])->findOrFail($id);
    
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
        
        // Update SEMUA laporan HILANG milik pengklaim
        \App\Models\Report::where('user_id', $claim->claimant_id)
            ->where('type', 'lost')
            ->update(['status' => 'resolved']);
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
        $claim = Claim::with(['report', 'claimant', 'owner', 'verifier'])
            ->findOrFail($id);
        
        return Inertia::render('Admin/ClaimDetail', [
            'claim' => $claim,
        ]);
    }
}