import { useState, useEffect, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { debounce } from 'lodash';

export default function SearchPage() {
    const { auth } = usePage().props;
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]); 
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
    });
    
    // Filter states
    const [filters, setFilters] = useState({
        keyword: '',
        type: 'all',
        category: '',
        location: '',
        region_id: '',
        date_from: '',
        date_to: '',
        sort_by: 'latest',
        per_page: 12
    });
    
    // Toast notification
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };
    
    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/search-categories');
                const data = await response.json();
                setCategories(data.categories || data.data || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // ⭐ TAMBAHKAN INI - Fetch regions untuk filter kelurahan
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await fetch('/api/regions', {
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    setRegions(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch regions:', error);
            }
        };
        fetchRegions();
    }, []);
    
    // Fetch search results
    const fetchResults = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: filters.per_page,
                ...(filters.keyword && { keyword: filters.keyword }),
                ...(filters.type !== 'all' && { type: filters.type }),
                ...(filters.category && { category: filters.category }),
                ...(filters.location && { location: filters.location }),
                ...(filters.region_id && { region_id: filters.region_id }),
                ...(filters.date_from && { date_from: filters.date_from }),
                ...(filters.date_to && { date_to: filters.date_to }),
                sort_by: filters.sort_by
            });
            
            const response = await fetch(`/api/search?${params}`);
            const data = await response.json();
            console.log('API Response:', data);
            console.log('Total:', data.total);
            console.log('Data length:', data.data?.length); 
            
            setSearchResults(data.data || []);
            const p = data.pagination || {};
            setPagination({
                current_page: p.current_page || 1,
                last_page: p.last_page || 1,
                per_page: p.per_page || 12,
                total: p.total ?? data.data?.length ?? 0
            });
        } catch (error) {
            console.error('Search error:', error);
            showToast('Gagal melakukan pencarian', 'error');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);
    
    // Debounced search for keyword
    const debouncedSearch = useCallback(
        debounce(() => {
            fetchResults(1);
        }, 500),
        [fetchResults]
    );
    
    // Trigger search when filters change
    useEffect(() => {
        if (filters.keyword) {
            debouncedSearch();
        } else {
            fetchResults(1);
        }
        }, [filters.type, filters.category, filters.location, filters.region_id, filters.date_from, filters.date_to, filters.sort_by, filters.per_page]);
    
    // Handle keyword change with debounce
    useEffect(() => {
        if (filters.keyword !== undefined) {
            debouncedSearch();
        }
    }, [filters.keyword]);
    
    // Handle filter changes
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    // Reset all filters
    const resetFilters = () => {
        setFilters({
            keyword: '',
            type: 'all',
            category: '',
            location: '',
            region_id: '',
            date_from: '',
            date_to: '',
            sort_by: 'latest',
            per_page: 12
        });
    };
    
    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            fetchResults(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    // Format date
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };
    
    // Get status badge
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Menunggu' };
            case 'verified': return { bg: 'bg-blue-100', text: 'text-blue-800', label: '✅ Terverifikasi' };
            case 'resolved': return { bg: 'bg-green-100', text: 'text-green-800', label: '🎉 Selesai' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        }
    };
    
    // Sorting options
    const sortOptions = [
        { value: 'latest', label: 'Terbaru' },
        { value: 'oldest', label: 'Terlama' },
        { value: 'name_asc', label: 'Nama (A-Z)' },
        { value: 'name_desc', label: 'Nama (Z-A)' },
        { value: 'location_asc', label: 'Lokasi (A-Z)' },
    ];
    
    // Per page options
    const perPageOptions = [12, 24, 48, 96];
    
    return (
        <AuthenticatedLayout>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-5 right-5 z-50 animate-slideIn">
                    <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
                        toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                            {toast.message}
                        </span>
                    </div>
                </div>
            )}
            
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-[#185FA5]/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-[#185FA5]" style={{ fontVariationSettings: '"FILL" 1' }}>search</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-[#185FA5]">Cari Barang Temuan &amp; Hilang</h1>
                                <p className="text-gray-500 text-sm max-w-2xl">
                                    Gunakan pencarian cerdas kami untuk menemukan kembali barang berharga Anda yang hilang di lingkungan Kecamatan Sambikerep.
                                </p>
                            </div>
                        </div>
                    </header>
                    
                    {/* Prominent Search Bar */}
                    <div className="flex flex-col md:flex-row gap-3 p-3 bg-white rounded-2xl border border-gray-200 shadow-lg focus-within:ring-2 focus-within:ring-[#185FA5]/20 transition-all duration-300 mb-6">
                        <div className="flex-1 flex items-center gap-3 px-2">
                            <span className="material-symbols-outlined text-[#185FA5]">search</span>
                            <input
                                type="text"
                                placeholder="Apa yang Anda cari? (Contoh: Kunci, Botol Minum, Jaket...)"
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                className="flex-1 border-none focus:ring-0 text-base placeholder:text-gray-400 p-2 outline-none"
                            />
                        </div>
                        <button 
                            className="bg-[#185FA5] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0C447C] transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">search</span>
                            Search
                        </button>
                    </div>
                    
                    {/* Results Info & Sort */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-gray-200 pb-3">
                        <span className="text-sm text-gray-500">
                            {!loading && (
                                <>Menampilkan <span className="text-[#185FA5] font-bold">{searchResults.length}</span> dari <span className="font-bold text-gray-700">{pagination.total}</span> hasil</>
                            )}
                            {loading && (
                                <span className="text-gray-400">Mencari...</span>
                            )}
                        </span>
                    </div>
                    
                    {/* Filter Section - Sidebar Style */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Sidebar - Filters */}
                        <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-4">
                            {/* Filters Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-[#185FA5]">Filters</h3>
                                    <button 
                                        onClick={resetFilters}
                                        className="text-xs text-[#185FA5] hover:underline"
                                    >
                                        Reset All
                                    </button>
                                </div>
                                
                                {/* Report Type */}
                                <div className="mb-5">
                                    <span className="block font-semibold text-sm text-gray-700 mb-3">Report Type</span>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="report_type" 
                                                value="all"
                                                checked={filters.type === 'all'}
                                                onChange={() => handleFilterChange('type', 'all')}
                                                className="w-4 h-4 text-[#185FA5] border-gray-300 focus:ring-[#185FA5]"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-[#185FA5] transition-colors">Semua Laporan</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="report_type"
                                                value="lost"
                                                checked={filters.type === 'lost'}
                                                onChange={() => handleFilterChange('type', 'lost')}
                                                className="w-4 h-4 text-[#185FA5] border-gray-300 focus:ring-[#185FA5]"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-[#185FA5] transition-colors">Barang Hilang</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="report_type"
                                                value="found"
                                                checked={filters.type === 'found'}
                                                onChange={() => handleFilterChange('type', 'found')}
                                                className="w-4 h-4 text-[#185FA5] border-gray-300 focus:ring-[#185FA5]"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-[#185FA5] transition-colors">Barang Ditemukan</span>
                                        </label>
                                    </div>
                                </div>
                                
                                {/* Categories */}
                                <div className="mb-5">
                                    <span className="block font-semibold text-sm text-gray-700 mb-3">Categories</span>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="radio"
                                                name="category"
                                                value=""
                                                checked={filters.category === ''}
                                                onChange={() => handleFilterChange('category', '')}
                                                className="w-4 h-4 text-[#185FA5] border-gray-300 focus:ring-[#185FA5]"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-[#185FA5] transition-colors">Semua Kategori</span>
                                        </label>
                                        {categories.map(cat => (
                                            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="radio"
                                                    name="category"
                                                    value={cat}
                                                    checked={filters.category === cat}
                                                    onChange={() => handleFilterChange('category', cat)}
                                                    className="w-4 h-4 text-[#185FA5] border-gray-300 focus:ring-[#185FA5]"
                                                />
                                                <span className="text-sm text-gray-600 group-hover:text-[#185FA5] transition-colors">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Location */}
                                <div className="mb-5">
                                    <span className="block font-semibold text-sm text-gray-700 mb-2">Lokasi</span>
                                    <input
                                        type="text"
                                        placeholder="Cari berdasarkan lokasi..."
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#185FA5] focus:border-transparent text-sm"
                                    />
                                </div>

                                {/* ⭐ Kelurahan - TAMBAHKAN DI SINI ⭐ */}
                                <div className="mb-5">
                                    <span className="block font-semibold text-sm text-gray-700 mb-2">Kelurahan</span>
                                    <select
                                        value={filters.region_id}
                                        onChange={(e) => handleFilterChange('region_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-[#185FA5] focus:ring-[#185FA5] text-sm bg-white p-2"
                                    >
                                        <option value="">Semua Kelurahan</option>
                                        {regions.map(region => (
                                            <option key={region.id} value={region.id}>{region.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Date Range */}
                                <div className="mb-5">
                                    <span className="block font-semibold text-sm text-gray-700 mb-2">Date Range</span>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">From</label>
                                            <input 
                                                type="date"
                                                value={filters.date_from}
                                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#185FA5] focus:ring-[#185FA5] text-sm bg-white p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">To</label>
                                            <input 
                                                type="date"
                                                value={filters.date_to}
                                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#185FA5] focus:ring-[#185FA5] text-sm bg-white p-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* ⭐ TAMBAHKAN INI - SORTING DI SIDEBAR ⭐ */}
                                <div className="mb-5">
                                    <span className="block font-semibold text-sm text-gray-700 mb-2">Urutkan</span>
                                    <select
                                        value={filters.sort_by}
                                        onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:border-[#185FA5] focus:ring-[#185FA5] text-sm bg-white p-2"
                                    >
                                        {sortOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Per Page */}
                                <div>
                                    <span className="block font-semibold text-sm text-gray-700 mb-2">Per Halaman</span>
                                    <select
                                        value={filters.per_page}
                                        onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                                        className="w-full rounded-lg border-gray-200 focus:border-[#185FA5] focus:ring-[#185FA5] text-sm bg-white p-2"
                                    >
                                        {perPageOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt} per halaman</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Tips Card */}
                            <div className="bg-[#185FA5] rounded-2xl p-5 text-white shadow-xl overflow-hidden relative group">
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10">
                                    <h4 className="font-bold text-lg mb-2">Ingin Barang Anda Cepat Ketemu?</h4>
                                    <p className="text-sm opacity-90 mb-4">Pastikan deskripsi barang Anda sangat detail. Berikan informasi ciri khas seperti stiker, goresan, atau merk spesifik.</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 px-4 py-2 bg-white/20 rounded-full backdrop-blur-md border border-white/30">
                                            <span className="material-symbols-outlined">photo_camera</span>
                                            <span className="text-sm font-medium">Gunakan Foto Jelas</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-4 py-2 bg-white/20 rounded-full backdrop-blur-md border border-white/30">
                                            <span className="material-symbols-outlined">history</span>
                                            <span className="text-sm font-medium">Cek Riwayat Berkala</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                        
                        {/* Right Content - Results */}
                        <div className="flex-1">
                            {/* Search Results Grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                                            <div className="h-48 bg-gray-200"></div>
                                            <div className="p-4">
                                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                                                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada hasil ditemukan</h3>
                                    <p className="text-gray-500 mb-4">
                                        {filters.keyword || filters.category || filters.location || filters.date_from || filters.date_to 
                                            ? 'Coba gunakan kata kunci atau filter yang berbeda'
                                            : 'Mulai cari barang dengan mengetikkan kata kunci di atas'}
                                    </p>
                                    {filters.keyword && (
                                        <button
                                            onClick={() => handleFilterChange('keyword', '')}
                                            className="px-4 py-2 bg-[#185FA5] text-white rounded-lg hover:bg-[#0C447C] transition"
                                        >
                                            Hapus Pencarian
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {searchResults.map((report) => {
                                            const statusBadge = getStatusBadge(report.status);
                                            return (
                                                <Link 
                                                    key={report.id} 
                                                    href={`/reports/${report.id}`}
                                                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                                >
                                                    {/* Image Section */}
                                                    <div className="h-48 relative overflow-hidden bg-gray-100">
                                                        <div className="absolute top-3 left-3 z-10">
                                                            <span className={`px-3 py-1 font-bold text-[10px] rounded-full uppercase tracking-widest backdrop-blur-md ${
                                                                report.type === 'lost' 
                                                                    ? 'bg-red-500/10 text-red-600' 
                                                                    : 'bg-green-500/10 text-green-600'
                                                            }`}>
                                                                {report.type === 'lost' ? 'Hilang' : 'Ditemukan'}
                                                            </span>
                                                        </div>
                                                        <div className="absolute top-3 right-3 z-10">
                                                            <span className={`px-3 py-1 font-bold text-[10px] rounded-full uppercase tracking-widest backdrop-blur-md ${statusBadge.bg} ${statusBadge.text}`}>
                                                                {statusBadge.label}
                                                            </span>
                                                        </div>
                                                        {report.photo ? (
                                                            <img 
                                                                src={`/storage/${report.photo}`} 
                                                                alt={report.item_name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <span className="text-5xl">{report.type === 'lost' ? '🔍' : '📦'}</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <div className="p-4 space-y-2">
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="font-bold text-gray-900 group-hover:text-[#185FA5] transition-colors text-lg">
                                                                    {report.item_name}
                                                                </h3>
                                                                <span className="text-xs text-gray-400">#{report.id}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                                {report.description || `Barang ${report.type === 'lost' ? 'hilang' : 'ditemukan'} di area kecamatan.`}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex flex-col gap-2 pt-2">
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                                {report.location}
                                                            </div>
                                                            {report.region && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <span className="material-symbols-outlined text-sm">map</span>
                                                                    {report.region.name}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                                {formatDate(report.date)}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                            {report.category && (
                                                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                                    {report.category}
                                                                </span>
                                                            )}
                                                            {report.color && (
                                                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: report.color.toLowerCase() }}></span>
                                                                    {report.color}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Pagination */}
                                    {pagination.last_page > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-8">
                                            <button
                                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                                disabled={pagination.current_page === 1}
                                                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                                            </button>
                                            
                                            {[...Array(Math.min(5, pagination.last_page))].map((_, i) => {
                                                let pageNum;
                                                if (pagination.last_page <= 5) {
                                                    pageNum = i + 1;
                                                } else if (pagination.current_page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (pagination.current_page >= pagination.last_page - 2) {
                                                    pageNum = pagination.last_page - 4 + i;
                                                } else {
                                                    pageNum = pagination.current_page - 2 + i;
                                                }
                                                
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`w-10 h-10 rounded-lg font-medium transition ${
                                                            pagination.current_page === pageNum
                                                                ? 'bg-[#185FA5] text-white shadow-md'
                                                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            
                                            <button
                                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                                disabled={pagination.current_page === pagination.last_page}
                                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e1e2e9;
                    border-radius: 10px;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}