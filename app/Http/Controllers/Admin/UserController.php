<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\Region;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Hanya Admin Kecamatan (super_admin) yang boleh mengelola pengguna.
     */
    private function requireSuperAdmin(): void
    {
        if (!auth()->user()?->isSuperAdmin()) {
            abort(403, 'Hanya Admin Kecamatan yang dapat mengelola pengguna.');
        }
    }

    /**
     * Boleh melihat profil user ini?
     * - Admin Kecamatan: semua
     * - Admin Kelurahan: dirinya sendiri, user yang punya laporan di wilayahnya,
     *   atau user yang terlibat klaim yang menyentuh wilayahnya
     */
    private function canViewUser(User $viewer, User $target): bool
    {
        if ($viewer->isSuperAdmin()) {
            return true;
        }

        if (!$viewer->isAdminKelurahan() || !$viewer->region_id) {
            return false;
        }

        if ($viewer->id === $target->id) {
            return true;
        }

        $regionId = $viewer->region_id;

        $hasReportInRegion = Report::where('user_id', $target->id)
            ->where('region_id', $regionId)
            ->exists();

        if ($hasReportInRegion) {
            return true;
        }

        return Claim::where(function ($q) use ($target) {
                $q->where('claimant_id', $target->id)
                  ->orWhere('owner_id', $target->id);
            })
            ->where(function ($q) use ($regionId) {
                $q->whereHas('report', fn ($r) => $r->where('region_id', $regionId))
                  ->orWhereHas('lostReport', fn ($r) => $r->where('region_id', $regionId));
            })
            ->exists();
    }

    public function index(Request $request)
    {
        $this->requireSuperAdmin();

        $query = User::query()
            ->withCount('reports')
            ->with('region:id,name')
            ->where('id', '!=', auth()->id());

        // Search (dikelompokkan supaya tidak merusak filter lain)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter role
        if ($request->filled('role') && $request->role !== 'all') {
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
                    'region_id' => $user->region_id,
                    'region_name' => $user->region?->name,
                    'created_at' => $user->created_at->toISOString(),
                    'created_at_human' => $user->created_at->diffForHumans(),
                    'report_count' => $user->reports_count,
                ];
            });

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'regions' => Region::where('type', 'kelurahan')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function show($id)
    {
        $viewer = auth()->user();
        $user = User::with('region:id,name')->findOrFail($id);

        if (!$this->canViewUser($viewer, $user)) {
            abort(403, 'Pengguna ini berada di luar wilayah Anda.');
        }

        // Admin kelurahan hanya melihat laporan di wilayahnya
        $scope = fn ($q) => $viewer->isSuperAdmin() ? $q : $q->where('region_id', $viewer->region_id);

        $stats = [
            'total_reports' => $scope($user->reports())->count(),
            'lost_reports' => $scope($user->reports())->where('type', 'lost')->count(),
            'found_reports' => $scope($user->reports())->where('type', 'found')->count(),
            'pending_reports' => $scope($user->reports())->where('status', 'pending')->count(),
            'verified_reports' => $scope($user->reports())->where('status', 'verified')->count(),
            'resolved_reports' => $scope($user->reports())->where('status', 'resolved')->count(),
        ];

        $recentReports = $scope($user->reports())->latest()->take(10)->get();
        $user->setRelation('reports', $recentReports);

        return Inertia::render('Admin/UserDetail', [
            'user' => $user,
            'stats' => $stats,
            'recentReports' => $recentReports,
        ]);
    }

    public function updateRole(Request $request, $id)
    {
        $this->requireSuperAdmin();

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|in:user,admin_kelurahan',
            'region_id' => [
                'required_if:role,admin_kelurahan',
                'nullable',
                Rule::exists('regions', 'id')->where('type', 'kelurahan'),
            ],
        ], [
            'region_id.required_if' => 'Pilih kelurahan untuk admin ini.',
            'region_id.exists' => 'Kelurahan tidak valid.',
        ]);

        // Jangan biarkan admin mengubah role sendiri
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak bisa mengubah role sendiri.');
        }

        // Role Admin Kecamatan tidak diubah dari sini
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Role Admin Kecamatan tidak dapat diubah dari sini.');
        }

        $data = ['role' => $validated['role']];

        if ($validated['role'] === 'admin_kelurahan') {
            $data['region_id'] = $validated['region_id'];
        }

        $user->update($data);

        $label = $validated['role'] === 'admin_kelurahan' ? 'Admin Kelurahan' : 'Warga';

        return back()->with('success', "Role {$user->name} berhasil diubah menjadi {$label}.");
    }

    public function destroy($id)
    {
        $this->requireSuperAdmin();

        $user = User::findOrFail($id);

        // Jangan biarkan admin menghapus diri sendiri
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak bisa menghapus akun sendiri.');
        }

        // Akun Admin Kecamatan tidak boleh dihapus dari sini
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Akun Admin Kecamatan tidak dapat dihapus.');
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