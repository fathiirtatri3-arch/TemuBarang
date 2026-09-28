import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200";
    const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className={labelClass}>Nama Lengkap</label>
                    <input
                        id="name"
                        type="text"
                        className={inputClass}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                        placeholder="Nama lengkap kamu"
                    />
                    <InputError className="mt-1.5" message={errors.name} />
                </div>

                <div>
                    <label className={labelClass}>Alamat Email</label>
                    <input
                        id="email"
                        type="email"
                        className={inputClass}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="email@contoh.com"
                    />
                    <InputError className="mt-1.5" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-sm text-amber-700">
                            Email kamu belum terverifikasi.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold underline hover:text-amber-900 transition-colors"
                            >
                                Kirim ulang email verifikasi.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-sm font-medium text-emerald-600">
                                Link verifikasi baru telah dikirim ke email kamu.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] hover:bg-[#0C447C] disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200 transition-all duration-200"
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
                                Simpan Perubahan
                            </>
                        )}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
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