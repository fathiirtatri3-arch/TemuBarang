<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\ApiResponseTrait;

class AdditionalApiController extends Controller
{
    use ApiResponseTrait;  // ⡅ Gunakan trait di sini

    /**
     * GET /api/categories
     * Mengembalikan daftar kategori barang
     */
    public function categories()
    {
        $categories = [
            'Elektronik',
            'Dokumen & Surat',
            'Pakaian & Aksesoris',
            'Alat Tulis',
            'Perlengkapan Makan & Minum',
            'Dompet & Tas',
            'Kartu & Identitas',
            'Kunci',
            'Perhiasan & Aksesoris',
            'Kendaraan & Aksesoris',
            'Anak & Bayi',
            'Uang',
            'Lainnya',
        ];

        return $this->success($categories);
    }

    /**
     * GET /api/recommendations
     * Mengembalikan rekomendasi kecocokan untuk user yang login
     */
    public function recommendations()
    {
        $user = Auth::user();
        
        if (!$user) {
            return $this->error('Unauthorized', 401);  // ⭐ UBAH INI
        }

        // Ambil semua laporan milik user
        $userReports = Report::where('user_id', $user->id)
            ->where('status', 'verified')
            ->get();
        
        $recommendations = [];
        
        foreach ($userReports as $userReport) {
            // Cari laporan yang berlawanan tipe (lost vs found)
            $oppositeType = $userReport->type === 'lost' ? 'found' : 'lost';
            
            $potentialMatches = Report::where('type', $oppositeType)
                ->where('status', 'verified')
                ->where('user_id', '!=', $user->id)
                ->get();
            
            foreach ($potentialMatches as $match) {
                // Hitung skor kecocokan sederhana
                $score = $this->calculateSimpleMatch($userReport, $match);
                
                if ($score >= 50) { // Minimal 50% untuk direkomendasikan
                    $recommendations[] = [
                        'user_report_id' => $userReport->id,
                        'user_report_name' => $userReport->item_name,
                        'matched_report_id' => $match->id,
                        'matched_report_name' => $match->item_name,
                        'matched_report_type' => $match->type,
                        'match_score' => $score,
                        'matched_photo' => $match->photo,
                        'created_at' => $match->created_at
                    ];
                }
            }
        }
        
        // Urutkan berdasarkan skor tertinggi, batasi 5 rekomendasi
        $recommendations = collect($recommendations)
            ->sortByDesc('match_score')
            ->take(5)
            ->values();
        
        return $this->success($recommendations);  // ⭐ UBAH INI
    }

    /**
     * GET /api/activities
     * Mengembalikan aktivitas terkini (notifikasi + update terbaru)
     */
    public function activities()
    {
        $user = Auth::user();
        
        if (!$user) {
            return $this->error('Unauthorized', 401);  // ⭐ UBAH INI
        }
        
        $activities = [];
        
        // 1. Ambil notifikasi dari tabel notifications
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        foreach ($notifications as $notif) {
            $activities[] = [
                'id' => $notif->id,
                'type' => 'notification',
                'title' => $notif->title,
                'message' => $notif->message,
                'is_read' => $notif->is_read,
                'created_at' => $notif->created_at->diffForHumans(),
                'raw_date' => $notif->created_at
            ];
        }
        
        // 2. Ambil update status laporan terbaru dari user
        $recentReports = Report::where('user_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->take(3)
            ->get();
        
        foreach ($recentReports as $report) {
            if ($report->status === 'resolved') {
                $message = "Laporan \"{$report->item_name}\" telah selesai (resolved). Selamat!";
            } elseif ($report->status === 'verified') {
                $message = "Laporan \"{$report->item_name}\" telah diverifikasi oleh admin.";
            } else {
                $message = "Laporan \"{$report->item_name}\" statusnya: " . ucfirst($report->status);
            }
            
            $activities[] = [
                'id' => $report->id,
                'type' => 'report_update',
                'title' => 'Update Laporan',
                'message' => $message,
                'status' => $report->status,
                'created_at' => $report->updated_at->diffForHumans(),
                'raw_date' => $report->updated_at
            ];
        }
        
        // Gabungkan dan urutkan berdasarkan tanggal
        $activities = collect($activities)
            ->sortByDesc('raw_date')
            ->take(10)
            ->values()
            ->map(function ($item) {
                unset($item['raw_date']);
                return $item;
            });
        
        return $this->success($activities);  // ⭐ UBAH INI
    }

    /**
     * Normalisasi kategori lama ke kategori baru
     * Berguna untuk data lama yang masih pakai kategori versi sekolah
     */
    private function normalizeCategory($category)
    {
        $mapping = [
            // Kategori lama → Kategori baru
            'Botol & Tempat Minum' => 'Perlengkapan Makan & Minum',
            'Kartu (Pelajar/ATM)'  => 'Kartu & Identitas',
            'Perhiasan'            => 'Perhiasan & Aksesoris',
        ];

        return $mapping[$category] ?? $category;
    }
    
    /**
     * Fungsi helper untuk menghitung skor kecocokan sederhana
     */
    private function calculateSimpleMatch($report1, $report2)
    {
        $score = 0;
        
        // Nama barang cocok (40%)
        if (str_contains(strtolower($report1->item_name), strtolower($report2->item_name)) ||
            str_contains(strtolower($report2->item_name), strtolower($report1->item_name))) {
            $score += 40;
        }
        
       // Kategori cocok (30%) — dengan normalisasi
        $cat1 = $this->normalizeCategory($report1->category);
        $cat2 = $this->normalizeCategory($report2->category);

        if ($cat1 === $cat2) {
            $score += 30;
        }
        
        // Warna cocok (20%)
        if (!empty($report1->color) && !empty($report2->color) && 
            str_contains(strtolower($report1->color), strtolower($report2->color))) {
            $score += 20;
        }
        
        // Lokasi sama (10%)
        if ($report1->location === $report2->location) {
            $score += 10;
        }
        
        return min($score, 100);
    }
}