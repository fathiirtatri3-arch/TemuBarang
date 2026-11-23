import { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminClaims() {
    const { claims, stats } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Filter claims berdasarkan status dan search
    const filteredClaims = claims.filter(claim => {
        const matchesStatus = filter === 'all' || claim.status === filter;
        const matchesSearch = searchTerm === '' || 
            claim.report?.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.claimant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    
    // Pagination
    const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClaims = filteredClaims.slice(startIndex, startIndex + itemsPerPage);
    
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
    
    const openVerifyModal = (claim) => {
        setSelectedClaim(claim);
        setAdminNote('');
        setShowModal(true);
    };
    
    const verifyClaim = (status) => {
        router.put(`/admin/claims/${selectedClaim.id}`, {
            status: status,
            admin_note: adminNote,
        }, {
            onSuccess: () => {
                setShowModal(false);
                setTimeout(() => window.location.reload(), 500);
            },
        });
    };
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Menunggu', dot: 'bg-amber-500' };
            case 'approved': return { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui', dot: 'bg-green-500' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: status, dot: 'bg-gray-500' };
        }
    };
    
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    // Reset ke halaman 1 saat filter berubah
    useState(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);
    
    const totalPending = stats.pending || 0;
    const totalApproved = stats.approved || 0;
    const totalRejected = stats.rejected || 0;
    
    return (
        <AuthenticatedLayout>
            {/* Verification Modal */}
            {showModal && selectedClaim && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scaleIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#185FA5]/10 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#185FA5]">verified</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Verifikasi Klaim</h3>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Barang</p>
                                <p className="font-semibold text-gray-900">{selectedClaim.report?.item_name}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Pengklaim</p>
                                <p className="font-semibold text-gray-900">{selectedClaim.claimant?.name}</p>
                                <p className="text-xs text-gray-400">{selectedClaim.claimant?.email}</p>
                            </div>
                            {selectedClaim.message && (
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Pesan</p>
                                    <p className="text-sm text-gray-600">{selectedClaim.message}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Alasan penolakan (wajib jika menolak)
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Alasan penolakan..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#185FA5] focus:border-[#185FA5] text-sm"
                                rows="3"
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => verifyClaim('approved')}
                                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-sm"
                            >
                                ✅ Setujui
                            </button>
                            <button
                                onClick={() => verifyClaim('rejected')}
                                disabled={!adminNote.trim()}
                                title={!adminNote.trim() ? 'Isi alasan penolakan terlebih dahulu' : ''}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ❌ Tolak
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2.5 px-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-semibold text-sm"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Klaim</h2>
                        <p className="text-gray-500 text-sm max-w-2xl">
                            Halaman verifikasi klaim barang hilang. Pastikan identitas pengklaim sesuai dengan bukti kepemilikan sebelum menyetujui penyerahan barang.
                        </p>
                    </div>
                    
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#185FA5] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="material-symbols-outlined text-4xl mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>pending_actions</span>
                                <h4 className="text-xs font-semibold uppercase tracking-wider opacity-80">Menunggu Verifikasi</h4>
                                <div className="flex items-baseline gap-2 mt-3">
                                    <span className="text-4xl font-extrabold">{totalPending}</span>
                                    <span className="text-sm opacity-70">Klaim Baru</span>
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10">
                                <span className="material-symbols-outlined text-[160px]">inventory_2</span>
                            </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="material-symbols-outlined text-3xl text-green-600 mb-2">check_circle</span>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Disetujui</h4>
                                    <div className="flex items-baseline gap-2 mt-3">
                                        <span className="text-3xl font-extrabold text-gray-900">{totalApproved}</span>
                                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <span className="material-symbols-outlined text-3xl text-red-600 mb-2">cancel</span>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ditolak</h4>
                            <div className="flex items-baseline gap-2 mt-3">
                                <span className="text-3xl font-extrabold text-gray-900">{totalRejected}</span>
                                <span className="text-sm text-gray-400 opacity-60">Total</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 w-full md:w-auto flex-wrap">
                            <button 
                                onClick={() => { setFilter('all'); setCurrentPage(1); }}
                                className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${
                                    filter === 'all' 
                                        ? 'bg-white shadow-sm text-[#185FA5]' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Semua
                            </button>
                            <button 
                                onClick={() => { setFilter('pending'); setCurrentPage(1); }}
                                className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${
                                    filter === 'pending' 
                                        ? 'bg-white shadow-sm text-[#185FA5]' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Menunggu
                            </button>
                            <button 
                                onClick={() => { setFilter('approved'); setCurrentPage(1); }}
                                className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${
                                    filter === 'approved' 
                                        ? 'bg-white shadow-sm text-[#185FA5]' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Disetujui
                            </button>
                            <button 
                                onClick={() => { setFilter('rejected'); setCurrentPage(1); }}
                                className={`px-6 py-2 rounded-lg font-semibold text-sm transition ${
                                    filter === 'rejected' 
                                        ? 'bg-white shadow-sm text-[#185FA5]' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Ditolak
                            </button>
                        </div>
                    </div>
                    
                    {/* Claim Table */}
                    {paginatedClaims.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada klaim</h3>
                            <p className="text-gray-500">Belum ada permintaan klaim dari pengguna</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Barang &amp; Status</th>
                                            <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Pengklaim</th>
                                            <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Pemilik Temuan</th>
                                            <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Lokasi &amp; Waktu</th>
                                            <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedClaims.map(claim => {
                                            const statusBadge = getStatusBadge(claim.status);
                                            return (
                                                <tr key={claim.id} className="hover:bg-gray-50 transition-all group">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                                                {claim.report?.photo ? (
                                                                    <img 
                                                                        src={`/storage/${claim.report.photo}`} 
                                                                        alt={claim.report?.item_name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                                                        📦
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{claim.report?.item_name}</p>
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                                                                    {statusBadge.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-gray-800">{claim.claimant?.name}</p>
                                                        <p className="text-xs text-gray-400">{claim.claimant?.email}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-gray-800">{claim.owner?.name}</p>
                                                        <p className="text-xs text-gray-400">{claim.owner?.email}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                                            <p className="text-sm">{claim.report?.location}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-400">{formatDate(claim.created_at)}</p>
                                                        {claim.report?.region?.name && (
                                                            <p className="text-xs text-gray-400 mt-0.5">{claim.report.region.name}</p>
                                                        )}
                                                        {claim.status === 'approved' && (
                                                            <span className={`inline-block mt-1 mr-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                claim.handed_over_at ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {claim.handed_over_at ? 'Sudah diserahkan' : 'Menunggu pengambilan'}
                                                            </span>
                                                        )}
                                                        {claim.is_redemption && (
                                                            <span className="inline-block mt-1 mr-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                                                Klaim Tebus
                                                            </span>
                                                        )}
                                                        {!claim.can_decide && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                                                Hanya info
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {claim.status === 'pending' && claim.can_decide && (
                                                                <>
                                                                    <button
                                                                        onClick={() => openVerifyModal(claim)}
                                                                        className="bg-[#185FA5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0C447C] transition"
                                                                    >
                                                                        Verifikasi
                                                                    </button>
                                                                </>
                                                            )}
                                                            {/* ⭐ ICON MATA UNTUK DETAIL ⭐ */}
                                                            <Link
                                                                href={`/admin/claims/${claim.id}`}
                                                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                                                                title="Lihat Detail"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* ⭐ PAGINATION - HANYA MUNCUL JIKA DATA > 10 ⭐ */}
                            {totalPages > 1 && (
                                <div className="px-5 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50/50">
                                    <p className="text-xs text-gray-500">
                                        Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredClaims.length)} dari {filteredClaims.length} klaim
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                                        </button>
                                        
                                        {getPageNumbers().map((page, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                className={`w-8 h-8 rounded-lg text-sm font-semibold transition ${
                                                    currentPage === page
                                                        ? 'bg-[#185FA5] text-white'
                                                        : page === '...'
                                                            ? 'cursor-default text-gray-400'
                                                            : 'hover:bg-gray-100 text-gray-600'
                                                }`}
                                                disabled={page === '...'}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                </div>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
            `}</style>
        </AuthenticatedLayout>
    );
}