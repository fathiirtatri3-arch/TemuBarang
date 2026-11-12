import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Users() {
    const { users, regions = [], flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDeleting, setIsDeleting] = useState(false);
    const [roleModal, setRoleModal] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [modalError, setModalError] = useState('');
    const [savingRole, setSavingRole] = useState(false);
    
    const handleDelete = (id, name) => {
        if (confirm(`Yakin ingin menghapus user "${name}"?`)) {
            setIsDeleting(true);
            router.delete(`/admin/users/${id}`, {
                onSuccess: () => {
                    setIsDeleting(false);
                },
                onError: () => {
                    alert('Gagal menghapus user');
                    setIsDeleting(false);
                },
            });
        }
    };
    
    const handleDemote = (id, name) => {
        if (confirm(`Ubah "${name}" menjadi Warga? Akses adminnya akan dicabut.`)) {
            router.put(`/admin/users/${id}/role`, { role: 'user' }, { preserveScroll: true });
        }
    };

    const openRegionModal = (user) => {
        setRoleModal(user);
        setSelectedRegion(user.region_id ? String(user.region_id) : '');
        setModalError('');
    };

    const saveAdminKelurahan = () => {
        if (!selectedRegion) {
            setModalError('Pilih kelurahan terlebih dahulu.');
            return;
        }
        setSavingRole(true);
        router.put(`/admin/users/${roleModal.id}/role`, {
            role: 'admin_kelurahan',
            region_id: selectedRegion,
        }, {
            preserveScroll: true,
            onSuccess: () => setRoleModal(null),
            onError: (errs) => setModalError(errs.region_id || errs.role || 'Gagal menyimpan.'),
            onFinish: () => setSavingRole(false),
        });
    };
    
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
                return { bg: 'bg-[#185FA5]/10 text-[#185FA5]', label: 'Admin Kelurahan' };
            case 'admin': 
                return { bg: 'bg-[#185FA5]/10 text-[#185FA5]', label: 'Admin' };
            default: 
                return { bg: 'bg-gray-100 text-gray-700', label: 'Warga' };
        }
    };
    
    const getStatusBadge = (user) => {
        // Asumsi: user aktif jika bukan admin atau ada logika lain
        const isActive = user.is_active !== false;
        if (isActive) {
            return { bg: 'text-[#107569]', dot: 'bg-[#107569]', label: 'Aktif' };
        }
        return { bg: 'text-error', dot: 'bg-error', label: 'Non-aktif' };
    };
    
    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };
    
    // Filter users
    const filteredUsers = users.data.filter(user => {
        const matchesSearch = search === '' || 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });
    
    // Stat cards
    const stats = {
        total: users.total || users.data.length,
        superAdmin: users.data.filter(u => u.role === 'super_admin').length,
        adminKelurahan: users.data.filter(u => u.role === 'admin_kelurahan').length,
        warga: users.data.filter(u => u.role === 'user').length,
    };
    
    return (
        <AuthenticatedLayout>
            {/* Modal: tunjuk / ubah wilayah Admin Kelurahan */}
            {roleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#D4E3FF] rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#185FA5]">location_city</span>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {roleModal.role === 'admin_kelurahan' ? 'Ubah Wilayah Admin' : 'Jadikan Admin Kelurahan'}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">{roleModal.name} • {roleModal.email}</p>
                            </div>
                        </div>

                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Kelurahan yang diampu <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedRegion}
                            onChange={(e) => { setSelectedRegion(e.target.value); setModalError(''); }}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#185FA5] bg-white"
                        >
                            <option value="">-- Pilih kelurahan --</option>
                            {regions.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        {modalError && <p className="text-xs text-red-600 mt-1.5">{modalError}</p>}
                        <p className="text-xs text-gray-400 mt-3">
                            Admin kelurahan hanya dapat melihat dan memproses laporan serta klaim di kelurahan ini.
                        </p>

                        <div className="flex gap-3 justify-end mt-5">
                            <button
                                onClick={() => setRoleModal(null)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                onClick={saveAdminKelurahan}
                                disabled={savingRole}
                                className="px-4 py-2 bg-[#185FA5] text-white rounded-xl hover:bg-[#0C447C] transition text-sm font-semibold disabled:opacity-50"
                            >
                                {savingRole ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Akses Pengguna</h2>
                            <p className="text-gray-500 text-sm max-w-2xl mt-1">
                                Kelola akun pengguna TemuBarang, tunjuk admin kelurahan beserta wilayahnya, dan jaga keamanan data warga.
                            </p>
                        </div>
                    </div>
                    
                    {/* Pesan sukses / error */}
                    {(flash?.success || flash?.error) && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
                            flash.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            {flash.success || flash.error}
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {/* Card 1: Total Pengguna */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-[#D4E3FF] p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-[#185FA5]">groups</span>
                                </div>
                                <span className="text-[#185FA5] font-bold text-xs bg-[#D4E3FF]/30 px-2 py-1 rounded-lg">+4%</span>
                            </div>
                            <p className="text-xs text-gray-500">Total Pengguna</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.total}</h3>
                        </div>

                        {/* Card 2: Super Admin */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-purple-100 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-purple-700">admin_panel_settings</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Super Admin</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.superAdmin}</h3>
                        </div>

                        {/* Card 3: Admin Kelurahan */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-[#D4E3FF] p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-[#185FA5]">location_city</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Admin Kelurahan</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.adminKelurahan}</h3>
                        </div>

                        {/* Card 4: Warga */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-green-700">person</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Warga</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.warga}</h3>
                        </div>
                    </div>
                    
                    {/* Table Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        {/* Filters Bar */}
                        <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-[#F8F9FF] border-b border-gray-200">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-semibold text-gray-500">Filter berdasarkan:</span>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-lg text-sm font-medium px-4 py-2 pr-10 focus:ring-2 focus:ring-[#185FA5] appearance-none"
                                >
                                    <option value="all">Semua Peran</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="admin_kelurahan">Admin Kelurahan</option>
                                    <option value="user">Warga</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-lg text-sm font-medium px-4 py-2 pr-10 focus:ring-2 focus:ring-[#185FA5] appearance-none"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Non-aktif</option>
                                </select>
                            </div>
                            <div className="text-xs text-gray-500">
                                Menampilkan <span className="font-bold text-gray-900">{filteredUsers.length}</span> dari <span className="font-bold text-gray-900">{stats.total}</span> pengguna
                            </div>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative max-w-md">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Cari user, email, atau role..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-[#185FA5] text-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Main Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Peran</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Bergabung</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                                                <div className="text-4xl mb-2">👤</div>
                                                <p>Tidak ada user ditemukan</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => {
                                            const badge = getRoleBadge(user.role);
                                            const status = getStatusBadge(user);
                                            return (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-all group">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#185FA5] to-[#0C447C] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                                                                <p className="text-[11px] text-gray-400">ID: {user.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg}`}>
                                                            {getRoleLabel(user.role)}
                                                        </span>
                                                            {user.role === 'admin_kelurahan' && (
                                                                <button
                                                                    onClick={() => openRegionModal(user)}
                                                                    className="p-2 text-[#185FA5] hover:bg-[#D4E3FF] rounded-lg transition-colors"
                                                                    title="Ubah Wilayah"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">edit_location_alt</span>
                                                                </button>
                                                            )}
                                                            {user.role === 'admin_kelurahan' && (
                                                            <p className="text-[11px] text-gray-400 mt-1">
                                                                {user.region_name ? `Kel. ${user.region_name}` : 'Wilayah belum diatur'}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${status.bg}`}>
                                                            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Link
                                                                href={`/admin/users/${user.id}`}
                                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Detail"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                            </Link>
                                                            {/* Tombol ubah role — hanya untuk user dan admin_kelurahan */}
                                                            {user.role === 'user' && (
                                                                <button
                                                                    onClick={() => openRegionModal(user)}
                                                                    className="p-2 text-[#185FA5] hover:bg-[#D4E3FF] rounded-lg transition-colors"
                                                                    title="Jadikan Admin Kelurahan"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">switch_account</span>
                                                                </button>
                                                            )}
                                                            {user.role === 'admin_kelurahan' && (
                                                                <button
                                                                    onClick={() => handleDemote(user.id, user.name)}
                                                                    className="p-2 text-[#6F3800] hover:bg-[#FFDCC4] rounded-lg transition-colors"
                                                                    title="Jadikan Warga"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">switch_account</span>
                                                                </button>
                                                            )}

                                                            {/* Tombol hapus — tidak bisa hapus Super Admin */}
                                                            {user.role !== 'super_admin' && (
                                                                <button
                                                                    onClick={() => handleDelete(user.id, user.name)}
                                                                    disabled={isDeleting}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                                    title="Hapus Akun"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">person_remove</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="p-4 flex items-center justify-between border-t border-gray-200 bg-gray-50/50">
                            <button 
                                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!users.prev_page_url}
                                onClick={() => users.prev_page_url && router.visit(users.prev_page_url)}
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                                Sebelumnya
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {users.links?.map((link, index) => {
                                    // Skip link yang tidak perlu (biasanya yang mengandung "Previous" atau "Next")
                                    const label = link.label;
                                    const isPrev = label.includes('Previous') || label.includes('‹');
                                    const isNext = label.includes('Next') || label.includes('›');
                                    const isDots = label.includes('...');
                                    
                                    // Skip tombol Previous dan Next karena sudah kita buat manual
                                    if (isPrev || isNext) return null;
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.visit(link.url)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                                                link.active
                                                    ? 'bg-[#185FA5] text-white'
                                                    : link.url && !isDots
                                                        ? 'hover:bg-gray-100 text-gray-600'
                                                        : 'text-gray-400 cursor-default'
                                            }`}
                                            disabled={!link.url || isDots}
                                            dangerouslySetInnerHTML={{ __html: isDots ? '...' : label }}
                                        />
                                    );
                                })}
                            </div>
                            
                            <button 
                                className="px-4 py-2 text-[#185FA5] text-sm font-medium hover:bg-[#D4E3FF] rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!users.next_page_url}
                                onClick={() => users.next_page_url && router.visit(users.next_page_url)}
                            >
                                Selanjutnya
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}