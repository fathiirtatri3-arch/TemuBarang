import { useState, useEffect } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PetaSambikerepView from '@/Components/GoogleMapView';

/* ============================================================
   HELPER (fungsi murni, tidak bergantung pada state)
   ============================================================ */
const COLOR_MAP = {
    // Warna dasar Indonesia
    'merah': '#EF4444',
    'biru': '#3B82F6',
    'hijau': '#22C55E',
    'kuning': '#EAB308',
    'hitam': '#1F2937',
    'putih': '#FFFFFF',
    'abu': '#9CA3AF',
    'abu-abu': '#9CA3AF',
    'orange': '#F97316',
    'oranye': '#F97316',
    'ungu': '#A855F7',
    'pink': '#EC4899',
    'merah muda': '#F472B6',
    'coklat': '#92400E',
    'cokelat': '#92400E',
    'emas': '#D4AF37',
    'silver': '#C0C0C0',
    'navy': '#1E3A8A',
    'tosca': '#14B8A6',
    'maroon': '#7F1D1D',
    'magenta': '#D946EF',
    'cyan': '#06B6D4',
    'gold': '#D4AF37',
    'brown': '#92400E',
    'gray': '#9CA3AF',
    'grey': '#9CA3AF',
    'beige': '#F5F5DC',
    'krem': '#FEF3C7',
    'cream': '#FEF3C7',
    'lavender': '#C4B5FD',
    'mint': '#6EE7B7',
    'olive': '#84CC16',
    'teal': '#14B8A6',
    'turquoise': '#40E0D0',
    'violet': '#8B5CF6',
};

const getColorHex = (colorName) => {
    if (!colorName) return '#CBD5E1'; // Abu-abu default

    const lowerColor = colorName.toLowerCase().trim();

    // Cek exact match dulu
    if (COLOR_MAP[lowerColor]) return COLOR_MAP[lowerColor];

    // Cek partial match (misal: "biru metalic" -> cari "biru")
    for (const [key, value] of Object.entries(COLOR_MAP)) {
        if (lowerColor.includes(key)) return value;
    }

    return '#CBD5E1';
};

// Tanggal + jam (untuk waktu klaim, verifikasi, kronologi)
const formatDateTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Versi ringkas untuk kartu samping
const formatShortDateTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Tanggal kejadian laporan. Kalau tersimpan hanya tanggal (tanpa jam),
// tampilkan tanggalnya saja supaya tidak muncul jam palsu (mis. "pukul 07.00").
const formatEventDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';

    const isMidnightUTC =
        d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;

    if (isMidnightUTC) {
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        });
    }
    return formatDateTime(value);
};

const getRoleLabel = (role) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin_kelurahan') return 'Admin Kelurahan';
    return 'Warga';
};

// Jarak dua titik koordinat (meter) - rumus Haversine
const distanceInMeters = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (Number(v) * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2) - toRad(lat1);
    const dLon = toRad(lon2) - toRad(lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
};

