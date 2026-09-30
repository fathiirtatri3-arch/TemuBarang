import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center">
                    <Link href="/">
                        <div className="w-24 h-24 flex items-center justify-center transition duration-300 hover:scale-105">
                            <img
                                src="/images/logo_temubarang_bg.png"
                                alt="Logo TemuBarang"
                                className="w-full h-full object-contain drop-shadow-lg"
                            />
                        </div>
                    </Link>
                </div>
                
                {/* Title */}
                <div className="text-center mt-4">
                    <h2 className="text-2xl font-bold text-gray-900">TemuBarang</h2>
                    <p className="text-sm text-gray-500 mt-1">Sistem Informasi Barang Hilang dan Temuan</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
                    {children}
                </div>
                
                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} TemuBarang. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

