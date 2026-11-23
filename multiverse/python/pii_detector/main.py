# TemuBarang - Deteksi Data Pribadi Otomatis pada Foto Laporan
#
# Input  (stdin, JSON): {"image_path": "C:/path/foto.jpg"}
# Output (stdout, JSON): {"success": true, "detected": true, "reasons": [...], "details": {...}}
#
# Cara kerja:
#   1. OCR dengan Tesseract -> cari NIK, nomor kartu bank, kata kunci dokumen
#   2. Deteksi wajah dengan Haar Cascade (OpenCV)
#
# Kalau ada error (Tesseract belum terpasang, file rusak, dll):
#   proses keluar dengan exit code != 0 dan pesan di stderr.
#   Sisi PHP_then fading, akan menyamarkan foto demi keamanan (fail-safe).

import sys
import json
import os
import re

# --- Konfigurasi Tesseract ---------------------------------------------------
# Path Tesseract bisa diatur lewat env TESSERACT_CMD, default lokasi Windows.
TESSERACT_CMD = os.environ.get(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
)

# Batas ukuran gambar agar OCR tidak terlalu lama / tidak makan RAM.
MAX_SIDE = 1600

# --- Daftar kata kunci dokumen identitas -----------------------------------
# Minimal 2 kata kunci berbeda agar dianggap dokumen identitas.
DOCUMENT_KEYWORDS = [
    "ktp",
    "kartu tanda penduduk",
    "kk",
    "kartu keluarga",
    "sim",
    "surat izin mengemudi",
    "surat izin mengemudi",
    "npwp",
    "akta kelahiran",
    "akta nikah",
    "paspor",
    "surat keterangan",
    "ijazah",
    "kartu potongan pajak",
    "bpjs",
    "kartu bpjs",
]

# Kata kunci yang terlalu umum (dipakai sendiri) tidak boleh dihitung sebagai
# "2 kata kunci dokumen" karena bisa false positive.
DOCUMENT_KEYWORDS_WEAK = {"kk", "sim", "npwp"}

# --- Regex NIK & kartu bank --------------------------------------------------
# NIK Indonesia = 16 digit
NIK_RE = re.compile(r"(?<!\d)\d{16}(?!\d)")
# Nomor kartu bank = 13-19 digit (dibatasi agar tidak menabrak NIK 16 digit)
CARD_RE = re.compile(r"(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)")


def normalize_digits(text: str) -> str:
    """Buang semua karakter non-digit."""
    return re.sub(r"\D", "", text)


def luhn_valid(number: str) -> bool:
    """Cek checksum Luhn (dipakai kartu bank dan IMEI)."""
    digits = [int(c) for c in number]
    if len(digits) < 2:
        return False

    checksum = 0
    parity = len(digits) % 2
    for i, d in enumerate(digits):
        if i % 2 == parity:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d

    return checksum % 10 == 0


def load_image(path: str):
    """Baca gambar + siapkan untuk OCR (grayscale + upscale)."""
    import cv2

    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError("Gambar tidak bisa dibaca: %s" % path)

    h, w = img.shape[:2]
    if max(h, w) > MAX_SIDE:
        scale = MAX_SIDE / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    return img


def preprocess_for_ocr(img):
    """Buat versi grayscale + kontras untuk akuratkan OCR."""
    import cv2

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Upscale 2x supaya angka kecil lebih terbaca
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return gray


def run_ocr(img) -> str:
    """Jalankan Tesseract OCR."""
    import pytesseract

    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

    # Try beberapa PSM, ambil yang paling banyak karakter
    best = ""
    for psm in (6, 11, 3):
        try:
            text = pytesseract.image_to_string(
                preprocess_for_ocr(img),
                lang="eng",
                config="--psm %d" % psm,
                timeout=12,
            )
        except RuntimeError:
            # timeout dari pytesseract -> biarkan, coba psm lain
            continue

        if len(text) > len(best):
            best = text

        # Kalau sudah dapat teks yang cukup panjang, tidak perlu coba lagi
        if len(best.strip()) > 40:
            break

    return best


