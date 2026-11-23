<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tesseract OCR (deteksi data pribadi otomatis)
    |--------------------------------------------------------------------------
    |
    | Lokasi binary Tesseract untuk PiiDetectionService. Kalau Tesseract belum
    | terpasang, detektor otomatis akan gagal dan foto otomatis disamarkan
    | demi keamanan (fail-safe), lalu alasannya tercatat di laporan.
    |
    */

    'tesseract' => [
        'path' => env('TESSERACT_CMD', 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'),
        'enabled' => (bool) env('PII_DETECTION_ENABLED', true),
    ],

];