const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} meter`;
    return `${(meters / 1000).toFixed(1)} km`;
};

const hasCoord = (v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v));

/* ============================================================
   KOMPONEN KECIL
   ============================================================ */
function Attribute({ label, children, last = false }) {
    return (
        <div className={last ? 'pb-1' : 'border-b border-slate-100 pb-3'}>
            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {label}
            </span>
            <div className="mt-1">{children}</div>
        </div>
    );
}

function ReportPanel({ report, type, onZoom, showCompareBadge = false }) {
    const isFound = type === 'found';
    const pill = isFound
        ? { text: 'BARANG TEMUAN', cls: 'text-emerald-700 bg-emerald-100/70 border-emerald-200', dot: 'bg-emerald-600' }
        : { text: 'LAPORAN HILANG PENGKLAIM', cls: 'text-rose-700 bg-rose-100/70 border-rose-200', dot: 'bg-rose-600' };

    const photoUrl = report?.has_original_photo && report?.can_view_original
        ? `/reports/${report.id}/photo-original`
        : (report?.photo ? `/storage/${report.photo}` : null);

    return (
        <div className="flex flex-col h-full min-w-0">
            <div className="flex-1 space-y-5">
                {/* Pill + ID */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${pill.cls}`}>
                        <span className={`w-2 h-2 rounded-full ${pill.dot}`}></span>
                        {pill.text}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">ID: #{report?.id}</span>
                </div>

                {/* Foto (4:3) + badge panah di tengah */}
                <div className="relative">
                    <div
                        onClick={() =>
                            photoUrl &&
                            onZoom({
                                src: photoUrl,
                                title: `${isFound ? 'Foto Barang Temuan' : 'Foto Laporan Hilang'} - ${report?.item_name || ''}`,
                            })
                        }
                        className={`relative group aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm ${photoUrl ? 'cursor-zoom-in' : ''}`}
                    >
                        {photoUrl ? (
                            <>
                                <img
                                    src={photoUrl}
                                    alt={report?.item_name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                                        Perbesar Foto
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-5xl">image</span>
                                <p className="text-xs mt-1">Tidak ada foto</p>
                            </div>
                        )}
                    </div>

                    
                </div>

                {/* Atribut (baris sejajar antar panel) */}
                <div className="space-y-4 pt-1">
                    <Attribute label="Nama Barang">
                        <p className="text-base font-bold text-slate-900 break-words">{report?.item_name || '-'}</p>
                    </Attribute>

                    <Attribute label="Kategori">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {report?.category || '-'}
                        </span>
                    </Attribute>

                    <Attribute label="Warna Fisik">
                        <div className="flex items-center gap-2">
                            {report?.color && (
                                <span
                                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-inner flex-shrink-0"
                                    style={{ backgroundColor: getColorHex(report.color) }}
                                    title={report.color}
                                ></span>
                            )}
                            <span className="text-sm font-bold text-slate-800">{report?.color || '-'}</span>
                        </div>
                    </Attribute>

                    <Attribute label={isFound ? 'Lokasi Penemuan' : 'Lokasi Kehilangan'}>
                        <div className="flex items-start gap-1.5 text-sm font-semibold text-slate-800">
                            <span className="material-symbols-outlined text-base text-red-500 mt-px">location_on</span>
                            <span className="break-words min-w-0">{report?.location || '-'}</span>
                        </div>
                    </Attribute>

                    <Attribute label={isFound ? 'Waktu Penemuan' : 'Waktu Kehilangan'}>
                        <div className="flex items-start gap-1.5 text-sm font-semibold text-slate-800">
                            <span className="material-symbols-outlined text-base text-slate-400 mt-px">schedule</span>
                            <span>{formatEventDate(report?.date)}</span>
                        </div>
                    </Attribute>

                    <Attribute label="Deskripsi" last>
                        <p className="text-sm text-slate-600 leading-relaxed break-words">
                            {report?.description || '-'}
                        </p>
                    </Attribute>
                </div>
            </div>

            {/* Tombol detail (rata bawah di kedua panel) */}
            <div className="pt-5">
                <Link
                    href={`/reports/${report?.id}`}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#185FA5] text-[#185FA5] hover:bg-blue-50/70 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                    <span>{isFound ? 'Lihat Detail Laporan Temuan' : 'Lihat Detail Laporan Hilang'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
}

/* ============================================================
   HALAMAN UTAMA
   ============================================================ */
