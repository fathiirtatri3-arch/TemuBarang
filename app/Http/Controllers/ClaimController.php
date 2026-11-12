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
    
    // Batasi percobaan klaim: maksimal 3 klaim ditolak per akun untuk barang yang sama
    $rejectedAttempts = Claim::where('report_id', $reportId)
        ->where('claimant_id', $user->id)
        ->where('status', 'rejected')
        ->count();

    if ($rejectedAttempts >= 3) {
        return response()->json(['message' => 'Anda telah mencapai batas percobaan klaim untuk barang ini. Silakan hubungi kantor kelurahan.'], 422);
    }

    // Wajib memilih laporan HILANG milik sendiri
    $lost = Report::where('id', $request->lost_report_id)
        ->where('user_id', $user->id)
        ->where('type', 'lost')
        ->where('status', 'verified')
        ->first();

    if (!$lost) {
        return response()->json(['message' => 'Pilih laporan barang hilang Anda yang sudah terverifikasi.'], 422);
    }

    // Ciri khusus: jika penemu mencatat ciri rahasia, pengklaim wajib menjawab
    $proof = trim((string) $request->claimant_proof);
    $serial = trim((string) $request->claimant_serial);

    // Barang elektronik: pengklaim wajib menyebut nomor seri/IMEI
    if ($report->category === 'Elektronik' && mb_strlen($serial) < 5) {
        return response()->json(['message' => 'Sebutkan nomor seri/IMEI perangkat ini.'], 422);
    }

    if (!empty($report->secret_feature) && mb_strlen($proof) < 5) {
        return response()->json(['message' => 'Sebutkan ciri khusus barang yang hanya Anda ketahui.'], 422);
    }

    $lostReportId = $lost->id;

    $claim = Claim::create([
        'lost_report_id' => $lostReportId,
        'claimant_proof' => $proof !== '' ? $proof : null,
        'claimant_serial' => $serial !== '' ? $serial : null,
        'report_id' => $reportId,
        'claimant_id' => $user->id,
        'owner_id' => $report->user_id,
        'status' => 'pending',
        'message' => $request->message,
    ]);
    
    // Admin wilayah barang temuan (pemutus) + admin wilayah laporan hilang (info)
    $decisionAdmins = NotificationHelper::adminsOfRegion($report->region_id);

    foreach ($decisionAdmins as $admin) {
        NotificationHelper::send(
            $admin->id,
            '📦 Permintaan Klaim Barang',
            "{$user->name} ingin mengklaim \"{$report->item_name}\". Klaim ini menunggu keputusan Anda.",
            'claim',
            "/admin/claims/{$claim->id}"
        );
    }

    if ($lost->region_id && (int) $lost->region_id !== (int) $report->region_id) {
        $infoAdmins = NotificationHelper::adminsOfRegion($lost->region_id)
            ->whereNotIn('id', $decisionAdmins->pluck('id')->all());

        foreach ($infoAdmins as $admin) {
            NotificationHelper::send(
                $admin->id,
                '📦 Warga Anda Mengajukan Klaim',
                "{$user->name} mengklaim barang temuan \"{$report->item_name}\" di Kel. " . ($report->region?->name ?? '-') . " lewat laporan hilangnya \"{$lost->item_name}\". Keputusan ada di admin wilayah barang temuan (info).",
                'claim',
                "/admin/claims/{$claim->id}"
            );
        }
    }
    
    return response()->json(['message' => 'Permintaan klaim berhasil dikirim ke admin.'], 201);
}
    
    // Admin melihat klaim di wilayahnya
    public function adminIndex()
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Hanya admin yang bisa mengakses');
        }

        $query = Claim::with(['report.region', 'lostReport.region', 'claimant', 'owner', 'verifier'])
            ->orderBy('created_at', 'desc');

        // Admin kelurahan: klaim yang barang temuannya ATAU laporan hilangnya ada di wilayahnya
        if ($user->isAdminKelurahan()) {
            if (!$user->region_id) {
                $query->whereRaw('1 = 0');
            } else {
                $regionId = $user->region_id;
                $query->where(function ($q) use ($regionId) {
                    $q->whereHas('report', fn ($r) => $r->where('region_id', $regionId))
                      ->orWhereHas('lostReport', fn ($r) => $r->where('region_id', $regionId));
                });
            }
        }

        $claims = $query->get()->map(function ($claim) use ($user) {
            // true = admin ini yang berhak memutuskan, false = hanya info
            $claim->setAttribute('can_decide', $user->canManageRegion($claim->report?->region_id));
            return $claim;
        });

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
    if (!$user->isAdmin()) {
        abort(403, 'Anda tidak berhak memverifikasi klaim');
    }

    $request->validate([
        'status' => 'required|in:approved,rejected',
        'admin_note' => 'required_if:status,rejected|nullable|string|max:500',
    ], [
        'admin_note.required_if' => 'Alasan penolakan wajib diisi.',
    ]);
    
    $claim = Claim::with(['report.region', 'claimant', 'lostReport'])->findOrFail($id);

    // Yang memutuskan klaim = admin wilayah tempat barang temuan berada
    if (!$user->canManageRegion($claim->report->region_id)) {
        abort(403, 'Keputusan klaim ini ada di admin Kelurahan ' . ($claim->report->region?->name ?? 'pemilik barang temuan'));
    }

    // Barang harus tercatat diterima di kantor kelurahan sebelum klaim disetujui
    if ($request->status === 'approved' && !$claim->report->received_at) {
        return redirect()->back()->with('error', 'Catat dulu penerimaan barang di kantor kelurahan sebelum menyetujui klaim.');
    }

    // Barang elektronik: nomor seri/IMEI harus sudah dicatat dari fisik perangkat
    if ($request->status === 'approved' && $claim->report->category === 'Elektronik' && empty($claim->report->serial_number)) {
        return redirect()->back()->with('error', 'Catat nomor seri/IMEI perangkat sebelum menyetujui klaim.');
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
    
    // Jika disetujui: laporan masuk tahap serah terima (belum selesai)
    if ($request->status === 'approved') {
        // Laporan TEMUAN yang diklaim
        $claim->report->update(['status' => 'matched']);

        // Laporan HILANG yang dirujuk klaim ini
        if ($claim->lost_report_id) {
            \App\Models\Report::where('id', $claim->lost_report_id)
                ->where('user_id', $claim->claimant_id)
                ->update(['status' => 'matched']);
        }

        // Klaim lain yang masih menunggu untuk barang yang sama otomatis ditolak
        $competing = Claim::where('report_id', $claim->report_id)
            ->where('id', '!=', $claim->id)
            ->where('status', 'pending')
            ->get();

        foreach ($competing as $other) {
            $other->update([
                'status' => 'rejected',
                'admin_note' => 'Barang ini telah disetujui untuk pengklaim lain.',
                'verified_at' => now(),
                'verified_by' => auth()->id(),
            ]);

            NotificationHelper::send(
                $other->claimant_id,
                '❌ Klaim Ditolak',
                "Klaim Anda untuk barang \"{$claim->report->item_name}\" ditolak karena barang telah disetujui untuk pengklaim lain.",
                'error',
                "/reports/{$claim->report_id}"
            );
        }
    }    
    // ── Notifikasi ──
    $approved   = $request->status === 'approved';
    $regionName = $claim->report->region?->name ?? '-';
    $itemName   = $claim->report->item_name;

    // 1) Pengklaim
    NotificationHelper::send(
        $claim->claimant_id,
        $approved ? '✅ Klaim Disetujui' : '❌ Klaim Ditolak',
        $approved
            ? "Klaim Anda untuk barang \"{$itemName}\" telah disetujui. Silakan mengambil barang di kantor Kelurahan {$regionName}."
            : "Klaim Anda untuk barang \"{$itemName}\" ditolak. Catatan: {$request->admin_note}",
        $approved ? 'success' : 'error',
        "/reports/{$claim->report_id}"
    );

    // 2) Penemu
    NotificationHelper::send(
        $claim->owner_id,
        $approved ? '📦 Klaim atas Barang Temuan Anda Disetujui' : 'ℹ️ Klaim atas Barang Temuan Anda Ditolak',
        $approved
            ? "Klaim atas barang temuan Anda \"{$itemName}\" telah disetujui admin. Barang akan diserahkan kepada pengklaim."
            : "Klaim atas barang temuan Anda \"{$itemName}\" ditolak admin. Barang tetap tersedia untuk diklaim.",
        'info',
        "/reports/{$claim->report_id}"
    );

    // 3) Admin wilayah laporan hilang (info), jika berbeda wilayah
    $lostRegionId = $claim->lostReport?->region_id;
    if ($lostRegionId && (int) $lostRegionId !== (int) $claim->report->region_id) {
        NotificationHelper::sendToRegionAdmins(
            $lostRegionId,
            $approved ? '✅ Klaim Warga Anda Disetujui' : '❌ Klaim Warga Anda Ditolak',
            "Klaim {$claim->claimant->name} atas \"{$itemName}\" (Kel. {$regionName}) telah " . ($approved ? 'disetujui.' : 'ditolak.'),
            'info',
            "/admin/claims/{$claim->id}"
        );
    }
    
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
            'lostReport.region',
        ])->findOrFail($id);

        $user = auth()->user();

        $foundRegionId = $claim->report?->region_id;
        $lostRegionId  = $claim->lostReport?->region_id;

        // Pemutus = admin wilayah barang temuan
        $canVerify = $user->canManageRegion($foundRegionId);

        // Admin wilayah laporan hilang boleh melihat (info)
        $isLostSideAdmin = $user->isAdminKelurahan()
            && $user->region_id
            && $lostRegionId
            && (int) $user->region_id === (int) $lostRegionId;

        if (!$canVerify && !$isLostSideAdmin) {
            abort(403, 'Klaim ini di luar wilayah Anda');
        }

        // Foto asli hanya untuk admin yang berhak
        $claim->report->setAttribute('can_view_original', $user->canViewOriginalPhoto($claim->report));
        if ($claim->lostReport) {
            $claim->lostReport->setAttribute('can_view_original', $user->canViewOriginalPhoto($claim->lostReport));
        }

        return Inertia::render('Admin/ClaimDetail', [
            'claim' => $claim,
            'lostReport' => $claim->lostReport,
            'canVerify' => $canVerify,
            'decisionRegion' => $claim->report?->region?->name,
            'secretFeature' => $canVerify ? $claim->report?->secret_feature : null,
            'handoverBy' => $claim->handedOverBy?->name,
            'serialNumber' => $canVerify ? $claim->report?->serial_number : null,
            'serialMatch' => ($canVerify && $claim->report?->serial_number && $claim->claimant_serial)
                ? $this->normalizeSerial($claim->report->serial_number) === $this->normalizeSerial($claim->claimant_serial)
                : null,
            'canHandover' => $canVerify && $claim->status === 'approved' && !$claim->handed_over_at,
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

    // Admin mencatat serah terima barang kepada pengambil
    public function handover(Request $request, $id)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Anda tidak berhak mencatat serah terima');
        }

        $claim = Claim::with(['report.region', 'claimant', 'lostReport'])->findOrFail($id);

        // Yang menyerahkan barang = admin wilayah tempat barang disimpan
        if (!$user->canManageRegion($claim->report->region_id)) {
            abort(403, 'Serah terima dicatat oleh admin ' . ($claim->report->region?->name ?? 'pemilik barang temuan'));
        }

        if ($claim->status !== 'approved') {
            return redirect()->back()->with('error', 'Serah terima hanya untuk klaim yang sudah disetujui.');
        }

        if ($claim->handed_over_at) {
            return redirect()->back()->with('error', 'Serah terima klaim ini sudah dicatat.');
        }

        $validated = $request->validate([
            'receiver_name' => 'required|string|min:3|max:100',
            'receiver_id_type' => 'required|in:KTP,KK,SIM,Kartu Pelajar,Lainnya',
            'handover_note' => 'nullable|string|max:500',
        ], [
            'receiver_name.required' => 'Nama pengambil wajib diisi.',
            'receiver_name.min' => 'Nama pengambil minimal 3 karakter.',
            'receiver_id_type.required' => 'Pilih jenis identitas yang ditunjukkan.',
            'receiver_id_type.in' => 'Jenis identitas tidak valid.',
        ]);

        $claim->update([
            'handed_over_at' => now(),
            'handed_over_by' => $user->id,
            'receiver_name' => $validated['receiver_name'],
            'receiver_id_type' => $validated['receiver_id_type'],
            'handover_note' => $validated['handover_note'] ?? null,
        ]);

        // Kedua laporan dinyatakan selesai
        $claim->report->update(['status' => 'resolved']);

        if ($claim->lost_report_id) {
            \App\Models\Report::where('id', $claim->lost_report_id)
                ->where('user_id', $claim->claimant_id)
                ->update(['status' => 'resolved']);
        }

        $itemName   = $claim->report->item_name;
        $regionName = $claim->report->region?->name ?? '-';

        // 1) Pengklaim
        NotificationHelper::send(
            $claim->claimant_id,
            '✅ Barang Telah Diserahkan',
            "Barang \"{$itemName}\" telah diserahkan kepada {$validated['receiver_name']} di kantor {$regionName}. Laporan Anda ditandai selesai.",
            'success',
            "/reports/{$claim->report_id}"
        );

        // 2) Penemu
        NotificationHelper::send(
            $claim->owner_id,
            '🎉 Barang Temuan Anda Kembali ke Pemiliknya',
            "Barang temuan Anda \"{$itemName}\" telah diserahkan kepada pemiliknya. Terima kasih atas kejujuran Anda!",
            'success',
            "/reports/{$claim->report_id}"
        );

        // 3) Admin wilayah laporan hilang (info), jika berbeda wilayah
        $lostRegionId = $claim->lostReport?->region_id;
        if ($lostRegionId && (int) $lostRegionId !== (int) $claim->report->region_id) {
            NotificationHelper::sendToRegionAdmins(
                $lostRegionId,
                '✅ Barang Warga Anda Telah Diserahkan',
                "Barang \"{$itemName}\" milik {$claim->claimant->name} telah diserahkan di kantor {$regionName}.",
                'info',
                "/admin/claims/{$claim->id}"
            );
        }

        return redirect()->back()->with('success', 'Serah terima berhasil dicatat. Laporan ditandai selesai.');
    }

    private function normalizeSerial($value): string
    {
        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) $value));
    }
}