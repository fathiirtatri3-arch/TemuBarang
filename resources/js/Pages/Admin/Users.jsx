import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Users() {
    const { users } = usePage().props;
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDeleting, setIsDeleting] = useState(false);
    
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
    
    const handleRoleChange = (id, role) => {
        if (confirm(`Ubah role user ini menjadi ${role}?`)) {
            router.put(`/admin/users/${id}/role`, { role });
        }
    };
    
    const getRoleBadge = (role) => {
        if (role === 'admin') {
            return { bg: 'bg-primary/10 text-primary', label: 'Admin' };
        }
        return { bg: 'bg-tertiary-fixed/40 text-tertiary', label: 'Siswa' };
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
        const matchesRole = roleFilter === 'all' || 
            (roleFilter === 'admin' && user.role === 'admin') ||
            (roleFilter === 'student' && user.role === 'student');
        return matchesSearch && matchesRole;
    });
    
    // Stat cards
    const stats = {
        total: users.total || users.data.length,
        admin: users.data.filter(u => u.role === 'admin').length,
        student: users.data.filter(u => u.role === 'student').length,
        staff: users.data.filter(u => u.role === 'staff').length || 0,
    };
    
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Akses Pengguna</h2>
                            <p className="text-gray-500 text-sm max-w-2xl mt-1">
                                Kelola dan pantau seluruh akun pengguna yang terdaftar di sistem TemuBarang untuk menjaga keamanan data sekolah.
                            </p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-[#E0E3E5] p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-[#444749]">admin_panel_settings</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Admin</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.admin}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-[#FFDCC4] p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-[#6F3800]">school</span>
                                </div>
                                <span className="text-[#6F3800] font-bold text-xs bg-[#FFDCC4]/50 px-2 py-1 rounded-lg">+120</span>
                            </div>
                            <p className="text-xs text-gray-500">Siswa</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.student}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-[#E7E8EE] p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-[#424751]">badge</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Staf</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.staff}</h3>
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
                                    <option value="admin">Admin</option>
                                    <option value="student">Siswa</option>
                                    <option value="staff">Staf</option>
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
                                                            {badge.label}
                                                        </span>
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
                                                            {user.role === 'student' ? (
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                                                    className="p-2 text-[#185FA5] hover:bg-[#D4E3FF] rounded-lg transition-colors"
                                                                    title="Jadikan Admin"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">switch_account</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, 'student')}
                                                                    className="p-2 text-[#6F3800] hover:bg-[#FFDCC4] rounded-lg transition-colors"
                                                                    title="Jadikan Siswa"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">switch_account</span>
                                                                </button>
                                                            )}
                                                            {user.id !== 1 && (
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