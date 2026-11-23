<?php

namespace App\Services;

use App\Models\Report;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

/**
 * Siklus hidup barang temuan: masa klaim, kedaluwarsa, dan tindak lanjut.
 *
 * Konsepnya mengikuti pola gudang kepabeanan:
 *
 *   Hari 1..30  MASA KLAIM AKTIF
 *               Barang disimpan di kantor kelurahan, pemilik bisa mengklaim.
 *   Hari ~25    PERINGATAN ke admin + penemu.
 *   Hari 30     MASA KLAIM DITUTUP -> status "Kedaluwarsa".
 *               Barang BELUM dianggap hilang dan BELUM milik siapa pun.
 *               Pemilik masih bisa MENEBUS sampai barang benar-benar dilepas.
 *   Setelah itu TINDAK LANJUT -> berita acara -> barang dilepas ->
 *               data sensitif dihapus -> tersisa arsip ringkas.
 *
 * Penting: tidak ada status "milik negara" dan tidak ada status "hilang".
 */
class ClaimWindowService
{
    /**
     * Rekomendasi tindak lanjut per kategori barang.
     *
     * Ini hanya SARAN yang ditampilkan ke admin. Admin tetap yang memutuskan,
     * dan pilihan yang ia ambil dicatat pada berita acara.
     * - Kartu & identitas / dokumen    -> dikembalikan ke penerbitnya
     * - Elektronik / uang / dompet      -> diserahkan ke instansi berwenang
     * - Barang bernilai rendah          -> dihibahkan ke lembaga sosial
     * - Barang rusak / ada data pribadi -> dimusnahkan dengan saksi
     */
    public const RECOMMENDED_ACTIONS = [
        'Kartu & Identitas'   => 'return_to_issuer',
        'Dokumen & Surat'     => 'return_to_issuer',
        'Uang'                => 'hand_to_authority',
        'Elektronik'          => 'hand_to_authority',
        'Dompet & Tas'        => 'hand_to_authority',
        'Kendaraan & Aksesoris' => 'hand_to_authority',
        'Perhiasan & Aksesoris' => 'hand_to_authority',
        'Pakaian & Aksesoris' => 'donated',
        'Perlengkapan Makan & Minum' => 'donated',
        'Alat Tulis'          => 'donated',
        'Kunci'               => 'donated',
        'Anak & Bayi'         => 'donated',
        'Lainnya'             => 'donated',
    ];

    /**
     * Label yang bisa ditampilkan ke pengguna.
     */
    public const ACTION_LABELS = [
        'return_to_issuer'  => 'Dikembalikan ke penerbit',
        'hand_to_authority' => 'Diserahkan ke instansi berwenang',
        'donated'           => 'Dihibahkan ke lembaga sosial',
        'destroyed'         => 'Dimusnahkan dengan saksi',
    ];

    /**
     * Penjelasan singkat tiap tindakan (dipakai di tooltip / hints).
     */
    public const ACTION_HINTS = [
        'return_to_issuer'  => 'KTP, SIM, kartu pelajar, kartu ATM -> dikembalikan ke penerbitnya (Dukcapil, kepolisian, bank, sekolah) atau dimusnahkan dengan saksi. Bukan "milik negara".',
        'hand_to_authority' => 'HP, laptop, dompet berisi uang -> diserahkan ke instansi berwenang (kep arrestingan atau pemerintah kota) lewat berita acara.',
        'donated'           => 'Barang bernilai rendah (tumbler, jaket, payung) -> dihibahkan ke lembaga sosial dengan berita acara.',
        'destroyed'         => 'Barang rusak atau berisi data pribadi -> dimusnahkan dengan saksi.',
    ];

    /**
     * Buka / jangkar masa klaim untuk laporan temuan.
     *
     * Masa klaim dihitung dari saat barang benar-benar MASUK kantor kelurahan.
     * Kalau barang belum diterima, dihitung dari waktu verifikasi supaya masa
     * klaim tetap berjalan.
     *
     * Aman dipanggil ulang: dipakai baik saat laporan diverifikasi maupun
     * saat admin mencatat penerimaan barang, sehingga deadline selalu
     * menempel pada waktu penyimpanan yang sebenarnya.
     *
     * Penting: kalau masa klaim sudah terbuka dan barang BELUM diterima,
     * deadline tidak digeser ulang. Tanpa itu, setiap kali laporan diedit
     * (updated_at berubah) masa klaim akan ikut bergeser dan pemilik bisa
     * kehilangan haknya tanpa pernah diberi tahu.
     */
    public function openWindow(Report $report): void
    {
        if ($report->type !== 'found' || !empty($report->released_at)) {
            return;
        }

        // Barang sudah diterima di kantor -> jangkar ke waktu penerimaan.
        if (!empty($report->received_at)) {
            $report->update([
                'claim_deadline' => $report->received_at->copy()->addDays($this->windowDays($report)),
            ]);

            return;
        }

        // Belum diterima: jangkar ke waktu verifikasi. Kalau deadline sudah
        // ada, biarkan - jangan geser karena updated_at bisa berubah
        // kapan saja (edit laporan, koreksi privasi foto, dll).
        if (!empty($report->claim_deadline)) {
            return;
        }

        $start = $report->updated_at ?? now();

        $report->update([
            'claim_deadline' => $start->copy()->addDays($this->windowDays($report)),
        ]);
    }

