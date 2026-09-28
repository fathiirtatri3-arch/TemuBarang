import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const { reports } = usePage().props;
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [selectedReports, setSelectedReports] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [regions, setRegions] = useState([]);
    const [regionFilter, setRegionFilter] = useState('all');
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };
    
    const filteredReports = reports.filter(report => {
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        const matchesType = typeFilter === 'all' || report.type === typeFilter;
        const matchesRegion = regionFilter === 'all' || String(report.region_id) === String(regionFilter);
        const matchesSearch = searchTerm === '' || 
            report.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });
    
    useEffect(() => {
        setSelectedReports([]);
        setSelectAll(false);
        setCurrentPage(1);
    }, [statusFilter, typeFilter, searchTerm, regionFilter]);

    // ⭐ TAMBAHKAN USEFFECT UNTUK FETCH REGIONS
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
                console.error('Error fetching regions:', error);
            }
        };
        fetchRegions();
    }, []);
    
    const sortedReports = [...filteredReports].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === 'user') {
            aVal = a.user?.name || '';
            bVal = b.user?.name || '';
        }
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReports = sortedReports.slice(startIndex, startIndex + itemsPerPage);
    
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
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
    
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };
    
    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    };
    
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
            const allIds = paginatedReports.map(r => r.id);
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
                    showToast(`${selectedReports.length} laporan berhasil dihapus`, 'success');
                    setSelectedReports([]);
                    setSelectAll(false);
                    setTimeout(() => window.location.reload(), 1500);
                },
                onError: () => {
                    showToast('Gagal menghapus laporan', 'error');
                    setIsDeleting(false);
                },
            });
        }
    };

    const updateStatus = async (reportId, newStatus) => {
        setIsProcessing(true);
        try {
            const response = await fetch(`/admin/reports/${reportId}/verify`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                const statusLabel = newStatus === 'verified' ? 'Terverifikasi' : 'Selesai';
                showToast(`✅ Laporan berhasil diubah menjadi ${statusLabel}`, 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                const error = await response.json();
                showToast(error.message || 'Gagal mengubah status', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleBulkAction = async () => {
        if (selectedReports.length === 0) {
            showToast('Pilih minimal satu laporan', 'error');
            return;
        }
        setShowBulkModal(true);
    };
    
    const confirmBulkAction = async () => {
        setIsProcessing(true);
        try {
            const promises = selectedReports.map(reportId => 
                fetch(`/admin/reports/${reportId}/verify`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ status: bulkAction })
                })
            );
            await Promise.all(promises);
            const actionLabel = bulkAction === 'verified' ? 'diverifikasi' : 'diselesaikan';
            showToast(`✅ ${selectedReports.length} laporan berhasil ${actionLabel}`, 'success');
            setSelectedReports([]);
            setSelectAll(false);
            setShowBulkModal(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            showToast('Gagal melakukan aksi massal', 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        verified: reports.filter(r => r.status === 'verified').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        lost: reports.filter(r => r.type === 'lost').length,
        found: reports.filter(r => r.type === 'found').length,
    };
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu' };
            case 'verified': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Terverifikasi' };
            case 'resolved': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Selesai' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        }
    };
    
    const getTypeBadge = (type) => {
        if (type === 'lost') {
            return { bg: 'bg-red-100 text-red-700', label: 'Hilang' };
        }
        return { bg: 'bg-teal-100 text-teal-700', label: 'Ditemukan' };
    };
    
    return (
        <AuthenticatedLayout>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-5 right-5 z-50 animate-slideIn">
                    <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
                        toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                        <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                            {toast.message}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Bulk Action Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scaleIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600">verified</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Konfirmasi Aksi Massal</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm">
                            Anda akan mengubah status <span className="font-bold text-blue-600">{selectedReports.length}</span> laporan menjadi <span className="font-bold">{bulkAction === 'verified' ? 'Terverifikasi' : 'Selesai'}</span>.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition font-semibold text-sm">
                                Batal
                            </button>
                            <button onClick={confirmBulkAction} disabled={isProcessing} className="px-4 py-2 bg-[#185FA5] text-white rounded-xl hover:bg-[#0C447C] transition disabled:opacity-50 font-semibold text-sm">
                                {isProcessing ? 'Memproses...' : 'Ya, Lanjutkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Verifikasi Laporan</h2>
                        <p className="text-gray-500 text-sm">Kelola dan verifikasi temuan barang di lingkungan sekolah SMKN 2 Surabaya.</p>
                    </div>
                    
                    {/* Stats Grid - 6 Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-[#185FA5]/10 text-[#185FA5] rounded-lg">
                                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                                </div>
                                <span className="text-[10px] text-green-600 font-semibold">+12%</span>
                            </div>
                            <p className="text-xs text-gray-500">Total Laporan</p>
                            <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                                    <span className="material-symbols-outlined text-sm">pending_actions</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Menunggu</p>
                            <h3 className="text-xl font-bold text-gray-900">{stats.pending}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Terverifikasi</p>
                            <h3 className="text-xl font-bold text-gray-900">{stats.verified}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                    <span className="material-symbols-outlined text-sm">task_alt</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Selesai</p>
                            <h3 className="text-xl font-bold text-gray-900">{stats.resolved}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                                    <span className="material-symbols-outlined text-sm">search_off</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Hilang</p>
                            <h3 className="text-xl font-bold text-gray-900">{stats.lost}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                                    <span className="material-symbols-outlined text-sm">category</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Ditemukan</p>
                            <h3 className="text-xl font-bold text-gray-900">{stats.found}</h3>
                        </div>
                    </div>
                    
                    {/* Select All & Bulk Actions */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {paginatedReports.length > 0 && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectAll && paginatedReports.length > 0}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-[#185FA5] focus:ring-[#185FA5]"
                                />
                                <label className="text-sm text-gray-600">
                                    Pilih semua ({paginatedReports.length} laporan)
                                </label>
                            </div>
                        )}
                        {selectedReports.length > 0 && (
                            <>
                                {selectedReports.some(id => {
                                    const report = filteredReports.find(r => r.id === id);
                                    return report && report.status === 'pending';
                                }) && (
                                    <button
                                        onClick={() => { setBulkAction('verified'); handleBulkAction(); }}
                                        className="px-3 py-1.5 bg-[#185FA5] text-white rounded-lg hover:bg-[#0C447C] transition text-sm font-semibold"
                                    >
                                        Verifikasi ({selectedReports.filter(id => {
                                            const report = filteredReports.find(r => r.id === id);
                                            return report && report.status === 'pending';
                                        }).length})
                                    </button>
                                )}
                                {selectedReports.some(id => {
                                    const report = filteredReports.find(r => r.id === id);
                                    return report && report.status === 'verified';
                                }) && (
                                    <button
                                        onClick={() => { setBulkAction('resolved'); handleBulkAction(); }}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                                    >
                                        Selesaikan ({selectedReports.filter(id => {
                                            const report = filteredReports.find(r => r.id === id);
                                            return report && report.status === 'verified';
                                        }).length})
                                    </button>
                                )}
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeleting}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50"
                                >
                                    Hapus ({selectedReports.length})
                                </button>
                                <button
                                    onClick={() => setSelectedReports([])}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                                >
                                    Batal Pilih
                                </button>
                            </>
                        )}
                    </div>
                    
                    {/* Filter Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Cari barang, pelapor, atau lokasi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#185FA5] focus:border-[#185FA5] text-sm"
                                />
                            </div>
                            <div className="relative w-full sm:w-48">
                                <select
                                    value={regionFilter}
                                    onChange={(e) => setRegionFilter(e.target.value)}
                                    className="w-full appearance-none px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#185FA5] text-sm bg-white"
                                >
                                    <option value="all">🗺️ Semua Kelurahan</option>
                                    {regions.map(region => (
                                        <option key={region.id} value={region.id}>{region.name}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">expand_more</span>
                            </div>
                            <div className="relative w-full sm:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full appearance-none px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#185FA5] text-sm bg-white"
                                >
                                    <option value="all">📊 Semua Status</option>
                                    <option value="pending">⏳ Menunggu</option>
                                    <option value="verified">✅ Terverifikasi</option>
                                    <option value="resolved">🎉 Selesai</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">expand_more</span>
                            </div>
                            <div className="relative w-full sm:w-48">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full appearance-none px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#185FA5] text-sm bg-white"
                                >
                                    <option value="all">📌 Semua Tipe</option>
                                    <option value="lost">🔴 Hilang</option>
                                    <option value="found">🟢 Ditemukan</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">expand_more</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Results Count */}
                    <div className="text-sm text-gray-500 mb-3">
                        Menampilkan {paginatedReports.length} dari {filteredReports.length} laporan
                    </div>
                    
                    {/* Data Table - Stitch Style */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectAll && paginatedReports.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-[#185FA5] focus:ring-[#185FA5]"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Informasi Barang
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Tipe
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Pelapor
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Lokasi
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedReports.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                                                <div className="text-4xl mb-2">📭</div>
                                                <p>Tidak ada laporan yang ditemukan</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedReports.map(report => {
                                            const statusBadge = getStatusBadge(report.status);
                                            const typeBadge = getTypeBadge(report.type);
                                            return (
                                                <tr key={report.id} className="hover:bg-gray-50 transition-all group">
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedReports.includes(report.id)}
                                                            onChange={() => handleSelectReport(report.id)}
                                                            className="rounded border-gray-300 text-[#185FA5] focus:ring-[#185FA5]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {/* Foto Barang */}
                                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                                                                {report.photo ? (
                                                                    <img 
                                                                        src={`/storage/${report.photo}`} 
                                                                        alt={report.item_name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xl">
                                                                        {report.type === 'lost' ? '🔍' : '📦'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">{report.item_name}</p>
                                                                <p className="text-xs text-gray-400">ID: #{report.id} • {report.category || 'Tidak ada kategori'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit ${typeBadge.bg}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${report.type === 'lost' ? 'bg-red-500' : 'bg-teal-500'}`}></span>
                                                            {typeBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-medium text-gray-700">{report.user?.name || '-'}</p>
                                                        <p className="text-xs text-gray-400">{report.user?.role === 'admin' ? 'Admin' : 'Siswa'}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                                {report.location}
                                                            </div>
                                                            {report.region && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                    <span className="material-symbols-outlined text-xs">map</span>
                                                                    {report.region.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {report.status === 'pending' && (
                                                                <button 
                                                                    onClick={() => updateStatus(report.id, 'verified')}
                                                                    disabled={isProcessing}
                                                                    className="px-3 py-1.5 bg-[#185FA5] text-white rounded-lg text-xs font-semibold hover:bg-[#0C447C] transition disabled:opacity-50"
                                                                >
                                                                    Verifikasi
                                                                </button>
                                                            )}
                                                            {report.status === 'verified' && (
                                                                <button 
                                                                    onClick={() => updateStatus(report.id, 'resolved')}
                                                                    disabled={isProcessing}
                                                                    className="px-3 py-1.5 border border-[#185FA5] text-[#185FA5] rounded-lg text-xs font-semibold hover:bg-[#185FA5]/5 transition disabled:opacity-50"
                                                                >
                                                                    Selesaikan
                                                                </button>
                                                            )}
                                                            <Link 
                                                                href={`/reports/${report.id}`}
                                                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedReports.length)} of {sortedReports.length} entries
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    {getPageNumbers().map((page, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                                                currentPage === page
                                                    ? 'bg-[#185FA5] text-white'
                                                    : page === '...'
                                                        ? 'cursor-default text-gray-400'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                            disabled={page === '...'}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
            
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
            `}</style>
        </AuthenticatedLayout>
    );
}