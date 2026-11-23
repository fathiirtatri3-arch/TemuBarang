<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\NotificationHelper;
use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\ReportFollowup;
use App\Services\ClaimWindowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Tindak lanjut barang temuan yang masa klaimnya habis.
 *
 * Admin mencatat berita acara: barang dilepas ke siapa,QI dengan alasan apa,
 * siapa saksinya, dan bukti fotonya. Setelah dicatat, barang dianggap sudah
 * dilepas dan data sensitif laporan dihapus.
 */
class ReportFollowupController extends Controller
{
    public function __construct(
        private ClaimWindowService $window
    ) {
    }

    /**
     * Halaman berita acara.
     */
    public function show(int $id)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Hanya admin yang bisa mengakses');
        }

        $report = Report::with(['user:id,name,role', 'region', 'followups.creator:id,name'])
            ->findOrFail($id);

        if (!$user->canManageRegion($report->region_id)) {
            abort(403, 'Laporan ini berada di luar wilayah Anda');
        }

        return Inertia::render('Admin/ReportFollowup', [
            'report' => $report,
            'followups' => $report->followups,
            'actionOptions' => $this->window->actionOptions(),
            'recommendedAction' => $this->window->recommendedAction($report),
            'daysRemaining' => $this->window->daysRemaining($report),
            'isExpired' => $report->status === 'expired',
            'minimumWitnesses' => (int) config('temubarang.minimum_witnesses'),
            'activeClaims' => \App\Models\Claim::where('report_id', $report->id)
                ->whereIn('status', ['pending', 'approved'])
                ->count(),
        ]);
    }

    /**
     * Simpan berita acara + lepas barang.
     */
    public function store(Request $request, int $id)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Hanya admin yang bisa mengakses');
        }

        $report = Report::findOrFail($id);

        if (!$user->canManageRegion($report->region_id)) {
            abort(403, 'Laporan ini berada di luar wilayah Anda');
        }

        if (!in_array($report->status, ['expired', 'verified'], true)) {
            return redirect()->back()->with('error', 'Laporan ini tidak bisa ditindaklanjuti.');
        }

        if (!empty($report->released_at)) {
            return redirect()->back()->with('error', 'Barang pada laporan ini sudah pernah dilepas.');
        }

        // Jangan lepas barang yang sedang ada klaimnya (pending/disetujui).
        // Kalau ada, klaim itu yang harus diselesaikan lebih dulu.
        $activeClaims = \App\Models\Claim::where('report_id', $report->id)
            ->whereIn('status', ['pending', 'approved'])
            ->count();

        if ($activeClaims > 0) {
            return redirect()->back()->with(
                'error',
                "Barang ini masih ada {$activeClaims} klaim yang belum selesai. Selesaikan klaimnya dulu sebelum melepas barang."
            );
        }

        $validated = $request->validate([
            'action' => 'required|in:return_to_issuer,hand_to_authority,donated,destroyed',
            'document_no' => 'nullable|string|max:100',
            'recipient_name' => 'nullable|string|max:150',
            'recipient_org' => 'nullable|string|max:150',
            'recipient_contact' => 'nullable|string|max:100',
            'recipient_id_number' => 'nullable|string|max:100',
            'witness_name' => 'required|string|max:150',
            'witness_name_2' => 'nullable|string|max:150',
            'witness_phone' => 'nullable|string|max:30',
            'note' => 'required|string|min:10|max:1000',
            'photo' => 'nullable|image|max:2048',
        ], [
            'action.required' => 'Pilih jenis tindak lanjut.',
            'witness_name.required' => 'Nama saksi wajib diisi. Barang tidak bisa dilepas tanpa saksi.',
            'note.required' => 'Keterangan berita acara wajib diisi.',
            'note.min' => 'Keterangan minimal 10 karakter.',
        ]);

        // Barang yang bukan dimusnahkan WAJIB punya penerima
        if ($validated['action'] !== 'destroyed') {
            if (empty($validated['recipient_name'])) {
                return back()->withErrors([
                    'recipient_name' => 'Nama penerima barang wajib diisi.',
                ]);
            }
            if (empty($validated['recipient_org'])) {
                return back()->withErrors([
                    'recipient_org' => 'Instansi / lembaga penerima wajib diisi.',
                ]);
            }
        }

        // Saksi minimal
        $minWitnesses = (int) config('temubarang.minimum_witnesses');
        if ($minWitnesses >= 1 && empty($validated['witness_name'])) {
            return back()->withErrors(['witness_name' => 'Minimal satu saksi wajib dicatat.']);
        }
        if ($minWitnesses >= 2 && empty($validated['witness_name_2'])) {
            return back()->withErrors(['witness_name_2' => 'Minimal dua saksi wajib dicatat.']);
        }

        // Bukti foto
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('followups', 'public');
        }

        $followup = ReportFollowup::create([
            'report_id'          => $report->id,
            'action'             => $validated['action'],
            'document_no'        => $validated['document_no'] ?? null,
            'recipient_name'     => $validated['recipient_name'] ?? null,
            'recipient_org'      => $validated['recipient_org'] ?? null,
            'recipient_contact'  => $validated['recipient_contact'] ?? null,
            'recipient_id_number'=> $validated['recipient_id_number'] ?? null,
            'witness_name'       => $validated['witness_name'],
            'witness_name_2'     => $validated['witness_name_2'] ?? null,
            'witness_phone'      => $validated['witness_phone'] ?? null,
            'note'               => $validated['note'],
            'photo'              => $photoPath,
            'created_by'         => $user->id,
            'executed_at'        => now(),
        ]);

        // Barang dianggap sudah dilepas + data sensitif dihapus
        $this->window->markReleased($report, $validated['action'], $user->id);

        $label = ClaimWindowService::ACTION_LABELS[$validated['action']] ?? $validated['action'];

        // Beri tahu penemu & pemilik laporan hilang yang terkait
        $recipientLabel = $validated['recipient_name'] ?? 'saksi';
        $orgLabel = $validated['recipient_org'] ?? '';

        if ($report->user_id) {
            NotificationHelper::send(
                $report->user_id,
                '📦 Barang Temuan Anda Sudah Ditindaklanjuti',
                "Barang temuan \"{$report->item_name}\" sudah ditindaklanjuti dengan status: {$label}. " .
                "Barang diserahkan kepada {$recipientLabel}" . ($orgLabel ? " ({$orgLabel})" : '') . ". " .
                "Terima kasih atas kejujuran Anda. Data sensitif laporan telah dihapus dari sistem.",
                'info',
                "/reports/{$report->id}"
            );
        }

        return redirect()
            ->route('reports.show', $report->id)
            ->with('success', "Berita acara berhasil dicatat. Barang ditandai sudah dilepas ({$label}).");
    }
}
