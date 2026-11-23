import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import TextType from '@/Components/TextType';
import AnimatedContent from '@/Components/AnimatedContent';
import OrbitImages from '@/Components/OrbitImages';
import ScrollStack, { ScrollStackItem } from '@/Components/ScrollStack';
import CardNav from '@/Components/CardNav';

export default function Welcome({ auth }) {
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        // Smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        const nav = document.querySelector('nav');
        const sections = ['home', 'features','team', 'about'];

        const handleScroll = () => {
            // Navbar shrink on scroll
            if (window.scrollY > 20) {
                nav.classList.add('h-16', 'bg-white/80', 'backdrop-blur-md', 'shadow-md');
                nav.classList.remove('h-20', 'bg-white');
            } else {
                nav.classList.add('h-20', 'bg-white');
                nav.classList.remove('h-16', 'bg-white/80', 'backdrop-blur-md', 'shadow-md');
            }

            // Active section detection
            const scrollBottom = window.scrollY + window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Kalau sudah di paling bawah, langsung set about
            if (scrollBottom >= docHeight - 10) {
                setActiveSection('about');
                return;
            }

            let current = 'home';
            sections.forEach((id) => {
                const el = document.getElementById(id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 120) current = id;
                }
            });
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.documentElement.style.scrollBehavior = '';
        };
    }, []);

    const navLinkClass = (section) =>
        section === activeSection
            ? 'text-[#004782] font-bold border-b-2 border-[#004782] pb-1 text-sm tracking-wide transition-all duration-300'
            : 'text-[#424751] hover:text-[#004782] border-b-2 border-transparent pb-1 text-sm tracking-wide font-semibold transition-all duration-300';

    return (
        <>
            <Head title="TemuBarang - Sistem Barang Hilang Kecamatan Sambikerep" />

            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    font-family: 'Material Symbols Outlined';
                    font-style: normal;
                    display: inline-block;
                    line-height: 1;
                    text-transform: none;
                    letter-spacing: normal;
                    word-wrap: normal;
                    white-space: nowrap;
                    direction: ltr;
                }
                .hover-lift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .hover-lift:hover { transform: scale(1.02); }
            `}</style>

            <div className="bg-[#f8f9ff] text-[#191c20] overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                {/* ── TopNavBar ── */}
                <nav className="bg-white fixed top-0 left-0 right-0 z-50 shadow-sm h-20 transition-all duration-300">
                    <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto h-full">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <img
                                src="/images/logo_temubarang_bg.png"
                                alt="Logo TemuBarang Kecamatan Sambikerep"
                                className="h-12 w-auto object-contain"
                            />
                            <div className="h-8 w-px bg-[#c2c6d2] mx-2 hidden sm:block"></div>
                            <span className="text-2xl font-extrabold text-[#004782]">TemuBarang</span>
                        </div>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#home" className={navLinkClass('home')}>Beranda</a>
                            <a href="#features" className={navLinkClass('features')}>Keunggulan</a>
                            <a href="#team" className={navLinkClass('team')}>Tim</a>
                            <a href="#about" className={navLinkClass('about')}>Tentang</a>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-[#185fa5] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-xl hover:bg-[#004782] transition-all active:scale-95"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="hidden sm:flex text-[#424751] hover:text-[#004782] text-sm font-semibold px-4 py-2 transition-all active:scale-95"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-[#185fa5] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-xl hover:bg-[#004782] transition-all active:scale-95"
                                    >
                                        Daftar Akun
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── Main Content ── */}
                <main className="pt-20">
                     <AnimatedContent
                        distance={80}
                        direction="vertical"
                        duration={0.9}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity={true}
                        scale={1}
                        threshold={0.15}
                        delay={0.1}
                        className="w-full"
                    >

                    {/* ── Hero Section ── */}
                    <section className="relative bg-[#185FA5] py-16 md:py-24 overflow-hidden">
                        {/* Decorative skew */}
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-20"></div>

                        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            {/* Left: Text */}
                            <div className="flex flex-col gap-6">
                                <div className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-4 py-1 rounded-full w-fit">
                                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                    <span className="text-xs font-medium">Sistem Resmi Kecamatan Sambikerep</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                                        <TextType
                                            text={[
                                                'Temukan Kembali Barang Berhargamu di Kecamatan Sambikerep',
                                                'Laporkan Barang Hilang dengan Mudah dan Cepat',
                                                'Kembalikan Barang Temuan ke Pemilik yang Sah'
                                            ]}
                                            typingSpeed={50}
                                            initialDelay={800}
                                            pauseDuration={3000}
                                            deletingSpeed={25}
                                            loop={true}
                                            showCursor={true}
                                            cursorCharacter="|"
                                            className="inline-block text-white"
                                            textColors={['#ffffff', '#e0f2fe', '#bae6fd']}
                                        />
                                </h1>

                                <p className="text-lg text-white/90 max-w-xl leading-relaxed">
                                    Sistem informasi cerdas untuk melaporkan barang hilang dan temuan khusus untuk seluruh warga Kecamatan Sambikerep, Surabaya. Cepat, transparan, dan terpercaya.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <Link
                                        href="/reports/create"
                                        className="flex items-center justify-center gap-2 bg-white text-[#185FA5] px-8 py-4 rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-outlined">search</span>
                                        Lapor Barang Hilang
                                    </Link>
                                    <Link
                                        href="/barang-temuan"
                                        className="flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-outlined">grid_view</span>
                                        Lihat Daftar Temuan
                                    </Link>
                                </div>
                            </div>

                            {/* Right: Illustration */}
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-white/10 rounded-full blur-3xl opacity-30"></div>
                                <img
                                    src="/images/revisi-utama.jpeg"
                                    alt="TemuBarang Illustration"
                                    className="relative w-full h-auto drop-shadow-2xl rounded-2xl transform transition-transform duration-500 group-hover:scale-[1.01]"
                                />
                            </div>
                        </div>
                    </section>
                    </AnimatedContent>

                    {/* ── Stats Section ── */}
                    <AnimatedContent
                        distance={60}
                        direction="vertical"
                        duration={0.8}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity={true}
                        threshold={0.15}
                        delay={0.2}
                        className="w-full"
                    >
                    <section className="bg-[#ededf4] py-6">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-wrap justify-center gap-16 md:gap-24 py-4">
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-5xl font-extrabold text-[#004782]">100+</span>
                                    <span className="text-xs font-semibold text-[#424751] uppercase tracking-wider mt-1">Barang Kembali</span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-5xl font-extrabold text-[#004782]">500+</span>
                                    <span className="text-xs font-semibold text-[#424751] uppercase tracking-wider mt-1">Warga Terbantu</span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-5xl font-extrabold text-[#004782]">4</span>
                                    <span className="text-xs font-semibold text-[#424751] uppercase tracking-wider mt-1">Kelurahan Terlayani</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    </AnimatedContent>

                    {/* ── Mengapa Memilih TemuBarang? ── */}
                        <section id="features" className="bg-white">
                            <div className="max-w-7xl mx-auto px-6 pt-16 pb-4 text-center">
                                <h2 className="text-3xl font-bold text-[#191c20] mb-3">
                                    Mengapa Memilih TemuBarang?
                                </h2>
                                <p className="text-base text-[#424751] max-w-2xl mx-auto mb-4">
                                    Kami mengedepankan kemudahan dan keamanan dalam setiap proses pencarian barang hilang di lingkungan kecamatan.
                                </p>
                            </div>

                                {/* Scroll Stack - Gunakan useWindowScroll={true} */}
                                <ScrollStack
                                    useWindowScroll={true}
                                    itemDistance={100}
                                    itemScale={0.03}
                                    itemStackDistance={30}
                                    stackPosition="20%"
                                    scaleEndPosition="10%"
                                    baseScale={0.88}
                                    rotationAmount={0}
                                    blurAmount={0.3}
                                    className="w-full max-w-7xl mx-auto px-6"
                                >
                                    {/* Fitur 1: Pencocokan Cerdas */}
                                    <ScrollStackItem itemClassName="bg-white border border-[#e7e8ee] hover:shadow-2xl transition-all">
                                        <div className="flex flex-col md:flex-row items-center gap-6 h-full justify-center p-6">
                                            <div className="w-full md:w-2/5 flex-shrink-0">
                                                <img
                                                    src="/images/pencocokan-cerdas.png"
                                                    alt="Pencocokan Cerdas"
                                                    className="w-full h-auto rounded-2xl shadow-md object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-14 h-14 bg-[#185fa5] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                                        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-[#004782]">Pencocokan Cerdas</h3>
                                                </div>
                                                <p className="text-[#424751] text-base leading-relaxed">
                                                    Menggunakan teknologi AI untuk mencocokkan laporan kehilangan dengan barang yang ditemukan secara presisi berdasarkan deskripsi dan foto.
                                                </p>
                                            </div>
                                        </div>
                                    </ScrollStackItem>

                                    {/* Fitur 2: Notifikasi Real-time - FOTO DI SEBELAH KANAN */}
                                    <ScrollStackItem itemClassName="bg-[#f2f3fa] border border-[#e7e8ee] hover:shadow-2xl transition-all">
                                        <div className="flex flex-col md:flex-row-reverse items-center gap-6 h-full justify-center p-6">
                                            {/* Gambar - SEKARANG DI SEBELAH KANAN */}
                                            <div className="w-full md:w-2/5 flex-shrink-0">
                                                <img
                                                    src="/images/notifikasi-realtime.png"
                                                    alt="Notifikasi Real-time"
                                                    className="w-full h-auto rounded-2xl shadow-md object-contain"
                                                />
                                            </div>
                                            {/* Konten Teks - SEKARANG DI SEBELAH KIRI */}
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-14 h-14 bg-[#924b00] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                                        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-[#6f3800]">Notifikasi Real-time</h3>
                                                </div>
                                                <p className="text-[#424751] text-base leading-relaxed">
                                                    Dapatkan pemberitahuan langsung melalui WhatsApp atau Email saat ada barang yang sesuai dengan laporan kehilangan Anda ditemukan di wiliayah kecamatan.
                                                </p>
                                            </div>
                                        </div>
                                    </ScrollStackItem>

                                    {/* Fitur 3: Keamanan Terjamin */}
                                    <ScrollStackItem itemClassName="bg-white border border-[#e7e8ee] hover:shadow-2xl transition-all">
                                        <div className="flex flex-col md:flex-row items-center gap-6 h-full justify-center p-6">
                                            <div className="w-full md:w-2/5 flex-shrink-0">
                                                <img
                                                    src="/images/keamanan-terjamin.png"
                                                    alt="Keamanan Terjamin"
                                                    className="w-full h-auto rounded-2xl shadow-md object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-14 h-14 bg-[#e0e3e5] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                                        <span className="material-symbols-outlined text-[#444749] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-[#5c5f61]">Keamanan Terjamin</h3>
                                                </div>
                                                <p className="text-[#424751] text-base leading-relaxed">
                                                    Verifikasi identitas yang ketat dan sistem bukti kepemilikan digital untuk memastikan barang kembali ke pemilik yang sah.
                                                </p>
                                            </div>
                                        </div>
                                    </ScrollStackItem>

                                    {/* ✨ Fitur 4: Titik Lokasi (BARU - Foto Kanan) */}
                                    <ScrollStackItem itemClassName="bg-[#f2f3fa] border border-[#e7e8ee] hover:shadow-2xl transition-all">
                                        <div className="flex flex-col md:flex-row-reverse items-center gap-6 h-full justify-center p-6">
                                            <div className="w-full md:w-2/5 flex-shrink-0">
                                                <img
                                                    src="/images/titik-lokasi.jpg"
                                                    alt="Titik Lokasi"
                                                    className="w-full h-auto rounded-2xl shadow-md object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-14 h-14 bg-[#0268D4] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                                        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-[#0268D4]">Titik Lokasi</h3>
                                                </div>
                                                <p className="text-[#424751] text-base leading-relaxed">
                                                    Temukan lokasi kejadian secara presisi melalui peta interaktif. Setiap laporan dilengkapi dengan titik koordinat untuk memudahkan pencarian barang di wilayah kecamatan.
                                                </p>
                                            </div>
                                        </div>
                                    </ScrollStackItem>
                                </ScrollStack>
                        </section>

                    {/* ── Titik Temu Kelurahan Section ── */}
                    <AnimatedContent
                        distance={60}
                        direction="vertical"
                        duration={0.9}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity={true}
                        threshold={0.15}
                        delay={0.15}
                        className="w-full"
                    >
                        <section id="team" className="py-16 bg-[#f2f3fa] overflow-hidden">
                            <div className="max-w-7xl mx-auto px-6 text-center">
                                <h2 className="text-3xl font-bold text-[#191c20] mb-3">
                                    Titik Temu Kelurahan
                                </h2>
                                <p className="text-base text-[#424751] max-w-2xl mx-auto mb-12">
                                    Admin di 4 kantor kelurahan Kecamatan Sambikerep siap membantu proses verifikasi dan pengembalian barang.
                                </p>

                                {/* Orbit Images */}
                                <div className="relative w-full flex justify-center items-center" style={{ height: '420px', marginBottom: '2rem' }}>
                                    <OrbitImages
                                        images={[
                                            { src: '/images/kelurahan/made.png', label: 'Kelurahan Made' },
                                            { src: '/images/kelurahan/bringin.png', label: 'Kelurahan Bringin' },
                                            { src: '/images/kelurahan/lontar.png', label: 'Kelurahan Lontar' },
                                            { src: '/images/kelurahan/sambikerep.png', label: 'Kelurahan Sambikerep' },
                                        ]}
                                        altPrefix="Kantor Kelurahan"
                                        shape="ellipse"
                                        radiusX={420}
                                        radiusY={130}
                                        duration={20}
                                        itemSize={72}
                                        direction="normal"
                                        fill={true}
                                        showPath={true}
                                        pathColor="rgba(24, 95, 165, 0.2)"
                                        pathWidth={1.5}
                                        responsive={true}
                                        className="w-full"
                                        centerContent={
                                            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-white p-3">
                                                <img
                                                    src="/images/logo-surabaya.png"
                                                    alt="Logo Kota Surabaya"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        }
                                    />
                                </div>

                                <p className="text-sm text-[#424751] max-w-lg mx-auto mt-8 italic">
                                    "Serahkan atau ambil barang Anda di kantor kelurahan terdekat, dengan verifikasi yang aman dan terpercaya."
                                </p>
                            </div>
                        </section>
                    </AnimatedContent>

                    {/* ── CTA Section ── */}
                    <AnimatedContent
                        distance={50}
                        direction="vertical"
                        duration={0.8}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity={true}
                        threshold={0.15}
                        delay={0.1}
                        className="w-full"
                    >
                    <section id="about" className="py-16 relative overflow-hidden bg-[#185fa5] text-white">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-full h-full"
                                style={{ background: 'radial-gradient(circle at center, white, transparent)' }}>
                            </div>
                        </div>
                        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Siap Mencari Barangmu?</h2>
                            <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90 leading-relaxed">
                                <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90 leading-relaxed">
                                    Bergabunglah dengan ratusan warga Kecamatan Sambikerep lainnya yang telah berhasil menemukan barang berharga mereka.
                                </p>
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-6">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-white text-[#004782] px-12 py-4 rounded-2xl font-semibold text-base shadow-xl hover:bg-[#f8f9ff] transition-all active:scale-95"
                                    >
                                        Ke Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="bg-white text-[#004782] px-12 py-4 rounded-2xl font-semibold text-base shadow-xl hover:bg-[#f8f9ff] transition-all active:scale-95"
                                        >
                                            Mulai Lapor Sekarang
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="bg-transparent border-2 border-white/50 text-white px-12 py-4 rounded-2xl font-semibold text-base hover:bg-white/10 transition-all active:scale-95"
                                        >
                                            Pelajari Selengkapnya
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                    </AnimatedContent>

                </main>

                {/* ── Footer ── */}
                <footer className="bg-[#ededf4]">
                    <div className="w-full py-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Brand */}
                        <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <img
                                    src="/images/logo_temubarang_bg.png"
                                    alt="Logo TemuBarang Kecamatan Sambikerep"
                                    className="h-8 w-auto object-contain"
                                />
                                <span className="text-lg font-bold text-[#004782] ml-2">TemuBarang</span>
                            </div>
                            <p className="text-sm text-[#424751] max-w-xs">
                                © 2025 TemuBarang Kecamatan Sambikerep. Recovering lost items with relief and order.
                            </p>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <a href="#" className="text-xs font-medium text-[#424751] hover:text-[#004782] hover:underline transition-all">Privacy Policy</a>
                            <a href="#" className="text-xs font-medium text-[#424751] hover:text-[#004782] hover:underline transition-all">Terms of Service</a>
                            <a href="#" className="text-xs font-medium text-[#424751] hover:text-[#004782] hover:underline transition-all">Support</a>
                            <a href="#" className="text-xs font-medium text-[#424751] hover:text-[#004782] hover:underline transition-all">Contact Us</a>
                        </div>

                        {/* Social icons */}
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-[#e7e8ee] flex items-center justify-center hover:bg-[#185fa5] hover:text-white transition-all text-[#424751]">
                                <span className="material-symbols-outlined text-[20px]">language</span>
                            </button>
                            <button className="w-10 h-10 rounded-full bg-[#e7e8ee] flex items-center justify-center hover:bg-[#185fa5] hover:text-white transition-all text-[#424751]">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </button>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}