    /**
     * Lama masa klaim (hari) untuk sebuah laporan.
     */
    public function windowDays(Report $report): int
    {
        return (int) config('temubarang.claim_window_days', 30);
    }

    /**
     * Sisa hari masa klaim. Null kalau jendelanya belum dibuka.
     */
    public function daysRemaining(Report $report): ?int
    {
        if (empty($report->claim_deadline)) {
            return null;
        }

        return (int) ceil(now()->diffInDays($report->claim_deadline, false));
    }

    /**
     * Apakah masa klaim sudah habis?
     */
    public function isExpired(Report $report): bool
    {
        if (empty($report->claim_deadline)) {
            return false;
        }

        return now()->greaterThanOrEqualTo($report->claim_deadline);
    }

    /**
     * Apakah sudah masuk window peringatan (X hari sebelum habis)?
     */
    public function isExpiringSoon(Report $report): bool
    {
        $remaining = $this->daysRemaining($report);

        if ($remaining === null || $remaining < 0) {
            return false;
        }

        return $remaining <= (int) config('temubarang.expiry_reminder_days');
    }

    /**
     * Apakah laporan masih bisa diklaim?
     *
     * 'verified'  -> masa klaim aktif
     * 'expired'   -> masih boleh (tebus), selama barang belum dilepas
     */
    public function isClaimable(Report $report): bool
    {
        if (!empty($report->released_at)) {
            return false; // sudah dilepas, tidak bisa diklaim lagi
        }

        return in_array($report->status, ['verified', 'expired'], true);
    }

    /**
     * Rekomendasi tindak lanjut untuk sebuah laporan.
     *
     * Mempertimbangkan kondisi barang, bukan hanya kategorinya:
     * - barang rusak / memuat data pribadi -> dimusnahkan dengan saksi
     * - barang berisi identitas penting     -> dikembalikan ke penerbitnya
     */
    public function recommendedAction(Report $report): string
    {
        // Barang yang fotonya terdeteksi memuat data pribadi (NIK, kartu bank,
        // wajah) sebaiknya dimusnahkan dengan saksi, bukan disimpan lagi.
        if ($report->pii_detected || $report->photo_sensitive) {
            return 'destroyed';
        }

        return self::RECOMMENDED_ACTIONS[$report->category] ?? 'donated';
    }

    /**
     * Semua tindakan yang mungkin, untuk ditampilkan ke admin.
     */
    public function actionOptions(): array
    {
        $out = [];
        foreach (self::ACTION_LABELS as $key => $label) {
            $out[] = [
                'value'       => $key,
                'label'       => $label,
                'hint'        => self::ACTION_HINTS[$key] ?? '',
                'needs_recipient' => $key !== 'destroyed',
                'needs_witness'   => true,
            ];
        }

        return $out;
    }

    /**
     * Tandai laporan sebagai kedaluwarsa (masa klaim habis).
     *
     * Statusnya BUKAN "hilang" dan BUKAN "milik negara" - barang masih di
     * kantor kelurahan dan masih bisa ditebus.
     */
    public function markExpired(Report $report): void
    {
        if ($report->status !== 'verified') {
            return;
        }

        $report->update([
            'status'      => 'expired',
            'expired_at'  => now(),
        ]);
    }

