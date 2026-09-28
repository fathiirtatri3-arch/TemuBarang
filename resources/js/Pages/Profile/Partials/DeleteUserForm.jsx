import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => setConfirmingUserDeletion(true);

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`${className}`}>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                <p className="text-xs text-rose-600 leading-relaxed">
                    Setelah akun dihapus, semua data dan informasi akan dihapus secara permanen.
                </p>
            </div>

            <button
                onClick={confirmUserDeletion}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-rose-200 transition-all duration-200"
            >
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                Hapus Akun
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-rose-600">warning</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Hapus Akun?</h2>
                            <p className="text-xs text-gray-400">Tindakan ini tidak dapat dibatalkan</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                        Semua data akan dihapus secara permanen. Masukkan password kamu untuk mengkonfirmasi.
                    </p>

                    <div className="mb-5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all duration-200"
                            autoFocus
                            placeholder="Masukkan password kamu"
                        />
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus Akun'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}