import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <AuthenticatedLayout>
            <Head title="Profil Saya - TemuBarang" />

            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Page Header */}
                    <header className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Profil Saya</h2>
                            <p className="text-gray-500 text-sm">Kelola informasi akun dan keamanan kamu</p>
                        </div>
                    </header>

                    {/* Profile Hero Card */}
                    <section className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-200/50 mb-6">
                        {/* Cover Pattern */}
                        <div className="h-32 w-full relative bg-gradient-to-r from-[#185FA5] to-[#0C447C]">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
                            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5"></div>
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10"></div>
                        </div>
                        
                        <div className="px-6 pb-6 flex flex-col md:flex-row items-end -mt-12 gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                                    {user?.avatar ? (
                                        <img 
                                            src={`/storage/${user.avatar}`} 
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#185FA5] to-[#0C447C] text-white text-4xl font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                <button className="absolute bottom-1 right-1 p-1 bg-[#185FA5] text-white rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">{user?.name || 'Pengguna'}</h3>
                                    <span className="px-3 py-1 bg-[#185FA5]/10 text-[#185FA5] text-xs font-semibold rounded-full border border-[#185FA5]/20 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">school</span>
                                        {user?.role === 'admin' ? 'Admin Sekolah' : 'Siswa'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </section>

                    {/* Bento Grid Settings */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Informasi Profil & Password */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Update Profile */}
                            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/50 hover:shadow-md transition-shadow group">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2 bg-[#185FA5]/10 rounded-2xl group-hover:bg-[#185FA5]/20 transition-colors">
                                        <span className="material-symbols-outlined text-[#185FA5]">badge</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Informasi Profil</h4>
                                        <p className="text-xs text-gray-500">Perbarui nama dan alamat email akun kamu</p>
                                    </div>
                                </div>
                                <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                            </section>

                            {/* Update Password */}
                            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/50 hover:shadow-md transition-shadow group">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100/50 transition-colors">
                                        <span className="material-symbols-outlined text-emerald-600">lock</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Ubah Password</h4>
                                        <p className="text-xs text-gray-500">Gunakan password yang panjang dan acak agar lebih aman</p>
                                    </div>
                                </div>
                                <UpdatePasswordForm />
                            </section>
                        </div>

                        {/* Right Column - Stats & Delete */}
                        <div className="space-y-6">
                            {/* Stats Card */}
                            <section className="bg-gradient-to-br from-[#185FA5] to-[#0C447C] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <span className="material-symbols-outlined text-[120px]">verified</span>
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-xs font-semibold mb-4 opacity-80 uppercase tracking-widest">Statistik Profil</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Laporan Selesai</span>
                                            <span className="font-bold text-xl">{user?.reports_count || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Barang Kembali</span>
                                            <span className="font-bold text-xl">{user?.returned_count || 0}</span>
                                        </div>
                                        <div className="pt-3 border-t border-white/20">
                                            <p className="text-xs opacity-90 italic">"Terima kasih telah membantu warga sekolah!"</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Delete Account */}
                            <section className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-rose-50 rounded-2xl">
                                        <span className="material-symbols-outlined text-rose-600">delete_forever</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-rose-700 text-sm">Hapus Akun</h4>
                                        <p className="text-xs text-rose-400">Tindakan ini tidak dapat dibatalkan</p>
                                    </div>
                                </div>
                                <DeleteUserForm />
                            </section>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}