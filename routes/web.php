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

        $canManage = $report->user_id === $user->id || $user->canManageRegion($report->region_id);
        $report->setAttribute('can_view_original', $user->canViewOriginalPhoto($report));

        // Laporan HILANG milik user yang sudah terverifikasi (untuk pilihan saat klaim)
        $myLostReports = \App\Models\Report::where('user_id', $user->id)
            ->where('type', 'lost')
            ->where('status', 'verified')
            ->latest()
            ->get(['id', 'item_name', 'category', 'color', 'location', 'date', 'photo', 'status']);

        return Inertia::render('Reports/ReportDetail', [
            'report' => $report,
            'myLostReports' => $myLostReports,
            'canManage' => $canManage,
            'secretFeature' => $canManage ? $report->secret_feature : null,
            'serialNumber' => $canManage ? $report->serial_number : null,
            'requiresProof' => $report->type === 'found' && !empty($report->secret_feature),
            'rejectionReason' => $canManage ? $report->rejection_reason : null,
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

        // Barang elektronik: nomor seri/IMEI dicatat admin dari fisik perangkat
        $serial = strtoupper(preg_replace('/\s+/', '', (string) request()->input('serial_number')));

        if ($report->category === 'Elektronik' && mb_strlen($serial) < 5) {
            return redirect()->back()->with('error', 'Catat nomor seri/IMEI dari fisik perangkat (minimal 5 karakter).');
        }

        if ($report->received_at) {
            return redirect()->back()->with('error', 'Penerimaan barang ini sudah dicatat.');
        }

        $report->update([
            'received_at' => now(),
            'received_by' => $user->id,
            'serial_number' => $serial !== '' ? $serial : null,
        ]);

        NotificationHelper::send(
            $report->user_id,
            '📦 Barang Diterima di Kantor Kelurahan',
            "Barang temuan Anda \"{$report->item_name}\" telah diterima dan disimpan di kantor " . ($report->region?->name ?? 'kelurahan') . ". Terima kasih atas kejujuran Anda!",
            'success',
            "/reports/{$report->id}"
        );

        return redirect()->back()->with('success', 'Penerimaan barang berhasil dicatat.');
    })->name('admin.reports.receive');

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
        return Inertia::render('Reports/MatchResult', [
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

    // Routes untuk manajemen user oleh admin
    Route::get('/admin/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users');
    Route::get('/admin/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'show'])->name('admin.users.show');
    Route::put('/admin/users/{id}/role', [App\Http\Controllers\Admin\UserController::class, 'updateRole'])->name('admin.users.role');
    Route::delete('/admin/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
});

require __DIR__.'/auth.php';