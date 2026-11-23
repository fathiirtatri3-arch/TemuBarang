<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Masa Klaim Barang Temuan
    |--------------------------------------------------------------------------
    |
    | Barang temuan yang sudah diverifikasi dan disimpan di kantor kelurahan
    | diberi masa klaim terbatas. Kalau lewat masa itu tanpa ada yang mengklaim,
    | statusnya menjadi "Kedaluwarsa" - BUKAN "hilang" dan BUKAN "milik negara".
    | Barang tetap bisa ditebus pemiliknya sampai benar-benar dilepas lewat
    | berita acara.
    |
    */

    'claim_window_days' => (int) env('CLAIM_WINDOW_DAYS', 30),

    /*
    | Seberapa hari sebelum masa klaim habis, admin & penemu diberi peringatan.
    */
    'expiry_reminder_days' => (int) env('CLAIM_EXPIRY_REMINDER_DAYS', 5),

    /*
    | Kalau admin belum menindaklanjuti laporan kedaluwarsa selama beberapa
    | hari, super admin diberi tahu. 0 = matikan eskalasi.
    */
    'escalation_days' => (int) env('CLAIM_ESCALATION_DAYS', 7),

    /*
    | Setelah barang benar-benar dilepas, data sensitif dihapus:
    | (foto asli di disk privat, nomor seri/IMEI, ciri rahasia).
    | Yang tersisa hanya arsip ringkas.
    */
    'purge_sensitive_on_release' => (bool) env('PURGE_SENSITIVE_ON_RELEASE', true),

    /*
    | Minimal jumlah saksi yang wajib tercatat pada berita acara.
    */
    'minimum_witnesses' => (int) env('MINIMUM_WITNESSES', 1),

];