    /**
     * Tandai kedaluwarsa DAN beri tahu admin + penemu.
     *
     * Ini satu-satunya jalan resmi menuju status "Kedaluwarsa", dipakai
     * baik oleh command scheduler maupun oleh sinkronisasi on-read. Karena
     * notifikasi ikut di sini, Perpindahan status hanya terjadi SEKALI:
     * siapa pun yang memicu lebih dulu, orang lain tidak akan menerima
     * notifikasi yang sama lagi.
     */
    public function expire(Report $report): bool
    {
        if ($report->status !== 'verified') {
            return false;
        }

        if (empty($report->claim_deadline) || !$this->isExpired($report)) {
            return false;
        }

        $this->markExpired($report);

        $report->refresh();
        $report->loadMissing(['user', 'region']);

        $deadline = $report->claim_deadline->format('d M Y');

        // 1) Admin kelurahan yang bertanggung jawab atas barang ini
        foreach (\App\Helpers\NotificationHelper::adminsOfRegion($report->region_id) as $admin) {
            \App\Helpers\NotificationHelper::sendOncePerReport(
                $admin->id,
                '📦 Barang Temuan Kedaluwarsa - Perlu Tindak Lanjut',
                "Masa klaim barang temuan \"{$report->item_name}\" (" .
                ($report->region?->name ?? 'kelurahan') . ") telah habis. " .
                "Barang TIDAK dianggap hilang dan TIDAK menjadi milik negara - barang masih tersimpan di kantor kelurahan " .
                "dan pemilik masih bisa menebusnya. Mohon catat berita acara tindak lanjut (dikembalikan ke penerbit, " .
                "diserahkan ke instansi berwenang, dihibahkan, atau dimusnahkan).",
                'warning',
                "/admin/reports/{$report->id}/followup"
            );
        }

        // 2) Penemu diberi tahu bahwa barangnya sudah kedaluwarsa (bukan hilang)
        if ($report->user_id) {
            \App\Helpers\NotificationHelper::sendOncePerReport(
                $report->user_id,
                '📦 Masa Klaim Barang Temuan Anda Berakhir',
                "Masa klaim untuk \"{$report->item_name}\" telah berakhir. Barang masih tersimpan di kantor kelurahan " .
                "dan belum dilepas. Pemilik masih bisa menebusnya di kantor kelurahan.",
                'info',
                "/reports/{$report->id}"
            );
        }

        return true;
    }

    /**
     * Sinkronkan status kedaluwarsa untuk satu laporan.
     *
     * Dipanggil saat laporan dibaca (halaman detail, daftar laporan, papan
     * temuan publik, dan saat pengajuan klaim). Tujuannya: masa klaim tetap
     * berlaku walaupun scheduler harian belum sempat jalan - misalnya cron
     * server mati, atau server baru dinyalakan setelah lewat deadline.
     *
     * Tanpa ini, laporan yang sudah lewat 30 hari tetap berstatus "verified",
     * sehingga:
     * - penglaim bisa mengirim claim biasa, bukan klaim tebus
     * - admin tidak melihat tombol "Tindak Lanjut"
     * - papan publik menampilkan sisa hari yang negatif
     *
     * Aman dipanggil berkali-kali: laporan yang sudah 'expired' dilewati.
     */
    public function syncExpired(Report $report): bool
    {
        if ($report->type !== 'found') {
            return false;
        }

        if ($report->status !== 'verified') {
            return false;
        }

        if (empty($report->claim_deadline)) {
            return false;
        }

        if (!$this->isExpired($report)) {
            return false;
        }

        return $this->expire($report);
    }

    /**
     * Sinkronkan status kedaluwarsa untuk sekumpulan laporan sekaligus.
     *
     * Dipakai oleh halaman daftar laporan dan papan temuan publik.
     */
    public function syncExpiredCollection(iterable $reports): int
    {
        $count = 0;

        foreach ($reports as $report) {
            if ($this->syncExpired($report)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Catat pelepasan barang (berita acara sudah dibuat di tabel
     * report_followups).
     *
     * Setelah barang dilepas, data sensitif DIHAPUS: foto asli di disk privat,
     * nomor seri/IMEI, dan ciri rahasia. Yang tersisa hanya arsip ringkas.
     */
    public function markReleased(Report $report, string $action, ?int $releasedBy = null): void
    {
        $report->update([
            'status'          => 'resolved',
            'resolution_type' => $action,
            'released_at'     => now(),
            'released_by'     => $releasedBy ?? auth()->id(),
        ]);

        if (config('temubarang.purge_sensitive_on_release', true)) {
            $this->purgeSensitiveData($report->fresh());
        }
    }

    /**
     * Hapus data sensitif laporan. Foto PUBLIK yang sudah buram tetap disimpan
     * sebagai arsip, supaya riwayat kasus masih bisa dibaca.
     */
    public function purgeSensitiveData(Report $report): void
    {
        // Foto asli di disk privat
        if (!empty($report->photo_original)) {
            Storage::disk('local')->delete($report->photo_original);
        }

        $report->update([
            'photo_original'  => null,
            'serial_number'   => null,
            'reported_imei'   => null,
            'imei_unreadable' => false,
            'secret_feature'  => null,
            'pii_reasons'     => null,
            'pii_check_error' => null,
        ]);

        Log::info('Data sensitif laporan #' . $report->id . ' dihapus setelah barang dilepas');
    }
}
