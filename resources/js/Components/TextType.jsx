import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function TextType({ 
    text, 
    typingSpeed = 50,
    initialDelay = 0,
    pauseDuration = 2000,
    deletingSpeed = 30,
    loop = true,
    className = '',
    showCursor = true,
    cursorCharacter = '|',
    cursorBlinkDuration = 0.5,
    textColors = [],
    onSentenceComplete,
    startOnVisible = false,
    as: Component = 'div',
    ...props 
}) {
    const elementRef = useRef(null);
    const cursorRef = useRef(null);
    const timelineRef = useRef(null);
    const currentIndex = useRef(0);
    const isDeleting = useRef(false);
    const isComplete = useRef(false);

    useEffect(() => {
        if (!elementRef.current) return;

        const texts = Array.isArray(text) ? text : [text];
        if (texts.length === 0) return;

        const el = elementRef.current;
        const cursor = cursorRef.current;

        // Bersihkan timeline sebelumnya
        if (timelineRef.current) {
            timelineRef.current.kill();
            timelineRef.current = null;
        }

        // Reset state
        currentIndex.current = 0;
        isDeleting.current = false;
        isComplete.current = false;
        el.textContent = '';

        const tl = gsap.timeline({
            paused: true,
            onComplete: () => {
                // Ketika satu siklus selesai
                if (loop && texts.length > 1) {
                    // Maju ke kalimat berikutnya
                    currentIndex.current = (currentIndex.current + 1) % texts.length;
                    isDeleting.current = false;
                    isComplete.current = false;
                    // Reset dan mulai lagi
                    tl.restart();
                }
            }
        });

        let charIndex = 0;
        let currentText = '';

        // Fungsi untuk mengetik atau menghapus satu karakter
        const typeNextChar = () => {
            const targetText = texts[currentIndex.current];
            
            if (isDeleting.current) {
                // Mode HAPUS
                if (charIndex > 0) {
                    charIndex--;
                    currentText = targetText.substring(0, charIndex);
                    el.textContent = currentText + (showCursor ? cursorCharacter : '');
                    // Kecepatan menghapus
                    const speed = deletingSpeed || typingSpeed * 0.6;
                    tl.add(() => {}, `+=${speed/1000}`);
                    // Panggil lagi untuk karakter berikutnya
                    tl.add(() => {
                        typeNextChar();
                    }, `+=${speed/1000}`);
                } else {
                    // Selesai menghapus, pindah ke kalimat berikutnya
                    isDeleting.current = false;
                    currentIndex.current = (currentIndex.current + 1) % texts.length;
                    // Ganti warna jika ada
                    if (textColors[currentIndex.current]) {
                        el.style.color = textColors[currentIndex.current];
                    }
                    // Mulai mengetik kalimat baru
                    typeNextChar();
                }
            } else {
                // Mode TIK
                if (charIndex < targetText.length) {
                    charIndex++;
                    currentText = targetText.substring(0, charIndex);
                    el.textContent = currentText + (showCursor ? cursorCharacter : '');
                    // Kecepatan mengetik dengan variasi
                    const speed = typingSpeed + (Math.random() * 20 - 10);
                    tl.add(() => {}, `+=${speed/1000}`);
                    // Panggil lagi untuk karakter berikutnya
                    tl.add(() => {
                        typeNextChar();
                    }, `+=${speed/1000}`);
                } else {
                    // Selesai mengetik satu kalimat
                    if (onSentenceComplete) {
                        onSentenceComplete(targetText, currentIndex.current);
                    }
                    // Jika ada lebih dari 1 kalimat dan loop aktif
                    if (texts.length > 1 && loop) {
                        // Jeda sebelum menghapus
                        tl.add(() => {
                            isDeleting.current = true;
                            typeNextChar();
                        }, `+=${pauseDuration/1000}`);
                    } else if (texts.length === 1) {
                        // Hanya satu kalimat, berhenti
                        isComplete.current = true;
                    }
                }
            }
        };

        // Set warna awal
        if (textColors.length > 0 && textColors[0]) {
            el.style.color = textColors[0];
        }
        
        // Mulai dengan delay
        tl.add(() => {
            typeNextChar();
        }, `+=${initialDelay/1000}`);

        // Jalankan timeline
        if (startOnVisible) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    tl.play();
                    observer.disconnect();
                }
            });
            observer.observe(el);
        } else {
            tl.play();
        }

        timelineRef.current = tl;

        // Animasi kursor berkedip
        if (cursor && showCursor) {
            gsap.to(cursor, {
                opacity: 0,
                duration: cursorBlinkDuration / 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
            });
        }

        // Cleanup
        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
                timelineRef.current = null;
            }
        };
    }, [text, typingSpeed, initialDelay, pauseDuration, deletingSpeed, loop, showCursor, cursorCharacter, cursorBlinkDuration, textColors, onSentenceComplete, startOnVisible]);

    return (
        <Component 
            ref={elementRef} 
            className={className}
            style={{ display: 'inline-block' }}
            {...props}
        >
            {showCursor && (
                <span 
                    ref={cursorRef}
                    className="cursor-blink"
                    style={{ 
                        display: 'inline-block',
                        animation: `cursorBlink ${cursorBlinkDuration}s step-end infinite`
                    }}
                >
                    {cursorCharacter}
                </span>
            )}
            <style>{`
                @keyframes cursorBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </Component>
    );
}