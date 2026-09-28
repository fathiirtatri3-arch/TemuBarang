import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all duration-200";
    const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-4">
                <div>
                    <label className={labelClass}>Password Saat Ini</label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        type="password"
                        className={inputClass}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                    <InputError message={errors.current_password} className="mt-1.5" />
                </div>

                <div>
                    <label className={labelClass}>Password Baru</label>
                    <input
                        id="password"
                        ref={passwordInput}
                        type="password"
                        className={inputClass}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <label className={labelClass}>Konfirmasi Password Baru</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        className={inputClass}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="flex items-center gap-4 pt-1">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-200 transition-all duration-200"
                    >
                        {processing ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">save</span>
                                Perbarui Password
                            </>
                        )}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Tersimpan!
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}