<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Helpers\BadWords;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with('user');
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('search')) {
            $query->where('item_name', 'like', '%' . $request->search . '%');
        }
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }
        
        $reports = $query->latest()->paginate(10);
        
        return redirect()->route('reports.index')->with('success', 'Laporan berhasil dibuat!');
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:lost,found',
            'item_name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:50',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'photo' => 'nullable|image|max:2048',
        ]);
        
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('reports', 'public');
            $validated['photo'] = $path;
        }
        
        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';
        
        $report = Report::create($validated);
        
        return response()->json($report, 201);
    }
    
    public function show(Report $report)
    {
        $report->load('user');
        return response()->json($report);
    }
    
    public function update(Request $request, Report $report)
    {
        if (auth()->user()->role !== 'admin' && auth()->id() !== $report->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

         // ⭐ CEK KATA KASAR ⭐
        if (BadWords::contains($request->item_name)) {
            return response()->json(['message' => 'Nama barang mengandung kata yang tidak diperbolehkan.'], 422);
        }
        
        if (BadWords::contains($request->description)) {
            return back()->withErrors(['description' => 'Deskripsi mengandung kata yang tidak diperbolehkan.']);
        }
        
        if (auth()->user()->role === 'admin') {
            $validated = $request->validate([
                'status' => 'sometimes|in:pending,verified,matched,resolved,rejected',
            ]);
            $report->update($validated);
        } else {
            $validated = $request->validate([
                'item_name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'color' => 'nullable|string|max:50',
                'location' => 'sometimes|string|max:255',
            ]);
            $report->update($validated);
        }

        
        
        return response()->json($report);
    }
    
    public function destroy(Report $report)
    {
        if (auth()->user()->role !== 'admin' && auth()->id() !== $report->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        if ($report->photo) {
            Storage::disk('public')->delete($report->photo);
        }
        
        $report->delete();
        
        return response()->json(['message' => 'Report deleted']);
    }
    
    public function userReports()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }
        
        $reports = $user->reports()->latest()->paginate(10);
        
        return response()->json($reports);
    }

    public function verify(Request $request, Report $report)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'status' => 'required|in:verified,resolved,rejected',
        ]);
        
        $report->update($validated);
        
        return response()->json(['message' => 'Status updated']);
    }
}