import sys
import json
import os
import cv2
import numpy as np

MAX_SIDE = 512
CLAHE = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

# Bobot CV klasik (total 1.0)
W_AKAZE = 0.35
W_ORB = 0.25
W_HIST = 0.25
W_HOG = 0.15

# Model CNN (MobileNetV2 ONNX)
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "models", "mobilenetv2-10.onnx"
)
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
_session = None


def get_session():
    global _session
    if _session is None:
        import onnxruntime as ort
        _session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
    return _session


def cnn_embedding(img_bgr):
    """Vektor ciri dari MobileNetV2, dipusatkan lalu dinormalisasi."""
    rgb = cv2.cvtColor(
        cv2.resize(img_bgr, (224, 224), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB
    ).astype(np.float32) / 255.0
    rgb = (rgb - MEAN) / STD
    tensor = np.transpose(rgb, (2, 0, 1))[np.newaxis, ...].astype(np.float32)

    sess = get_session()
    out = sess.run(None, {sess.get_inputs()[0].name: tensor})[0]
    vec = out.flatten().astype(np.float32)
    vec -= vec.mean()
    n = np.linalg.norm(vec)
    return vec / n if n > 0 else None


def cnn_score(f1, f2):
    a, b = f1.get("cnn"), f2.get("cnn")
    if a is None or b is None:
        return None, None
    sim = float(np.dot(a, b))
    # Dikalibrasi dari 2 titik data: beda total ~0.55 -> 0 poin, sama ~0.90 -> 100 poin
    score = max((sim - 0.55) / 0.35, 0.0) * 100
    return round(min(score, 100.0), 2), round(sim, 4)


def load_image(path):
    """Baca file SEKALI, resize menjaga rasio aspek."""
    if not os.path.exists(path):
        return None
    img = cv2.imread(path)
    if img is None:
        return None
    h, w = img.shape[:2]
    scale = MAX_SIDE / max(h, w)
    interp = cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC
    return cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=interp)


def extract_features(path):
    img = load_image(path)
    if img is None:
        return None

    # Preprocessing: grayscale -> denoise (pertahankan tepi) -> CLAHE (ratakan cahaya)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 5, 40, 40)
    gray_eq = CLAHE.apply(gray)

    # AKAZE
    akaze = cv2.AKAZE_create(
        descriptor_type=cv2.AKAZE_DESCRIPTOR_MLDB,
        descriptor_size=0,
        descriptor_channels=3,
        threshold=0.001,
        nOctaves=4,
        nOctaveLayers=4,
    )
    akaze_kp, akaze_des = akaze.detectAndCompute(gray_eq, None)

    # ORB (cadangan kalau AKAZE lemah)
    orb = cv2.ORB_create(nfeatures=1000)
    orb_kp, orb_des = orb.detectAndCompute(gray_eq, None)

    # Histogram HSV: center crop 60%, hanya H dan S, piksel pucat/gelap diabaikan
    h, w = img.shape[:2]
    mh, mw = int(h * 0.2), int(w * 0.2)
    center = img[mh:h - mh, mw:w - mw]
    hsv = cv2.cvtColor(center, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, (0, 40, 40), (180, 255, 255))
    colored_ratio = cv2.countNonZero(mask) / mask.size
    hist = cv2.calcHist([hsv], [0, 1], mask, [18, 16], [0, 180, 0, 256])
    cv2.normalize(hist, hist, 1.0, 0.0, cv2.NORM_L1)

    # HOG: blur dulu supaya fokus ke bentuk umum
    hog_img = cv2.GaussianBlur(cv2.resize(gray_eq, (128, 128)), (5, 5), 0)
    hog = cv2.HOGDescriptor((128, 128), (16, 16), (8, 8), (8, 8), 9)
    hog_desc = hog.compute(hog_img).flatten()

    # CNN embedding (kalau gagal, lanjut dengan CV klasik saja)
    try:
        cnn = cnn_embedding(img)
        cnn_error = None
    except Exception as e:
        cnn, cnn_error = None, str(e)

    return {
        "akaze_kp": akaze_kp, "akaze_des": akaze_des,
        "orb_kp": orb_kp, "orb_des": orb_des,
        "hist": hist, "colored_ratio": colored_ratio,
        "hog": hog_desc,
        "cnn": cnn, "cnn_error": cnn_error,
    }


