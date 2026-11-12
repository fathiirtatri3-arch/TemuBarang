import { useState, useEffect } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PetaSambikerep from '@/Components/GoogleMap';

export default function CreateReport() {
    const [photoPreview, setPhotoPreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [liveErrors, setLiveErrors] = useState({});
    const [hasPhoto, setHasPhoto] = useState(false);
    const [regions, setRegions] = useState([]);
    const [regionsLoading, setRegionsLoading] = useState(true);
    const [coordinates, setCoordinates] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'lost',
        item_name: '',
        category: '',
        description: '',
        color: '',
        location: '',
        date: '',
        photo: null,
        region_id: '',
        latitude: '',
        longitude: '',
        secret_feature: '',
    });
    
    // Real-time validation
    useEffect(() => {
        const newErrors = {};
        if (data.item_name && data.item_name.length < 5) {
            newErrors.item_name = 'Nama barang minimal 5 karakter';
        }
        if (data.location && data.location.length < 3) {
            newErrors.location = 'Lokasi minimal 3 karakter';
        }
        if (data.date && new Date(data.date) > new Date()) {
            newErrors.date = 'Tanggal tidak boleh melebihi hari ini';
        }
        setLiveErrors(newErrors);
    }, [data.item_name, data.location, data.date]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories', {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setCategories(data.data);
                } else {
                    setCategories([
                        'Elektronik', 'Dokumen & Surat', 'Pakaian & Aksesoris', 'Alat Tulis',
                        'Perlengkapan Makan & Minum', 'Dompet & Tas', 'Kartu & Identitas', 'Kunci',
                        'Perhiasan & Aksesoris', 'Kendaraan & Aksesoris', 'Anak & Bayi', 'Uang', 'Lainnya'
                    ]);
                }
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setCategories([
                        'Elektronik', 'Dokumen & Surat', 'Pakaian & Aksesoris', 'Alat Tulis',
                        'Perlengkapan Makan & Minum', 'Dompet & Tas', 'Kartu & Identitas', 'Kunci',
                        'Perhiasan & Aksesoris', 'Kendaraan & Aksesoris', 'Anak & Bayi', 'Uang', 'Lainnya'
                    ]);
                } finally {
                    setCategoriesLoading(false);
                }
            };
            fetchCategories();
        }, []);

    // ⭐ TAMBAHKAN USEFFECT UNTUK FETCH REGIONS
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await fetch('/api/regions', {
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    setRegions(data.data);
                }
            } catch (error) {
                console.error('Error fetching regions:', error);
            } finally {
                setRegionsLoading(false);
            }
        };
        fetchRegions();
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        console.log('File selected:', file);
        
        if (file) {
            // Validasi ukuran
            if (file.size > 2 * 1024 * 1024) {
                showToast('Ukuran foto maksimal 2MB', 'error');
                return;
            }
            // Validasi tipe
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                showToast('Format foto harus JPG atau PNG', 'error');
                return;
            }
            
            // Set data photo
            setData('photo', file);
            setHasPhoto(true);
            
            // Buat preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                console.log('Preview set:', reader.result.substring(0, 50));
            };
            reader.readAsDataURL(file);
            
            // Reset input agar bisa upload ulang
            e.target.value = '';
        }
    };
    
    const removePhoto = () => {
        setPhotoPreview(null);
        setData('photo', null);
        setHasPhoto(false);
        document.getElementById('photo-input').value = '';
    };
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('Submitting form...');
        console.log('Data:', data);
        console.log('Has photo:', hasPhoto);
        console.log('Photo file:', data.photo);
        
        // Validasi foto wajib
        if (!hasPhoto || !data.photo) {
            showToast('Foto barang wajib diupload!', 'error');
            return;
        }

        if (data.type === 'found' && (data.secret_feature || '').trim().length < 5) {
            showToast('Isi ciri khusus rahasia barang temuan (minimal 5 karakter)', 'error');
            return;
        }

        if (!data.latitude || !data.longitude) {
            showToast('Tandai lokasi di peta terlebih dahulu!', 'error');
            return;
        }

        if (Object.keys(liveErrors).length > 0) {
            showToast('Harap perbaiki error yang ada', 'error');
            return;
        }
        
        setShowConfirmModal(true);
    };
    
    const confirmSubmit = () => {
        setShowConfirmModal(false);

        post('/reports', {
            forceFormData: true,
            onSuccess: () => {
                showToast('Laporan berhasil dikirim!', 'success');
                reset();
                setPhotoPreview(null);
                setHasPhoto(false);
                setCoordinates(null);
                setTimeout(() => {
                    router.visit('/reports');
                }, 1500);
            },
            onError: (errors) => {
                console.error('Submit errors:', errors);
                showToast(
                    errors.error || errors.item_name || errors.description || errors.photo || errors.latitude || errors.secret_feature || 'Gagal mengirim laporan. Cek kembali data Anda.',
                    'error'
                );
            },
        });
    };
    
    const today = new Date().toISOString().split('T')[0];
    const selectedRegionName = regions.find(r => String(r.id) === String(data.region_id))?.name;
    
    return (
        <AuthenticatedLayout>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-5 right-5 z-50 animate-slideIn">
                    <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
                        toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                            {toast.message}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 animate-scaleIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Laporan</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Apakah data yang Anda masukkan sudah benar? Pastikan informasi barang sudah lengkap dan akurat.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmSubmit}
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Ya, Kirim Laporan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto px-4 py-6 relative">
                    {/* Page Header */}
                    <header className="mb-6">
                        <div className="flex items-center gap-4 text-gray-500 mb-3">
                            <Link href="/reports" className="group hover:text-[#185FA5] transition-colors flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-[#185FA5] group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Kembali ke Daftar</span>
                            </Link>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Buat Laporan Baru</h2>
                                <p className="text-gray-500 text-sm mt-1">Lengkapi data untuk mempercepat proses pemulihan barang.</p>
                            </div>
                        </div>
                    </header>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Form Section - Left */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative">
                                {/* Form Type Switcher */}
                                <div className="flex justify-center mb-6">
                                    <div className="bg-gray-50 p-1.5 rounded-2xl flex gap-1 w-full max-w-md border border-gray-200">
                                        <button
                                            type="button"
                                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                                data.type === 'lost' 
                                                    ? 'bg-white shadow-md text-[#185FA5]' 
                                                    : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                            onClick={() => setData('type', 'lost')}
                                        >
                                            <span className="material-symbols-outlined text-lg">zoom_in</span>
                                            Barang Hilang
                                        </button>
                                        <button
                                            type="button"
                                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                                data.type === 'found' 
                                                    ? 'bg-white shadow-md text-[#185FA5]' 
                                                    : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                            onClick={() => setData('type', 'found')}
                                        >
                                            <span className="material-symbols-outlined text-lg">inventory</span>
                                            Barang Temuan
                                        </button>
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {/* Nama Barang */}
                                    <div className="col-span-2">
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">
                                            Nama Barang <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.item_name}
                                            onChange={(e) => setData('item_name', e.target.value)}
                                            className={`w-full px-5 py-4 rounded-2xl border ${
                                                (errors.item_name || liveErrors.item_name) ? 'border-red-500' : 'border-gray-200'
                                            } bg-white outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300`}
                                            placeholder="Contoh: Botol Minum Hydro Flask"
                                            required
                                        />
                                        {liveErrors.item_name && <p className="mt-1 text-xs text-red-500">{liveErrors.item_name}</p>}
                                        {!liveErrors.item_name && data.item_name && data.item_name.length >= 3 && (
                                            <p className="mt-1 text-xs text-green-600">✓ Nama barang valid</p>
                                        )}
                                        {errors.item_name && <p className="mt-1 text-xs text-red-500">{errors.item_name}</p>}
                                    </div>

                                    {/* Kategori */}
                                    <div>
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">
                                            Kategori <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                                className={`w-full px-5 py-4 rounded-2xl border ${
                                                    errors.category ? 'border-red-500' : 'border-gray-200'
                                                } bg-white outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 appearance-none`}
                                                required
                                            >
                                                <option value="">Pilih Kategori</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">expand_more</span>
                                        </div>
                                        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                                        {['Elektronik', 'Dokumen & Surat', 'Kartu & Identitas', 'Uang'].includes(data.category) && (
                                            <p className="mt-1.5 text-xs text-slate-600 flex items-start gap-1.5">
                                                <span className="material-symbols-outlined text-sm text-slate-500">visibility_off</span>
                                                <span>Foto kategori ini disamarkan otomatis untuk publik. Admin kelurahan tetap melihat foto aslinya.</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Warna */}
                                    <div>
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">Warna Utama</label>
                                        <input
                                            type="text"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300"
                                            placeholder="Contoh: Hitam, Biru"
                                        />
                                        {errors.color && <p className="mt-1 text-xs text-red-500">{errors.color}</p>}
                                    </div>

                                    {/* ⭐ KELURAHAN (TAMBAHKAN DI SINI) ⭐ */}
                                    <div>
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">
                                            Kelurahan <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#185FA5] transition-colors">map</span>
                                            <select
                                                value={data.region_id}
                                                onChange={(e) => setData('region_id', e.target.value)}
                                                className={`w-full pl-12 pr-5 py-4 rounded-2xl border ${
                                                    errors.region_id ? 'border-red-500' : 'border-gray-200'
                                                } bg-white outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 appearance-none`}
                                                required
                                            >
                                                <option value="">Pilih Kelurahan</option>
                                                {regionsLoading ? (
                                                    <option disabled>Memuat...</option>
                                                ) : (
                                                    regions.map(region => (
                                                        <option key={region.id} value={region.id}>{region.name}</option>
                                                    ))
                                                )}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">expand_more</span>
                                        </div>
                                        {errors.region_id && <p className="mt-1 text-xs text-red-500">{errors.region_id}</p>}
                                    </div>

                                    {/* Lokasi */}
                                    <div>
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">
                                            Lokasi <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#185FA5] transition-colors">location_on</span>
                                            <input
                                                type="text"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                className={`w-full pl-12 pr-5 py-4 rounded-2xl border ${
                                                    (errors.location || liveErrors.location) ? 'border-red-500' : 'border-gray-200'
                                                } bg-white outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300`}
                                                placeholder={data.type === 'lost' ? "Contoh: Jl. Raya Jelidro, Taman" : "Contoh: Jl. Raya Jelidro, Taman"}
                                                required
                                            />
                                        </div>
                                        {liveErrors.location && <p className="mt-1 text-xs text-red-500">{liveErrors.location}</p>}
                                        {!liveErrors.location && data.location && data.location.length >= 3 && (
                                            <p className="mt-1 text-xs text-green-600">✓ Lokasi valid</p>
                                        )}
                                        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
                                    </div>

                                    {/* ⭐ PETA INTERAKTIF - TAMBAHKAN DI SINI ⭐ */}
                                    <div className="col-span-2">
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">
                                            Tandai Lokasi di Peta <span className="text-red-500">*</span>
                                        </label>
                                        <PetaSambikerep 
                                            onLocationSelect={(coords) => {
                                                setCoordinates(coords);
                                                setData(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
                                            }}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Klik pada peta untuk menandai lokasi barang.
                                        </p>
                                    </div>

                                    {/* Tanggal */}
                                    <div>
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">
                                            Tanggal Kejadian <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#185FA5] transition-colors">calendar_month</span>
                                            <input
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                max={today}
                                                className={`w-full pl-12 pr-5 py-4 rounded-2xl border ${
                                                    (errors.date || liveErrors.date) ? 'border-red-500' : 'border-gray-200'
                                                } bg-white outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300`}
                                                required
                                            />
                                        </div>
                                        {liveErrors.date && <p className="mt-1 text-xs text-red-500">{liveErrors.date}</p>}
                                        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                                    </div>

                                    {/* Deskripsi */}
                                    <div className="col-span-2">
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">Deskripsi Detail</label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 resize-none"
                                            placeholder="Ceritakan ciri khas barang, logo tertentu, atau kondisi saat terakhir dilihat..."
                                            rows="4"
                                            maxLength="500"
                                        />
                                        <div className="text-right text-xs text-gray-400 mt-1">
                                            {data.description.length}/500 karakter
                                        </div>
                                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                    </div>

                                    {/* Barang temuan: info penyerahan + ciri khusus rahasia */}
                                    {data.type === 'found' && (
                                        <div className="col-span-2 space-y-4">
                                            <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                                                <span className="material-symbols-outlined text-amber-600">home_work</span>
                                                <p className="text-sm text-amber-800 leading-relaxed">
                                                    Setelah laporan diverifikasi, <strong>serahkan barang ke kantor {selectedRegionName || 'kelurahan yang Anda pilih'}</strong> agar bisa diberikan kepada pemiliknya dengan aman. Mohon jangan menyimpan barang sendiri.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">
                                                    Ciri Khusus Rahasia <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative group">
                                                    <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 group-focus-within:text-[#185FA5] transition-colors">lock</span>
                                                    <textarea
                                                        value={data.secret_feature}
                                                        onChange={(e) => setData('secret_feature', e.target.value)}
                                                        className={`w-full pl-12 pr-5 py-4 rounded-2xl border ${
                                                            errors.secret_feature ? 'border-red-500' : 'border-gray-200'
                                                        } bg-white outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 resize-none`}
                                                        placeholder="Contoh: wallpaper HP foto kucing, isi dompet ada struk Indomaret, ada goresan di bagian dalam tutup"
                                                        rows="3"
                                                        maxLength="255"
                                                    />
                                                </div>
                                                <p className="mt-1.5 text-xs text-gray-500">
                                                    🔒 Tidak ditampilkan ke publik. Hanya dilihat admin kelurahan untuk mencocokkan jawaban pemilik saat klaim. Jangan tulis ciri ini di kolom Deskripsi, karena Deskripsi tampil publik.
                                                </p>
                                                {errors.secret_feature && <p className="mt-1 text-xs text-red-500">{errors.secret_feature}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload Foto - Dengan Preview di DALAM Area Upload */}
                                    <div className="col-span-2">
                                        <label className="block font-semibold text-sm mb-2.5 text-gray-800 px-1">
                                            Upload Foto Barang <span className="text-red-500">*</span>
                                        </label>
                                        
                                        {!photoPreview ? (
                                            // BELUM upload
                                            <div 
                                                className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-3xl py-10 bg-gray-50 transition-all duration-500 hover:border-[#185FA5] hover:bg-[#185FA5]/5 cursor-pointer"
                                                onClick={() => document.getElementById('photo-input').click()}
                                            >
                                                <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center text-[#185FA5] group-hover:scale-110 transition-transform duration-500 mb-4 border border-gray-100">
                                                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold text-gray-800 text-lg">Unggah Foto Pendukung</p>
                                                    <p className="text-xs text-gray-500 mt-1.5 px-4">
                                                        Klik untuk pilih file atau seret ke sini<br />(JPG, PNG, Maks 2MB)
                                                    </p>
                                                </div>
                                                <input 
                                                    id="photo-input" 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    accept="image/jpeg,image/png,image/jpg" 
                                                    onChange={handlePhotoChange} 
                                                />
                                            </div>
                                        ) : (
                                            // SUDAH upload - Preview di DALAM area
                                            <div className="relative border-2 border-[#185FA5] border-solid rounded-3xl p-6 bg-[#185FA5]/5 transition-all duration-500">
                                                <button
                                                    type="button"
                                                    onClick={removePhoto}
                                                    className="absolute top-3 right-3 z-10 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition shadow-md"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                                
                                                <div className="flex flex-col md:flex-row items-center gap-6">
                                                    <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                                                        <img 
                                                            src={photoPreview} 
                                                            alt="Preview" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 text-center md:text-left">
                                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                            <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                                                            <p className="font-semibold text-gray-800 text-lg">Foto berhasil diupload</p>
                                                        </div>
                                                        <p className="text-sm text-green-600">✓ File siap dikirim</p>
                                                        <p className="text-xs text-gray-400 mt-2">Klik tombol (×) untuk mengganti foto</p>
                                                    </div>
                                                </div>
                                                
                                                <input 
                                                    id="photo-input" 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/jpeg,image/png,image/jpg" 
                                                    onChange={handlePhotoChange} 
                                                />
                                            </div>
                                        )}
                                        
                                        {errors.photo && <p className="mt-1 text-xs text-red-500">{errors.photo}</p>}
                                    </div>

                                    {/* Form Actions */}
                                    <div className="col-span-2 mt-4 pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                                        <Link
                                            href="/reports"
                                            className="w-full sm:w-auto px-6 py-4 rounded-2xl text-gray-600 font-bold hover:bg-gray-100 transition-all duration-300 text-center"
                                        >
                                            Batal
                                        </Link>
                                        <button
                                            type="submit"
                                            onClick={handleSubmit}
                                            disabled={processing || Object.keys(liveErrors).length > 0}
                                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#185FA5] text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    Kirim Laporan
                                                    <span className="material-symbols-outlined text-sm">send</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Sidebar - Right */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Illustration Card */}
                            <div className="bg-[#185FA5]/5 rounded-3xl p-6 relative overflow-hidden border border-[#185FA5]/10">
                                <div className="w-full h-40 rounded-2xl mb-4 bg-gradient-to-br from-[#185FA5]/20 to-[#185FA5]/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-7xl text-[#185FA5]/30" style={{ fontVariationSettings: '"FILL" 1' }}>inventory_2</span>
                                </div>
                                <h4 className="font-bold text-[#185FA5] text-lg mb-2">Membantu sesama</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Sistem TemuBarang didesain untuk memudahkan koordinasi antara penemu dan pemilik barang di lingkungan kecamatan.
                                </p>
                            </div>

                            {/* Tips Section */}
                            <div className="bg-gray-50/60 border border-gray-200/40 p-6 rounded-3xl space-y-4">
                                <div className="flex items-center gap-3 text-[#185FA5]">
                                    <div className="w-10 h-10 bg-[#185FA5]/10 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>lightbulb</span>
                                    </div>
                                    <h4 className="font-bold text-sm">Tips Melapor</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-[#185FA5] shadow-sm">1</span>
                                        <p className="text-sm text-gray-600 leading-snug">Sebutkan ciri khas unik (misal: stiker, goresan, gantungan kunci).</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-[#185FA5] shadow-sm">2</span>
                                        <p className="text-sm text-gray-600 leading-snug">Lokasi yang spesifik (misal: "Jl. Raya Jelidro dekat minimarket").</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-[#185FA5] shadow-sm">3</span>
                                        <p className="text-sm text-gray-600 leading-snug">Foto barang dari sudut pandang yang jelas dan pencahayaan baik.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Live Status */}
                            <div className="bg-[#185FA5] rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 flex items-center justify-between group overflow-hidden relative">
                                <div className="relative z-10">
                                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Status Sistem</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="font-semibold">Online &amp; Siap</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-5xl opacity-10 absolute -right-2 group-hover:rotate-12 transition-transform duration-500">verified_user</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations CSS */}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
            `}</style>
        </AuthenticatedLayout>
    );
}