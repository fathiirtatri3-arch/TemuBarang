<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Models\Report;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MatchingPageController;
use App\Http\Controllers\NotificationController;
use App\Helpers\NotificationHelper;
use App\Http\Controllers\ClaimController;
use App\Http\Controllers\Admin\UserController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'auth' => [
            'user' => auth()->user(),
        ],
    ]);
})->name('welcome');

// Papan Barang Temuan - daftar publik barang temuan yang sedang aktif
// masa klaimnya. Tanpa halaman ini, masa klaim 30 hari tidak bermakna karena
// tidak ada yang tahu barang tersebut ada.
Route::get('/barang-temuan', [\App\Http\Controllers\PublicBoardController::class, 'index'])
    ->name('board.found');

Route::get('/test-email', function () {
    $user = auth()->user();
    if (!$user) {
        return 'Login dulu!';
    }
    
    \Illuminate\Support\Facades\Mail::raw('Test email dari TemuBarang', function ($message) use ($user) {
        $message->to($user->email)
                ->subject('Test Email');
    });
    
    return 'Email dikirim ke ' . $user->email;
})->middleware('auth');

Route::get('/dashboard', function () {
    $user = auth()->user();
    
    // Data dibatasi sesuai role: Admin Kecamatan = semua, Admin Kelurahan = wilayahnya, Warga = miliknya
    $totalReports = Report::visibleTo($user)->count();
    $pendingReports = Report::visibleTo($user)->where('status', 'pending')->count();
    $resolvedReports = Report::visibleTo($user)->where('status', 'resolved')->count();
    $recentReports = Report::visibleTo($user)->with('user:id,name')->latest()->take(5)->get();
    
    // Kirim data ke Dashboard
    return Inertia::render('Dashboard', [
        'stats' => [
            'total_reports' => $totalReports,
            'pending_reports' => $pendingReports,
            'resolved_reports' => $resolvedReports,
        ],
        'recentReports' => $recentReports,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/api/regions', function () {
        return response()->json([
            'success' => true,
            'data' => \App\Models\Region::where('type', 'kelurahan')->get()
        ]);
    })->name('api.regions');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Routes untuk laporan
    Route::get('/reports', function () {
        $user = auth()->user();

        // Admin Kecamatan: semua | Admin Kelurahan: wilayahnya | Warga: miliknya
        $reports = \App\Models\Report::with(['user:id,name,role', 'region'])
            ->visibleTo($user)
            ->latest()
            ->get();

        // Laporan temuan yang masa claimnya sudah lewat ditandai Kedaluwarsa
        // supaya filter dan badge di halaman ini akurat.
        app(\App\Services\ClaimWindowService::class)->syncExpiredCollection($reports);

        return Inertia::render('Reports/ReportsList', ['reports' => $reports]);
    })->name('reports.index');
    
    Route::get('/reports/create', function () {
        return Inertia::render('Reports/CreateReport');
    })->name('reports.create');

        // Route untuk bulk delete laporan
    Route::delete('/reports/bulk-delete', function () {
        $ids = request()->input('ids', []);
        
        if (empty($ids)) {
            return redirect()->back()->with('error', 'Tidak ada laporan yang dipilih.');
        }
        
        $user = auth()->user();
        
        // Hanya laporan yang boleh dikelola user ini (milik sendiri / wilayahnya / semua untuk Admin Kecamatan)
        $query = \App\Models\Report::whereIn('id', $ids)->visibleTo($user);
        
        // Hapus juga foto-fotonya
        $reports = $query->get();
        foreach ($reports as $report) {
            if ($report->photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($report->photo);
            }
        }
        
        $count = 0;
        foreach ($reports as $report) {
            $report->delete();
            $count++;
        }
        
        return redirect()->back()->with('success', "$count laporan berhasil dihapus.");
    })->name('reports.bulk-delete');
    
    Route::get('/reports/{id}', function ($id) {
        $user = auth()->user();

        // Hanya id, nama, dan role pelapor yang dikirim ke browser (tanpa email/telepon)
        $report = \App\Models\Report::with(['user:id,name,role', 'region'])->findOrFail($id);

        // Masa klaim yang sudah lewat -> langsung ditandai Kedaluwarsa.
        // Jadi status tidak bergantung pada scheduler harian yang mungkin
        // belum sempat jalan.
        app(\App\Services\ClaimWindowService::class)->syncExpired($report);

        $canManage = $report->user_id === $user->id || $user->canManageRegion($report->region_id);
        $report->setAttribute('can_view_original', $user->canViewOriginalPhoto($report));

        // Laporan HILANG milik user yang sudah terverifikasi (untuk pilihan saat klaim).
        // Status 'matched' ikut disertakan supaya laporan yang sudah pernah dipakai
        // untuk klaim yang disetujui TIDAK bisa dipakai lagi untuk klaim kedua.
        $myLostReports = \App\Models\Report::where('user_id', $user->id)
            ->where('type', 'lost')
            ->whereIn('status', ['verified', 'matched'])
            ->whereNotIn('id', function ($q) {
                $q->select('lost_report_id')
                    ->from('claims')
                    ->whereNotNull('lost_report_id')
                    ->whereIn('status', ['pending', 'approved']);
            })
            ->latest()
            ->get(['id', 'item_name', 'category', 'color', 'location', 'date', 'photo', 'status']);

        $imeiService = app(\App\Services\ImeiService::class);

        return Inertia::render('Reports/ReportDetail', [
            'report' => $report,
            'myLostReports' => $myLostReports,
            'canManage' => $canManage,
            'secretFeature' => $canManage ? $report->secret_feature : null,
            'serialNumber' => $canManage ? $report->serial_number : null,
            'requiresProof' => $report->type === 'found' && !empty($report->secret_feature),
            'rejectionReason' => $canManage ? $report->rejection_reason : null,

            // Nomor seri / IMEI
            'reportedImei' => $canManage ? $report->reported_imei : null,
            'reportedImeiFormatted' => $canManage ? $imeiService->format($report->reported_imei) : null,
            'imeiUnreadable' => $canManage ? (bool) $report->imei_unreadable : false,
            'imeiVerifiedAt' => $canManage ? $report->imei_verified_at : null,

            // Status privasi foto
            'photoBlurred' => $report->isPhotoBlurred(),
            'photoSensitive' => (bool) $report->photo_sensitive,
            'piiDetected' => (bool) $report->pii_detected,
            'piiStatus' => $report->pii_status,
            'piiReasons' => $canManage ? ($report->pii_reasons ?? []) : [],
            'piiCheckedAt' => $canManage ? $report->pii_checked_at : null,
            'piiCheckError' => $canManage ? $report->pii_check_error : null,
        ]);
    })->name('reports.show');

    // Foto ASLI (privat) untuk laporan yang fotonya disamarkan
    Route::get('/reports/{id}/photo-original', function ($id) {
        $report = \App\Models\Report::findOrFail($id);

        if (!auth()->user()->canViewOriginalPhoto($report) || !$report->photo_original) {
            abort(404);
        }

        $path = \Illuminate\Support\Facades\Storage::disk('local')->path($report->photo_original);

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path, ['Cache-Control' => 'private, no-store']);
    })->name('reports.photo-original');
    
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');

    // Route untuk edit laporan
    Route::get('/reports/{id}/edit', function ($id) {
        $report = \App\Models\Report::findOrFail($id);
        
        // Hanya pemilik, atau admin yang berwenang atas wilayah laporan ini
        $user = auth()->user();
        if ($report->user_id !== $user->id && !$user->canManageRegion($report->region_id)) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit laporan ini');
        }
        
        return Inertia::render('Reports/EditReport', [
            'report' => $report,
            'secretFeature' => $report->secret_feature,
            'reportedImei' => $report->reported_imei,
            'imeiUnreadable' => (bool) $report->imei_unreadable,
        ]);
    })->name('reports.edit');

        
    // Route untuk update laporan
    Route::put('/reports/{id}', [ReportController::class, 'update'])->name('reports.update');
    
    // Route untuk delete laporan
    Route::delete('/reports/{id}', function ($id) {
        $report = \App\Models\Report::findOrFail($id);
        
        $user = auth()->user();
        if ($report->user_id !== $user->id && !$user->canManageRegion($report->region_id)) {
            abort(403);
        }
        
        if ($report->photo) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($report->photo);
        }
        
        $report->delete();
        
        return redirect()->route('reports.index')->with('success', 'Laporan berhasil dihapus');
    })->name('reports.destroy');

    // Admin Dashboard
    Route::get('/admin', function () {
        if (!in_array(auth()->user()->role, ['super_admin', 'admin_kelurahan'])) {
            abort(403, 'Hanya admin yang bisa mengakses');
        }
        $user = auth()->user();

        $reports = \App\Models\Report::with(['user:id,name,role', 'region'])
            ->visibleTo($user)
            ->latest()
            ->get();

        // Sinkronkan masa klaim yang sudah lewat -> badge "Kedaluwarsa" dan
        // tombol "Tindak Lanjut" langsung muncul tanpa menunggu scheduler.
        app(\App\Services\ClaimWindowService::class)->syncExpiredCollection($reports);

        return Inertia::render('Admin/Dashboard', [
            'reports' => $reports,
            'regionName' => $user->isAdminKelurahan() ? $user->region?->name : null,
        ]);
    })->name('admin.dashboard');
    
    // Route untuk verifikasi laporan oleh admin (hanya di wilayahnya)
    Route::put('/admin/reports/{report}/verify', function ($id) {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $report = \App\Models\Report::with('user')->findOrFail($id);

        // Admin kelurahan hanya boleh memproses laporan di wilayahnya
        if (!$user->canManageRegion($report->region_id)) {
            return response()->json(['message' => 'Laporan ini berada di luar wilayah Anda'], 403);
        }

        $status = request()->input('status');

        if (!in_array($status, ['verified', 'resolved'])) {
            return response()->json(['message' => 'Invalid status'], 422);
        }

        // Alur status: pending -> verified -> resolved
        $requiredCurrent = $status === 'verified' ? 'pending' : 'verified';
        if ($report->status !== $requiredCurrent) {
            return response()->json(['message' => 'Perubahan status tidak valid untuk laporan ini'], 422);
        }

        // Laporan temuan hanya selesai lewat serah terima klaim
        if ($status === 'resolved' && $report->type === 'found') {
            return response()->json(['message' => 'Laporan temuan hanya bisa diselesaikan lewat serah terima klaim'], 422);
        }

        $report->update(['status' => $status]);

        // Laporan temuan yang baru diverifikasi: buka masa klaim (30 hari).
        // Masa klaim dihitung dari saat barang masuk kantor kelurahan; kalau
        // barang belum diterima, dihitung dari waktu verifikasi.
        if ($status === 'verified' && $report->type === 'found') {
            app(\App\Services\ClaimWindowService::class)->openWindow($report->fresh());
        }

        // Setelah terverifikasi, cek kecocokan lintas kelurahan
        if ($status === 'verified') {
            NotificationHelper::checkAndNotifyMatches($report);
        }

        // Notifikasi ke pelapor
        NotificationHelper::send(
            $report->user_id,
            $status === 'verified' ? '✅ Laporan Terverifikasi' : '🎉 Laporan Selesai',
            $status === 'verified'
                ? "Laporan \"{$report->item_name}\" Anda telah diverifikasi oleh admin kelurahan." . ($report->type === 'found' ? ' Silakan serahkan barang ke kantor kelurahan agar dapat diberikan kepada pemiliknya.' : '')
                : "Laporan \"{$report->item_name}\" Anda telah selesai diproses.",
            'success',
            "/reports/{$report->id}"
        );

        if (request()->expectsJson()) {
            return response()->json(['message' => 'Status updated successfully']);
        }

        return redirect()->back()->with('success', 'Laporan berhasil diproses');
    })->name('admin.verify');

    // Admin mencatat barang temuan sudah diterima di kantor kelurahan
    Route::put('/admin/reports/{report}/receive', function ($id) {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Hanya admin yang bisa mengakses');
        }

        $report = \App\Models\Report::with('region')->findOrFail($id);

        if (!$user->canManageRegion($report->region_id)) {
            abort(403, 'Laporan ini berada di luar wilayah Anda');
        }

        if ($report->type !== 'found' || $report->status !== 'verified') {
            return redirect()->back()->with('error', 'Hanya laporan temuan terverifikasi yang bisa dicatat penerimaannya.');
        }

        // Barang elektronik: nomor seri/IMEI WAJIB dicatat admin dari fisik
        // perangkat, karena inilah bukti kepemilikan yang paling kuat.
        //
        // Barang NON-elektronik (tumbler, jaket, payung, kunci) umumnya TIDAK
        // punya nomor seri. Dulu aturan ini tetap memaksa minimal 5 karakter,
        // sehingga barang seperti itu tidak pernah bisa dicatat "diterima" -
        // artinya masa klaim juga tidak pernah di-anchor ke waktu penerimaan.
        $imeiService = app(\App\Services\ImeiService::class);
        $serialInput = (string) request()->input('serial_number');
        $serial = $imeiService->normalize($serialInput) ?? strtoupper(preg_replace('/\s+/', '', $serialInput));

        if ($report->category === 'Elektronik') {
            if (!$imeiService->isValidImei($serial)) {
                return redirect()->back()->with('error', $imeiService->validationMessage($serial));
            }
        } elseif ($serial !== '' && mb_strlen($serial) < 5) {
            // Kalau memang diisi, minimal harus masuk akal - supaya tidak
            // ada nomor seri asal-asalan yang tidak bisa dicocokkan.
            return redirect()->back()->with('error', 'Nomor seri minimal 5 karakter. Kosongkan saja kalau barang ini tidak punya nomor seri.');
        }

        if ($report->received_at) {
            return redirect()->back()->with('error', 'Penerimaan barang ini sudah dicatat.');
        }

        $report->update([
            'received_at' => now(),
            'received_by' => $user->id,
            'serial_number' => $serial !== '' ? $serial : null,
            'imei_verified_at' => now(),
        ]);

        // Barang baru masuk kantor kelurahan -> jangkar ulang masa klaim
        // (30 hari) mulai dari waktu penerimaan, bukan dari waktu verifikasi.
        app(\App\Services\ClaimWindowService::class)->openWindow($report->fresh());

        NotificationHelper::send(
            $report->user_id,
            '📦 Barang Diterima di Kantor Kelurahan',
            "Barang temuan Anda \"{$report->item_name}\" telah diterima dan disimpan di kantor " . ($report->region?->name ?? 'kelurahan') . ". Terima kasih atas kejujuran Anda!",
            'success',
            "/reports/{$report->id}"
        );

        // Bandingkan nomor seri yang dibaca admin dengan yang dilaporkan penemu
        if ($report->reported_imei && $serial && !$imeiService->matches($report->reported_imei, $serial)) {
            return redirect()->back()->with('warning', '⚠️ Nomor seri yang dibaca dari perangkat BERBEDA dengan yang dilaporkan penemu. Mohon verifikasi ulang sebelum menyetujui klaim.');
        }

        return redirect()->back()->with('success', 'Penerimaan barang berhasil dicatat.');
    })->name('admin.reports.receive');

    // Admin menyamarkan foto (koreksi manual hasil deteksi yang keliru)
    Route::put('/admin/reports/{report}/privacy/blur', function ($id) {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Hanya admin yang bisa mengakses');
        }

        $report = \App\Models\Report::findOrFail($id);

        if (!$user->canManageRegion($report->region_id)) {
            abort(403, 'Laporan ini berada di luar wilayah Anda');
        }

        if ($report->photo_sensitive) {
            return redirect()->back()->with('error', 'Foto kategori sensitif tidak bisa dibuka samarannya.');
        }

        if ($report->photo_blurred) {
            return redirect()->back()->with('error', 'Foto laporan ini sudah disamarkan.');
        }

        app(\App\Services\PhotoPrivacyService::class)->protect($report, false);

        $report->update([
            'pii_status'           => 'forced',
            'pii_detected'         => true,
            'pii_reasons'          => ['Disamarkan manual oleh admin'],
            'pii_checked_at'       => now(),
            'privacy_override_by'  => $user->id,
            'privacy_override_at'  => now(),
        ]);

        return redirect()->back()->with('success', 'Foto berhasil disamarkan.');
    })->name('admin.reports.privacy.blur');

    // Admin membuka samaran foto (hanya untuk hasil deteksi PII, bukan kategori sensitif)
    Route::put('/admin/reports/{report}/privacy/unblur', function ($id) {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Hanya admin yang bisa diakses');
        }

        $report = \App\Models\Report::findOrFail($id);

        if (!$user->canManageRegion($report->region_id)) {
            abort(403, 'Laporan ini berada di luar wilayah Anda');
        }

        if ($report->photo_sensitive) {
            return redirect()->back()->with('error', 'Foto kategori sensitif tetap disamarkan dan tidak bisa dibuka.');
        }

        if (!$report->photo_original) {
            return redirect()->back()->with('error', 'Tidak ada foto asli yang tersimpan untuk laporan ini.');
        }

        $restored = app(\App\Services\PhotoPrivacyService::class)->restorePublic($report);

        if (!$restored) {
            return redirect()->back()->with('error', 'Gagal membuka samaran foto.');
        }

        $report->update([
            'pii_status'          => 'cleared',
            'pii_detected'        => false,
            'pii_reasons'         => [],
            'privacy_override_by' => $user->id,
            'privacy_override_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Samaran foto dibuka. Foto kini tampil normal.');
    })->name('admin.reports.privacy.unblur');

    // Admin menolak laporan (wajib alasan)
    Route::put('/admin/reports/{report}/reject', function ($id) {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Hanya admin yang bisa mengakses');
        }

        $report = \App\Models\Report::findOrFail($id);

        if (!$user->canManageRegion($report->region_id)) {
            abort(403, 'Laporan ini berada di luar wilayah Anda');
        }

        $validated = request()->validate([
            'reason' => 'required|string|min:5|max:500',
        ], [
            'reason.required' => 'Alasan penolakan wajib diisi.',
            'reason.min' => 'Alasan penolakan minimal 5 karakter.',
        ]);

        if ($report->status !== 'pending') {
            return redirect()->back()->with('error', 'Hanya laporan yang menunggu verifikasi yang bisa ditolak.');
        }

        $report->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
        ]);

        NotificationHelper::send(
            $report->user_id,
            '❌ Laporan Ditolak',
            "Laporan \"{$report->item_name}\" ditolak admin kelurahan. Alasan: {$validated['reason']}. Anda dapat memperbaiki laporan lalu mengajukannya kembali.",
            'error',
            "/reports/{$report->id}"
        );

        return redirect()->back()->with('success', 'Laporan ditolak dan pelapor diberi tahu.');
    })->name('admin.reports.reject');

    // Route untuk halaman hasil pencocokan
    Route::get('/reports/{id}/match', function ($id) {
        $report = \App\Models\Report::with('user')->findOrFail($id);
        return Inertia::render('Matching/MatchResult', [
            'reportId' => $id,
            'report' => $report
        ]);
    })->name('reports.match');

    // Route untuk halaman pencarian
    Route::get('/search', function () {
        return Inertia::render('Search/SearchPage');
    })->name('search');

    // Route untuk halaman rekomendasi
    Route::get('/matches', [MatchingPageController::class, 'index'])->name('matches.index');

    // Routes untuk notifikasi
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Route untuk klaim barang temuan
    Route::post('/claims/{reportId}', [ClaimController::class, 'store'])->name('claims.store');

    // Admin melihat semua klaim
    Route::get('/admin/claims', [ClaimController::class, 'adminIndex'])->name('admin.claims');
    Route::get('/admin/claims/{id}', [ClaimController::class, 'show'])->name('admin.claims.show');
    Route::put('/admin/claims/{id}', [ClaimController::class, 'verify'])->name('admin.claims.verify');
    Route::put('/admin/claims/{id}/handover', [ClaimController::class, 'handover'])->name('admin.claims.handover');

    // Berita acara tindak lanjut: barang temuan yang masa klaimnya sudah habis
    // dilepas ke penerbit / instansi berwenang / lembaga sosial, atau dimusnahkan.
    Route::get('/admin/reports/{report}/followup', [\App\Http\Controllers\Admin\ReportFollowupController::class, 'show'])
        ->name('admin.reports.followup');
    Route::post('/admin/reports/{report}/followup', [\App\Http\Controllers\Admin\ReportFollowupController::class, 'store'])
        ->name('admin.reports.followup.store');

    // Routes untuk manajemen user oleh admin
    Route::get('/admin/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users');
    Route::get('/admin/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'show'])->name('admin.users.show');
    Route::put('/admin/users/{id}/role', [App\Http\Controllers\Admin\UserController::class, 'updateRole'])->name('admin.users.role');
    Route::delete('/admin/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
});

require __DIR__.'/auth.php';