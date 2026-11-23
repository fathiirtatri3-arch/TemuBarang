import { Link, usePage, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ReportFollowup() {
    const {
        report,
        followups = [],
        actionOptions = [],
        recommendedAction = null,
        daysRemaining = null,
        isExpired = false,
        minimumWitnesses = 1,
        activeClaims = 0,
    } = usePage().props;

    const { post, processing, errors } = useForm({
        action: recommendedAction || 'donated',
        document_no: '',
        recipient_name: '',
        recipient_org: '',
        recipient_contact: '',
        recipient_id_number: '',
        witness_name: '',
        witness_name_2: '',
        witness_phone: '',
        note: '',
        photo: null,
    });

    const [preview, setPreview] = useState(null);

    const selectedAction = actionOptions.find((a) => a.value === form.data.action);
    const needsRecipient = selectedAction ? selectedAction.needs_recipient : true;

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/admin/reports/${report.id}/followup`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const f = page.props.flash || {};
                if (f.error) {
                    return;
                }
                setPreview(null);
                router.reload({ only: ['followups'] });
            },
        });
    };

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        setPreview(file ? URL.createObjectURL(file) : null);
        form.photo = file;
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-5xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <Link href={`/reports/${report.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#185FA5] hover:underline mb-2">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Kembali ke detail laporan
                        </Link>
                        <h1 className="text-xl font-black text-gray-900">Berita Acara Tindak Lanjut</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {report.item_name} &middot; {report.category} &middot; {report.region?.name || '-'}
                        </p>
                    </div>
                    <Link
                        href={`/reports/${report.id}`}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition"
                    >
                        Lihat Laporan
                    </Link>
                </div>

                {activeClaims > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-2xl text-red-600">block</span>
                            <div>
                                <p className="text-sm font-bold text-red-900">
                                    Ada {activeClaims} klaim aktif pada barang ini
                                </p>
                                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                                    Selesaikan klaim yang masih berjalan terlebih dahulu sebelum melepas barang.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status masa klaim */}
                <div className={`rounded-2xl border p-5 ${
                    isExpired
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                }`}>                    <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined text-2xl ${isExpired ? 'text-amber-600' : 'text-[#185FA5]'}`}>
                            {isExpired ? 'hourglass_top' : 'schedule'}
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">
                                {isExpired
                                    ? 'Masa klaim sudah habis - menunggu tindak lanjut'
                                    : 'Masa klaim masih aktif'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                {isExpired ? (
                                    <>
                                        Barang <strong>tidak</strong> dianggap hilang dan <strong>bukan</strong> milik negara.
                                        Barang masih tersimpan di kantor kelurahan dan pemilik aslinya masih bisa menebusnya
                                        sampai barang benar-benar dilepas lewat berita acara di bawah.
                                    </>
                                ) : (
                                    <>
                                        Barang masih bisa diklaim sampai{' '}
                                        <strong>{report.claim_deadline ? formatDate(report.claim_deadline) : '-'}</strong>
                                        {daysRemaining !== null && daysRemaining >= 0
                                            ? ` (${daysRemaining} hari lagi)`
                                            : ''}
                                        . Tindak lanjut hanya dilakukan setelah masa klaim habis.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Riwayat berita acara */}
                {followups.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                            Riwayat Tindak Lanjut ({followups.length})
                        </p>
                        <div className="space-y-3">
                            {followups.map((f) => (
                                <div key={f.id} className="border border-gray-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <span className="px-2.5 py-1 rounded-lg bg-[#EAF1FF] text-[#185FA5] text-[11px] font-bold">
                                            {f.action_label || f.action}
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                            {formatDate(f.executed_at)} &middot; oleh {f.creator?.name || '-'}
                                        </span>
                                    </div>
                                    {f.recipient_name && (
                                        <p className="text-xs text-gray-600 mt-2">
                                            Penerima: <strong>{f.recipient_name}</strong>
                                            {f.recipient_org ? ` (${f.recipient_org})` : ''}
                                        </p>
                                    )}
                                    {f.witness_name && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            Saksi: {f.witness_name}{f.witness_name_2 ? `, ${f.witness_name_2}` : ''}
                                        </p>
                                    )}
                                    {f.note && (
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{f.note}</p>
                                    )}
                                    {f.photo_url && (
                                        <a href={f.photo_url} target="_blank" rel="noreferrer" className="inline-block mt-2">
                                            <img src={f.photo_url} alt="Bukti berita acara" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form berita acara */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Catat Pelepasan Barang</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Setiap pilihan dicatat lengkap: siapa yang menerima, instansi mana, siapa saksinya,
                            kapan, dan bukti fotonya.
                        </p>
                    </div>

                    {/* Pilihan tindakan */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                            Jenis Tindak Lanjut
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {actionOptions.map((opt) => {
                                const active = form.data.action === opt.value;
                                const isRecommended = opt.value === recommendedAction;
                                return (
                                    <label
                                        key={opt.value}
                                        className={`cursor-pointer border-2 rounded-xl p-4 transition ${
                                            active ? 'border-[#185FA5] bg-[#EAF1FF]' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="radio"
                                                name="action"
                                                value={opt.value}
                                                checked={active}
                                                onChange={(e) => form.setData('action', e.target.value)}
                                                className="mt-1"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                                                    {opt.label}
                                                    {isRecommended && (
                                                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                                                            Disarankan
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.hint}</p>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        {errors.action && <p className="text-xs text-red-600 mt-1">{errors.action}</p>}
                    </div>

                    {/* Penerima */}
                    {needsRecipient && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                    Nama Penerima <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.recipient_name}
                                    onChange={(e) => form.setData('recipient_name', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                    placeholder="Nama orang / lembaga penerima"
                                />
                                {errors.recipient_name && <p className="text-xs text-red-600 mt-1">{errors.recipient_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                    Instansi / Lembaga <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.recipient_org}
                                    onChange={(e) => form.setData('recipient_org', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                    placeholder="Contoh: bank penerbit kartu, sekolah, instansi pemerintah"
                                />
                                {errors.recipient_org && <p className="text-xs text-red-600 mt-1">{errors.recipient_org}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                    Kontak Penerima
                                </label>
                                <input
                                    type="text"
                                    value={form.data.recipient_contact}
                                    onChange={(e) => form.setData('recipient_contact', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                    placeholder="Nomor HP / telepon (opsional)"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                    Nomor Identitas Penerima
                                </label>
                                <input
                                    type="text"
                                    value={form.data.recipient_id_number}
                                    onChange={(e) => form.setData('recipient_id_number', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                    placeholder="Opsional"
                                />
                            </div>
                        </div>
                    )}

                    {/* Saksi */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                Nama Saksi {minimumWitnesses >= 1 && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={form.data.witness_name}
                                onChange={(e) => form.setData('witness_name', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                placeholder="Nama saksi"
                            />
                            {errors.witness_name && <p className="text-xs text-red-600 mt-1">{errors.witness_name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                Saksi Kedua {minimumWitnesses >= 2 && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={form.data.witness_name_2}
                                onChange={(e) => form.setData('witness_name_2', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                placeholder="Opsional"
                            />
                            {errors.witness_name_2 && <p className="text-xs text-red-600 mt-1">{errors.witness_name_2}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                No. HP Saksi
                            </label>
                            <input
                                type="text"
                                value={form.data.witness_phone}
                                onChange={(e) => form.setData('witness_phone', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                placeholder="Opsional"
                            />
                        </div>
                    </div>

                    {/* Nomor berita acara + keterangan */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                Nomor Berita Acara
                            </label>
                            <input
                                type="text"
                                value={form.data.document_no}
                                onChange={(e) => form.setData('document_no', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                placeholder="Opsional"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                                Keterangan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={form.data.note}
                                onChange={(e) => form.setData('note', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#185FA5] focus:outline-none"
                                placeholder="Jelaskan kronologi, kondisi barang, dan alasan tindak lanjut ini."
                            />
                            {errors.note && <p className="text-xs text-red-600 mt-1">{errors.note}</p>}
                        </div>
                    </div>

                    {/* Bukti foto */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
                            Bukti Foto
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onFileChange}
                            className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#EAF1FF] file:text-[#185FA5] file:font-semibold file:text-xs hover:file:bg-[#DCE9FF]"
                        />
                        {preview && (
                            <img src={preview} alt="Pratinjau bukti" className="mt-3 w-40 h-40 object-cover rounded-xl border border-gray-200" />
                        )}
                    </div>

                    <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <span className="material-symbols-outlined text-sm text-gray-400 mt-0.5">info</span>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Setelah berita acara disimpan, barang dianggap sudah dilepas dan data sensitif
                            (foto asli, nomor seri/IMEI, ciri rahasia) akan dihapus dari sistem.
                            Yang tersisa hanya arsip ringkas laporan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-[#185FA5] text-white rounded-xl font-bold text-sm hover:bg-[#134d87] transition disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Berita Acara & Lepaskan Barang'}
                        </button>
                        <Link
                            href={`/reports/${report.id}`}
                            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