export default function ClaimDetail() {
    const { claim, lostReport, canVerify = true, decisionRegion, secretFeature = null, canHandover = false, handoverBy = null, serialNumber = null, serialMatch = null, imeiComparison = null } = usePage().props;
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyAction, setVerifyAction] = useState('');
    const [showHandoverModal, setShowHandoverModal] = useState(false);
    const [handoverProcessing, setHandoverProcessing] = useState(false);
    const [handoverErrors, setHandoverErrors] = useState({});
    const [handoverForm, setHandoverForm] = useState({
        receiver_name: claim.claimant?.name || '',
        receiver_id_type: 'KTP',
        handover_note: '',
    });
    const idTypes = ['KTP', 'KK', 'SIM', 'Kartu Pelajar', 'Lainnya'];
    const [lightbox, setLightbox] = useState(null); // { src, title }

    // Tutup lightbox dengan tombol Esc
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') setLightbox(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const verifyClaim = (status) => {
        if (status === 'approved' && !claim.report?.received_at) {
            alert('Catat dulu penerimaan barang di kantor kelurahan (di halaman detail laporan temuan) sebelum menyetujui klaim.');
            return;
        }
        if (status === 'approved' && claim.report?.category === 'Elektronik' && !serialNumber) {
            alert('Catat nomor seri/IMEI perangkat (di halaman detail laporan temuan) sebelum menyetujui klaim.');
            return;
        }
        setVerifyAction(status);
        setAdminNote('');
        setShowVerifyModal(true);
    };

    const submitHandover = () => {
        setHandoverProcessing(true);
        setHandoverErrors({});
        router.put(`/admin/claims/${claim.id}/handover`, handoverForm, {
            preserveScroll: true,
            onSuccess: (page) => {
                const f = page.props.flash || {};
                if (f.error) {
                    setHandoverErrors({ general: f.error });
                } else {
                    setShowHandoverModal(false);
                }
            },
            onError: (errs) => setHandoverErrors(errs),
            onFinish: () => setHandoverProcessing(false),
        });
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

    const getStatusBadge = () => {
        switch (claim.status) {
            case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-800', label: '⏳ Menunggu Verifikasi', dot: 'bg-amber-500' };
            case 'approved': return { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Disetujui', dot: 'bg-green-500' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Ditolak', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: claim.status, dot: 'bg-gray-500' };
        }
    };

    const statusBadge = getStatusBadge();

    // Klaim "tebus": pengklaim menebus barang yang masa klaimnya sudah habis.
    // Barang masih tersimpan di kantor kelurahan, jadi ini masih bisa disetujui.
    const isRedemption = !!claim.is_redemption;

    // Jarak antara lokasi temuan dan lokasi hilang (jika kedua koordinat ada)
    const distance =
        lostReport &&
        [claim.report?.latitude, claim.report?.longitude, lostReport.latitude, lostReport.longitude].every(hasCoord)
            ? distanceInMeters(
                claim.report.latitude,
                claim.report.longitude,
                lostReport.latitude,
                lostReport.longitude
            )
            : null;

    const addressText = [claim.report?.location, claim.report?.region?.name].filter(Boolean).join(', ');

    // Kronologi dari data asli
    const timeline = [
        claim.report?.created_at && {
            key: 'found',
            time: claim.report.created_at,
            dot: 'bg-emerald-500',
            title: 'Barang temuan dilaporkan',
            desc: `${claim.owner?.name || 'Penemu'} melaporkan temuan "${claim.report.item_name}".`,
        },
        lostReport?.created_at && {
            key: 'lost',
            time: lostReport.created_at,
            dot: 'bg-blue-500',
            title: 'Laporan kehilangan dibuat',
            desc: `${claim.claimant?.name || 'Pengklaim'} melaporkan kehilangan "${lostReport.item_name}".`,
        },
        claim.created_at && {
            key: 'claim',
            time: claim.created_at,
            dot: 'bg-amber-500',
            title: 'Klaim diajukan',
            desc: `${claim.claimant?.name || 'Pengklaim'} mengajukan klaim atas "${claim.report?.item_name}".`,
        },
        claim.verified_at && {
            key: 'verified',
            time: claim.verified_at,
            dot: claim.status === 'approved' ? 'bg-green-600' : 'bg-red-500',
            title: claim.status === 'approved' ? 'Klaim disetujui' : 'Klaim ditolak',
            desc: `Diverifikasi oleh ${claim.verifier?.name || 'admin'}.`,
        },
    ]
        .filter(Boolean)
        .sort((a, b) => new Date(a.time) - new Date(b.time));

    return (
        <AuthenticatedLayout>
            {/* Confirm Verify Modal */}
            {showVerifyModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    verifyAction === 'approved' ? 'bg-green-100 text-green-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {verifyAction === 'approved' ? 'check_circle' : 'cancel'}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {verifyAction === 'approved' ? 'Setujui Klaim' : 'Tolak Klaim'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowVerifyModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <p className="text-slate-600 text-sm mt-4 mb-4">
                            {verifyAction === 'approved'
                                ? 'Anda akan menyetujui klaim ini. Pastikan data sudah benar.'
                                : 'Anda akan menolak klaim ini. Berikan alasan yang jelas, alasan akan dikirim ke pengklaim.'}
                        </p>

                        {verifyAction === 'rejected' && (
                            <div className="mb-4">
                                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                                    Alasan Penolakan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Contoh: Ciri fisik barang tidak sesuai dengan barang temuan..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#185FA5] focus:border-transparent text-sm resize-none"
                                    rows="3"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={confirmVerify}
                                disabled={processing || (verifyAction === 'rejected' && !adminNote.trim())}
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

            {/* Modal: catat serah terima */}
            {showHandoverModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">handshake</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Catat Serah Terima</h3>
                            </div>
                            <button
                                onClick={() => setShowHandoverModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {handoverErrors.general && (
                                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {handoverErrors.general}
                                </p>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                                    Nama pengambil <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={handoverForm.receiver_name}
                                    onChange={(e) => setHandoverForm({ ...handoverForm, receiver_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#185FA5] focus:border-transparent"
                                    placeholder="Nama orang yang mengambil barang"
                                />
                                {handoverErrors.receiver_name && (
                                    <p className="text-xs text-red-600 mt-1">{handoverErrors.receiver_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                                    Identitas yang ditunjukkan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={handoverForm.receiver_id_type}
                                    onChange={(e) => setHandoverForm({ ...handoverForm, receiver_id_type: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#185FA5] focus:border-transparent"
                                >
                                    {idTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Cukup catat jenis identitasnya, jangan menulis nomor lengkap.
                                </p>
                                {handoverErrors.receiver_id_type && (
                                    <p className="text-xs text-red-600 mt-1">{handoverErrors.receiver_id_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                                    Catatan (opsional)
                                </label>
                                <textarea
                                    value={handoverForm.handover_note}
                                    onChange={(e) => setHandoverForm({ ...handoverForm, handover_note: e.target.value })}
                                    rows="2"
                                    maxLength="500"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#185FA5] focus:border-transparent"
                                    placeholder="Mis. diambil oleh kakak kandung, membawa surat kuasa"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-4">
                            Setelah disimpan, laporan temuan dan laporan hilang ditandai selesai. Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex gap-3 justify-end mt-5">
                            <button
                                onClick={() => setShowHandoverModal(false)}
                                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition text-sm font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                onClick={submitHandover}
                                disabled={handoverProcessing}
                                className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-bold disabled:opacity-50"
                            >
                                {handoverProcessing ? 'Menyimpan...' : 'Simpan Serah Terima'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox foto */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-2 text-white">
                            <span className="text-xs font-bold flex items-center gap-2 min-w-0">
                                <span className="material-symbols-outlined text-sm">photo</span>
                                <span className="truncate">{lightbox.title}</span>
                            </span>
                            <button
                                onClick={() => setLightbox(null)}
                                className="text-white/70 hover:text-white p-1 rounded"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <img
                            src={lightbox.src}
                            alt={lightbox.title}
                            className="w-full max-h-[75vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-28 md:pb-10">

                    {/* Breadcrumb / Back Button (header tidak diubah) */}
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

                    <div className="space-y-6">

                        {/* ============ 1. KARTU KOMPARASI ============ */}
                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                            <div className="pb-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#185FA5]">compare</span>
                                    Komparasi Barang Temuan dan Laporan Hilang
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Bandingkan ciri barang temuan dengan laporan hilang milik pengklaim untuk memastikan kepemilikan.
                                </p>
                            </div>

                            <div className="relative mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                {/* Garis pemisah vertikal (desktop) */}
                                <div className="hidden md:block absolute inset-y-0 left-1/2 w-px bg-slate-200"></div>

                                {/* Panel kiri: barang temuan (badge panah ada di dalam panel ini) */}
                                <ReportPanel
                                    type="found"
                                    report={claim.report}
                                    onZoom={setLightbox}
                                    showCompareBadge
                                />

                                {/* Pemisah mobile dengan badge panah */}
                                <div className="md:hidden relative flex items-center justify-center">
                                    <div className="absolute inset-x-0 border-t border-slate-200"></div>
                                    <div className="relative w-10 h-10 rounded-full bg-[#185FA5] text-white flex items-center justify-center shadow-lg ring-4 ring-white">
                                        <span className="material-symbols-outlined text-xl rotate-90">compare_arrows</span>
                                    </div>
                                </div>

                                {/* Panel kanan: laporan hilang pengklaim */}
                                {lostReport ? (
                                    <ReportPanel
                                        type="lost"
                                        report={lostReport}
                                        onZoom={setLightbox}
                                    />
                                ) : (
                                    <div className="flex flex-col h-full min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border text-rose-700 bg-rose-100/70 border-rose-200">
                                                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                                                LAPORAN HILANG PENGKLAIM
                                            </span>
                                        </div>
                                        <div className="mt-5 flex-1 min-h-[260px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-center p-8 flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-3">
                                                <span className="material-symbols-outlined text-2xl">link_off</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-800">Tidak ada laporan hilang terkait</h4>
                                            <p className="text-xs text-slate-500 max-w-xs mt-1">
                                                Klaim ini dikirim tanpa menautkan laporan barang hilang milik pengklaim.
                                            </p>
                                            <span className="inline-block mt-3 text-[11px] font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                                Disarankan memeriksa bukti kepemilikan secara manual
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ============ VERIFIKASI CIRI KHUSUS (hanya pemutus klaim) ============ */}
                        {canVerify && (
                            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="pb-4 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#185FA5]">lock</span>
                                        Verifikasi Ciri Khusus
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Bandingkan ciri rahasia yang dicatat penemu dengan jawaban pengklaim. Jangan bagikan ciri rahasia ini kepada siapa pun.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                        <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Ciri rahasia dari penemu</p>
                                        <p className="text-sm font-semibold text-slate-900 break-words">
                                            {secretFeature || 'Penemu tidak mencatat ciri khusus.'}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                                        <p className="text-[10px] font-bold tracking-wider text-[#185FA5] uppercase mb-1">Jawaban pengklaim</p>
                                        <p className="text-sm font-semibold text-slate-900 break-words">
                                            {claim.claimant_proof || 'Pengklaim tidak mengisi jawaban.'}
                                        </p>
                                    </div>
                                </div>

                                {claim.report?.category === 'Elektronik' && (
                                    <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-white">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Nomor seri / IMEI</p>
                                            {serialMatch === true && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Cocok</span>
                                            )}
                                            {serialMatch === false && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">Tidak cocok</span>
                                            )}
                                            {serialMatch === null && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">Belum bisa dibandingkan</span>
                                            )}
                                        </div>

                                        {/* Tiga sumber ditampilkan berdampingan */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                                                    Dilaporkan penemu
                                                </p>
                                                <p className="text-sm font-mono text-slate-900 break-all">
                                                    {imeiComparison?.reported || '—'}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">Dari laporan barang temuan</p>
                                            </div>

                                            <div className={`p-3 rounded-lg border ${
                                                imeiComparison?.reported_vs_admin === false
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-slate-50 border-slate-200'
                                            }`}>
                                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                                                    Dibaca admin (fisik)
                                                </p>
                                                <p className="text-sm font-mono text-slate-900 break-all">
                                                    {imeiComparison?.admin || '—'}
                                                </p>
                                                {imeiComparison?.reported_vs_admin === false && (
                                                    <p className="text-[10px] text-red-600 font-bold mt-1">⚠️ BEDA dari laporan penemu</p>
                                                )}
                                                {imeiComparison?.reported_vs_admin === true && (
                                                    <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Sama</p>
                                                )}
                                                <p className="text-[10px] text-slate-400 mt-1">Saat terima barang</p>
                                            </div>

                                            <div className={`p-3 rounded-lg border ${
                                                imeiComparison?.reported_vs_claimant === false
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-blue-50 border-blue-100'
                                            }`}>
                                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                                                    Jawaban pengklaim
                                                </p>
                                                <p className="text-sm font-mono text-slate-900 break-all">
                                                    {imeiComparison?.claimant || '—'}
                                                </p>
                                                {imeiComparison?.reported_vs_claimant === false && (
                                                    <p className="text-[10px] text-red-600 font-bold mt-1">⚠️ BEDA dari laporan penemu</p>
                                                )}
                                                {imeiComparison?.reported_vs_claimant === true && (
                                                    <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Sama</p>
                                                )}
                                                <p className="text-[10px] text-slate-400 mt-1">Dari formulir klaim</p>
                                            </div>
                                        </div>

                                        {imeiComparison?.all_match && (
                                            <div className="mt-3 flex gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                                                <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
                                                <p className="text-xs text-emerald-800 leading-relaxed">
                                                    ✅ Tiga sumber nomor seri <strong>sama persis</strong>. Barang ini hampir pasti milik pengklaim.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!claim.report?.received_at && (
                                    <div className="mt-4 flex flex-wrap items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                                        <span className="material-symbols-outlined text-amber-600 text-base">warning</span>
                                        <span>Barang belum tercatat diterima di kantor kelurahan. Klaim baru bisa disetujui setelah penerimaan dicatat.</span>
                                        <Link href={`/reports/${claim.report?.id}`} className="font-bold underline">Buka laporan temuan</Link>
                                    </div>
                                )}

                                {isRedemption && (
                                    <div className="mt-4 flex flex-wrap items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                                        <span className="material-symbols-outlined text-amber-600 text-base">redeem</span>
                                        <span>
                                            Ini adalah klaim <strong>tebus</strong>: masa klaim barang sudah habis, tetapi barang
                                            masih tersimpan di kantor kelurahan sehingga pemilik aslinya tetap boleh menebusnya.
                                            Barang TIDAK hilang dan TIDAK menjadi milik negara.
                                        </span>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ============ SERAH TERIMA BARANG ============ */}
                        {claim.status === 'approved' && (
                            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="pb-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#185FA5]">handshake</span>
                                            Serah Terima Barang
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Catat siapa yang mengambil barang, supaya ada bukti penyerahan.
                                        </p>
                                    </div>
                                    {claim.handed_over_at ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            Sudah diserahkan
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            Menunggu pengambilan
                                        </span>
                                    )}
                                </div>

                                {claim.handed_over_at ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                            <p className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase mb-1">Diserahkan kepada</p>
                                            <p className="text-sm font-semibold text-slate-900 break-words">{claim.receiver_name}</p>
                                            <p className="text-xs text-slate-600 mt-0.5">Identitas: {claim.receiver_id_type}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Waktu serah terima</p>
                                            <p className="text-sm font-semibold text-slate-900">{formatDateTime(claim.handed_over_at)}</p>
                                            <p className="text-xs text-slate-600 mt-0.5">Dicatat oleh {handoverBy || '-'}</p>
                                        </div>
                                        {claim.handover_note && (
                                            <div className="md:col-span-2 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                                                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1">Catatan</p>
                                                <p className="text-sm italic text-gray-600 break-words">"{claim.handover_note}"</p>
                                            </div>
                                        )}
                                    </div>
                                ) : canHandover ? (
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() => setShowHandoverModal(true)}
                                            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">inventory</span>
                                            Catat Serah Terima
                                        </button>
                                        <p className="text-xs text-slate-500">
                                            Klik setelah pemilik datang ke kantor dan barang diserahkan.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 mt-4">
                                        Serah terima dicatat oleh admin {decisionRegion || 'pemilik barang temuan'}.
                                    </p>
                                )}
                            </section>
                        )}

                        {/* ============ 2. PETA + PANEL KANAN ============ */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                            {/* Kolom kiri: peta + kronologi */}
                            <section className="lg:col-span-8 space-y-6 min-w-0">

                                {/* Peta */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#185FA5] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">map</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">Titik Lokasi di Peta</h3>
                                            <p className="text-xs text-slate-500">Lokasi barang temuan</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                                        <PetaSambikerepView
                                            latitude={claim.report?.latitude}
                                            longitude={claim.report?.longitude}
                                            itemName={claim.report?.item_name}
                                        />
                                    </div>

                                    <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                                        <span className="material-symbols-outlined text-red-500 mt-0.5">place</span>
                                        <div className="text-xs min-w-0">
                                            <p className="font-bold text-slate-900 break-words">
                                                {addressText || 'Alamat tidak tersedia'}
                                            </p>
                                            <p className="text-slate-500 mt-0.5">Kecamatan Sambikerep, Kota Surabaya</p>
                                            {distance !== null && (
                                                <p className="text-slate-500 mt-1">
                                                    Jarak antara lokasi temuan dan lokasi hilang:{' '}
                                                    <strong className="text-slate-700">{formatDistance(distance)}</strong>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Kronologi */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#185FA5] text-lg">history</span>
                                            Kronologi Klaim
                                        </h3>
                                        <span className="text-[11px] text-slate-400 font-medium">Zona waktu perangkat Anda</span>
                                    </div>

                                    <ol className="mt-5 ml-2 border-l border-slate-200 space-y-5">
                                        {timeline.map((item, index) => (
                                            <li key={item.key} className="relative pl-5">
                                                <span className={`absolute -left-[6px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${item.dot}`}></span>
                                                <time className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                    {formatDateTime(item.time)}
                                                    {index === timeline.length - 1 && ' (Terbaru)'}
                                                </time>
                                                <h4 className="text-xs font-bold text-slate-800 mt-0.5">{item.title}</h4>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </section>

                            {/* Kolom kanan: pengklaim, penemu, verifikasi (menempel saat scroll) */}
                            <section className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">

                                {/* Informasi Pengklaim */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                    <p className="pb-3 border-b border-gray-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                        Informasi Pengklaim
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="w-11 h-11 rounded-full bg-[#185FA5] text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                                            {claim.claimant?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-bold text-slate-900 truncate">{claim.claimant?.name}</h4>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/70 text-blue-800 border border-blue-200">
                                                    {getRoleLabel(claim.claimant?.role)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400">Pengaju klaim</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2.5 text-xs border-t border-slate-100 pt-3">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="material-symbols-outlined text-slate-400 text-base flex-shrink-0">mail</span>
                                            <a
                                                href={`mailto:${claim.claimant?.email}`}
                                                className="min-w-0 truncate hover:text-[#185FA5] hover:underline font-medium"
                                            >
                                                {claim.claimant?.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="material-symbols-outlined text-slate-400 text-base flex-shrink-0">event</span>
                                            <span className="font-medium text-slate-700">Klaim: {formatShortDateTime(claim.created_at)}</span>
                                        </div>
                                    </div>

                                    {claim.message && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-xs italic text-gray-600 break-words">"{claim.message}"</p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <Link
                                            href={`/admin/users/${claim.claimant?.id}`}
                                            className="w-full py-2 px-3 rounded-xl bg-[#EAF1FF] text-[#185FA5] hover:bg-blue-100/70 font-bold text-xs transition flex items-center justify-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-base">person_search</span>
                                            <span>Lihat Profil Pengklaim</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Informasi Penemu */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                    <p className="pb-3 border-b border-gray-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                        Informasi Penemu
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="w-11 h-11 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                                            {claim.owner?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-bold text-slate-900 truncate">{claim.owner?.name}</h4>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/70 text-blue-800 border border-blue-200">
                                                    {getRoleLabel(claim.owner?.role)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400">Pelapor barang temuan</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2.5 text-xs border-t border-slate-100 pt-3">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="material-symbols-outlined text-slate-400 text-base flex-shrink-0">mail</span>
                                            <a
                                                href={`mailto:${claim.owner?.email}`}
                                                className="min-w-0 truncate hover:text-[#185FA5] hover:underline font-medium"
                                            >
                                                {claim.owner?.email}
                                            </a>
                                        </div>
                                        {claim.owner?.phone && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <span className="material-symbols-outlined text-slate-400 text-base flex-shrink-0">phone</span>
                                                <span className="font-medium text-slate-700">{claim.owner.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <Link
                                            href={`/admin/users/${claim.owner?.id}`}
                                            className="w-full py-2 px-3 rounded-xl bg-[#EAF1FF] text-[#185FA5] hover:bg-blue-100/70 font-bold text-xs transition flex items-center justify-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-base">person_search</span>
                                            <span>Lihat Profil Penemu</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Verifikasi Klaim */}
                                <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-[#185FA5] shadow-sm p-5">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[#185FA5] text-lg">verified_user</span>
                                            Verifikasi Klaim
                                        </h4>
                                        {claim.status === 'pending' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                Menunggu Keputusan
                                            </span>
                                        )}
                                    </div>

                                    {claim.status === 'pending' && !canVerify ? (
                                        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                Keputusan klaim ini ada di <strong className="text-slate-900">Admin Kelurahan {decisionRegion || 'pemilik barang temuan'}</strong>, tempat barang temuan disimpan. Anda dapat melihat detailnya sebagai informasi.
                                            </p>
                                        </div>
                                    ) : claim.status === 'pending' ? (
                                        <>
                                            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                                                Anda akan memutuskan klaim <strong className="text-slate-900">{claim.claimant?.name}</strong> atas
                                                barang <strong className="text-slate-900">{claim.report?.item_name}</strong>.
                                            </p>

                                            {/* Tombol (desktop). Di mobile tombol ada di bar bawah */}
                                            <div className="hidden md:block mt-4 space-y-2.5">
                                                <button
                                                    onClick={() => verifyClaim('approved')}
                                                    disabled={processing}
                                                    className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm hover:shadow transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                                                    <span>Setujui Klaim</span>
                                                </button>
                                                <button
                                                    onClick={() => verifyClaim('rejected')}
                                                    disabled={processing}
                                                    className="w-full py-3 px-4 rounded-xl border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-lg">cancel</span>
                                                    <span>Tolak Klaim</span>
                                                </button>
                                            </div>

                                            <p className="text-[11px] text-slate-400 mt-3 text-center leading-normal">
                                                Tindakan ini permanen dan pemberitahuan dikirim lewat email.
                                            </p>
                                        </>
                                    ) : (
                                        <div className={`mt-3 p-4 rounded-xl border ${
                                            claim.status === 'approved'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                : 'bg-red-50 border-red-200 text-red-900'
                                        }`}>
                                            <div className="flex items-center gap-2 font-bold text-xs">
                                                <span
                                                    className={`material-symbols-outlined text-lg ${claim.status === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}
                                                    style={{ fontVariationSettings: '"FILL" 1' }}
                                                >
                                                    {claim.status === 'approved' ? 'check_circle' : 'cancel'}
                                                </span>
                                                {claim.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh {claim.verifier?.name || 'admin'}
                                            </div>
                                            {claim.verified_at && (
                                                <p className="text-[11px] opacity-80 mt-1">{formatDateTime(claim.verified_at)}</p>
                                            )}
                                            {claim.admin_note && (
                                                <div className="mt-3 pt-2 border-t border-black/10">
                                                    <p className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">Catatan</p>
                                                    <p className="text-xs italic break-words">"{claim.admin_note}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bar verifikasi tetap di bawah (mobile) */}
            {claim.status === 'pending' && canVerify && (
                <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 p-3 shadow-lg flex items-center gap-3">
                    <button
                        onClick={() => verifyClaim('rejected')}
                        disabled={processing}
                        className="flex-1 py-3 px-3 rounded-xl border-2 border-red-600 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 active:bg-red-50 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-base">cancel</span>
                        <span>Tolak</span>
                    </button>
                    <button
                        onClick={() => verifyClaim('approved')}
                        disabled={processing}
                        className="flex-1 py-3 px-3 rounded-xl bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow active:bg-green-700 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                        <span>Setujui</span>
                    </button>
                </div>
            )}

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