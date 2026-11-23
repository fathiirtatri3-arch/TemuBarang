<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Region;
use App\Services\ClaimWindowService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Papan Barang Temuan - daftar PUBLIK barang temuan yang sedang aktif
 * masa klaimnya.
 *
 * Tanpa pengumuman ini, masa klaim 30 hari jadi tidak bermakna: tidak ada
 * yang tahu barang tersebut ada, sehingga "tidak ada yang mengklaim" bukan
 * berarti tidak ada pemiliknya.
 *
 * Yang ditampilkan dijaga:
 * - Hanya laporan temuan yang sudah diverifikasi admin.
 * - Ciri khusus (rahasia), nomor seri/IMEI, dan data pribadi TIDAK pernah
 *   ikut ke halaman publik.
 * - Lokasi ditampilkan umum (nama kelurahan), bukan titik GPS presisi.
 * - Kategori berisi identitas (KTP, kartu, uang) fotonya ditampilkan buram.
 */
class PublicBoardController extends Controller
{
    /**
     * Kategori yang fotonya boleh ditampilkan publik apa adanya.
     * Kategori di luar daftar ini otomatis pakai foto buram (kalau ada).
     */
    public const PUBLIC_PHOTO_CATEGORIES = [
        'Elektronik',
        'Pakaian & Aksesoris',
        'Alat Tulis',
        'Perlengkapan Makan & Minum',
        'Dompet & Tas',
        'Kunci',
        'Perhiasan & Aksesoris',
        'Kendaraan & Aksesoris',
        'Anak & Bayi',
        'Lainnya',
    ];

    /**
     * Daftar barang temuan yang masih bisa diklaim.
     */
    public function index(Request $request)
    {
        $window = app(ClaimWindowService::class);

        $query = Report::with(['region:id,name'])
            ->where('type', 'found')
            ->whereIn('status', ['verified', 'expired'])
            ->whereNull('released_at')
            ->latest('received_at');

        // Filter kategori
        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        // Filter kelurahan
        if ($request->filled('region_id')) {
            $query->where('region_id', $request->integer('region_id'));
        }

        // Sisa hari masa klaim (hanya yang massanya masih aktif)
        if ($request->filled('remaining')) {
            $days = (int) $request->integer('remaining');
            $query->where('claim_deadline', '>=', now()->addDays($days));
        }

        $reports = $query->get()
            ->map(function (Report $report) use ($window) {
                // Masa klaim yang sudah lewat langsung ditandai Kedaluwarsa,
                // supaya papan publik tidak menampilkan sisa hari negatif
                // walau scheduler harian belum sempat jalan.
                $window->syncExpired($report);

                $days = $window->daysRemaining($report);

                return [
                    'id'             => $report->id,
                    'item_name'      => $report->item_name,
                    'category'       => $report->category,
                    'color'          => $report->color,
                    'location'       => $report->location,
                    'region'         => $report->region?->name,
                    'date'           => $report->date?->format('d M Y'),
                    'photo'          => $report->photo,
                    'photo_blurred'  => $report->isPhotoBlurred(),
                    'days_remaining' => $days !== null && $days >= 0 ? $days : null,
                    'expired'        => $report->status === 'expired',
                    'can_claim'      => $report->status === 'verified',

                    // Barang kedaluwarsa masih bisa DITEBUS pemiliknya sampai
                    // barang benar-benar dilepas. Jadi tetap ditautkan ke
                    // halaman laporan supaya pemilik bisa mengajukan klaim
                    // tebus, bukan sekadar diarahkan ke kantor kelurahan.
                    'can_redeem'     => $report->status === 'expired' && empty($report->released_at),
                ];
            })
            ->values();

        $regions = Region::where('type', 'kelurahan')->get(['id', 'name']);
        $categories = Report::where('type', 'found')->distinct()->orderBy('category')->pluck('category');

        return Inertia::render('Public/FoundBoard', [
            'reports'    => $reports,
            'regions'    => $regions,
            'categories' => $categories,
            'filters'    => [
                'category'  => $request->string('category')->toString(),
                'region_id' => $request->string('region_id')->toString(),
                'remaining' => $request->string('remaining')->toString(),
            ],
        ]);
    }
}
