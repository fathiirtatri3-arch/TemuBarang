import { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ClaimDetail() {
    const { claim } = usePage().props;
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyAction, setVerifyAction] = useState('');
    
    const verifyClaim = (status) => {
        setVerifyAction(status);
        setShowVerifyModal(true);
    };
    
    const confirmVerify = () => {
        setProcessing(true);
        router.put(`/admin/claims/${claim.id}`, {
            status: verifyAction,
            admin_note: adminNote,
        }, {
            onSuccess: () => {
                setShowVerifyModal(false);
                setProcessing(false);
                setTimeout(() => window.location.reload(), 500);
            },
            onError: () => {
                setProcessing(false);
            }
        });
    };
    
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    const getStatusBadge = () => {
        switch(claim.status) {
            case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-800', label: '⏳ Menunggu Verifikasi', dot: 'bg-amber-500' };
            case 'approved': return { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Disetujui', dot: 'bg-green-500' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Ditolak', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: claim.status, dot: 'bg-gray-500' };
        }
    };
    
    const statusBadge = getStatusBadge();
    
    return (
        <AuthenticatedLayout>
            {/* Confirm Verify Modal */}
            {showVerifyModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scaleIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                verifyAction === 'approved' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                <span className="text-xl">{verifyAction === 'approved' ? '✅' : '❌'}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {verifyAction === 'approved' ? 'Setujui Klaim' : 'Tolak Klaim'}
                            </h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            {verifyAction === 'approved' 
                                ? 'Anda akan menyetujui klaim ini. Pastikan data sudah benar.' 
                                : 'Anda akan menolak klaim ini. Berikan alasan yang jelas.'}
                        </p>
                        {verifyAction === 'rejected' && (
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Alasan Penolakan
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Masukkan alasan penolakan..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#185FA5] text-sm"
                                    rows="3"
                                    required
                                />
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={confirmVerify}
                                disabled={processing || (verifyAction === 'rejected' && !adminNote)}
                                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${
                                    verifyAction === 'approved' 
                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            >
                                {processing ? 'Memproses...' : (verifyAction === 'approved' ? 'Ya, Setujui' : 'Ya, Tolak')}
                            </button>
                            <button
                                onClick={() => setShowVerifyModal(false)}
                                className="py-2.5 px-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-semibold text-sm"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Breadcrumb / Back Button */}
                    <div className="mb-8">
                        <Link 
                            href="/admin/claims" 
                            className="group inline-flex items-center gap-2 text-gray-500 hover:text-[#185FA5] transition text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Kembali ke Manajemen Klaim
                        </Link>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#185FA5] text-3xl">package_2</span>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Detail Klaim</h1>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">Informasi lengkap permintaan klaim barang temuan</p>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 ${statusBadge.bg} rounded-full shadow-sm`}>
                                <span className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`}></span>
                                <span className={`text-sm font-semibold ${statusBadge.text}`}>{statusBadge.label}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bento Layout */}
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* Informasi Barang */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                <span className="material-symbols-outlined text-[#185FA5]">inventory_2</span>
                                <h3 className="text-lg font-bold text-gray-900">Informasi Barang</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Nama Barang</p>
                                    <p className="text-lg font-bold text-gray-900">{claim.report?.item_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Kategori</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400">edit_note</span>
                                        <p className="text-lg font-bold text-gray-900">{claim.report?.category || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Lokasi</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400">location_on</span>
                                        <p className="text-lg font-bold text-gray-900">{claim.report?.location}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Tanggal Kejadian</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400">calendar_month</span>
                                        <p className="text-lg font-bold text-gray-900">{formatDate(claim.report?.date)}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Warna</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        {claim.report?.color && (
                                            <div className="w-6 h-6 rounded-full border border-gray-200 shadow-inner" 
                                                 style={{ backgroundColor: claim.report.color.toLowerCase() }}></div>
                                        )}
                                        <p className="text-lg font-bold text-gray-900">{claim.report?.color || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Lampiran Foto</p>
                                    <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-20 w-full bg-gray-100">
                                        {claim.report?.photo ? (
                                            <img 
                                                src={`/storage/${claim.report.photo}`} 
                                                alt={claim.report?.item_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span className="material-symbols-outlined text-3xl">image</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* 2 Kolom: Pengklaim & Penemu */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Informasi Pengklaim */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <span className="material-symbols-outlined text-[#185FA5]">person</span>
                                    <h3 className="text-lg font-bold text-gray-900">Informasi Pengklaim</h3>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-gray-500">account_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Nama</p>
                                            <p className="text-base font-bold text-gray-900">{claim.claimant?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-gray-500">mail</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Email</p>
                                            <p className="text-base font-bold text-gray-900">{claim.claimant?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-gray-500">event</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Tanggal Klaim</p>
                                            <p className="text-base font-bold text-gray-900">{formatDate(claim.created_at)}</p>
                                        </div>
                                    </div>
                                    {claim.message && (
                                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">
                                            <p className="text-sm italic text-gray-600">"{claim.message}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Informasi Penemu */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <span className="material-symbols-outlined text-[#185FA5]">verified</span>
                                    <h3 className="text-lg font-bold text-gray-900">Informasi Penemu</h3>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-gray-500">account_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Nama</p>
                                            <p className="text-base font-bold text-gray-900">{claim.owner?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-gray-500">mail</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Email</p>
                                            <p className="text-base font-bold text-gray-900">{claim.owner?.email}</p>
                                        </div>
                                    </div>
                                    {claim.owner?.phone && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-gray-500">phone</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Telepon</p>
                                                <p className="text-base font-bold text-gray-900">{claim.owner.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Verifikasi Klaim - Action Footer */}
                        {claim.status === 'pending' && (
                            <div className="bg-gray-50 border-t-4 border-[#185FA5] rounded-2xl p-6 shadow-sm mt-2">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-[#185FA5">task_alt</span>
                                    <h3 className="text-lg font-bold text-gray-900">Verifikasi Klaim</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => verifyClaim('approved')}
                                        disabled={processing}
                                        className="flex items-center justify-center gap-3 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                                        Setujui Klaim
                                    </button>
                                    <button
                                        onClick={() => verifyClaim('rejected')}
                                        disabled={processing}
                                        className="flex items-center justify-center gap-3 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined">cancel</span>
                                        Tolak Klaim
                                    </button>
                                </div>
                                <p className="text-center text-gray-500 text-xs mt-4">
                                    Tindakan ini akan secara permanen memperbarui status klaim dan memberitahukan pengguna melalui email.
                                </p>
                            </div>
                        )}
                        
                        {/* Info jika sudah diverifikasi */}
                        {claim.status !== 'pending' && claim.verified_at && (
                            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[#185FA5]">verified</span>
                                    <p className="text-sm font-medium text-gray-700">
                                        Diverifikasi oleh <span className="font-bold">{claim.verifier?.name}</span>
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400">{formatDate(claim.verified_at)}</p>
                                {claim.admin_note && (
                                    <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 text-left max-w-md mx-auto">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Catatan</p>
                                        <p className="text-sm text-gray-700">{claim.admin_note}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                    </div>
                    
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