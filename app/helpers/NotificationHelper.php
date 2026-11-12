<?php

namespace App\Helpers;

use App\Models\Notification;
use App\Models\Report;
use App\Models\User;
use App\Services\MatchScoreService;

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


    /**
     * Daftar admin yang bertanggung jawab atas sebuah kelurahan.
     * Jika kelurahan itu belum punya admin, jatuh ke Admin Kecamatan (super_admin).
     */
    public static function adminsOfRegion($regionId)
    {
        if ($regionId) {
            $admins = User::where('role', 'admin_kelurahan')
                ->where('region_id', $regionId)
                ->get();

            if ($admins->isNotEmpty()) {
                return $admins;
            }
        }

        return User::where('role', 'super_admin')->get();
    }

    /**
     * Kirim notifikasi ke semua admin sebuah kelurahan.
     */
    public static function sendToRegionAdmins($regionId, $title, $message, $type = 'info', $link = null)
    {
        foreach (self::adminsOfRegion($regionId) as $admin) {
            self::send($admin->id, $title, $message, $type, $link);
        }
    }

    /**
     * Kirim hanya jika notifikasi yang sama belum pernah dikirim
     * (mencegah dobel saat sebuah kecocokan dicek ulang).
     */
    private static function sendOnce($userId, $title, $message, $type, $link)
    {
        $exists = Notification::where('user_id', $userId)
            ->where('type', $type)
            ->where('link', $link)
            ->where('message', $message)
            ->exists();

        if ($exists) {
            return null;
        }

        return self::send($userId, $title, $message, $type, $link);
    }

    /**
     * Cek kecocokan untuk laporan yang BARU SAJA diverifikasi.
     * - Hanya laporan berstatus verified yang dicocokkan
     * - Lintas kelurahan (tidak dibatasi wilayah)
     * - Penerima: pemilik laporan hilang + admin kedua wilayah (info)
     */
    public static function checkAndNotifyMatches($newReport)
    {
        if ($newReport->status !== 'verified') {
            return;
        }

        $oppositeType = $newReport->type === 'lost' ? 'found' : 'lost';

        $potentialMatches = Report::with('region')
            ->where('type', $oppositeType)
            ->where('status', 'verified')
            ->where('user_id', '!=', $newReport->user_id)
            ->get();

        $newReport->loadMissing('region');

        $scorer = app(MatchScoreService::class);

        foreach ($potentialMatches as $match) {
            // Hemat waktu: skor foto maksimal bernilai 50. Kalau dengan foto 100%
            // pun skor tak mungkin mencapai ambang, lewati (tidak perlu hitung foto).
            $text = $scorer->textScore($newReport, $match);
            if (($text['score'] * 0.50) + 50 < MatchScoreService::NOTIFY_THRESHOLD) {
                continue;
            }

            // Skor yang SAMA dengan halaman Pencocokan
            $score = $scorer->score($newReport, $match)['score'];

            if ($score < MatchScoreService::NOTIFY_THRESHOLD) {
                continue;
            }

            $lost  = $newReport->type === 'lost' ? $newReport : $match;
            $found = $newReport->type === 'found' ? $newReport : $match;

            $lostRegion  = $lost->region?->name ?? '-';
            $foundRegion = $found->region?->name ?? '-';

            // 1) Pemilik laporan hilang
            self::sendOnce(
                $lost->user_id,
                '🔍 Potensi Kecocokan Ditemukan',
                "Barang temuan \"{$found->item_name}\" (Kel. {$foundRegion}) mungkin cocok dengan laporan hilang Anda \"{$lost->item_name}\" (skor {$score}%).",
                'match',
                "/reports/{$found->id}"
            );

            // 2) Admin kedua wilayah (info), satu kali per admin
            $regionIds = collect([$lost->region_id, $found->region_id])->unique();
            $adminIds = [];

            foreach ($regionIds as $regionId) {
                foreach (self::adminsOfRegion($regionId) as $admin) {
                    if (in_array($admin->id, $adminIds)) {
                        continue;
                    }
                    $adminIds[] = $admin->id;

                    self::sendOnce(
                        $admin->id,
                        '🔍 Potensi Kecocokan Antar Laporan',
                        "Laporan hilang \"{$lost->item_name}\" (Kel. {$lostRegion}) mungkin cocok dengan laporan temuan \"{$found->item_name}\" (Kel. {$foundRegion}), skor {$score}%.",
                        'match',
                        "/reports/{$found->id}"
                    );
                }
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
        
        // Nama barang (40%)
        $score += self::calculateNameScore($report1->item_name, $report2->item_name);
        
        // Kategori (30%)
        $score += self::calculateCategoryScore($report1->category, $report2->category);
        
        // Warna (20%)
        $score += self::calculateColorScore($report1->color, $report2->color);
        
        // Lokasi (10%)
        $score += self::calculateLocationScore($report1->location, $report2->location);
        
        return min($score, 100);
    }

    /**
     * Hitung skor nama barang dengan similarity + sinonim
     * Max: 40 poin
     */
    private static function calculateNameScore($name1, $name2)
    {
        if (empty($name1) || empty($name2)) return 0;
        
        $n1 = strtolower(trim($name1));
        $n2 = strtolower(trim($name2));
        
        // 1. Exact match → 40
        if ($n1 === $n2) return 40;
        
        // 2. Cek sinonim dulu (sebelum similarity)
        $synonymScore = self::checkSynonyms($n1, $n2);
        if ($synonymScore > 0) return $synonymScore;
        
        // 3. Similarity score dengan similar_text()
        similar_text($n1, $n2, $percent);
        
        if ($percent >= 80) return 40;   // Sangat mirip
        if ($percent >= 65) return 35;   // Mirip
        if ($percent >= 50) return 30;   // Cukup mirip
        if ($percent >= 35) return 20;   // Sedikit mirip
        if ($percent >= 20) return 10;   // Kemungkinan mirip
        
        // 4. Cek partial word match (kata yang sama)
        $words1 = preg_split('/\s+/', $n1);
        $words2 = preg_split('/\s+/', $n2);
        $commonWords = array_intersect($words1, $words2);
        
        // Filter kata umum yang tidak bermakna (stopword)
        $stopwords = ['di', 'dan', 'yang', 'untuk', 'dengan', 'atau', 'ke', 'dari', 'ini', 'itu'];
        $meaningfulWords = array_diff($commonWords, $stopwords);
        
        if (count($meaningfulWords) >= 1) return 15;
        
        return 0;
    }

    /**
     * Cek sinonim dari kamus
     * Max: 40 poin
     */
    private static function checkSynonyms($n1, $n2)
    {
        // Kamus sinonim nama barang (lengkap)
        $synonyms = [
            // === WADAH MINUM ===
            'tumbler' => ['botol', 'flask', 'termos', 'water bottle', 'tumbler', 'gelas', 'cup', 'mug', 'cangkir'],
            'botol' => ['tumbler', 'flask', 'termos', 'water bottle', 'gelas', 'cup'],
            'termos' => ['tumbler', 'botol', 'flask', 'water bottle'],
            'gelas' => ['cup', 'mug', 'cangkir', 'tumbler', 'botol'],
            'cup' => ['gelas', 'mug', 'cangkir', 'tumbler'],
            'mug' => ['gelas', 'cup', 'cangkir'],
            'cangkir' => ['gelas', 'cup', 'mug'],
            
            // === ELEKTRONIK ===
            'hp' => ['handphone', 'ponsel', 'smartphone', 'telepon', 'phone', 'mobile', 'seluler'],
            'handphone' => ['hp', 'ponsel', 'smartphone', 'telepon', 'phone', 'mobile'],
            'ponsel' => ['hp', 'handphone', 'smartphone', 'telepon', 'phone'],
            'smartphone' => ['hp', 'handphone', 'ponsel', 'telepon', 'phone'],
            'telepon' => ['hp', 'handphone', 'ponsel', 'smartphone', 'phone'],
            'laptop' => ['notebook', 'komputer', 'pc', 'netbook'],
            'notebook' => ['laptop', 'komputer', 'pc'],
            'komputer' => ['laptop', 'notebook', 'pc'],
            'charger' => ['pengisi', 'adaptor', 'carger', 'cas', 'power adapter'],
            'earphone' => ['headphone', 'headset', 'earbuds', 'tws', 'earphone'],
            'headphone' => ['earphone', 'headset', 'earbuds'],
            'headset' => ['earphone', 'headphone', 'earbuds'],
            'powerbank' => ['power bank', 'baterai', 'battery', 'pb'],
            'flashdisk' => ['usb', 'flash drive', 'fd', 'usb drive'],
            'mouse' => ['tetikus', 'mouse komputer'],
            'keyboard' => ['papan ketik', 'kb'],
            'speaker' => ['pengeras suara', 'sound', 'audio'],
            
            // === DOMPET & TAS ===
            'dompet' => ['wallet', 'purse', 'dompet', 'tempat uang'],
            'wallet' => ['dompet', 'purse'],
            'tas' => ['bag', 'backpack', 'ransel', 'tas punggung', 'tas selempang'],
            'bag' => ['tas', 'backpack', 'ransel'],
            'ransel' => ['tas', 'backpack', 'bag', 'tas punggung'],
            'backpack' => ['tas', 'ransel', 'bag'],
            
            // === PAKAIAN ===
            'jaket' => ['jacket', 'hoodie', 'sweater', 'coat', 'mantel'],
            'jacket' => ['jaket', 'hoodie', 'sweater'],
            'hoodie' => ['jaket', 'jacket', 'sweater'],
            'sweater' => ['jaket', 'jacket', 'hoodie'],
            'baju' => ['kaos', 'kemeja', 'shirt', 't-shirt', 'pakaian'],
            'kaos' => ['baju', 't-shirt', 'shirt', 'kemeja'],
            'kemeja' => ['baju', 'shirt', 'kaos'],
            'celana' => ['pants', 'jeans', 'trousers'],
            'jeans' => ['celana', 'pants'],
            'sepatu' => ['shoes', 'sneakers', 'sandal', 'sandal jepit'],
            'sneakers' => ['sepatu', 'shoes'],
            'sandal' => ['sepatu', 'shoes', 'sandal jepit'],
            'topi' => ['hat', 'cap', 'songkok'],
            'hat' => ['topi', 'cap'],
            'cap' => ['topi', 'hat'],
            
            // === ALAT TULIS ===
            'pulpen' => ['pen', 'bolpoin', 'ballpoint', 'p pena'],
            'pen' => ['pulpen', 'bolpoin', 'ballpoint'],
            'pensil' => ['pencil', 'pensil mekanik', 'pensil 2b'],
            'pencil' => ['pensil'],
            'buku' => ['book', 'notes', 'notebook', 'buku tulis'],
            'book' => ['buku', 'notes'],
            'penghapus' => ['eraser', 'rubber', 'karet penghapus'],
            'eraser' => ['penghapus', 'rubber'],
            'penggaris' => ['ruler', 'garisan'],
            'ruler' => ['penggaris'],
            'tas pensil' => ['tempat pensil', 'pencil case', 'kotak pensil'],
            
            // === KUNCI & IDENTITAS ===
            'kunci' => ['key', 'anak kunci', 'kunci motor', 'kunci rumah'],
            'key' => ['kunci'],
            'dompet' => ['wallet', 'purse'],
            'kartu pelajar' => ['kartu siswa', 'kartu identitas', 'id card', 'student card'],
            'ktp' => ['kartu tanda penduduk', 'id card', 'kartu identitas'],
            'sim' => ['surat izin mengemudi', 'driver license'],
            'stnk' => ['surat tanda nomor kendaraan'],
            
            // === PERHIASAN ===
            'cincin' => ['ring', 'cincin kawin', 'cincin emas'],
            'ring' => ['cincin'],
            'kalung' => ['necklace', 'liontin', 'gelang leher'],
            'necklace' => ['kalung'],
            'gelang' => ['bracelet', 'bangle'],
            'bracelet' => ['gelang'],
            'anting' => ['earring', 'subang'],
            'earring' => ['anting', 'subang'],
            'jam tangan' => ['watch', 'arloji', 'jam'],
            'watch' => ['jam tangan', 'arloji'],
            
            // === KENDARAAN ===
            'helm' => ['helmet', 'topi motor'],
            'helmet' => ['helm'],
            'motor' => ['sepeda motor', 'motorbike', 'motorcycle'],
            'sepeda' => ['bike', 'bicycle', 'onthel'],
            'bike' => ['sepeda', 'bicycle'],
            
            // === ANAK & BAYI ===
            'botol susu' => ['dot', 'botol bayi', 'milk bottle'],
            'stroller' => ['kereta bayi', 'bayi', 'pram'],
            'mainan' => ['toy', 'mainan anak'],
            'toy' => ['mainan'],
            'diaper' => ['popok', 'pampers'],
            'popok' => ['diaper', 'pampers'],
            
            // === MAKANAN & MINUMAN ===
            'makanan' => ['food', 'bekal', 'lunch box'],
            'minuman' => ['drink', 'beverage', 'air minum'],
            'kotak makan' => ['lunch box', 'bekal', 'tempat makan'],
            'lunch box' => ['kotak makan', 'bekal', 'tempat makan'],
            
            // === KESEHATAN ===
            'masker' => ['mask', 'masker medis', 'masker kain'],
            'mask' => ['masker'],
            'hand sanitizer' => ['pembersih tangan', 'sanitizer', 'handsan'],
            'obat' => ['medicine', 'vitamin', 'suplemen'],
            
            // === LAINNYA ===
            'payung' => ['umbrella', 'payung lipat'],
            'umbrella' => ['payung'],
            'kacamata' => ['glasses', 'eyeglasses', 'spectacles'],
            'glasses' => ['kacamata'],
            'kotak pensil' => ['tempat pensil', 'pencil case'],
            'pencil case' => ['kotak pensil', 'tempat pensil'],
        ];
        
        // Cek setiap sinonim
        foreach ($synonyms as $key => $syns) {
            // Cek apakah n1 atau n2 mengandung key atau sinonim
            $n1HasKey = str_contains($n1, $key);
            $n2HasKey = str_contains($n2, $key);
            
            // Cek apakah n1/n2 mengandung salah satu sinonim
            $n1HasSyn = false;
            $n2HasSyn = false;
            foreach ($syns as $syn) {
                if (str_contains($n1, $syn)) $n1HasSyn = true;
                if (str_contains($n2, $syn)) $n2HasSyn = true;
            }
            
            // Jika salah satu mengandung key dan yang lain mengandung sinonim
            if (($n1HasKey && $n2HasSyn) || ($n2HasKey && $n1HasSyn)) {
                return 40; // Sinonim = cocok penuh
            }
            
            // Jika keduanya mengandung sinonim dari key yang sama
            if ($n1HasSyn && $n2HasSyn) {
                return 40;
            }
        }
        
        return 0;
    }

    /**
     * Hitung skor kategori dengan partial match
     * Max: 30 poin
     */
    private static function calculateCategoryScore($cat1, $cat2)
    {
        if (empty($cat1) || empty($cat2)) return 0;
        
        $c1 = self::normalizeCategory($cat1);
        $c2 = self::normalizeCategory($cat2);
        
        // Exact match
        if ($c1 === $c2) return 30;
        
        // Similarity
        similar_text(strtolower($c1), strtolower($c2), $percent);
        if ($percent >= 60) return 20;
        if ($percent >= 40) return 10;
        
        // Kategori terkait
        $relatedCategories = [
            'Elektronik' => ['Kartu & Identitas', 'Kendaraan & Aksesoris'],
            'Perlengkapan Makan & Minum' => ['Dompet & Tas', 'Anak & Bayi'],
            'Pakaian & Aksesoris' => ['Perhiasan & Aksesoris', 'Anak & Bayi'],
            'Kunci' => ['Kendaraan & Aksesoris', 'Dokumen & Surat'],
            'Dokumen & Surat' => ['Kartu & Identitas', 'Kunci'],
        ];
        
        foreach ($relatedCategories as $key => $related) {
            if (($c1 === $key && in_array($c2, $related)) || 
                ($c2 === $key && in_array($c1, $related))) {
                return 15;
            }
        }
        
        return 0;
    }

    /**
     * Hitung skor warna dengan color family
     * Max: 20 poin
     */
    private static function calculateColorScore($color1, $color2)
    {
        if (empty($color1) || empty($color2)) return 0;
        
        $c1 = strtolower(trim($color1));
        $c2 = strtolower(trim($color2));
        
        // Exact match
        if ($c1 === $c2) return 20;
        
        // Partial (biru vs biru tua)
        if (str_contains($c1, $c2) || str_contains($c2, $c1)) return 20;
        
        // Color family
        $colorFamilies = [
            'biru' => ['navy', 'cyan', 'biru muda', 'biru tua', 'tosca', 'light blue', 'dark blue', 'blue'],
            'merah' => ['maroon', 'pink', 'merah muda', 'merah tua', 'magenta', 'red'],
            'hijau' => ['green', 'mint', 'hijau muda', 'hijau tua', 'olive'],
            'kuning' => ['gold', 'yellow', 'kuning muda', 'kuning tua'],
            'hitam' => ['black', 'abu tua'],
            'putih' => ['white', 'abu muda', 'cream'],
            'abu' => ['gray', 'grey', 'silver', 'abu-abu'],
            'coklat' => ['brown', 'cokelat', 'tan'],
            'ungu' => ['purple', 'violet', 'lavender'],
            'orange' => ['oranye', 'jingga'],
        ];
        
        foreach ($colorFamilies as $family => $members) {
            $inFamily1 = ($c1 === $family || in_array($c1, $members) || str_contains($c1, $family));
            $inFamily2 = ($c2 === $family || in_array($c2, $members) || str_contains($c2, $family));
            
            if ($inFamily1 && $inFamily2) {
                return 15; // Satu keluarga warna
            }
        }
        
        return 0;
    }

    /**
     * Hitung skor lokasi dengan normalisasi
     * Max: 10 poin
     */
    private static function calculateLocationScore($loc1, $loc2)
    {
        if (empty($loc1) || empty($loc2)) return 0;
        
        $l1 = strtolower(trim($loc1));
        $l2 = strtolower(trim($loc2));
        
        // Normalisasi
        $normalize = function($str) {
            $str = str_replace(['jl.', 'jl ', 'jalan ', 'jln.'], 'jl ', $str);
            $str = str_replace(['no.', 'no '], 'no ', $str);
            $str = str_replace(['gg.', 'gg '], 'gang ', $str);
            return preg_replace('/\s+/', ' ', trim($str));
        };
        
        $n1 = $normalize($l1);
        $n2 = $normalize($l2);
        
        // Exact match setelah normalisasi
        if ($n1 === $n2) return 10;
        
        // Partial match
        similar_text($n1, $n2, $percent);
        if ($percent >= 60) return 10;
        if ($percent >= 40) return 7;
        if ($percent >= 20) return 3;
        
        // Keyword match
        $stopwords = ['di', 'dan', 'yang', 'untuk', 'ke', 'dari', 'ini', 'itu', 'jl', 'no', 'gang'];
        $words1 = array_diff(explode(' ', $n1), $stopwords);
        $words2 = array_diff(explode(' ', $n2), $stopwords);
        $commonWords = array_intersect($words1, $words2);
        
        if (count($commonWords) >= 2) return 7;
        if (count($commonWords) >= 1) return 3;
        
        return 0;
    }
}