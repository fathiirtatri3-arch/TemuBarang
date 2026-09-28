<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Helpers\NotificationHelper;
use App\Helpers\BadWords;

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
        ]);

        \Log::info('=== CEK KATA KASAR ===');
        \Log::info('Item name: ' . $request->item_name);
        \Log::info('Description: ' . $request->description);
        \Log::info('Contains bad word: ' . (BadWords::contains($request->description) ? 'YES' : 'NO'));

        // Cek konten untuk kata-kata tidak pantas
        if (BadWords::contains($request->item_name)) {
            return back()->withErrors(['item_name' => 'Nama barang mengandung kata yang tidak diperbolehkan.']);
        }

        if (BadWords::contains($request->description)) {
            return back()->withErrors(['description' => 'Deskripsi mengandung kata yang tidak diperbolehkan.']);
        }
        
        // Upload foto jika ada
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('reports', 'public');
            $validated['photo'] = $path;
        }
        
        // Tambahkan user_id dan status
        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';
        $validated['region_id'] = $request->region_id;
        $validated['latitude'] = $request->latitude;
        $validated['longitude'] = $request->longitude;
        $validated['location_detail'] = $request->location;
        
        // Simpan ke database
        $report = Report::create($validated);

            NotificationHelper::send(
            1, // ID admin (sesuaikan dengan ID admin di database Anda)
            '📋 Laporan Baru Perlu Diverifikasi',
            "User {$report->user->name} membuat laporan baru: {$report->item_name} ({$report->type}).",
            'info',
            "/admin"
        );

        // Kirim notifikasi jika ada kecocokan
        NotificationHelper::checkAndNotifyMatches($report);
        
        return redirect()->route('reports.index')->with('success', 'Laporan berhasil dibuat!');

    }

    public function update(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        
        // Cek kepemilikan
        if (!in_array(auth()->user()->role, ['super_admin', 'admin_kelurahan']) && $report->user_id !== auth()->id()) {
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
        ]);

        // ✅ CEK KATA KASAR — harus SEBELUM update
        if (BadWords::contains($request->item_name)) {
            return back()->withErrors(['item_name' => 'Nama barang mengandung kata yang tidak diperbolehkan.']);
        }

        if (BadWords::contains($request->description)) {
            return back()->withErrors(['description' => 'Deskripsi mengandung kata yang tidak diperbolehkan.']);
        }

        if ($request->hasFile('photo')) {
            if ($report->photo) {
                Storage::disk('public')->delete($report->photo);
            }
            $validated['photo'] = $request->file('photo')->store('reports', 'public');
        }

        $report->update($validated);

        return redirect()->route('reports.show', $report->id)
            ->with('success', 'Laporan berhasil diperbarui');
    }
    
    public function show($id)
    {
        return Inertia::render('Reports/ReportDetail', ['reportId' => $id]);
    }
}