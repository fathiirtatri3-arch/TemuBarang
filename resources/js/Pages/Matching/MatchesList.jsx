import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function MatchesList() {
    const { matches, stats } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    console.log('📊 Data Matches:', matches);
    console.log('📊 Sample Match (pertama):', matches[0]);
    console.log('📊 Field yang ada di match:', Object.keys(matches[0] || {}));
    
    const filteredMatches = matches.filter(match => {
        const matchesFilter = filter === 'all' || 
            (filter === 'high' && match.match_score >= 65) ||
            (filter === 'medium' && match.match_score >= 35 && match.match_score < 65) ||
            (filter === 'low' && match.match_score < 35);
        
        const matchesSearch = searchTerm === '' ||
            match.user_report_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.matched_report_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesFilter && matchesSearch;
    });
    
    const getScoreColor = (score) => {
        if (score >= 65) return 'bg-green-100 text-green-700';
        if (score >= 35) return 'bg-amber-100 text-amber-700';
        return 'bg-gray-100 text-gray-600';
    };
    
    const getScoreLabel = (score) => {
        if (score >= 65) return 'Sangat Cocok';
        if (score >= 35) return 'Cukup Cocok';
        return 'Kemungkinan Cocok';
    };
    
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };
    
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-[#185FA5]/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-[#185FA5]" style={{ fontVariationSettings: '"FILL" 1' }}>compare_arrows</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-[#185FA5]">Pencocokan Barang Otomatis</h1>
                                <p className="text-gray-500 text-sm">Sistem AI membandingkan laporan Anda dengan barang yang ditemukan secara real-time.</p>
                            </div>
                        </div>
                        <button className="bg-[#185FA5] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-[#185FA5]/20 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            Refresh Data
                        </button>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border-l-4 border-purple-500 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-600 font-bold text-sm">Total Kecocokan</p>
                                <span className="material-symbols-outlined text-purple-500 p-2 bg-purple-50 rounded-lg">hub</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-purple-900 leading-none">{stats.total_matches || 0}</h2>
                            <div className="mt-3 text-green-600 text-xs font-bold flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-sm">trending_up</span> +3 Baru
                            </div>
                        </div>
                        <div className="bg-white border-l-4 border-green-500 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-600 font-bold text-sm">Sangat Cocok (65%+)</p>
                                <span className="material-symbols-outlined text-green-500 p-2 bg-green-50 rounded-lg">verified</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-green-700 leading-none">{stats.high_score || 0}</h2>
                            <div className="mt-3 text-gray-500 text-xs font-medium">Memerlukan verifikasi segera</div>
                        </div>
                        <div className="bg-white border-l-4 border-amber-500 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-600 font-bold text-sm">Cukup Cocok (35-64%)</p>
                                <span className="material-symbols-outlined text-amber-500 p-2 bg-amber-50 rounded-lg">search_check</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-amber-700 leading-none">{stats.medium_score || 0}</h2>
                            <div className="mt-3 text-gray-500 text-xs font-medium">Perlu pengecekan manual detail</div>
                        </div>
                    </div>
                    
                    {/* Controls - Search & Filter */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-grow w-full">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Cari barang atau ID laporan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#185FA5] focus:border-[#185FA5] outline-none text-sm transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-1 w-full md:w-auto bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                    filter === 'all' 
                                        ? 'bg-[#185FA5] text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilter('high')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                    filter === 'high' 
                                        ? 'bg-[#185FA5] text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Sangat Cocok
                            </button>
                            <button
                                onClick={() => setFilter('medium')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                    filter === 'medium' 
                                        ? 'bg-[#185FA5] text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Cukup Cocok
                            </button>
                        </div>
                    </div>
                    
                    {/* Results */}
                    {filteredMatches.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Kecocokan</h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'Tidak ada hasil yang sesuai dengan pencarian Anda' : 'Belum ditemukan barang yang cocok dengan laporan Anda'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {filteredMatches.map((match, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                                    <div className="p-5 flex-1">
                                        {/* Header Match */}
                                        <div className="flex justify-between items-center mb-4">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${
                                                match.match_score >= 65 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                <span className="material-symbols-outlined text-sm">
                                                    {match.match_score >= 65 ? 'stars' : 'info'}
                                                </span>
                                                {match.match_score}% Match
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">#MATCH-{String(match.id || idx + 1).padStart(4, '0')}</span>
                                        </div>
                                        
                                        {/* Comparison Content */}
                                        <div className="flex flex-col gap-4">
                                            {/* Your Report - SEKARANG BISA TAMPIL FOTO */}
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                                                <p className="text-[10px] font-extrabold text-[#185FA5] uppercase tracking-tighter mb-2">
                                                    {match.user_report_type === 'lost' ? '🔴 Laporan Hilang Anda' : '🟢 Laporan Temuan Anda'}
                                                </p>
                                                <div className="flex gap-3">
                                                    <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {match.user_report_photo ? (
                                                            <img 
                                                                src={`/storage/${match.user_report_photo}`} 
                                                                alt={match.user_report_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl">{match.user_report_type === 'lost' ? '🔍' : '📦'}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{match.user_report_name}</h4>
                                                        <p className="text-[11px] text-gray-500">ID Laporan: #{match.user_report_id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Arrow */}
                                            <div className="flex justify-center">
                                                <span className="material-symbols-outlined text-[#185FA5] text-2xl rotate-90">compare_arrows</span>
                                            </div>
                                            
                                            {/* Matched Report */}
                                            <div className="p-3 bg-[#185FA5]/5 rounded-xl border border-[#185FA5]/20">
                                                <p className="text-[10px] font-extrabold text-[#185FA5] uppercase tracking-tighter mb-2">
                                                    {match.matched_report_type === 'lost' ? '🔴 Laporan Hilang' : '🟢 Laporan Temuan'}
                                                </p>
                                                <div className="flex gap-3">
                                                    <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {/* MATCHED REPORT PUNYA FOTO - PAKAI matched_photo */}
                                                        {match.matched_photo ? (
                                                            <img 
                                                                src={`/storage/${match.matched_photo}`} 
                                                                alt={match.matched_report_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl">{match.matched_report_type === 'lost' ? '🔍' : '📦'}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{match.matched_report_name}</h4>
                                                        <p className="text-[11px] text-gray-500">{match.matched_location || 'Lokasi tidak tersedia'} • {match.matched_date ? formatDate(match.matched_date) : 'Tanggal tidak tersedia'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                        <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm">
                                            Abaikan
                                        </button>
                                        <Link
                                            href={`/reports/${match.matched_report_id}`}
                                            className="flex-[2] py-2.5 bg-[#185FA5] text-white font-bold rounded-xl hover:bg-[#0C447C] transition-all shadow-md text-sm flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                            Lihat Detail
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Load More */}
                    {filteredMatches.length > 4 && (
                        <div className="mt-6 flex justify-center">
                            <button className="text-[#185FA5] font-bold text-sm flex items-center gap-1 hover:underline bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200 transition-all hover:shadow-md">
                                Tampilkan Lebih Banyak
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                        </div>
                    )}
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}