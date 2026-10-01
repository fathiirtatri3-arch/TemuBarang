<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * GET /api/search
     * Mencari laporan barang hilang/temuan yang sudah terverifikasi
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        // Query dasar: hanya laporan yang sudah terverifikasi atau selesai
        $query = Report::with(['user', 'region'])
            ->whereIn('status', ['verified', 'resolved']);

        // Filter berdasarkan keyword (nama barang)
        if ($request->has('keyword') && !empty($request->keyword)) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('item_name', 'like', '%' . $keyword . '%')
                  ->orWhere('description', 'like', '%' . $keyword . '%');
            });
        }

        // Filter berdasarkan tipe (lost/found)
        if ($request->has('type') && $request->type !== 'all' && in_array($request->type, ['lost', 'found'])) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan kategori
        if ($request->has('category') && $request->category !== 'all' && !empty($request->category)) {
            $query->where('category', $request->category);
        }

        // Filter berdasarkan warna
        if ($request->has('color') && !empty($request->color)) {
            $query->where('color', 'like', '%' . $request->color . '%');
        }

        // Filter berdasarkan lokasi
        if ($request->has('location') && !empty($request->location)) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Filter berdasarkan region_id
        if ($request->has('region_id') && !empty($request->region_id)) {
            $query->where('region_id', $request->region_id);
        }

        // Filter berdasarkan tanggal dari
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        // Filter berdasarkan tanggal sampai
        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Sorting
        $sortMap = [
            'latest'       => ['created_at', 'desc'],
            'oldest'       => ['created_at', 'asc'],
            'name_asc'     => ['item_name', 'asc'],
            'name_desc'    => ['item_name', 'desc'],
            'location_asc' => ['location', 'asc'],
        ];

        $sortField = $request->get('sort_by', 'latest');
        [$column, $sortDirection] = $sortMap[$sortField] ?? ['created_at', 'desc'];
        $query->orderBy($column, $sortDirection);

        // Pagination (12 item per halaman)
        $perPage = $request->get('per_page', 12);
        $reports = $query->paginate($perPage);

        // Tambahkan informasi tambahan untuk response
        return response()->json([
            'success' => true,
            'data' => $reports->items(),
            'pagination' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
                'next_page_url' => $reports->nextPageUrl(),
                'prev_page_url' => $reports->previousPageUrl(),
            ],
            'filters' => [
                'keyword' => $request->keyword,
                'type' => $request->type,
                'category' => $request->category,
                'location' => $request->location,
                'region_id' => $request->region_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'sort_by' => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * GET /api/categories
     * Mengembalikan daftar kategori untuk filter (reuse dari AdditionalApiController)
     * Atau bisa panggil langsung di frontend
     */
    public function getCategories()
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
            'Lainnya',
        ];

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}