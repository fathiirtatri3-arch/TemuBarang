<?php

namespace App\Helpers;

class BadWords
{
    protected static $words = [
        'babi', 'anjing', 'kontol', 'memek', 'ngentot',
        'goblok', 'bodoh', 'tolol', 'idiot', 'sial',
        'kampret', 'jahanam', 'brengsek', 'bangsat',
        'anjay', 'asu', 'kirik', 'tai', 'ampas',
        'setan', 'iblis', 'neraka', 'silit',
        // tambahkan sesuai kebutuhan
    ];
    
    public static function contains($text)
    {
        if (empty($text)) return false;
        
        \Log::info('BadWords check: ' . $text);

        $text = strtolower($text);
        foreach (self::$words as $word) {
            if (stripos($text, $word) !== false) {
                \Log::info('Found bad word: ' . $word);
                return true;
            }
        }
        return false;
    }
    
    public static function filter($text)
    {
        if (empty($text)) return $text;
        
        $text = strtolower($text);
        foreach (self::$words as $word) {
            $replacement = str_repeat('*', strlen($word));
            $text = str_ireplace($word, $replacement, $text);
        }
        return $text;
    }
}