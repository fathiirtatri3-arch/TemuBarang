<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        $query->where('id', '!=', auth()->id());
        
        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }
        
        // Filter role
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }
        
        $users = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at->toISOString(),
                    'created_at_human' => $user->created_at->diffForHumans(),
                    'report_count' => $user->reports()->count(),
                ];
            });
        
        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }
    
    public function show($id)
    {
        $user = User::with(['reports' => function ($query) {
            $query->latest()->take(10);
        }])->findOrFail($id);
        
        $stats = [
            'total_reports' => $user->reports()->count(),
            'lost_reports' => $user->reports()->where('type', 'lost')->count(),
            'found_reports' => $user->reports()->where('type', 'found')->count(),
            'pending_reports' => $user->reports()->where('status', 'pending')->count(),
            'verified_reports' => $user->reports()->where('status', 'verified')->count(),
            'resolved_reports' => $user->reports()->where('status', 'resolved')->count(),
        ];
        
        return Inertia::render('Admin/UserDetail', [
            'user' => $user,
            'stats' => $stats,
            'recentReports' => $user->reports()->latest()->take(10)->get(),
        ]);
    }
    
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'role' => 'required|in:user,admin_kelurahan,super_admin',
        ]);
        
        // Jangan biarkan admin mengubah role sendiri
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak bisa mengubah role sendiri.');
        }
        
        $user->update(['role' => $request->role]);
        
        return back()->with('success', "Role user berhasil diubah menjadi {$request->role}.");
    }
    
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Jangan biarkan admin menghapus diri sendiri
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak bisa menghapus akun sendiri.');
        }
        
        // Hapus laporan user beserta fotonya
        foreach ($user->reports as $report) {
            if ($report->photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($report->photo);
            }
            $report->delete();
        }
        
        $user->delete();
        
        return redirect()->route('admin.users')->with('success', 'User berhasil dihapus.');
    }
}