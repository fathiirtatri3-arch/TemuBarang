import sys
import json
import cv2
import numpy as np
import os

def get_image_features(image_path):
    if not os.path.exists(image_path):
        return None, None, None

    img_color = cv2.imread(image_path)
    if img_color is None:
        return None, None, None

    img_color = cv2.resize(img_color, (640, 640))
    img_gray = cv2.cvtColor(img_color, cv2.COLOR_BGR2GRAY)

    # AKAZE keypoints
    akaze = cv2.AKAZE_create(
        descriptor_type=cv2.AKAZE_DESCRIPTOR_MLDB,
        descriptor_size=0,
        descriptor_channels=3,
        threshold=0.001,
        nOctaves=4,
        nOctaveLayers=4
    )
    kp, des = akaze.detectAndCompute(img_gray, None)

    # Histogram pakai CENTER CROP 50% — fokus ke objek, hindari background
    h, w = img_color.shape[:2]
    margin_h, margin_w = h // 4, w // 4
    center = img_color[margin_h:h-margin_h, margin_w:w-margin_w]

    img_hsv = cv2.cvtColor(center, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist(
        [img_hsv], [0, 1], None,
        [50, 60], [0, 180, 0, 256]
    )
    cv2.normalize(hist, hist, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)

    return kp, des, hist

def calculate_akaze_score(kp1, des1, kp2, des2):
    if des1 is None or des2 is None:
        return 0.0, 0

    bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    try:
        matches = bf.knnMatch(des1, des2, k=2)
    except cv2.error:
        return 0.0, 0

    good_matches = []
    for match in matches:
        if len(match) == 2:
            m, n = match
            if m.distance < 0.75 * n.distance:
                good_matches.append(m)

    total_good = len(good_matches)
    if total_good == 0:
        return 0.0, 0

    min_kp = min(len(kp1), len(kp2))
    ratio = total_good / min_kp
    normalized = min(total_good / 200.0, 1.0) * 100
    score = (ratio * 50) + (normalized * 0.5)

    return min(round(score, 2), 100.0), total_good

def calculate_histogram_score(hist1, hist2):
    if hist1 is None or hist2 is None:
        return 0.0

    # CORREL: 1.0 = identik, 0.0 = tidak mirip, -1.0 = berlawanan
    score = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
    score = max(score, 0.0)  # buang nilai negatif

    return round(score * 100, 2)

def calculate_hog_score(image_path1, image_path2):
    """HOG: membaca bentuk dan tekstur, bukan warna"""
    def get_hog(path):
        img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return None
        img = cv2.resize(img, (128, 128))
        
        hog = cv2.HOGDescriptor(
            _winSize=(128, 128),
            _blockSize=(16, 16),
            _blockStride=(8, 8),
            _cellSize=(8, 8),
            _nbins=9
        )
        descriptor = hog.compute(img)
        return descriptor.flatten()
    
    hog1 = get_hog(image_path1)
    hog2 = get_hog(image_path2)
    
    if hog1 is None or hog2 is None:
        return 0.0
    
    # Cosine similarity
    dot = np.dot(hog1, hog2)
    norm = np.linalg.norm(hog1) * np.linalg.norm(hog2)
    if norm == 0:
        return 0.0
    
    similarity = dot / norm
    return round(float(similarity) * 100, 2)

def get_label(score):
    if score >= 65:
        return "sangat_mirip"
    elif score >= 35:
        return "mungkin_cocok"
    else:
        return "tidak_cocok"

def main():
    try:
        raw = sys.stdin.read().strip()
        if not raw:
            print(json.dumps({"error": "Input kosong"}))
            return

        data = json.loads(raw)
        img1_path = data.get('image1_path', '')
        img2_path = data.get('image2_path', '')

        if not img1_path or not img2_path:
            print(json.dumps({"error": "Path gambar tidak lengkap"}))
            return

        kp1, des1, hist1 = get_image_features(img1_path)
        kp2, des2, hist2 = get_image_features(img2_path)

        if kp1 is None or kp2 is None:
            print(json.dumps({
                "match_score": 0.0,
                "total_matches": 0,
                "error": "Gambar tidak bisa dibaca"
            }))
            return

        akaze_score, total_matches = calculate_akaze_score(kp1, des1, kp2, des2)
        hist_score = calculate_histogram_score(hist1, hist2)
        hog_score = calculate_hog_score(img1_path, img2_path)

        # Gabungkan: AKAZE 40% + Histogram 35%
        # Sisanya 25% nanti dari skor teks di PHP
        photo_score = (akaze_score * 0.45) + (hist_score * 0.30) + (hist_score * 0.25)
        photo_score = round(min(photo_score, 100.0), 2)

        print(json.dumps({
            "photo_score": photo_score,       # skor gabungan foto (dikirim ke PHP)
            "akaze_score": akaze_score,        # debug
            "histogram_score": hist_score, 
            "hog_score": hog_score,    # debug
            "total_matches": total_matches,
            "keypoints_1": len(kp1),
            "keypoints_2": len(kp2),
            "message": "success"
        }))

    except json.JSONDecodeError:
        print(json.dumps({"error": "Format JSON tidak valid"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()