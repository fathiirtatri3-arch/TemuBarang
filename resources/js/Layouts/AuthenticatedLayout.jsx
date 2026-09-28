import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const { auth, user: globalUser, url } = usePage().props;
    const { url: currentUrl } = usePage();
    const user = auth?.user || globalUser;
    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin_kelurahan';
    const isSuperAdmin = user?.role === 'super_admin';
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await fetch('/api/notifications/unread-count', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
                });
                const data = await response.json();
                setUnreadCount(data.count || 0);
            } catch (error) {
                console.error('Gagal mengambil jumlah notifikasi:', error);
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Helper: cek apakah path saat ini aktif
    const isActive = (path) => {
        const currentPath = currentUrl.split('?')[0];
        
        // Khusus path yang bisa jadi prefix path lain
        if (path === '/admin') {
            return currentPath === '/admin';
        }
        if (path === '/reports') {
            return currentPath === '/reports';
        }
        if (path === '/notifications') {
            return currentPath === '/notifications';
        }
        
        return currentPath === path || currentPath.startsWith(path + '/');
    };

    const NavItem = ({ href, icon, label, badge, danger }) => {
        const active = isActive(href);
        return (
            <Link
                href={href}
                className="tb-nav-item"
                style={{
                    background: active ? (danger ? '#FFF1F0' : '#EAF2FF') : 'transparent',
                    color: active ? (danger ? '#C0392B' : '#185FA5') : (danger ? '#94A3B8' : '#64748B'),
                    fontWeight: active ? 600 : 500,
                }}
            >
                <span style={{
                    width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: active ? (danger ? '#C0392B' : '#185FA5') : '#94A3B8',
                    flexShrink: 0,
                }}>
                    {icon}
                </span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && (
                    <span className="tb-nav-badge">{badge > 99 ? '99+' : badge}</span>
                )}
                {active && (
                    <span style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: 16, borderRadius: '0 3px 3px 0',
                        background: danger ? '#C0392B' : '#185FA5',
                    }}></span>
                )}
            </Link>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .tb-nav-item {
                    position: relative;
                    display: flex; align-items: center; gap: 11px;
                    padding: 9px 12px; border-radius: 10px;
                    font-size: 13.5px;
                    cursor: pointer; margin-bottom: 3px;
                    text-decoration: none;
                    transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
                }
                .tb-nav-item:hover { background: #F1F5F9 !important; color: #0F172A !important; }
                .tb-nav-item:hover span:first-child { color: #185FA5 !important; }
                .tb-nav-item:active { transform: scale(0.98); }
                .tb-user-chip {
                    display: flex; align-items: center; gap: 10px;
                    padding: 9px 10px; border-radius: 10px;
                    cursor: pointer; text-decoration: none;
                    transition: background 0.15s ease;
                }
                .tb-user-chip:hover { background: #F1F5F9; }
                .tb-logout-btn {
                    display: flex; align-items: center; gap: 11px;
                    padding: 9px 12px; border-radius: 10px;
                    font-size: 13.5px; font-weight: 500;
                    color: #C0392B; cursor: pointer; margin-top: 4px;
                    text-decoration: none; transition: background 0.15s ease;
                    background: none; border: none; width: 100%;
                    font-family: inherit; text-align: left;
                }
                .tb-logout-btn:hover { background: #FFF1F0; }
                .tb-nav-badge {
                    background: #185FA5; color: #fff;
                    font-size: 10px; padding: 2px 7px; border-radius: 99px;
                    font-weight: 700; flex-shrink: 0;
                }
                .tb-section-label {
                    font-size: 10.5px; font-weight: 700; color: #B0B9C6;
                    text-transform: uppercase; letter-spacing: 1px;
                    padding: 0 0.65rem; margin: 18px 0 8px 0;
                }
                .tb-section-label:first-of-type { margin-top: 4px; }
            `}</style>

            {/* ── SIDEBAR ── */}
            <aside style={{
                width: 232,
                flexShrink: 0,
                background: '#fff',
                borderRight: '1px solid #EDF1F7',
                display: 'flex',
                flexDirection: 'column',
                padding: '0 0 1rem 0',
                position: 'fixed',
                top: 0, left: 0,
                height: '100vh',
                zIndex: 10,
                overflowY: 'auto',
            }}>
                {/* Logo */}
                <div style={{ padding: '1.4rem 1.25rem', borderBottom: '1px solid #EDF1F7', marginBottom: '0.5rem' }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, #185FA5, #0F4C85)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(24,95,165,0.25)',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.01em' }}>TemuBarang</div>
                            <div style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.4, fontWeight: 500 }}>Sistem Barang Hilang</div>
                        </div>
                    </Link>
                </div>

                {/* Menu utama */}
                <div style={{ padding: '0 0.65rem' }}>
                    <div className="tb-section-label">Menu</div>

                    <NavItem href="/dashboard" label="Dashboard" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                    } />

                    <NavItem href="/reports/create" label="Buat Laporan" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    } />

                    <NavItem href="/reports" label="Semua Laporan" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                    } />

                    <NavItem href="/search" label="Cari Barang" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    } />

                    <NavItem href="/matches" label="Pencocokan" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                    } />

                    {isAdmin && (
                        <>
                            <div className="tb-section-label">Admin</div>

                            <NavItem href="/admin" label="Verifikasi Laporan" icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 11l3 3L22 4"/>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                            } />

                            <NavItem href="/admin/claims" label="Manajemen Klaim" icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    <path d="M8 12.5a4 4 0 0 1 0-7.75"/>
                                </svg>
                            } />

                            {/* ⭐ MENU KELOLA USER HANYA UNTUK SUPER ADMIN ⭐ */}
                            {isSuperAdmin && (
                                <NavItem href="/admin/users" label="Kelola User" icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                } />
                            )}
                        </>
                    )}

                    <div className="tb-section-label">Akun</div>

                    <NavItem href="/notifications" label="Notifikasi" badge={unreadCount} icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    } />

                    <NavItem href="/profile" label="Profil" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                    } />
                </div>

                {/* Footer — user + logout */}
                <div style={{ marginTop: 'auto', padding: '0.85rem 0.65rem 0', borderTop: '1px solid #EDF1F7' }}>
                    <Link href="/profile" className="tb-user-chip">
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #185FA5, #0F4C85)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                                {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin Kelurahan' : 'Warga'}
                            </div>
                        </div>
                    </Link>

                    <Link method="post" href="/logout" as="button" className="tb-logout-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                    </Link>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main style={{ marginLeft: 232, flex: 1, minWidth: 0 }}>
                <div
                    key={currentUrl}
                    style={{
                        animation: 'fadeIn 0.25s ease-in-out',
                    }}
                >
                    {children}
                </div>
            </main>
        </div>
    );
}