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
    
    // Ambil data dari database
    if ($user && in_array($user->role, ['super_admin', 'admin_kelurahan'])) {
        $totalReports = Report::count();
        $pendingReports = Report::where('status', 'pending')->count();
        $resolvedReports = Report::where('status', 'resolved')->count();
        $recentReports = Report::with('user')->latest()->take(5)->get();
    } else {
        $totalReports = Report::where('user_id', $user ? $user->id : 0)->count();
        $pendingReports = Report::where('user_id', $user ? $user->id : 0)->where('status', 'pending')->count();
        $resolvedReports = Report::where('user_id', $user ? $user->id : 0)->where('status', 'resolved')->count();
        $recentReports = Report::where('user_id', $user ? $user->id : 0)->latest()->take(5)->get();
    }
    
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
        
        // ⭐ TAMBAHKAN 'region' DI with()
        if (in_array($user->role, ['super_admin', 'admin_kelurahan'])) {
            $reports = \App\Models\Report::with(['user', 'region'])->latest()->get();
        } else {
            $reports = \App\Models\Report::with(['user', 'region'])->where('user_id', $user->id)->latest()->get();
        }
        
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
        
        // Hapus laporan yang dimiliki user (atau semua jika admin)
        $query = \App\Models\Report::whereIn('id', $ids);
        
        if (!in_array($user->role, ['super_admin', 'admin_kelurahan'])) {
            $query->where('user_id', $user->id);
        }
        
        // Hapus juga foto-fotonya
        $reports = $query->get();
        foreach ($reports as $report) {
            if ($report->photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($report->photo);
            }
        }
        
        $count = $query->delete();
        
        return redirect()->back()->with('success', "$count laporan berhasil dihapus.");
    })->name('reports.bulk-delete');
    
    Route::get('/reports/{id}', function ($id) {
        $report = \App\Models\Report::with('user')->findOrFail($id);
        return Inertia::render('Reports/ReportDetail', ['report' => $report]);
    })->name('reports.show');
    
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');

    // Route untuk edit laporan
    Route::get('/reports/{id}/edit', function ($id) {
        $report = \App\Models\Report::findOrFail($id);
        
        // Cek kepemilikan: hanya pemilik atau admin yang bisa edit
        if (!in_array(auth()->user()->role, ['super_admin', 'admin_kelurahan']) && $report->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit laporan ini');
        }
        
        return Inertia::render('Reports/EditReport', ['report' => $report]);
    })->name('reports.edit');

        
    // Route untuk update laporan
    Route::put('/reports/{id}', [ReportController::class, 'update'])->name('reports.update');
    
    // Route untuk delete laporan
    Route::delete('/reports/{id}', function ($id) {
        $report = \App\Models\Report::findOrFail($id);
        
        if (!in_array(auth()->user()->role, ['super_admin', 'admin_kelurahan']) && $report->user_id !== auth()->id()) {
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
        $reports = \App\Models\Report::with('user', 'region')->latest()->get();
        return Inertia::render('Admin/Dashboard', ['reports' => $reports]);
    })->name('admin.dashboard');
    
    // Route untuk verifikasi laporan oleh admin
    Route::put('/admin/reports/{report}/verify', function ($id) {
        if (!in_array(auth()->user()->role, ['super_admin', 'admin_kelurahan'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $report = \App\Models\Report::findOrFail($id);
        $status = request()->input('status');
        
        if (!in_array($status, ['verified', 'resolved'])) {
            return response()->json(['message' => 'Invalid status'], 422);
        }
        
        $report->update(['status' => $status]);

        // Notifikasi ke admin yang melakukan verifikasi
        $adminMessage = $status === 'verified' 
            ? "Anda telah memverifikasi laporan \"{$report->item_name}\" milik {$report->user->name}."
            : "Anda telah menandai selesai laporan \"{$report->item_name}\" milik {$report->user->name}.";
        
        NotificationHelper::send(
            auth()->id(), // Admin yang sedang login
            $status === 'verified' ? '✅ Laporan Diverifikasi' : '🎉 Laporan Selesai',
            $adminMessage,
            'success',
            "/reports/{$report->id}"
        );
        
        // Notifikasi ke user pemilik laporan
        $userTitle = $status === 'verified' ? '✅ Laporan Terverifikasi' : '🎉 Laporan Selesai';
        $userMessage = $status === 'verified' 
            ? "Laporan \"{$report->item_name}\" Anda telah diverifikasi oleh admin."
            : "Laporan \"{$report->item_name}\" Anda telah selesai diproses.";
        
        // Jika status diubah menjadi 'verified', cek kecocokan dan kirim notifikasi
        if ($status === 'verified') {
        NotificationHelper::checkAndNotifyMatches($report);
        }

        // Kirim notifikasi ke user pemilik laporan
        $title = $status === 'verified' ? '✅ Laporan Terverifikasi' : '🎉 Laporan Selesai';
        $message = $status === 'verified' 
            ? "Laporan \"{$report->item_name}\" Anda telah diverifikasi oleh admin."
            : "Laporan \"{$report->item_name}\" Anda telah selesai diproses.";
        
        NotificationHelper::send(
            $report->user_id,
            $title,
            $message,
            $status === 'verified' ? 'success' : 'success',
            "/reports/{$report->id}"
        );

        // Untuk request AJAX dari React
        if (request()->expectsJson()) {
            return response()->json(['message' => 'Status updated successfully']);
        }
        
        return redirect()->back()->with('success', 'Laporan berhasil diverifikasi');
    })->name('admin.verify');

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

    // Routes untuk manajemen user oleh admin
    Route::get('/admin/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users');
    Route::get('/admin/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'show'])->name('admin.users.show');
    Route::put('/admin/users/{id}/role', [App\Http\Controllers\Admin\UserController::class, 'updateRole'])->name('admin.users.role');
    Route::delete('/admin/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
});

require __DIR__.'/auth.php';