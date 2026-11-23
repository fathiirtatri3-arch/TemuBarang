import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Papan Barang Temuan - daftar publik barang yang ditemukan dan masih
 * tersimpan di kantor kelurahan, lengkap dengan sisa masa klaimnya.
 *
 * Halaman ini bisa diakses WITHOUT login, karena tujuannya agar warga yang
 * kehilangan barang tahu kalau barangnya sudah ditemukan.
 */
export default function FoundBoard() {
    const { reports = [], regions = [], categories = [], filters = {}, auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    const [category, setCategory] = useState(filters.category || '');
    const [regionId, setRegionId] = useState(filters.region_id || '');
    const [remaining, setRemaining] = useState(filters.remaining || '');

    const applyFilter = (overrides = {}) => {
        const next = {
            category: overrides.category ?? category,
            region_id: overrides.region_id ?? regionId,
            remaining: overrides.remaining ?? remaining,
        };

        router.get('/barang-temuan', next, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setCategory('');
        setRegionId('');
        setRemaining('');
        router.get('/barang-temuan', {}, { preserveState: true, replace: true });
    };

    const hasFilter = category || regionId || remaining;

    return (
        <>
            <Head title="Papan Barang Temuan — TemuBarang" />

            <div className="min-h-screen bg-slate-50">
                {/* Navbar sederhana */}
                <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/images/logo_temubarang_bg.png" alt="Logo TemuBarang" className="w-9 h-9 object-contain" />
                            <div className="leading-tight">
                                <p className="font-black text-gray-900 text-sm">TemuBarang</p>
                                <p className="text-[10px] text-gray-400">Kecamatan Sambikerep</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/reports"
                                className="hidden sm:inline-flex px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#185FA5] transition"
                            >
                                Laporan Barang
                            </Link>
                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 bg-[#185FA5] text-white rounded-xl font-bold text-xs hover:bg-[#134d87] transition"
                                >
                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 bg-[#185FA5] text-white rounded-xl font-bold text-xs hover:bg-[#134d87] transition"
                                >
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Header */}
                <header className="bg-gradient-to-br from-[#185FA5] to-[#0C447C] text-white">
                    <div className="max-w-6xl mx-auto px-4 py-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">
                            Kecamatan Sambikerep, Surabaya
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-black">Papan Barang Temuan</h1>
                        <p className="text-sm text-blue-100 mt-2 max-w-2xl leading-relaxed">
                            Daftar barang yang ditemukan dan sudah tersimpan di kantor kelurahan.
                            Kalau barang Anda ada di sini, segera buat laporan kehilangan lalu klaim di kantor kelurahan
                            sebelum masa klaim habis.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-5 text-xs">
                            <span className="px-3 py-1.5 rounded-lg bg-white/15 font-semibold">
                                {reports.length} barang terdaftar
                            </span>
                            <span className="px-3 py-1.5 rounded-lg bg-white/15 font-semibold">
                                Masa klaim 30 hari
                            </span>
                            <span className="px-3 py-1.5 rounded-lg bg-white/15 font-semibold">
                                Gratis, di kantor kelurahan
                            </span>
                        </div>
                    </div>
                </header>

                {/* Filter */}
                <div className="max-w-6xl mx-auto px-4 mt-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                    Kategori
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        applyFilter({ category: e.target.value });
                                    }}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none bg-white"
                                >
                                    <option value="">Semua kategori</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                    Kelurahan
                                </label>
                                <select
                                    value={regionId}
                                    onChange={(e) => {
                                        setRegionId(e.target.value);
                                        applyFilter({ region_id: e.target.value });
                                    }}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none bg-white"
                                >
                                    <option value="">Semua kelurahan</option>
                                    {regions.map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                    Sisa Masa Klaim
                                </label>
                                <select
                                    value={remaining}
                                    onChange={(e) => {
                                        setRemaining(e.target.value);
                                        applyFilter({ remaining: e.target.value });
                                    }}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none bg-white"
                                >
                                    <option value="">Semua</option>
                                    <option value="7">Masih ada 7 hari</option>
                                    <option value="14">Masih ada 14 hari</option>
                                    <option value="30">Masih ada 30 hari</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={resetFilter}
                                    disabled={!hasFilter}
                                    className="w-full px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daftar barang */}
                <main className="max-w-6xl mx-auto px-4 py-6">
                    {reports.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300">inventory_2</span>
                            <p className="font-bold text-gray-800 mt-3">Belum ada barang temuan yang terdaftar</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Coba ubah filter, atau cek lagi beberapa saat lagi.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reports.map((r) => (
                                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="relative h-48 bg-slate-100">
                                        {r.photo ? (
                                            <img
                                                src={`/storage/${r.photo}`}
                                                alt={r.item_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                        )}
                                        {r.photo_blurred && (
                                            <span className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">visibility_off</span>
                                                Disamarkan
                                            </span>
                                        )}
                                        {r.expired ? (
                                            <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold">
                                                Menunggu Tindak Lanjut
                                            </span>
                                        ) : (
                                            r.days_remaining !== null && (
                                                <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-[#185FA5] text-white text-[10px] font-bold">
                                                    {r.days_remaining} hari lagi
                                                </span>
                                            )
                                        )}
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <p className="font-bold text-gray-900 text-sm">{r.item_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {r.category}{r.color ? ` &middot; ${r.color}` : ''}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2 flex items-start gap-1.5">
                                            <span className="material-symbols-outlined text-sm flex-shrink-0">location_on</span>
                                            <span>{r.location}{r.region ? `, ${r.region}` : ''}</span>
                                        </p>
                                        {r.date && (
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm">event</span>
                                                {r.date}
                                            </p>
                                        )}

                                        <div className="mt-auto pt-3">
                                            {r.can_claim ? (
                                                <Link
                                                    href={isLoggedIn ? `/reports/${r.id}` : '/login'}
                                                    className="block w-full py-2 bg-green-600 text-white rounded-xl font-bold text-xs text-center hover:bg-green-700 transition"
                                                >
                                                    Klaim Barang Ini
                                                </Link>
                                            ) : r.can_redeem ? (
                                                <Link
                                                    href={isLoggedIn ? `/reports/${r.id}` : '/login'}
                                                    className="block w-full py-2 bg-amber-600 text-white rounded-xl font-bold text-xs text-center hover:bg-amber-700 transition"
                                                >
                                                    Tebus Barang Ini
                                                </Link>
                                            ) : (
                                                <p className="w-full py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs text-center">
                                                    Masa klaim habis - hubungi kantor kelurahan
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Penjelasan alur */}
                    <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 text-sm">Bagaimana cara mengklaim barang?</h2>
                        <ol className="mt-3 space-y-2.5 text-sm text-gray-600 list-decimal list-inside">
                            <li>Buat <strong>laporan barang hilang</strong> di aplikasi (foto + keterangan barang).</li>
                            <li>Admin kelurahan memverifikasi laporan Anda, lalu pencocokan otomatis dilakukan dengan barang di papan ini.</li>
                            <li>Kalau cocok, Anda mendapat notifikasi dan bisa mengajukan klaim.</li>
                            <li>Anda menyetor ciri khusus / nomor seri barang ke kantor kelurahan sebagai bukti.</li>
                            <li>Barang diserahkan kepada Anda, dan laporan ditutup sebagai selesai.</li>
                        </ol>
                        <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">info</span>
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Barang yang masa klaimnya habis <strong>bukan berarti hilang</strong> dan <strong>bukan milik negara</strong>.
                                Barang tetap tersimpan di kantor kelurahan, dan pemilik aslinya masih bisa menebusnya
                                sampai barang benar-benar dilepas melalui berita acara.
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-slate-200 bg-white mt-8">
                    <div className="max-w-6xl mx-auto px-4 py-6 text-center">
                        <p className="text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} TemuBarang &middot; Kecamatan Sambikerep, Surabaya
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
