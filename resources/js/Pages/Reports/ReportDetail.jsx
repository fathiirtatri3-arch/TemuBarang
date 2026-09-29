import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import PetaSambikerepView from '@/Components/GoogleMapView';

export default function ReportDetail() {
    const { report } = usePage().props;
    const [showMatch, setShowMatch] = useState(false);
    const [matches, setMatches] = useState([]);
    const [loadingMatch, setLoadingMatch] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [claimLoading, setClaimLoading] = useState(false);

    const { auth } = usePage().props;
    const user = auth?.user;
    const isOwner = user && report.user_id === user.id;
    const isAdmin = user?.role === 'admin';

    const { delete: destroy, processing } = useForm();

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const formatRelativeTime = (date) => {
        const diff = new Date() - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        return `${days} hari lalu`;
    };

    const checkMatching = async () => {
        setLoadingMatch(true);
        try {
            const response = await fetch(`/api/reports/${report.id}/match`, { credentials: 'include' });
            const data = await response.json();
            setMatches(data);
            setShowMatch(true);
            if (data.length === 0) showToast('Belum ditemukan barang yang cocok', 'info');
        } catch (error) {
            showToast('Gagal mencari kecocokan', 'error');
        } finally {
            setLoadingMatch(false);
        }
    };

    const handleDelete = () => {
        destroy(`/reports/${report.id}`, {
            onSuccess: () => { showToast('Laporan berhasil dihapus', 'success'); setTimeout(() => { window.location.href = '/reports'; }, 500); },
            onError: () => showToast('Gagal menghapus laporan', 'error'),
        });
    };

    const handleClaim = async (targetReportId, itemName) => {
        const confirmMsg = itemName
            ? `Anda yakin ingin mengklaim "${itemName}"? Admin akan memproses permintaan Anda.`
            : 'Anda yakin ingin mengklaim barang ini? Admin akan memproses permintaan Anda.';

        if (confirm(confirmMsg)) {
            setClaimLoading(true);
            try {
                const response = await fetch(`/claims/${targetReportId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
                });
                const data = await response.json();
                if (response.ok) {
                    showToast('Permintaan klaim berhasil dikirim!', 'success');
                    setShowMatch(false);
                } else {
                    showToast(data.message || 'Gagal mengirim klaim', 'error');
                }
            } catch (error) {
                showToast('Terjadi kesalahan', 'error');
            } finally {
                setClaimLoading(false);
            }
        }
    };

    const isLost = report.type === 'lost';
    const statusConfig = {
        pending: { label: 'Sedang Dicari', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
        verified: { label: 'Terverifikasi', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
        resolved: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    }[report.status] || { label: report.status, bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };

    return (
        <AuthenticatedLayout>
            {/* Toast */}
            {toast.show && (
                <div className="fixed top-5 right-5 z-50" style={{ animation: 'slideIn 0.3s ease-out' }}>
                    <div className={`rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 border ${
                        toast.type === 'success' ? 'bg-green-50 border-green-200' :
                        toast.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                        <span className={`text-sm font-semibold ${toast.type === 'success' ? 'text-green-800' : toast.type === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
                            {toast.message}
                        </span>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Laporan</h3>
                        <p className="text-gray-500 text-sm mb-6">Apakah Anda yakin ingin menghapus laporan "<strong>{report.item_name}</strong>"? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm font-semibold">Batal</button>
                            <button onClick={handleDelete} disabled={processing} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50">
                                {processing ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-pointer" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Full size" className="max-w-full max-h-full object-contain p-4" />
                    <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300">✕</button>
                </div>
            )}

            <div className="min-h-screen bg-[#f8f9ff]">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">

                    {/* Breadcrumb + Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                                <Link href="/reports" className="hover:text-[#185FA5] transition">Laporan</Link>
                                <span>/</span>
                                <span>{isLost ? 'Barang Hilang' : 'Barang Temuan'}</span>
                                <span>/</span>
                                <span className="text-[#185FA5] font-semibold">#{report.id}</span>
                            </nav>
                            <h1 className="text-2xl font-black text-gray-900">Detail Laporan</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Status badge */}
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                                {statusConfig.label}
                            </span>
                            {/* Share */}
                            <button
                                onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link disalin!', 'success'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                Bagikan
                            </button>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* LEFT: Foto + Detail */}
                        <div className="lg:col-span-2 space-y-5">

                            {/* Photo Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Foto besar */}
                                <div className="relative h-80 md:h-96 overflow-hidden bg-gray-100 group cursor-pointer"
                                     onClick={() => report.photo && setSelectedImage(`/storage/${report.photo}`)}>
                                    {report.photo ? (
                                        <img
                                            src={`/storage/${report.photo}`}
                                            alt={report.item_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-7xl mb-3">{isLost ? '🔍' : '📦'}</div>
                                                <p className="text-gray-400 text-sm">Tidak ada foto</p>
                                            </div>
                                        </div>
                                    )}
                                    {report.photo && (
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-4">
                                            <p className="text-white text-xs opacity-80">Klik untuk memperbesar</p>
                                        </div>
                                    )}
                                </div>

                                {/* Detail konten */}
                                <div className="p-5 space-y-5">
                                    {/* Type badge + nama */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            <span className={`w-2 h-2 rounded-full ${isLost ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                            {isLost ? 'Barang Hilang' : 'Barang Temuan'}
                                        </span>
                                        {report.category && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                {report.category}
                                            </span>
                                        )}
                                        {report.color && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                                <span className="w-3 h-3 rounded-full border border-orange-200" style={{ backgroundColor: report.color.toLowerCase() }}></span>
                                                {report.color}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-black text-gray-900">{report.item_name}</h2>

                                    {report.description && (
                                        <p className="text-gray-600 leading-relaxed text-sm">{report.description}</p>
                                    )}

                                    <hr className="border-gray-200 border" />

                                    {/* ⭐ PETA LOKASI - TAMBAHKAN DI SINI ⭐ */}
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-[#185FA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Lokasi di Peta
                                        </p>
                                        <PetaSambikerepView
                                            latitude={report.latitude}
                                            longitude={report.longitude}
                                            itemName={report.item_name}
                                        />
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#EAF1FF] flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-[#185FA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">Lokasi Terakhir</p>
                                                <p className="text-sm font-semibold text-gray-800">{report.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#EAF1FF] flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-[#185FA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">Tanggal Kejadian</p>
                                                <p className="text-sm font-semibold text-gray-800">{formatDate(report.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Sidebar */}
                        <div className="space-y-4">

                            {/* Pelapor Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Pelapor</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#185FA5] flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                                        {report.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{report.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-400">{report.user?.role === 'admin' ? 'Admin' : 'Siswa'}</p>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="space-y-2 pt-1">
                                    {/* Cari Kecocokan */}
                                    {isLost && report.status !== 'resolved' && (
                                        <button
                                            onClick={checkMatching}
                                            disabled={loadingMatch}
                                            className="w-full py-2.5 bg-[#185FA5] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#134d87] transition disabled:opacity-50"
                                        >
                                            {loadingMatch ? (
                                                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Mencari...</>
                                            ) : (
                                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Cari Kecocokan</>
                                            )}
                                        </button>
                                    )}

                                    {/* Klaim */}
                                    {!isLost && !isOwner && report.status !== 'resolved' && (
                                        <button
                                            onClick={() => handleClaim(report.id, report.item_name)}
                                            disabled={claimLoading}
                                            className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            {claimLoading ? 'Memproses...' : '📦 Klaim Barang Ini'}
                                        </button>
                                    )}

                                    {/* Edit */}
                                    {(isOwner || isAdmin) && report.status !== 'resolved' && (
                                        <Link
                                            href={`/reports/${report.id}/edit`}
                                            className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Edit Laporan
                                        </Link>
                                    )}

                                    {/* Hapus */}
                                    {(isOwner || isAdmin) && (
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Hapus Laporan
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Status Timeline Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Status Laporan</p>
                                <div className="relative space-y-4 pl-2">
                                    <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                                    {/* Step 1: Dibuat */}
                                    <div className="flex gap-3 items-start">
                                        <div className="w-7 h-7 rounded-full bg-[#185FA5] flex items-center justify-center z-10 flex-shrink-0 shadow-sm">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Laporan Dibuat</p>
                                            <p className="text-xs text-gray-400">{formatDate(report.created_at)} • Oleh {report.user?.name}</p>
                                        </div>
                                    </div>

                                    {/* Step 2: Verifikasi */}
                                    <div className="flex gap-3 items-start">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 flex-shrink-0 shadow-sm ${report.status === 'verified' || report.status === 'resolved' ? 'bg-[#185FA5]' : 'bg-gray-100 border border-gray-200'}`}>
                                            {report.status === 'verified' || report.status === 'resolved' ? (
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                            )}
                                        </div>
                                        <div className={report.status === 'verified' || report.status === 'resolved' ? '' : 'opacity-40'}>
                                            <p className="text-sm font-bold text-gray-800">Diverifikasi Admin</p>
                                            <p className="text-xs text-gray-400">{report.status === 'pending' ? 'Menunggu verifikasi...' : formatRelativeTime(report.updated_at)}</p>
                                        </div>
                                    </div>

                                    {/* Step 3: Selesai */}
                                    <div className="flex gap-3 items-start">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 flex-shrink-0 shadow-sm ${report.status === 'resolved' ? 'bg-green-500' : 'bg-gray-100 border border-gray-200'}`}>
                                            {report.status === 'resolved' ? (
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                            )}
                                        </div>
                                        <div className={report.status === 'resolved' ? '' : 'opacity-40'}>
                                            <p className="text-sm font-bold text-gray-800">Selesai / Ditemukan</p>
                                            <p className="text-xs text-gray-400">{report.status === 'resolved' ? formatRelativeTime(report.updated_at) : 'Menunggu update...'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tips Card */}
                            <div className="bg-[#EAF1FF] border border-blue-100 rounded-2xl p-4 flex gap-3">
                                <svg className="w-4 h-4 text-[#185FA5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-xs text-[#185FA5] leading-relaxed">
                                    <strong>Tips:</strong> Selalu gunakan fitur resmi untuk berkoordinasi. Jangan bagikan nomor telepon pribadi di deskripsi publik.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

{/* Modal Hasil Pencocokan */}
            {showMatch && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Hasil Pencocokan</h2>
                            <button onClick={() => setShowMatch(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                            <p className="text-gray-500 text-sm mb-5">
                                {matches.length > 0
                                    ? `Kami menemukan ${matches.length} barang yang memiliki kemiripan sangat tinggi dengan laporan Anda.`
                                    : 'Belum ditemukan barang yang cocok dengan laporan Anda.'}
                            </p>

                            {matches.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-5xl mb-3">🔍</div>
                                    <h3 className="font-bold text-gray-900 mb-1">Belum Ada Kecocokan</h3>
                                    <p className="text-gray-400 text-sm">Kami akan memberi tahu jika ada kecocokan baru.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {matches.map((match) => (
                                        <div key={match.id} className={`rounded-2xl p-5 border ${
                                            match.match_score >= 80 ? 'bg-green-50/50 border-green-200' :
                                            match.match_score >= 60 ? 'bg-yellow-50/50 border-yellow-200' : 'bg-gray-50/50 border-gray-200'
                                        }`}>
                                            <div className="flex gap-4">
                                                {/* Foto */}
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {match.photo ? (
                                                        <img src={`/storage/${match.photo}`} alt={match.item_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="font-bold text-gray-900">{match.item_name}</h3>
                                                        {match.match_score >= 80 && <span className="px-2.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-bold">Sangat Cocok</span>}
                                                        {match.match_score >= 60 && match.match_score < 80 && <span className="px-2.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full font-bold">Cukup Cocok</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mb-2">{match.category || '-'}</p>

                                                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">🎨 {match.color || '-'}</span>
                                                        <span className="flex items-center gap-1">📅 {formatDate(match.date)}</span>
                                                        <span className="flex items-center gap-1">📍 {match.location}</span>
                                                        <span className="flex items-center gap-1">👤 {match.user?.name || 'Admin'}</span>
                                                    </div>
                                                </div>

                                                {/* Match ring */}
                                                <div className="flex flex-col items-center flex-shrink-0">
                                                    <div className="relative w-14 h-14 mb-1">
                                                        <svg className="w-14 h-14 -rotate-90">
                                                            <circle cx="28" cy="28" r="24" stroke="#E5E7EB" strokeWidth="4" fill="none"/>
                                                            <circle cx="28" cy="28" r="24" stroke={match.match_score >= 80 ? '#22C55E' : match.match_score >= 60 ? '#F59E0B' : '#6B7280'} strokeWidth="4" fill="none" strokeDasharray={`${(match.match_score / 100) * 150} 150`} strokeLinecap="round"/>
                                                        </svg>
                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-700">{match.match_score}%</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Match</span>
                                                </div>
                                            </div>

                                            {/* Deskripsi compare */}
                                            {(report.description || match.description) && (
                                                <div className="mt-4 pt-4 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deskripsi Anda</p>
                                                        <p className="text-xs text-gray-600 italic bg-white rounded-lg p-2.5 border border-gray-100">
                                                            "{report.description || '-'}"
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Temuan Sistem</p>
                                                        <p className="text-xs text-gray-600 italic bg-white rounded-lg p-2.5 border border-gray-100">
                                                            "{match.description || '-'}"
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tombol aksi per-item */}
                                            <div className="mt-4 pt-4 border-t border-gray-200/60 flex flex-col sm:flex-row-reverse gap-2">
                                                <button
                                                    onClick={() => handleClaim(match.id, match.item_name)}
                                                    disabled={claimLoading}
                                                    className="flex-1 sm:flex-none px-5 py-2 bg-[#185FA5] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#134d87] hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {claimLoading ? 'Memproses...' : 'Klaim Barang'}
                                                </button>
                                                <button
                                                    onClick={() => showToast('Baik, dilewati.', 'info')}
                                                    className="flex-1 sm:flex-none px-5 py-2 bg-white border border-gray-300 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-100 transition-all active:scale-95"
                                                >
                                                    Bukan Barang Saya
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `}</style>
        </AuthenticatedLayout>
    );
}