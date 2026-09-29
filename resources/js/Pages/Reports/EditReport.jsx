import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PetaSambikerep from '@/Components/GoogleMap'; 

export default function EditReport() {
    const { report } = usePage().props;
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [liveErrors, setLiveErrors] = useState({});
    const [regions, setRegions] = useState([]);
    const [regionsLoading, setRegionsLoading] = useState(true)
    const [coordinates, setCoordinates] = useState(null);
    
    const { data, setData, put, processing, errors } = useForm({
        item_name: report.item_name,
        category: report.category || '',
        description: report.description || '',
        color: report.color || '',
        location: report.location,
        date: report.date ? report.date.split('T')[0] : '',
        region_id: report.region_id || '',
        latitude: report.latitude || '',
        longitude: report.longitude || '',
        photo: null,
        _method: 'PUT',
    });
    
    // Real-time validation
    useEffect(() => {
        const newErrors = {};
        if (data.item_name && data.item_name.length < 3) {
            newErrors.item_name = 'Nama barang minimal 3 karakter';
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
                    setCategories(['Elektronik', 'Alat Tulis', 'Pakaian', 'Aksesoris', 'Perlengkapan', 'Lainnya']);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories(['Elektronik', 'Alat Tulis', 'Pakaian', 'Aksesoris', 'Perlengkapan', 'Lainnya']);
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
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };
    
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran file (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast('Ukuran foto maksimal 2MB', 'error');
                return;
            }
            // Validasi tipe file
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                showToast('Format foto harus JPG atau PNG', 'error');
                return;
            }
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validasi sebelum submit
        if (Object.keys(liveErrors).length > 0) {
            showToast('Harap perbaiki error yang ada', 'error');
            return;
        }
        
        setShowConfirmModal(true);
    };
    
    const confirmSubmit = () => {
        setShowConfirmModal(false);
        
        // Gunakan POST with _method PUT untuk file upload
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('item_name', data.item_name);
        formData.append('category', data.category);
        formData.append('description', data.description);
        formData.append('color', data.color);
        formData.append('location', data.location);
        formData.append('date', data.date);
        formData.append('region_id', data.region_id);
        formData.append('latitude', data.latitude);
        formData.append('longitude', data.longitude);
        if (data.photo) {
            formData.append('photo', data.photo);
        }
        
        router.post(`/reports/${report.id}`, formData, {
            onSuccess: () => {
                showToast('Laporan berhasil diperbarui!', 'success');
                setTimeout(() => {
                    window.location.href = `/reports/${report.id}`;
                }, 500);
            },
            onError: (errors) => {
                if (errors.item_name) {
                    showToast(errors.item_name, 'error');
                } else if (errors.description) {
                    showToast(errors.description, 'error');
                } else if (errors.location) {
                    showToast(errors.location, 'error');
                } else {
                    showToast('Gagal memperbarui laporan. Cek kembali data Anda.', 'error');
                }
            },
        });
    };
    
    const removePhoto = () => {
        setPhotoPreview(null);
        setData('photo', null);
        // Trigger untuk hapus foto di backend bisa ditambahkan nanti
    };
    
    // Get current date for max date input
    const today = new Date().toISOString().split('T')[0];
    
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
            
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 animate-scaleIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Edit</h3>
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
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Ya, Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">✏️ Edit Laporan</h1>
                        <p className="text-gray-500 text-sm mt-1">Perbarui informasi barang #{report.id}</p>
                    </div>
                    <Link href={`/reports/${report.id}`} className="text-gray-500 hover:text-gray-700 transition flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Kembali
                    </Link>
                </div>
                
                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-yellow-100/30">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Edit Laporan</p>
                                <p className="text-xs text-gray-400">Perbarui data barang {report.item_name}</p>
                            </div>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Nama Barang */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Barang <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.item_name}
                                onChange={e => setData('item_name', e.target.value)}
                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ${
                                    (errors.item_name || liveErrors.item_name) ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Contoh: Botol Minum Hydro Flask"
                                required
                            />
                            {liveErrors.item_name && <p className="text-red-500 text-xs mt-1">{liveErrors.item_name}</p>}
                            {!liveErrors.item_name && data.item_name && data.item_name.length >= 3 && (
                                <p className="text-green-500 text-xs mt-1">✓ Nama barang valid</p>
                            )}
                            {errors.item_name && <p className="text-red-500 text-xs mt-1">{errors.item_name}</p>}
                        </div>
                        
                        {/* Kategori dan Warna */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                                <select
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                        errors.category ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Warna</label>
                                <input
                                    type="text"
                                    value={data.color}
                                    onChange={e => setData('color', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Contoh: Hitam, Biru"
                                />
                                {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
                            </div>
                        </div>
                        
                        {/* Kelurahan, Lokasi, dan Tanggal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Kelurahan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.region_id}
                                    onChange={e => setData('region_id', e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                        errors.region_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
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
                                {errors.region_id && <p className="text-red-500 text-xs mt-1">{errors.region_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                        (errors.location || liveErrors.location) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Contoh: Ruang 203, Kantin"
                                    required
                                />
                                {liveErrors.location && <p className="text-red-500 text-xs mt-1">{liveErrors.location}</p>}
                                {!liveErrors.location && data.location && data.location.length >= 3 && (
                                    <p className="text-green-500 text-xs mt-1">✓ Lokasi valid</p>
                                )}
                                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                            </div>

                            {/* ⭐ PETA EDIT LOKASI - TAMBAHKAN DI SINI ⭐ */}
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Tandai Lokasi di Peta <span className="text-red-500">*</span>
                                </label>
                                <PetaSambikerep
                                    initialMarker={
                                        report.latitude && report.longitude
                                            ? { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) }
                                            : null
                                    }
                                    onLocationSelect={(coords) => {
                                        setCoordinates(coords);
                                        setData('latitude', coords.lat);
                                        setData('longitude', coords.lng);
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Klik pada peta untuk memindahkan titik lokasi barang.
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kejadian <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    max={today}
                                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                                        (errors.date || liveErrors.date) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {liveErrors.date && <p className="text-red-500 text-xs mt-1">{liveErrors.date}</p>}
                                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                            </div>
                        </div>
                        
                        {/* Deskripsi dengan karakter counter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                rows="4"
                                placeholder="Deskripsikan ciri-ciri barang..."
                                maxLength="500"
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">
                                {data.description.length}/500 karakter
                            </div>
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>
                        
                        {/* Foto Barang */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Foto Barang (Opsional)</label>
                            
                            {/* Current Photo */}
                            {report.photo && !photoPreview && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2">Foto saat ini:</p>
                                    <div className="relative inline-block">
                                        <img 
                                            src={`/storage/${report.photo}`} 
                                            alt={report.item_name} 
                                            className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* New Photo Preview */}
                            {photoPreview && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-2">Foto baru:</p>
                                    <div className="relative inline-block">
                                        <img 
                                            src={photoPreview} 
                                            alt="Preview" 
                                            className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removePhoto}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Upload Input */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-400 transition cursor-pointer"
                                 onClick={() => document.getElementById('photo-input').click()}>
                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-gray-500">Klik untuk upload foto baru (max 2MB, JPG/PNG)</p>
                                <input
                                    id="photo-input"
                                    type="file"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/jpg"
                                />
                            </div>
                            {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                        </div>
                        
                        {/* Info Tips */}
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800">Tips Mengedit Laporan</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Pastikan informasi yang diupdate akurat. Perubahan akan langsung terlihat di halaman detail laporan.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Submit Button */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing || Object.keys(liveErrors).length > 0}
                                className="bg-yellow-500 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                            <Link
                                href={`/reports/${report.id}`}
                                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition text-center"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            
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