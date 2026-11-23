<?php

namespace App\Services;

/**
 * Validasi & perbandingan nomor seri / IMEI.
 *
 * IMEI adalah 15 digit dan memakai checksum Luhn, jadi salah ketik satu digit
 * langsung ketahuan. Serve ini dipakai di:
 * - ReportController  : laporan penemu (found) & pemilik (lost)
 * - ClaimController   : jawaban penglaim
 * - MatchingService   : pencocokan dua laporan
 */
class ImeiService
{
    /** Panjang standar IMEI */
    public const IMEI_LENGTH = 15;

    /**
     * Ambil hanya digit dari input pengguna.
     * "35-209900-176148-1" -> "352099001761481"
     */
    public function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D/', '', $value);

        return $digits === '' ? null : $digits;
    }

    /**
     * Checksum Luhn.
     */
    public function luhnValid(string $number): bool
    {
        if ($number === '' || !ctype_digit($number)) {
            return false;
        }

        $sum    = 0;
        $parity = strlen($number) % 2;

        for ($i = 0; $i < strlen($number); $i++) {
            $digit = (int) $number[$i];

            if ($i % 2 === $parity) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
        }

        return $sum % 10 === 0;
    }

    /**
     * Apakah nilai ini IMEI yang sah?
     * -> 15 digit + checksum Luhn benar
     */
    public function isValidImei(?string $value): bool
    {
        $digits = $this->normalize($value);

        if ($digits === null || strlen($digits) !== self::IMEI_LENGTH) {
            return false;
        }

        return $this->luhnValid($digits);
    }

    /**
     * Pesan error yang ramah untuk ditampilkan ke pengguna.
     */
    public function validationMessage(?string $value): string
    {
        $digits = $this->normalize($value);

        if ($digits === null) {
            return 'Nomor seri wajib diisi.';
        }

        if (strlen($digits) !== self::IMEI_LENGTH) {
            return 'Nomor seri/IMEI harus terdiri dari ' . self::IMEI_LENGTH . ' digit (sekarang ' . strlen($digits) . ' digit).';
        }

        if (!$this->luhnValid($digits)) {
            return 'Nomor seri/IMEI tidak valid (checksum salah). Periksa ulang digit yang diketik.';
        }

        return 'Nomor seri/IMEI tidak valid.';
    }

    /**
     * Dua nomor seri dianggap sama bila digitnya identik.
     */
    public function matches(?string $a, ?string $b): bool
    {
        $na = $this->normalize($a);
        $nb = $this->normalize($b);

        if ($na === null || $nb === null) {
            return false;
        }

        return $na === $nb;
    }

    /**
     * Bandingkan tiga sumber angka (dibenarkan penemu, dibaca admin, jawab penglaim).
     * Mengembalikan status per sumber supaya UI bisa menandai yang cocok / beda.
     *
     * @return array{
     *   reported: ?string, admin: ?string, claimant: ?string,
     *   reported_vs_admin: ?bool, reported_vs_claimant: ?bool,
     *   admin_vs_claimant: ?bool, all_match: bool, has_data: bool
     * }
     */
    public function compare(?string $reported, ?string $admin, ?string $claimant): array
    {
        $r = $this->normalize($reported);
        $a = $this->normalize($admin);
        $c = $this->normalize($claimant);

        $cmp = function (?string $x, ?string $y): ?bool {
            if ($x === null || $y === null) {
                return null;
            }
            return $x === $y;
        };

        $reportedVsAdmin      = $cmp($r, $a);
        $reportedVsClaimant   = $cmp($r, $c);
        $adminVsClaimant      = $cmp($a, $c);
        $allMatch             = $reportedVsAdmin === true && $reportedVsClaimant === true;

        return [
            'reported'            => $r,
            'admin'               => $a,
            'claimant'            => $c,
            'reported_vs_admin'   => $reportedVsAdmin,
            'reported_vs_claimant'=> $reportedVsClaimant,
            'admin_vs_claimant'   => $adminVsClaimant,
            'all_match'           => $allMatch,
            'has_data'            => $r !== null || $a !== null || $c !== null,
        ];
    }

    /**
     * Format tampilan: 352099001761481 -> 35-209900-176148-1
     */
    public function format(?string $value): ?string
    {
        $digits = $this->normalize($value);

        if ($digits === null) {
            return null;
        }

        if (strlen($digits) !== self::IMEI_LENGTH) {
            return $digits;
        }

        return implode('-', [
            substr($digits, 0, 2),
            substr($digits, 2, 6),
            substr($digits, 8, 6),
            substr($digits, 14, 1),
        ]);
    }
}
