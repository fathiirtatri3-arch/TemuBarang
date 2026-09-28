<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $user = auth()->user();
        
        if ($user->role === 'admin') {
            // Admin melihat semua laporan
            $total = Report::count();
            $pending = Report::where('status', 'pending')->count();
            $resolved = Report::where('status', 'resolved')->count();
        } else {
            // Siswa hanya melihat laporannya sendiri
            $total = Report::where('user_id', $user->id)->count();
            $pending = Report::where('user_id', $user->id)->where('status', 'pending')->count();
            $resolved = Report::where('user_id', $user->id)->where('status', 'resolved')->count();
        }
        
        return response()->json([
            'total_reports' => $total,
            'pending_reports' => $pending,
            'resolved_reports' => $resolved,
        ]);
    }
    
    public function recentReports()
    {
        $user = auth()->user();
        
        if ($user->role === 'admin') {
            $reports = Report::with('user')
                ->latest()
                ->take(5)
                ->get();
        } else {
            $reports = Report::where('user_id', $user->id)
                ->latest()
                ->take(5)
                ->get();
        }
        
        return response()->json($reports);
    }
}