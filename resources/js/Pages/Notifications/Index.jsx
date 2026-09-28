import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function NotificationsIndex() {
    const { notifications, stats } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    
    
    const filteredNotifications = notifications.filter(notification => {
        // Filter berdasarkan status (Semua / Belum Dibaca)
        const matchesStatus = filter === 'all' || (filter === 'unread' ? !notification.is_read : notification.is_read);
        
        // ⭐ FILTER BERDASARKAN KATEGORI ⭐
        let matchesCategory = true;
        if (categoryFilter === 'verification') {
            matchesCategory = notification.title?.toLowerCase().includes('verifikasi') || 
                            notification.message?.toLowerCase().includes('verifikasi');
        } else if (categoryFilter === 'match') {
            matchesCategory = notification.title?.toLowerCase().includes('kecocokan') || 
                            notification.message?.toLowerCase().includes('kecocokan') ||
                            notification.title?.toLowerCase().includes('match') ||
                            notification.message?.toLowerCase().includes('match');
        }
        
        return matchesStatus && matchesCategory;
    });
    
    const markAsRead = (id) => {
        router.put(`/notifications/${id}/read`, {}, {
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    const markAllAsRead = () => {
        if (confirm('Tandai semua notifikasi sebagai sudah dibaca?')) {
            router.put('/notifications/read-all', {}, {
                onSuccess: () => {
                    window.location.reload();
                },
            });
        }
    };

    const deleteNotification = (id) => {
        if (confirm('Hapus notifikasi ini?')) {
            router.delete(`/notifications/${id}`, {
                onSuccess: () => {
                    window.location.reload();
                },
            });
        }
    };
    
    const getTypeIcon = (type) => {
        switch(type) {
            case 'success': return 'check_circle';
            case 'match': return 'search';
            case 'error': return 'error';
            default: return 'notifications';
        }
    };
    
    const getTypeBgColor = (type) => {
        switch(type) {
            case 'success': return 'bg-primary/10';
            case 'match': return 'bg-tertiary-fixed';
            case 'error': return 'bg-error/10';
            default: return 'bg-secondary-container';
        }
    };
    
    const getTypeTextColor = (type) => {
        switch(type) {
            case 'success': return 'text-primary';
            case 'match': return 'text-tertiary';
            case 'error': return 'text-error';
            default: return 'text-on-secondary-container';
        }
    };
    
    const formatDate = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diff = now - notifDate;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        if (days < 7) return `${days} hari lalu`;
        return notifDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    
    // Group notifications by date
    const getGroupedNotifications = () => {
        const groups = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        filteredNotifications.forEach(notif => {
            const notifDate = new Date(notif.created_at);
            let key = '';
            
            if (notifDate.toDateString() === today.toDateString()) {
                key = 'Hari Ini';
            } else if (notifDate.toDateString() === yesterday.toDateString()) {
                key = 'Kemarin';
            } else {
                key = notifDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            }
            
            if (!groups[key]) groups[key] = [];
            groups[key].push(notif);
        });
        
        return groups;
    };
    
    const groupedNotifications = getGroupedNotifications();
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
                    
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl animate-bounce">🔔</span>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Notifikasi</h2>
                                <p className="text-gray-500 text-sm">
                                    {unreadCount} notifikasi belum dibaca dari {stats.total || notifications.length} total
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="bg-[#185FA5] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:bg-[#0C447C] transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">done_all</span>
                                Tandai semua dibaca
                            </button>
                        )}
                    </header>
                    
                    {/* Filter Tabs */}
                    <div className="flex gap-6 border-b border-gray-200/30 mb-6 relative">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-1 py-2 font-bold transition-colors hover:text-[#185FA5] relative ${
                                filter === 'all' 
                                    ? 'text-[#185FA5] border-b-2 border-[#185FA5]' 
                                    : 'text-gray-500'
                            }`}
                        >
                            Semua ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-1 py-2 font-semibold transition-colors hover:text-[#185FA5] relative ${
                                filter === 'unread' 
                                    ? 'text-[#185FA5] border-b-2 border-[#185FA5]' 
                                    : 'text-gray-500'
                            }`}
                        >
                            Belum Dibaca ({unreadCount})
                        </button>
                    </div>
                    
                    {/* Notifications List */}
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-48 h-48 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-6xl">📭</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Semua Beres!</h3>
                            <p className="text-gray-500 max-w-sm">
                                {filter === 'unread' 
                                    ? 'Anda telah membaca semua notifikasi terbaru.'
                                    : 'Belum ada notifikasi masuk.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Main Content - Notifications List */}
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                {Object.keys(groupedNotifications).map((groupKey) => (
                                    <section key={groupKey}>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                                            {groupKey}
                                        </h4>
                                        <div className="flex flex-col gap-3">
                                            {groupedNotifications[groupKey].map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`group relative flex flex-col md:flex-row bg-white rounded-2xl p-4 border transition-all duration-300 overflow-hidden ${
                                                        notification.is_read 
                                                            ? 'border-gray-100/50 bg-white/50' 
                                                            : 'border-[#185FA5]/30 hover:border-[#185FA5]/50 shadow-sm'
                                                    } hover:shadow-lg`}
                                                >
                                                    {/* Left Border Indicator */}
                                                    <div className={`absolute left-0 top-0 w-1 h-full ${
                                                        notification.is_read ? 'bg-gray-300' : 'bg-[#185FA5]'
                                                    }`}></div>
                                                    
                                                    <div className="flex-1 flex gap-3">
                                                        {/* Icon */}
                                                        <div className={`w-12 h-12 shrink-0 rounded-xl ${getTypeBgColor(notification.type)} flex items-center justify-center`}>
                                                            <span className={`material-symbols-outlined text-2xl ${getTypeTextColor(notification.type)}`}>
                                                                {getTypeIcon(notification.type)}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Content */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <h3 className={`font-bold ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                                                                    {notification.title}
                                                                </h3>
                                                                {!notification.is_read && (
                                                                    <span className="bg-[#185FA5]/10 text-[#185FA5] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                                        Baru
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className={`text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-600'}`}>
                                                                {notification.message}
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-1 text-gray-400 text-xs">
                                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                                <span>{formatDate(notification.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Actions */}
                                                    <div className="mt-3 md:mt-0 flex flex-col justify-between items-end shrink-0">
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">close</span>
                                                        </button>
                                                        {!notification.is_read && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="text-[#185FA5] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                                                            >
                                                                Tandai Dibaca
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                            
                            {/* ⭐ SIDEBAR DENGAN KATEGORI ⭐ */}
                            <aside className="lg:col-span-4 flex flex-col gap-4">
                                {/* Kategori Filter */}
                                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Kategori</h4>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => setCategoryFilter('all')}
                                            className={`flex items-center gap-3 text-sm p-2.5 rounded-lg w-full text-left transition-all ${
                                                categoryFilter === 'all' 
                                                    ? 'bg-[#185FA5] text-white font-bold' 
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">category</span>
                                            Semua
                                        </button>
                                        <button
                                            onClick={() => setCategoryFilter('verification')}
                                            className={`flex items-center gap-3 text-sm p-2.5 rounded-lg w-full text-left transition-all ${
                                                categoryFilter === 'verification' 
                                                    ? 'bg-[#185FA5] text-white font-bold' 
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">verified</span>
                                            Verifikasi
                                        </button>
                                        <button
                                            onClick={() => setCategoryFilter('match')}
                                            className={`flex items-center gap-3 text-sm p-2.5 rounded-lg w-full text-left transition-all ${
                                                categoryFilter === 'match' 
                                                    ? 'bg-[#185FA5] text-white font-bold' 
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">travel_explore</span>
                                            Kecocokan
                                        </button>
                                    </div>
                                </div>

                                {/* Tips Card */}
                                <div className="bg-[#185FA5]/5 rounded-2xl p-5 border border-[#185FA5]/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="material-symbols-outlined text-[#185FA5]">info</span>
                                        <p className="font-bold text-sm text-[#185FA5]">Tips</p>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Aktifkan notifikasi browser agar tidak ketinggalan info barang hilang Anda.
                                    </p>
                                </div>
                            </aside>
                        </div>
                    )}
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}