<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Deteksi data pribadi (PII) otomatis pada foto laporan.
 *
 * Memanggil script Python (multiverse/python/pii_detector/main.py) yang memakai
 * Tesseract OCR + Haar Cascade OpenCV. Yang diperiksa:
 *   - NIK (16 digit)
 *   - Nomor kartu bank (13-19 digit, checksum Luhn)
 *   - Kata kunci dokumen identitas (minimal 2 kata kunci)
 *   - Wajah
 *
 * Prinsip fail-safe: kalau detektor gagal (Tesseract belum terpasang, timeout,
 * script hilang), hasil tetap "terdeteksi" sehingga foto disamarkan. Membuka
 * samaran tetap bisa dilakukan admin lewat koreksi manual.
 */
class PiiDetectionService
{
    private string $pythonPath;
    private string $scriptPath;
    private int $timeoutSeconds = 30;

    public function __construct()
    {
        $this->pythonPath = base_path('multiverse/python/venv/Scripts/python.exe');
        $this->scriptPath = base_path('multiverse/python/pii_detector/main.py');
    }

    /**
     * Periksa satu file gambar.
     *
     * @return array{
     *   success: bool, detected: bool, reasons: array, details: array,
     *   error: ?string, failed: bool
     * }
     */
    public function detect(string $imagePath): array
    {
        if (!file_exists($imagePath)) {
            return $this->failedResult('File gambar tidak ditemukan');
        }

        if (!file_exists($this->pythonPath)) {
            return $this->failedResult('Konfigurasi Python tidak valid');
        }

        if (!file_exists($this->scriptPath)) {
            return $this->failedResult('Script deteksi PII tidak ditemukan');
        }

        $input = json_encode([
            'image_path' => str_replace('\\', '/', $imagePath),
        ]);

        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = @proc_open(
            "\"{$this->pythonPath}\" \"{$this->scriptPath}\"",
            $descriptors,
            $pipes,
            base_path(),
            $this->pythonEnv()
        );

        if (!is_resource($process)) {
            \Log::error('Gagal menjalankan proc_open untuk deteksi PII');
            return $this->failedResult('Gagal menjalankan detektor');
        }

        stream_set_blocking($pipes[1], false);
        stream_set_blocking($pipes[2], false);

        fwrite($pipes[0], $input);
        fclose($pipes[0]);

        $output      = '';
        $errorOutput = '';
        $startTime   = time();

        while (true) {
            $chunk = fread($pipes[1], 8192);
            if ($chunk !== false) {
                $output .= $chunk;
            }

            $errChunk = fread($pipes[2], 8192);
            if ($errChunk !== false) {
                $errorOutput .= $errChunk;
            }

            $status = proc_get_status($process);

            if (!$status['running']) {
                break;
            }

            if ((time() - $startTime) > $this->timeoutSeconds) {
                proc_terminate($process, 9);
                \Log::warning('Deteksi PII timeout setelah ' . $this->timeoutSeconds . ' detik', [
                    'image' => $imagePath,
                ]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                proc_close($process);
                return $this->failedResult('Timeout — deteksi terlalu lama');
            }

            usleep(50000);
        }

        $output      .= stream_get_contents($pipes[1]);
        $errorOutput .= stream_get_contents($pipes[2]);

        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($process);

        if (trim($output) === '') {
            \Log::error('Output Python deteksi PII kosong', ['stderr' => $errorOutput]);
            return $this->failedResult($errorOutput !== '' ? trim($errorOutput) : 'Tidak ada output dari detektor');
        }

        $result = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            \Log::error('Output deteksi PII tidak valid JSON', [
                'output' => $output,
                'stderr' => $errorOutput,
            ]);
            return $this->failedResult('Output detektor tidak valid');
        }

        return [
            'success'  => true,
            'detected' => (bool) ($result['detected'] ?? false),
            'reasons'  => array_values((array) ($result['reasons'] ?? [])),
            'details'  => (array) ($result['details'] ?? []),
            'error'    => null,
            'failed'   => false,
        ];
    }

    /**
     * Environment untuk proses Python (supaya Tesseract & logging aman).
     */
    private function pythonEnv(): array
    {
        $env = [
            'PATH'              => getenv('PATH') ?: '',
            'SystemRoot'        => getenv('SystemRoot') ?: 'C:\\Windows',
            'TEMP'              => sys_get_temp_dir(),
            'TMP'               => sys_get_temp_dir(),
            'PYTHONIOENCODING'  => 'utf-8',
            'PYTHONUNBUFFERED'  => '1',
            'TESSERACT_CMD'     => (string) (config('services.tesseract.path') ?: env('TESSERACT_CMD', '')),
        ];

        // Vite/Tesseract mungkin butuh path tambahan
        $extraPath = (string) env('TESSERACT_DIR', '');
        if ($extraPath !== '') {
            $env['PATH'] = $extraPath . ';' . $env['PATH'];
        }

        return $env;
    }

    /**
     * Detektor gagal -> tetap dianggap "berisi data pribadi" (fail-safe).
     */
    private function failedResult(string $message): array
    {
        \Log::warning('Deteksi PII gagal: ' . $message);

        return [
            'success'  => false,
            'detected' => true,
            'reasons'  => ['Deteksi otomatis gagal: ' . $message],
            'details'  => [],
            'error'    => $message,
            'failed'   => true,
        ];
    }
}