def detect_faces(img) -> int:
    """Hitung wajah frontal dengan Haar Cascade bawaan OpenCV."""
    import cv2

    cascade_path = os.path.join(
        cv2.data.haarcascades, "haarcascade_frontalface_default.xml"
    )
    if not os.path.exists(cascade_path):
        # Cascade tidak tersedia -> bukan alasan untuk gagal total,
        # deteksi lain tetap jalan.
        return 0

    cascade = cv2.CascadeClassifier(cascade_path)
    if cascade.empty():
        return 0

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    faces = cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
    )

    return len(faces)


def analyze(img) -> dict:
    """Analisis satu gambar, kembalikan dict hasil deteksi."""
    reasons = []
    details = {
        "nik_count": 0,
        "card_count": 0,
        "document_keywords": [],
        "face_count": 0,
        "ocr_chars": 0,
    }

    # 1) OCR
    ocr_text = ""
    try:
        ocr_text = run_ocr(img)
    except Exception as exc:  # noqa: BLE001
        # OCR gagal total -> lempar error supaya PHP bisa fail-safe.
        raise RuntimeError("OCR gagal: %s" % exc)

    details["ocr_chars"] = len(ocr_text.strip())
    upper_text = ocr_text.upper()

    # 2) NIK (16 digit)
    niks = NIK_RE.findall(ocr_text)
    if niks:
        details["nik_count"] = len(niks)
        reasons.append("NIK terdeteksi (%d)" % len(niks))

    # 3) Nomor kartu bank (13-19 digit + Luhn)
    cards = 0
    for raw in CARD_RE.findall(ocr_text):
        digits = normalize_digits(raw)
        if 13 <= len(digits) <= 19 and luhn_valid(digits):
            cards += 1
    if cards:
        details["card_count"] = cards
        reasons.append("Nomor kartu bank terdeteksi (%d)" % cards)

    # 4) Kata kunci dokumen identitas (minimal 2)
    found_keywords = []
    lower_text = upper_text.lower()
    for kw in DOCUMENT_KEYWORDS:
        if kw.lower() in lower_text:
            found_keywords.append(kw)
    strong = [k for k in found_keywords if k not in DOCUMENT_KEYWORDS_WEAK]
    if len(found_keywords) >= 2:
        details["document_keywords"] = found_keywords
        reasons.append(
            "Kata kunci dokumen identitas (%s)" % ", ".join(found_keywords[:5])
        )
    elif len(strong) >= 1 and len(found_keywords) >= 2:
        details["document_keywords"] = found_keywords
        reasons.append(
            "Kata kunci dokumen identitas (%s)" % ", ".join(found_keywords[:5])
        )

    # 5) Wajah
    try:
        faces = detect_faces(img)
        details["face_count"] = faces
        if faces > 0:
            reasons.append("Wajah terdeteksi (%d)" % faces)
    except Exception:  # noqa: BLE001
        # Gagal deteksi wajah tidak boleh menggagalkan analisis.
        pass

    return {
        "detected": len(reasons) > 0,
        "reasons": reasons,
        "details": details,
    }


def main() -> int:
    raw = sys.stdin.read().strip()
    if not raw:
        sys.stderr.write("Input JSON kosong\n")
        return 1

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        sys.stderr.write("JSON tidak valid: %s\n" % exc)
        return 1

    image_path = (payload.get("image_path") or "").strip()
    if not image_path:
        sys.stderr.write("image_path wajib diisi\n")
        return 1

    if not os.path.exists(image_path):
        sys.stderr.write("File gambar tidak ditemukan: %s\n" % image_path)
        return 1

    try:
        img = load_image(image_path)
        result = analyze(img)
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write("%s\n" % exc)
        return 2

    result["success"] = True
    sys.stdout.write(json.dumps(result, ensure_ascii=False))
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    sys.exit(main())
