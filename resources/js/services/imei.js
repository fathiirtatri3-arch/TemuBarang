/**
 * Validasi & format nomor seri / IMEI di sisi browser.
 *
 * Aturan ini harus sama dengan backend (App\Services\ImeiService):
 * 15 digit + checksum Luhn.
 */

export const IMEI_LENGTH = 15;

/**
 * Ambil hanya digit dari input pengguna.
 */
export function normalizeImei(value) {
    if (!value) return null;
    const digits = String(value).replace(/\D/g, '');
    return digits === '' ? null : digits;
}

/**
 * Checksum Luhn.
 */
export function luhnValid(number) {
    const digits = normalizeImei(number);
    if (!digits || digits.length < 2) return false;

    let sum = 0;
    let parity = digits.length % 2;

    for (let i = 0; i < digits.length; i++) {
        let d = parseInt(digits[i], 10);
        if (i % 2 === parity) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }

    return sum % 10 === 0;
}

/**
 * Apakah nilai ini IMEI yang sah?
 */
export function isValidImei(value) {
    const digits = normalizeImei(value);
    return !!digits && digits.length === IMEI_LENGTH && luhnValid(digits);
}

/**
 * Pesan error yang ramah.
 */
export function imeiErrorMessage(value) {
    const digits = normalizeImei(value);

    if (!digits) return 'Nomor seri wajib diisi.';
    if (digits.length !== IMEI_LENGTH) {
        return `Nomor seri/IMEI harus ${IMEI_LENGTH} digit (sekarang ${digits.length} digit).`;
    }
    if (!luhnValid(digits)) {
        return 'Nomor seri/IMEI tidak valid (checksum salah). Periksa ulang digit yang diketik.';
    }
    return 'Nomor seri/IMEI tidak valid.';
}

/**
 * Format tampilan: 352099001761481 -> 35-209900-176148-1
 */
export function formatImei(value) {
    const digits = normalizeImei(value);
    if (!digits) return null;
    if (digits.length !== IMEI_LENGTH) return digits;

    return [
        digits.slice(0, 2),
        digits.slice(2, 8),
        digits.slice(8, 14),
        digits.slice(14, 15),
    ].join('-');
}
