<?php

namespace App\Services;

use App\Models\MatchResult;

class ImageMatchingService
{
    private string $pythonPath;
    private string $scriptPath;
    private int $timeoutSeconds = 20;

    public function __construct()
    {
        $this->pythonPath = base_path('multiverse/python/venv/Scripts/python.exe');
        $this->scriptPath = base_path('multiverse/python/image_matcher/main.py');
    }

    public function compare(string $imagePath1, string $imagePath2): array
    {
        if (!file_exists($imagePath1) || !file_exists($imagePath2)) {
            return $this->errorResult('File gambar tidak ditemukan');
        }

        if (!file_exists($this->pythonPath)) {
            \Log::error('Python executable tidak ditemukan: ' . $this->pythonPath);
            return $this->errorResult('Konfigurasi Python tidak valid');
        }

        $input = json_encode([
            'image1_path' => str_replace('\\', '/', $imagePath1),
            'image2_path' => str_replace('\\', '/', $imagePath2),
        ]);

        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = proc_open(
            "\"{$this->pythonPath}\" \"{$this->scriptPath}\"",
            $descriptors,
            $pipes
        );

        if (!is_resource($process)) {
            \Log::error('Gagal menjalankan proc_open untuk image matching');
            return $this->errorResult('Gagal menjalankan Python');
        }

        stream_set_blocking($pipes[1], false);

        fwrite($pipes[0], $input);
        fclose($pipes[0]);

        $output    = '';
        $startTime = time();

        while (true) {
            $chunk = fread($pipes[1], 8192);
            if ($chunk !== false) {
                $output .= $chunk;
            }

            $status = proc_get_status($process);

            if (!$status['running']) {
                break;
            }

            if ((time() - $startTime) > $this->timeoutSeconds) {
                proc_terminate($process, 9);
                \Log::warning('Image matching timeout setelah ' . $this->timeoutSeconds . ' detik', [
                    'image1' => $imagePath1,
                    'image2' => $imagePath2,
                ]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                proc_close($process);
                return $this->errorResult('Timeout — proses terlalu lama');
            }

            usleep(50000);
        }

        $output .= stream_get_contents($pipes[1]);
        $errorOutput = stream_get_contents($pipes[2]);

        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($process);

        if (empty($output)) {
            \Log::error('Output Python kosong', ['stderr' => $errorOutput]);
            return $this->errorResult('Tidak ada output dari Python');
        }

        $result = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            \Log::error('Output Python tidak valid JSON', [
                'output' => $output,
                'stderr' => $errorOutput,
            ]);
            return $this->errorResult('Output Python tidak valid');
        }

        if (isset($result['error'])) {
            \Log::warning('Python mengembalikan error', ['error' => $result['error']]);
            return $this->errorResult($result['error']);
        }

        return [
            'success'         => true,
            'photo_score'     => $result['photo_score'] ?? 0.0,
            'akaze_score'     => $result['akaze_score'] ?? 0.0,
            'orb_score'       => $result['orb_score'] ?? 0.0,
            'histogram_score' => $result['histogram_score'] ?? 0.0,
            'hog_score'       => $result['hog_score'] ?? 0.0,
            'total_matches'   => $result['total_matches'] ?? 0,
        ];
    }

    public function compareWithCache(int $reportId1, int $reportId2, string $imagePath1, string $imagePath2): array
    {
        $idA = min($reportId1, $reportId2);
        $idB = max($reportId1, $reportId2);

        $cached = MatchResult::where('report_id_1', $idA)
            ->where('report_id_2', $idB)
            ->first();

        if ($cached) {
            return [
                'success'     => true,
                'photo_score' => $cached->photo_score,
                'from_cache'  => true,
            ];
        }

        $result = $this->compare($imagePath1, $imagePath2);

        if ($result['success']) {
            MatchResult::updateOrCreate(
                ['report_id_1' => $idA, 'report_id_2' => $idB],
                ['photo_score' => $result['photo_score']]
            );
        }

        return $result;
    }

    private function errorResult(string $message): array
    {
        return [
            'success'     => false,
            'photo_score' => 0.0,
            'error'       => $message,
        ];
    }
}