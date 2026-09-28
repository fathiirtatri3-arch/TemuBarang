import { useState, useEffect } from 'react';
import { usePage, useParams, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function MatchResult() {
    const { id } = useParams();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportInfo, setReportInfo] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    const reportId = id;
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };
    
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const reportResponse = await fetch(`/api/reports/${reportId}`, {
                    credentials: 'include'
                });
                if (reportResponse.ok) {
                    const reportData = await reportResponse.json();
                    setReportInfo(reportData.data || reportData);
                }
                
                const matchResponse = await fetch(`/api/reports/${reportId}/match`, {
                    credentials: 'include'
                });
                if (matchResponse.ok) {
                    const matchData = await matchResponse.json();
                    setMatches(Array.isArray(matchData) ? matchData : (matchData.data || []));
                } else {
                    console.error('Failed to fetch matches');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                showToast('Gagal memuat data pencocokan', 'error');
            } finally {
                setLoading(false);
            }
        };
        
        if (reportId) {
            fetchData();
        }
    }, [reportId]);
    
    const handleClaim = (matchedReportId, matchedItemName) => {
        showToast(`Klaim untuk "${matchedItemName}" akan diproses. Silakan hubungi admin sekolah.`, 'info');
    };
    
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-gray-500';
    };
    
    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-gray-100';
    };
    
    const getScoreLabel = (score) => {
        if (score >= 80) return 'Sangat Cocok';
        if (score >= 60) return 'Cukup Cocok';
        return 'Kemungkinan Cocok';
    };
    
    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="fixed inset-0 bg-on-background/40 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
                        <div className="relative inline-block mb-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#185FA5] border-t-transparent mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl">🔍</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Mencari Kecocokan...</h3>
                        <p className="text-sm text-gray-500 mt-2">Kami sedang menganalisis data barang yang cocok dengan laporan Anda</p>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }
    
    return (
        <AuthenticatedLayout>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-5 right-5 z-50 animate-slideIn">
                    <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
                        toast.type === 'success' ? 'bg-green-50 border border-green-200' :
                        toast.type === 'error' ? 'bg-red-50 border border-red-200' :
                        'bg-blue-50 border border-blue-200'
                    }`}>
                        {toast.type === 'success' && (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {toast.type === 'error' && (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {toast.type === 'info' && (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <span className={`text-sm font-medium ${
                            toast.type === 'success' ? 'text-green-800' :
                            toast.type === 'error' ? 'text-red-800' :
                            'text-blue-800'
                        }`}>
                            {toast.message}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                {/* Modal Container */}
                <div className="bg-white w-full max-w-[680px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                    
                    {/* Modal Header */}
                    <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200/30">
                        <h2 className="text-xl font-bold text-gray-900">Hasil Pencocokan</h2>
                        <Link 
                            href={`/reports/${reportId}`}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </Link>
                    </div>
                    
                    {/* Modal Content */}
                    <div className="p-6">
                        <p className="text-gray-500 text-sm mb-6">
                            {matches.length > 0 
                                ? `Kami menemukan ${matches.length} barang yang memiliki kemiripan sangat tinggi dengan laporan Anda.`
                                : 'Belum ditemukan barang yang cocok dengan laporan Anda.'
                            }
                        </p>
                        
                        {matches.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Kecocokan</h3>
                                <p className="text-gray-500 text-sm">
                                    Saat ini belum ditemukan barang yang cocok dengan laporan Anda.
                                </p>
                                <Link 
                                    href={`/reports/${reportId}`}
                                    className="mt-4 inline-block px-4 py-2 bg-[#185FA5] text-white rounded-lg hover:bg-[#0C447C] transition"
                                >
                                    Kembali ke Laporan
                                </Link>
                            </div>
                        ) : (
                            matches.map((match, idx) => (
                                <div 
                                    key={match.id || idx} 
                                    className={`rounded-2xl p-6 mb-6 relative overflow-hidden border ${
                                        match.match_score >= 80 
                                            ? 'bg-green-50/50 border-green-200/50' 
                                            : match.match_score >= 60 
                                                ? 'bg-yellow-50/50 border-yellow-200/50' 
                                                : 'bg-gray-50/50 border-gray-200/50'
                                    }`}
                                >
                                    {/* Match Card */}
                                    <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                                        {/* Image */}
                                        <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden border border-gray-200/20 bg-gray-100 shadow-sm flex-shrink-0">
                                            {match.photo || match.matched_photo ? (
                                                <img 
                                                    src={`/storage/${match.photo || match.matched_photo}`} 
                                                    alt={match.item_name || match.matched_report_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                                    {match.type === 'lost' || match.matched_report_type === 'lost' ? '🔍' : '📦'}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Info Area */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            {match.item_name || match.matched_report_name}
                                                        </h3>
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                            match.match_score >= 80 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : match.match_score >= 60 
                                                                    ? 'bg-yellow-100 text-yellow-700' 
                                                                    : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {getScoreLabel(match.match_score)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                                                        <span>{match.category || match.matched_category || 'Tidak ada kategori'}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Progress Ring */}
                                                <div className="hidden sm:flex flex-col items-center">
                                                    <div className="relative w-16 h-16">
                                                        <svg className="w-16 h-16 transform -rotate-90">
                                                            <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                                                            <circle 
                                                                cx="32" cy="32" r="28" 
                                                                stroke={match.match_score >= 80 ? '#22C55E' : match.match_score >= 60 ? '#F59E0B' : '#6B7280'} 
                                                                strokeWidth="4" 
                                                                fill="none" 
                                                                strokeDasharray={`${(match.match_score / 100) * 176} 176`}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor(match.match_score)}`}>
                                                            {match.match_score}%
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-green-600 mt-1 uppercase tracking-wider">Match</span>
                                                </div>
                                            </div>
                                            
                                            {/* Detail Grid */}
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <span className="material-symbols-outlined text-[#185FA5] text-sm">palette</span>
                                                    <span>{match.color || match.matched_color || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <span className="material-symbols-outlined text-[#185FA5] text-sm">calendar_today</span>
                                                    <span>{match.date ? formatDate(match.date) : match.matched_date ? formatDate(match.matched_date) : '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <span className="material-symbols-outlined text-[#185FA5] text-sm">location_on</span>
                                                    <span>{match.location || match.matched_location || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <span className="material-symbols-outlined text-[#185FA5] text-sm">person</span>
                                                    <span>Ditemukan oleh: {match.user?.name || match.matched_user?.name || 'Admin'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Comparison Section */}
                                    {match.description && match.matched_description && (
                                        <div className="mt-6 pt-6 border-t border-gray-200/30">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Deskripsi Anda</span>
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/20">
                                                        <p className="text-sm text-gray-600 italic">"{match.description}"</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Temuan Sistem</span>
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/20">
                                                        <p className="text-sm text-gray-600 italic">"{match.matched_description}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Modal Footer (Actions) - Only show if there are matches */}
                    {matches.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row-reverse gap-3 border-t border-gray-100">
                            <button
                                onClick={() => handleClaim(matches[0]?.id, matches[0]?.item_name || matches[0]?.matched_report_name)}
                                className="flex-1 sm:flex-none px-8 py-3 bg-[#185FA5] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                            >
                                Klaim Barang
                            </button>
                            <Link
                                href={`/reports/${reportId}`}
                                className="flex-1 sm:flex-none px-8 py-3 bg-transparent border border-gray-400 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-all duration-200 text-center"
                            >
                                Bukan Barang Saya
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .animate-in { animation: fadeIn 0.3s ease-out; }
                .fade-in { animation: fadeIn 0.3s ease-out; }
                .zoom-in { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </AuthenticatedLayout>
    );
}