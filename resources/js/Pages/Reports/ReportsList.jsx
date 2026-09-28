import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function ReportsList() {
    const { reports, auth } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';
    
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Bulk Delete States
    const [selectedReports, setSelectedReports] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const itemsPerPage = 9;
    
    // Simulasi loading saat filter berubah
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [search, typeFilter, statusFilter, currentPage]);
    
    // Filter laporan
    const filteredReports = reports.filter(report => {
        const matchesSearch = report.item_name.toLowerCase().includes(search.toLowerCase()) ||
                            (report.description && report.description.toLowerCase().includes(search.toLowerCase()));
        const matchesType = typeFilter === 'all' || report.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });
    
    // Reset select all saat filter berubah
    useEffect(() => {
        setSelectedReports([]);
        setSelectAll(false);
    }, [search, typeFilter, statusFilter]);
    
    // Pagination logic
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);
    
    // Bulk Delete Functions
    const handleSelectReport = (id) => {
        if (selectedReports.includes(id)) {
            setSelectedReports(selectedReports.filter(i => i !== id));
            setSelectAll(false);
        } else {
            setSelectedReports([...selectedReports, id]);
        }
    };
    
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedReports([]);
            setSelectAll(false);
        } else {
            const allIds = filteredReports.map(r => r.id);
            setSelectedReports(allIds);
            setSelectAll(true);
        }
    };
    
    const handleBulkDelete = () => {
        if (selectedReports.length === 0) {
            alert('Pilih minimal satu laporan');
            return;
        }
        
        if (confirm(`Yakin ingin menghapus ${selectedReports.length} laporan?`)) {
            setIsDeleting(true);
            router.delete('/reports/bulk-delete', {
                data: { ids: selectedReports },
                onSuccess: () => {
                    setSelectedReports([]);
                    setSelectAll(false);
                    window.location.reload();
                },
                onError: () => {
                    alert('Gagal menghapus laporan');
                    setIsDeleting(false);
                },
            });
        }
    };

    // Reset page saat filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, statusFilter]);
    
    // Get status badge style
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu' };
            case 'verified':
                return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terverifikasi' };
            case 'resolved':
                return { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        }
    };
    
    const getTypeBadge = (type) => {
        if (type === 'lost') {
            return { bg: 'bg-red-500/10 text-red-600', label: 'Hilang' };
        }
        return { bg: 'bg-green-500/10 text-green-600', label: 'Ditemukan' };
    };
    
    // Loading Skeleton Component
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
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
    );
    
    // Grid View Card - Stitch Style
    const GridCard = ({ report }) => {
        const statusBadge = getStatusBadge(report.status);
        const typeBadge = getTypeBadge(report.type);
        const isChecked = selectedReports.includes(report.id);
        
        return (
            <div className="group bg-white rounded-2xl border border-gray-200/50 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col h-full relative">
                {/* Checkbox */}
                <div className="absolute top-3 left-3 z-20">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectReport(report.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/90 shadow-sm"
                    />
                </div>
                
                <Link href={`/reports/${report.id}`} className="block flex-1">
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                        {report.photo ? (
                            <img 
                                src={`/storage/${report.photo}`} 
                                alt={report.item_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-5xl">{report.type === 'lost' ? '🔍' : '📦'}</span>
                            </div>
                        )}
                        
                        {/* Type Badge */}
                        <div className={`absolute top-3 left-10 z-10 ${typeBadge.bg} px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md`}>
                            {typeBadge.label}
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{report.item_name}</h3>
                        
                        <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {report.location}
                            </div>
                            {report.region && (
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <span className="material-symbols-outlined text-sm">map</span>
                                    {report.region.name}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                {new Date(report.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                        
                        {report.description && (
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                                {report.description}
                            </p>
                        )}
                        
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                {report.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{report.user?.name || 'Anonymous'}</span>
                            <span className={`ml-auto px-2 py-1 text-xs rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                {statusBadge.label}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        );
    };
    
    // List View Item - Stitch Style
    const ListItem = ({ report }) => {
        const statusBadge = getStatusBadge(report.status);
        const typeBadge = getTypeBadge(report.type);
        const isChecked = selectedReports.includes(report.id);
        
        return (
            <div className="group bg-white rounded-2xl border border-gray-200/50 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="flex items-center p-4 gap-4">
                    {/* Checkbox */}
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectReport(report.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    
                    <Link href={`/reports/${report.id}`} className="flex-1 block">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                {report.photo ? (
                                    <img 
                                        src={`/storage/${report.photo}`} 
                                        alt={report.item_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                        {report.type === 'lost' ? '🔍' : '📦'}
                                    </div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {report.item_name}
                                    </h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${typeBadge.bg}`}>
                                        {typeBadge.label}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                        {statusBadge.label}
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {report.location}
                                    </span>
                                    {report.region && (
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">map</span>
                                            {report.region.name}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                        {new Date(report.date).toLocaleDateString('id-ID')}
                                    </span>
                                    {report.color && (
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 rounded-full border border-gray-200" style={{ 
                                                backgroundColor: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown'].includes(report.color?.toLowerCase()) 
                                                    ? report.color.toLowerCase() 
                                                    : '#CBD5E1' 
                                            }}></span>
                                            {report.color}
                                        </span>
                                    )}
                                </div>
                                
                                {report.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{report.description}</p>
                                )}
                            </div>
                            
                            <div className="text-right text-xs text-gray-400 flex-shrink-0">
                                Oleh: {report.user?.name || 'Anonymous'}
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        );
    };
    
    // Pagination Component - Stitch Style
    const Pagination = () => {
        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 5;
            
            if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
                if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) pages.push(i);
                    pages.push('...');
                    pages.push(totalPages);
                } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                    pages.push('...');
                    pages.push(totalPages);
                }
            }
            return pages;
        };
        
        if (totalPages <= 1) return null;
        
        return (
            <div className="flex justify-center items-center gap-2 mt-8">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                {getPageNumbers().map((page, idx) => (
                    <button
                        key={idx}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition font-medium ${
                            currentPage === page
                                ? 'bg-blue-600 text-white'
                                : page === '...' 
                                    ? 'cursor-default text-gray-400' 
                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        disabled={page === '...'}
                    >
                        {page}
                    </button>
                ))}
                
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
        );
    };
    
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <header className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Semua Laporan</h1>
                            <p className="text-gray-500 text-sm">Temukan barang hilang atau temuan di lingkungan sekolah</p>
                        </div>
                        <Link 
                            href="/reports/create" 
                            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md hover:shadow-xl transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Lapor Sekarang
                        </Link>
                    </header>
                    
                    {/* Search & Filter Bar - Stitch Style */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200/50 shadow-sm mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Checkbox Select All - DI SINI POSISINYA */}
                            {filteredReports.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600 whitespace-nowrap">
                                        Pilih semua ({filteredReports.length} laporan)
                                    </span>
                                    {selectedReports.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            disabled={isDeleting}
                                            className="ml-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-1 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                            Hapus ({selectedReports.length})
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            {/* Search */}
                            <div className="relative flex-grow min-w-[150px] md:min-w-[200px]">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Cari nama barang atau lokasi..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition text-sm"
                                />
                            </div>
                            
                            {/* Filters */}
                            <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 items-center">
                                <div className="relative">
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:ring-2 focus:ring-blue-500 appearance-none"
                                    >
                                        <option value="all">Semua Tipe</option>
                                        <option value="lost">Hilang</option>
                                        <option value="found">Ditemukan</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">expand_more</span>
                                </div>
                                
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:ring-2 focus:ring-blue-500 appearance-none"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="pending">Menunggu</option>
                                        <option value="verified">Terverifikasi</option>
                                        <option value="resolved">Selesai</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            
                            {/* View Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200/50 ml-auto">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${
                                        viewMode === 'grid'
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">grid_view</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${
                                        viewMode === 'list'
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">view_list</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Active Filters Info */}
                    {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-sm text-gray-500">Filter aktif:</span>
                            {search && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    🔍 {search}
                                    <button onClick={() => setSearch('')} className="hover:text-blue-900">×</button>
                                </span>
                            )}
                            {typeFilter !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    {typeFilter === 'lost' ? '🔴 Hilang' : '🟢 Ditemukan'}
                                    <button onClick={() => setTypeFilter('all')} className="hover:text-blue-900">×</button>
                                </span>
                            )}
                            {statusFilter !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    {statusFilter === 'pending' ? '⏳ Menunggu' : statusFilter === 'verified' ? '✅ Terverifikasi' : '🎉 Selesai'}
                                    <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900">×</button>
                                </span>
                            )}
                            <button 
                                onClick={() => {
                                    setSearch('');
                                    setTypeFilter('all');
                                    setStatusFilter('all');
                                }}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                Reset semua
                            </button>
                        </div>
                    )}
                    
                    {/* Results Count */}
                    <div className="text-sm text-gray-500 mb-4">
                        Menampilkan {paginatedReports.length} dari {filteredReports.length} laporan
                    </div>
                    
                    {/* Main Content */}
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : filteredReports.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada laporan</h3>
                            <p className="text-gray-500 mb-4">
                                {search || typeFilter !== 'all' || statusFilter !== 'all' 
                                    ? 'Tidak ada laporan yang sesuai dengan filter yang dipilih'
                                    : 'Belum ada laporan barang yang dibuat'}
                            </p>
                            {!reports.length && (
                                <Link 
                                    href="/reports/create"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    + Buat Laporan Baru
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                                    {paginatedReports.map(report => (
                                        <GridCard key={report.id} report={report} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3 animate-fadeIn">
                                    {paginatedReports.map(report => (
                                        <ListItem key={report.id} report={report} />
                                    ))}
                                </div>
                            )}
                            
                            {/* Pagination */}
                            <Pagination />
                        </>
                    )}
                    
                </div>
            </div>
            
            {/* Add custom CSS for animation */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}