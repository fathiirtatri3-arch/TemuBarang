import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import api from '@/services/api';

export default function Dashboard() {
    const { stats } = usePage().props;
    const [greeting, setGreeting] = useState('');
    const [greetingIcon, setGreetingIcon] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    const [recommendations, setRecommendations] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatIndonesianDate = () => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const today = new Date();
        return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) { setGreeting('Selamat Pagi'); setGreetingIcon('🌅'); }
        else if (hour < 15) { setGreeting('Selamat Siang'); setGreetingIcon('☀️'); }
        else if (hour < 18) { setGreeting('Selamat Sore'); setGreetingIcon('🌤️'); }
        else { setGreeting('Selamat Malam'); setGreetingIcon('🌙'); }
        setCurrentDate(formatIndonesianDate());
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [recRes, actRes] = await Promise.all([
                    api.get('/recommendations'),
                    api.get('/activities')
                ]);
                if (recRes.data.success) setRecommendations(recRes.data.data);
                if (actRes.data.success) setActivities(actRes.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Gagal memuat data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const { auth } = usePage().props;
    const user = auth?.user;
    const userName = user?.name || 'Pengguna';
    const isAdmin = user?.role === 'admin';

    const tips = [
        { icon: 'label', title: 'Label Nama', desc: 'Berikan inisial atau nama pada barang pribadi.' },
        { icon: 'photo_camera', title: 'Foto Inventaris', desc: 'Simpan foto detail sebagai bukti klaim valid.' },
        { icon: 'notifications_active', title: 'Push Notif', desc: 'Aktifkan notifikasi untuk kecocokan real-time.' },
    ];

    const quickActions = [
        { icon: 'add_box', label: 'Lapor Barang', href: '/reports/create', bgColor: 'bg-[#EAF1FF]', hoverBg: 'group-hover:bg-[#185FA5]', textColor: 'text-[#185FA5]' },
        { icon: 'search', label: 'Cari Temuan', href: '/reports', bgColor: 'bg-green-50', hoverBg: 'group-hover:bg-green-600', textColor: 'text-green-700' },
        { icon: 'auto_awesome', label: 'AI Matcher', href: '/matches', bgColor: 'bg-purple-50', hoverBg: 'group-hover:bg-purple-600', textColor: 'text-purple-700' },
        { icon: 'print', label: 'Cetak Label', href: '#', bgColor: 'bg-orange-50', hoverBg: 'group-hover:bg-orange-600', textColor: 'text-orange-700' },
    ];

    // Stat cards sesuai Stitch: angka besar + label + badge kecil di kanan
    const statCards = [
        {
            key: 'total', label: 'Total Laporan', value: stats.total_reports,
            icon: 'description', valueColor: 'text-[#185FA5]',
            badge: '+5%', badgeColor: 'text-green-600', badgeLabel: '',
            href: '/reports'
        },
        {
            key: 'pending', label: 'Menunggu Verifikasi', value: stats.pending_reports,
            icon: 'hourglass_empty', valueColor: 'text-yellow-500',
            badge: 'ACTION REQ.', badgeColor: 'text-yellow-600', badgeLabel: '',
            href: '/reports?status=pending'
        },
        {
            key: 'resolved', label: 'Telah Selesai', value: stats.resolved_reports,
            icon: 'verified', valueColor: 'text-green-500',
            badge: '', badgeColor: '', badgeLabel: '',
            href: '/reports?status=resolved'
        },
        {
            key: 'searching', label: 'Masih Dicari', value: stats.total_reports - stats.resolved_reports,
            icon: 'search', valueColor: 'text-red-500',
            badge: 'ACTIVE', badgeColor: 'text-red-500', badgeLabel: '',
            href: '/reports'
        },
    ];

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-[#F8FAFC]">
                <main className="w-full">
                    {/* ===== BANNER BIRU ===== */}
                    <div
                        className="relative flex flex-col justify-end overflow-hidden"
                        style={{
                            backgroundColor: '#185FA5',
                            backgroundImage: `
                                radial-gradient(at 0% 0%, rgba(0,71,130,0.6) 0px, transparent 55%),
                                radial-gradient(at 100% 0%, rgba(24,95,165,0.5) 0px, transparent 50%)
                            `,
                            paddingBottom: '2.5rem',
                        }}
                    >
                        {/* Decorative blobs */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10 w-full px-6 md:px-10 pt-8">
                            {/* Top row: title + buttons */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div className="text-white">
                                    <div className="flex items-center gap-2 mb-1 opacity-80">
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>school</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Admin Management System</p>
                                    </div>
                                    <h2 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.1 }} className="mb-1 text-white">Portal Sekolah</h2>
                                    <p className="text-sm opacity-75 max-w-sm">
                                        Lacak, kelola, dan kembalikan barang hilang di area sekolah dengan sistem otomasi AI.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link href="/search" className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white border border-white/30 hover:bg-white/15 transition-all">
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
                                        Cari Barang
                                    </Link>
                                    <Link href="/reports/create" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-[#185FA5] shadow-lg hover:scale-105 transition-all">
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                                        Buat Laporan
                                    </Link>
                                </div>
                            </div>

                            {/* Greeting card — style Stitch: dark semi-transparent, no hard border */}
                            <div
                                className="rounded-2xl px-5 py-4"
                                style={{ background: 'rgba(255,255,255,0.12)' }}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                                    {/* Avatar + greeting */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                             style={{ background: 'rgba(255,255,255,0.15)' }}>
                                            {isAdmin ? '🏫' : '🎒'}
                                        </div>
                                        <div className="text-white">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm opacity-80">{greetingIcon} {greeting},</span>
                                                <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide">
                                                    {isAdmin ? 'Staff' : 'Siswa'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black">{userName}</h3>
                                        </div>
                                    </div>

                                    {/* Date + status */}
                                    <div className="flex gap-8 text-white/85 text-right">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Hari Ini</p>
                                            <p className="text-sm font-semibold">{currentDate}</p>
                                        </div>
                                        <div className="w-px bg-white/20 self-stretch hidden md:block"></div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Status Aktivitas</p>
                                            <p className="text-sm font-semibold flex items-center gap-1 justify-end">
                                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                                                {stats.pending_reports} Laporan Baru
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== KONTEN UTAMA (putih) ===== */}
                    <div className="w-full px-6 md:px-10 py-8">

                        {/* STAT CARDS — Sesuai Stitch: angka besar, label kecil, badge kecil */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-10">
                            {statCards.map((stat) => (
                                <Link
                                    key={stat.key}
                                    href={stat.href}
                                    className="group py-4 px-2 hover:opacity-80 transition-all cursor-pointer"
                                >
                                    {/* Label atas */}
                                    <p className="text-xs text-gray-400 font-medium mb-2">{stat.label}</p>

                                    {/* Nilai + badge sejajar langsung di samping angka */}
                                    <div className="flex items-end gap-2">
                                        <span className={`leading-none ${stat.valueColor}`} style={{ fontSize: '2.8rem', fontWeight: 900 }}>
                                            {stat.value}
                                        </span>
                                        {stat.badge && (
                                            <span className={`text-[11px] font-black uppercase ${stat.badgeColor} mb-1`}>
                                                {stat.badge}
                                            </span>
                                        )}
                                        {stat.key === 'resolved' && (
                                            <span className="material-symbols-outlined text-green-500 mb-1" style={{ fontSize: '20px' }}>verified</span>
                                        )}
                                    </div>

                                    {/* Garis bawah warna */}
                                    <div className={`mt-3 h-0.5 rounded-full w-8 ${
                                        stat.key === 'total' ? 'bg-[#185FA5]' :
                                        stat.key === 'pending' ? 'bg-yellow-400' :
                                        stat.key === 'resolved' ? 'bg-green-500' :
                                        'bg-red-400'
                                    }`}></div>
                                </Link>
                            ))}
                        </div>

                        {/* GRID: Rekomendasi + Tips */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                            {/* Rekomendasi Kecocokan */}
                            <div className="lg:col-span-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">Rekomendasi Kecocokan</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Hasil pencocokan pintar berbasis AI</p>
                                    </div>
                                    <Link href="/matches" className="text-[#185FA5] font-bold text-sm flex items-center gap-1 hover:underline">
                                        Semua
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="bg-white rounded-2xl p-10 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#185FA5] border-t-transparent mb-3"></div>
                                            <p className="text-gray-400 text-sm">Memuat rekomendasi...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="bg-white rounded-2xl p-10 text-center">
                                            <div className="text-4xl mb-2">⚠️</div>
                                            <p className="text-gray-400 text-sm">{error}</p>
                                        </div>
                                    ) : recommendations.length === 0 ? (
                                        <div className="bg-white rounded-2xl p-10 text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <span className="text-3xl">🔍</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">Belum ada rekomendasi kecocokan</p>
                                            <p className="text-gray-300 text-xs mt-1">Buat laporan untuk mendapatkan rekomendasi</p>
                                        </div>
                                    ) : (
                                        recommendations.slice(0, 3).map((item, idx) => {
                                            console.log('Item recommendation:', item);
                                            const score = item.match_score || item.similarity || 0;
                                            const isHighMatch = score >= 80;
                                            const isMidMatch = score >= 60 && score < 80;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="group bg-white rounded-2xl border border-gray-100 hover:border-[#185FA5]/20 hover:shadow-md transition-all overflow-hidden"
                                                >
                                                    <div className="flex gap-4 p-4">
                                                        {/* Image */}
                                                        <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                            {item.matched_photo ?(
                                                                <img
                                                                    src={`/storage/${item.matched_photo}`}
                                                                    alt={item.matched_report_name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="text-3xl">📦</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Name + Badge */}
                                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                                <h4 className="font-bold text-gray-900 text-base leading-snug">
                                                                    {item.matched_report_name || item.name}
                                                                </h4>
                                                                <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                                                    isHighMatch ? 'bg-green-100 text-green-700' :
                                                                    isMidMatch ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {score}% MATCH
                                                                </span>
                                                            </div>

                                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                                {item.description || 'Ditemukan di area sekolah.'}
                                                            </p>

                                                            {/* Footer: date + button */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                                                                    {item.created_at
                                                                        ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' })
                                                                        : 'Baru saja'}
                                                                </div>
                                                                <Link
                                                                    href={`/reports/${item.matched_report_id || item.id}`}
                                                                    className="px-4 py-1.5 rounded-lg text-sm font-bold bg-[#D4E3FF] text-[#004883] hover:bg-[#185FA5] hover:text-white transition-all"
                                                                >
                                                                    Verifikasi Detail
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Tips Pencegahan */}
                            <div className="lg:col-span-4">
                                <div className="bg-[#F2F3FA] rounded-2xl p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-5">Tips Pencegahan</h3>
                                    <div className="space-y-5">
                                        {tips.map((tip, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    <span className="material-symbols-outlined text-[#185FA5]" style={{ fontSize: '18px' }}>{tip.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-800">{tip.title}</h4>
                                                    <p className="text-xs text-gray-500 leading-snug mt-0.5">{tip.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 bg-[#185FA5] rounded-xl p-4 text-white text-center">
                                        <p className="text-sm font-medium mb-2">Ingin tips lengkap?</p>
                                        <button className="w-full py-2 rounded-lg font-bold text-xs transition-colors hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                            Unduh Panduan Siswa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* REKAMAN AKTIVITAS */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xl font-bold text-gray-900">Rekaman Aktivitas</h3>
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#185FA5]"></span>
                                    <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                                </div>
                            </div>

                            <div className="space-y-0">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#185FA5] border-t-transparent mb-3"></div>
                                        <p className="text-gray-400 text-sm">Memuat aktivitas...</p>
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">📭</div>
                                        <p className="text-gray-400 text-sm">Belum ada aktivitas terkini</p>
                                    </div>
                                ) : (
                                    activities.slice(0, 4).map((activity, idx) => {
                                        const isResolved = activity.type === 'resolved';
                                        const isVerified = activity.type === 'verified';
                                        const dotColor = isResolved ? 'bg-green-500' : isVerified ? 'bg-[#185FA5]' : 'bg-yellow-400';
                                        const typeLabel = isResolved ? 'Selesai' : isVerified ? 'Terverifikasi' : 'Baru';
                                        const typeLabelColor = isResolved ? 'text-green-600' : isVerified ? 'text-[#185FA5]' : 'text-yellow-600';
                                        return (
                                            <div key={idx} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 group">
                                                <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${dotColor} group-hover:scale-125 transition-transform`}></div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {activity.title || 'Update Laporan'}
                                                        </p>
                                                        <span className={`text-[10px] font-black uppercase ${typeLabelColor}`}>
                                                            {typeLabel}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>schedule</span>
                                                        {activity.created_at || 'Baru saja'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <Link
                                href="/notifications"
                                className="block text-center text-sm font-bold text-[#185FA5] mt-4 pt-3 border-t border-gray-100 hover:opacity-75 transition-opacity"
                            >
                                Muat Aktivitas Lainnya
                            </Link>
                        </div>

                        {/* QUICK ACTIONS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickActions.map((action, idx) => (
                                <Link
                                    key={idx}
                                    href={action.href}
                                    className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${action.bgColor} ${action.textColor} flex items-center justify-center mb-3 ${action.hoverBg} group-hover:text-white transition-all`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{action.icon}</span>
                                    </div>
                                    <span className={`font-bold text-sm ${action.textColor}`}>{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}