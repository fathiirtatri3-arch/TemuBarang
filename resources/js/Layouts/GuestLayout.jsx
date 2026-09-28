import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center">
                    <Link href="/">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition duration-300">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
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

