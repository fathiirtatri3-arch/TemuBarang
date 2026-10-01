<?php

namespace App\Helpers;

use App\Models\Notification;
use App\Models\Report;

class NotificationHelper
{
    public static function send($userId, $title, $message, $type = 'info', $link = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'link' => $link,
            'is_read' => false,
        ]);
    }


    // Fungsi untuk memeriksa kecocokan dan mengirim notifikasi jika ditemukan
    public static function checkAndNotifyMatches($newReport)
    {
        // Cari laporan yang berlawanan tipe (lost vs found)
        $oppositeType = $newReport->type === 'lost' ? 'found' : 'lost';
        
        // Cari laporan yang sudah terverifikasi dan berlawanan tipe
        $potentialMatches = Report::where('type', $oppositeType)
            ->where('status', 'verified')
            ->where('user_id', '!=', $newReport->user_id)
            ->get();
        
        foreach ($potentialMatches as $match) {
            $score = self::calculateMatchScore($newReport, $match);
            
            // Jika skor di atas 60%, kirim notifikasi ke kedua user
            if ($score >= 60) {
                // Notifikasi ke pemilik laporan baru
                self::send(
                    $newReport->user_id,
                    '🔍 Potensi Kecocokan Ditemukan',
                    "Ada laporan {$oppositeType} \"{$match->item_name}\" yang mungkin cocok dengan laporan Anda (skor {$score}%).",
                    'match',
                    "/reports/{$match->id}"
                );
                
                // Notifikasi ke pemilik laporan lama
                self::send(
                    $match->user_id,
                    '🔍 Potensi Kecocokan Ditemukan',
                    "Ada laporan baru \"{$newReport->item_name}\" yang mungkin cocok dengan laporan Anda (skor {$score}%).",
                    'match',
                    "/reports/{$newReport->id}"
                );
            }
        }
    }

    /**
     * Normalisasi kategori lama ke kategori baru
     * Berguna untuk data lama yang masih pakai kategori versi sekolah
     */
    private static function normalizeCategory($category)
    {
        $mapping = [
            // Kategori lama → Kategori baru
            'Botol & Tempat Minum' => 'Perlengkapan Makan & Minum',
            'Kartu (Pelajar/ATM)'  => 'Kartu & Identitas',
            'Perhiasan'            => 'Perhiasan & Aksesoris',
        ];

        return $mapping[$category] ?? $category;
    }
    
    private static function calculateMatchScore($report1, $report2)
    {
        $score = 0;
        
        if (str_contains(strtolower($report1->item_name), strtolower($report2->item_name)) ||
            str_contains(strtolower($report2->item_name), strtolower($report1->item_name))) {
            $score += 40;
        }
        
        // Kategori cocok (30%) — dengan normalisasi
        $cat1 = self::normalizeCategory($report1->category);
        $cat2 = self::normalizeCategory($report2->category);

        if ($cat1 === $cat2) {
            $score += 30;
        }
        
        if (!empty($report1->color) && !empty($report2->color) && 
            str_contains(strtolower($report1->color), strtolower($report2->color))) {
            $score += 20;
        }
        
        if ($report1->location === $report2->location) {
            $score += 10;
        }
        
        return min($score, 100);
    }
}