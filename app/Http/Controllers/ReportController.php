<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Helpers\NotificationHelper;
use App\Helpers\BadWords;
use App\Services\PhotoPrivacyService;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/ReportsList');
    }
    
    public function create()
    {
        return Inertia::render('Reports/CreateReport');
    }
    
    public function store(Request $request)
    {
        // Validasi data
        $validated = $request->validate([
            'type' => 'required|in:lost,found',
            'item_name' => 'required|string|min:5|max:255',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|min:20',
            'color' => 'nullable|string|max:50',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'photo' => 'required|image|max:2048',
            'region_id' => 'required|exists:regions,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'secret_feature' => 'required_if:type,found|nullable|string|min:5|max:255',
        ]);

        \Log::info('=== CEK KATA KASAR ===');
        \Log::info('Item name: ' . $request->item_name);
        \Log::info('Description: ' . $request->description);
        \Log::info('Contains bad word: ' . (BadWords::contains($request->description) ? 'YES' : 'NO'));

        // Cek konten untuk kata-kata tidak pantas
        if (BadWords::contains($request->item_name)) {
            return back()->withErrors(['item_name' => 'Nama barang mengandung kata yang tidak diperbolehkan.']);
        }

        if (BadWords::contains($request->description ?? '')) {
            return back()->withErrors(['description' => 'Deskripsi mengandung kata yang tidak diperbolehkan.']);
        }
        
        // Ciri khusus rahasia hanya berlaku untuk laporan temuan
        if ($validated['type'] !== 'found') {
            $validated['secret_feature'] = null;
        }

        // Upload foto jika ada
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('reports', 'public');
            $validated['photo'] = $path;
        }
        
        // Tambahkan user_id dan status
        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';
        $validated['location_detail'] = $request->location;
        
        // Simpan ke database
        $report = Report::create($validated);

        // Lindungi foto (blur kategori sensitif) dan buang metadata EXIF/GPS
        app(PhotoPrivacyService::class)->process($report, true);

        // Notifikasi hanya ke admin kelurahan pemilik wilayah laporan ini
        $jenis = $report->type === 'lost' ? 'barang hilang' : 'barang temuan';

        NotificationHelper::sendToRegionAdmins(
            $report->region_id,
            '📋 Laporan Baru Perlu Diverifikasi',
            "{$report->user->name} membuat laporan {$jenis}: {$report->item_name}.",
            'info',
            "/admin"
        );

        // Catatan: pencocokan BARU dijalankan setelah laporan diverifikasi
        // (lihat route /admin/reports/{report}/verify)
        
        return redirect()->route('reports.index')->with('success', 'Laporan berhasil dibuat!');

    }

    public function update(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        
        // Hanya pemilik, atau admin yang berwenang atas wilayah laporan ini
        $user = auth()->user();
        if ($report->user_id !== $user->id && !$user->canManageRegion($report->region_id)) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit laporan ini');
        }
        
        $validated = $request->validate([
            'item_name' => 'required|string|min:5|max:255',
            'category'  => 'required|string|max:100',
            'description' => 'nullable|string|min:20',
            'color'     => 'nullable|string|max:50',
            'location'  => 'required|string|max:255',
            'date'      => 'required|date',
            'photo'     => 'nullable|image|max:2048',
            'region_id' => 'required|exists:regions,id',
            'latitude'  => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'secret_feature' => 'nullable|string|min:5|max:255',
        ]);

        // ✅ CEK KATA KASAR — harus SEBELUM update
        if (BadWords::contains($request->item_name)) {
            return back()->withErrors(['item_name' => 'Nama barang mengandung kata yang tidak diperbolehkan.']);
        }

        if (BadWords::contains($request->description ?? '')) {
            return back()->withErrors(['description' => 'Deskripsi mengandung kata yang tidak diperbolehkan.']);
        }

        if ($request->hasFile('photo')) {
            if ($report->photo) {
                Storage::disk('public')->delete($report->photo);
            }
            // Foto lama yang tersimpan privat ikut dihapus
            if ($report->photo_original) {
                Storage::disk('local')->delete($report->photo_original);
                $validated['photo_original'] = null;
                $validated['photo_sensitive'] = false;
            }

            $validated['photo'] = $request->file('photo')->store('reports', 'public');
        }

        $validated['location_detail'] = $request->location;
        
        // Laporan yang ditolak lalu diperbaiki pemiliknya diajukan ulang untuk diverifikasi
        $resubmitted = $report->status === 'rejected' && $report->user_id === $user->id;
        if ($resubmitted) {
            $validated['status'] = 'pending';
            $validated['rejection_reason'] = null;
        }

        // Laporan yang ditolak lalu diperbaiki pemiliknya diajukan ulang untuk diverifikasi
        $resubmitted = $report->status === 'rejected' && $report->user_id === $user->id;
        if ($resubmitted) {
            $validated['status'] = 'pending';
            $validated['rejection_reason'] = null;
        }

        $report->update($validated);

        // Foto baru / kategori berubah menjadi sensitif: proses ulang perlindungan foto
        app(PhotoPrivacyService::class)->process($report->fresh(), $request->hasFile('photo'));

        if ($resubmitted) {
            NotificationHelper::sendToRegionAdmins(
                $report->region_id,
                '📋 Laporan Diajukan Ulang',
                "{$user->name} memperbaiki laporan \"{$report->item_name}\" dan mengajukannya kembali untuk diverifikasi.",
                'info',
                "/admin"
            );
        }

        if ($resubmitted) {
            NotificationHelper::sendToRegionAdmins(
                $report->region_id,
                '📋 Laporan Diajukan Ulang',
                "{$user->name} memperbaiki laporan \"{$report->item_name}\" dan mengajukannya kembali untuk diverifikasi.",
                'info',
                "/admin"
            );
        }

        return redirect()->route('reports.show', $report->id)
            ->with('success', 'Laporan berhasil diperbarui');
    }
    
    public function show($id)
    {
        return Inertia::render('Reports/ReportDetail', ['reportId' => $id]);
    }
}