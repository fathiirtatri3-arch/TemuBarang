import { usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function UserDetail() {
    const { user, stats, recentReports } = usePage().props;
    
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    
    const formatDateTime = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu' };
            case 'verified': return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terverifikasi' };
            case 'resolved': return { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        }
    };
    
    // ⭐ Fungsi helper role (khusus admin)
    const getRoleLabel = (role) => {
        switch(role) {
            case 'super_admin': return 'Super Admin';
            case 'admin_kelurahan': return 'Admin Kelurahan';
            case 'admin': return 'Admin';
            default: return 'Warga';
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'super_admin': 
                return { bg: 'bg-purple-100 text-purple-700', label: 'Super Admin' };
            case 'admin_kelurahan': 
                return { bg: 'bg-blue-100 text-blue-700', label: 'Admin Kelurahan' };
            case 'admin': 
                return { bg: 'bg-blue-100 text-blue-700', label: 'Admin' };
            default: 
                return { bg: 'bg-green-100 text-green-700', label: 'Warga' };
        }
    };
    
    const roleBadge = getRoleBadge(user.role);
    
    // Hitung persentase untuk statistik
    const totalReports = stats.total_reports || 0;
    const lostReports = stats.lost_reports || 0;
    const foundReports = stats.found_reports || 0;
    const verifiedReports = stats.verified_reports || 0;
    const resolvedReports = stats.resolved_reports || 0;
    
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Back Button */}
                    <Link 
                        href="/admin/users" 
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#185FA5] transition mb-4 text-sm font-medium group"
                    >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Kembali ke Manajemen User
                    </Link>
                    
                    {/* Hero Profile Section */}
                    <section className="relative bg-[#185FA5] rounded-3xl overflow-hidden p-8 flex flex-col md:flex-row items-center gap-8 text-white shadow-lg">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                        
                        <div className="relative z-10 group flex-shrink-0">
                            <div className="w-32 h-32 rounded-3xl border-4 border-white/20 overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500 bg-white/20 flex items-center justify-center">
                                {user.avatar ? (
                                    <img 
                                        src={`/storage/${user.avatar}`} 
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-bold text-white">
                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="relative z-10 text-center md:text-left space-y-2 flex-1">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white">{user.name}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                                <span className={`px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/10 ${roleBadge.bg}`}>
                                    {roleBadge.label}
                                </span>
                                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/10 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">mail</span>
                                    {user.email}
                                </span>
                                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/10 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    Bergabung: {formatDate(user.created_at)}
                                </span>
                            </div>
                            <p className="text-sm opacity-80 pt-2 max-w-lg">
                                {user.role === 'super_admin' 
                                    ? 'Super Admin yang mengelola seluruh sistem TemuBarang Kecamatan Sambikerep.' 
                                    : user.role === 'admin_kelurahan' 
                                        ? 'Admin Kelurahan yang membantu verifikasi laporan di wilayahnya.' 
                                        : 'Warga Kecamatan Sambikerep yang menggunakan sistem TemuBarang.'}
                            </p>
                        </div>
                    </section>
                    
                    {/* GRID 2 KOLOM: Kiri (Laporan Terbaru) + Kanan (Statistik & Info) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                        
                        {/* KOLOM KIRI - Laporan Terbaru (7 kolom) */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full">
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#185FA5]">list_alt</span>
                                        <h3 className="font-bold text-lg text-gray-900">Laporan Terbaru</h3>
                                    </div>
                                    <span className="text-xs text-gray-400">{recentReports?.length || 0} laporan</span>
                                </div>
                                
                                {recentReports?.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="text-5xl mb-3">📭</div>
                                        <p className="text-gray-500 text-sm">Belum ada laporan dari user ini</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {recentReports.map((report) => {
                                            const statusBadge = getStatusBadge(report.status);
                                            return (
                                                <Link 
                                                    key={report.id} 
                                                    href={`/reports/${report.id}`}
                                                    className="block hover:bg-gray-50 transition-colors group"
                                                >
                                                    <div className="px-5 py-4">
                                                        {/* Baris 1: Nama + Badge Status + Type */}
                                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                                            <h4 className="font-semibold text-gray-900 group-hover:text-[#185FA5] transition-colors text-base">
                                                                {report.item_name}
                                                            </h4>
                                                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                                                {statusBadge.label}
                                                            </span>
                                                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                                                                report.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                {report.type === 'lost' ? 'Hilang' : 'Ditemukan'}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Baris 2: Detail Info (Lokasi, Tanggal, Kategori) */}
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                                {report.location}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                                {formatDate(report.date)}
                                                            </span>
                                                            {report.category && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm">category</span>
                                                                    {report.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Baris 3: Tanggal Dibuat (opsional, untuk info tambahan) */}
                                                        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                                            Dibuat: {formatDateTime(report.created_at)}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {recentReports?.length > 5 && (
                                    <div className="p-4 border-t border-gray-100 text-center">
                                        <Link 
                                            href="/reports" 
                                            className="text-sm font-semibold text-[#185FA5] hover:underline"
                                        >
                                            Lihat semua laporan →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* KOLOM KANAN - Statistik & Info (5 kolom) */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* Statistik Aktivitas */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#185FA5]">analytics</span>
                                    Statistik Aktivitas
                                </h3>
                                <div className="space-y-4">
                                    {/* Metric 1: Laporan Diverifikasi */}
                                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#D4E3FF] rounded-xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#185FA5] text-sm">fact_check</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Laporan Diverifikasi</p>
                                                <p className="text-xl font-extrabold text-gray-900">{verifiedReports || 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-green-600 font-bold text-sm">
                                            <span className="material-symbols-outlined text-sm">trending_up</span>
                                            {totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 0}%
                                        </div>
                                    </div>
                                    
                                    {/* Metric 2: Klaim Disetujui */}
                                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#FFDCC4] rounded-xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#6F3800] text-sm">handshake</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Klaim Disetujui</p>
                                                <p className="text-xl font-extrabold text-gray-900">{resolvedReports || 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-green-600 font-bold text-sm">
                                            <span className="material-symbols-outlined text-sm">trending_up</span>
                                            {totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0}%
                                        </div>
                                    </div>
                                    
                                    {/* Metric 3: Total Laporan */}
                                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#E7E8EE] rounded-xl flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#424751] text-sm">description</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Total Laporan</p>
                                                <p className="text-xl font-extrabold text-gray-900">{totalReports}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-500 font-bold text-sm">
                                            Laporan
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Log Login Terakhir */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#185FA5] text-sm">history</span>
                                    Log Login Terakhir
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">computer</span>
                                            <span className="text-gray-700">Chrome on Windows</span>
                                        </div>
                                        <span className="text-xs text-gray-400">Hari ini, 08:45</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">smartphone</span>
                                            <span className="text-gray-700">Safari on iPhone</span>
                                        </div>
                                        <span className="text-xs text-gray-400">Kemarin, 19:20</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Informasi Penting */}
                            <div className="bg-[#185FA5]/5 rounded-2xl p-5 border border-[#185FA5]/10">
                                <div className="flex gap-3">
                                    <span className="material-symbols-outlined text-[#185FA5]">info</span>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-[#185FA5]">Informasi Penting</p>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {user.role === 'super_admin' 
                                                ? 'Sebagai Super Admin, Anda bertanggung jawab atas seluruh sistem dan pengelolaan data pengguna.' 
                                                : user.role === 'admin_kelurahan' 
                                                    ? 'Sebagai Admin Kelurahan, Anda bertanggung jawab atas verifikasi laporan di wilayah Anda.' 
                                                    : 'Pastikan data laporan yang Anda kirimkan akurat untuk mempermudah proses verifikasi.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <style>{`
                .interactive-card {
                    transition: all 0.3s ease;
                }
                .interactive-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px -4px rgba(24, 95, 165, 0.12);
                }
            `}</style>
        </AuthenticatedLayout>
    );
}