def feature_match_score(kp1, des1, kp2, des2):
    """Skor fitur biner (AKAZE-MLDB / ORB). Return (skor 0-100, jumlah match bagus)."""
    if des1 is None or des2 is None or len(kp1) < 2 or len(kp2) < 2:
        return 0.0, 0

    bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    try:
        matches = bf.knnMatch(des1, des2, k=2)
    except cv2.error:
        return 0.0, 0

    good = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.75 * m[1].distance]
    n = len(good)
    if n == 0:
        return 0.0, 0

    min_kp = min(len(kp1), len(kp2))
    # Cocok 15% keypoint sudah dianggap penuh
    ratio_score = min(n / max(min_kp * 0.15, 1), 1.0)
    count_score = min(n / 100.0, 1.0)
    score = (ratio_score * 0.7 + count_score * 0.3) * 100

    # Redam jika match terlalu sedikit (rawan kebetulan)
    if n < 8:
        score *= n / 8.0

    return round(min(score, 100.0), 2), n


def histogram_score(f1, f2):
    low1 = f1["colored_ratio"] < 0.1
    low2 = f2["colored_ratio"] < 0.1

    # Barang hitam/putih/abu: Hue tidak bermakna
    if low1 and low2:
        return 70.0
    if low1 != low2:
        return 20.0

    correl = max(cv2.compareHist(f1["hist"], f2["hist"], cv2.HISTCMP_CORREL), 0.0)
    bhat = 1.0 - cv2.compareHist(f1["hist"], f2["hist"], cv2.HISTCMP_BHATTACHARYYA)
    return round(max((correl + bhat) / 2, 0.0) * 100, 2)


def hog_score(f1, f2):
    a, b = f1["hog"], f2["hog"]
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    sim = float(np.dot(a, b) / norm)
    # Skala ulang 0.5-1.0 -> 0-100
    return round(max((sim - 0.5) / 0.5, 0.0) * 100, 2)


def compare(path1, path2):
    f1 = extract_features(path1)
    f2 = extract_features(path2)
    if f1 is None or f2 is None:
        return {"error": "Gambar tidak bisa dibaca"}

    akaze_s, akaze_n = feature_match_score(f1["akaze_kp"], f1["akaze_des"], f2["akaze_kp"], f2["akaze_des"])
    orb_s, orb_n = feature_match_score(f1["orb_kp"], f1["orb_des"], f2["orb_kp"], f2["orb_des"])
    hist_s = histogram_score(f1, f2)
    hog_s = hog_score(f1, f2)

    classic = akaze_s * W_AKAZE + orb_s * W_ORB + hist_s * W_HIST + hog_s * W_HOG
    cnn_s, cnn_cos = cnn_score(f1, f2)

    # CNN 60% + CV klasik 40%. Kalau CNN gagal dimuat, pakai CV klasik saja.
    photo = classic if cnn_s is None else (cnn_s * 0.6 + classic * 0.4)

    return {
        "photo_score": round(min(photo, 100.0), 2),
        "classic_score": round(classic, 2),
        "cnn_score": cnn_s,
        "cnn_cosine": cnn_cos,
        "cnn_error": f1.get("cnn_error") or f2.get("cnn_error"),
        "akaze_score": akaze_s,
        "orb_score": orb_s,
        "histogram_score": hist_s,
        "hog_score": hog_s,
        "total_matches": akaze_n,
        "orb_matches": orb_n,
        "keypoints_1": len(f1["akaze_kp"]),
        "keypoints_2": len(f2["akaze_kp"]),
        "message": "success",
    }


def main():
    try:
        # Mode tes manual: python main.py foto1.jpg foto2.jpg
        if len(sys.argv) == 3:
            print(json.dumps(compare(sys.argv[1], sys.argv[2]), indent=2))
            return

        raw = sys.stdin.read().strip()
        if not raw:
            print(json.dumps({"error": "Input kosong"}))
            return

        data = json.loads(raw)
        p1 = data.get("image1_path", "")
        p2 = data.get("image2_path", "")
        if not p1 or not p2:
            print(json.dumps({"error": "Path gambar tidak lengkap"}))
            return

        print(json.dumps(compare(p1, p2)))

    except json.JSONDecodeError:
        print(json.dumps({"error": "Format JSON tidak valid"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main()