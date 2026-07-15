import React, { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// WhatsAppShare – completely isolated, zero-dependency share widget.
// Gracefully fails silently if anything goes wrong.
// ---------------------------------------------------------------------------

const WHATSAPP_ICON = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
    >
        <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.473.648 4.794 1.78 6.81L2 30l7.395-1.743A13.93 13.93 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2Zm0 25.4a11.33 11.33 0 0 1-5.79-1.587l-.415-.248-4.387 1.034.985-4.283-.271-.44A11.367 11.367 0 0 1 4.6 16.003c0-6.285 5.118-11.4 11.403-11.4 6.285 0 11.397 5.115 11.397 11.4S22.288 27.4 16.003 27.4Zm6.24-8.534c-.342-.17-2.024-1-2.34-1.115-.316-.114-.546-.17-.776.17-.23.342-.888 1.115-1.087 1.344-.2.23-.4.257-.74.086-.343-.172-1.447-.533-2.757-1.7-1.02-.908-1.708-2.03-1.908-2.372-.2-.34-.021-.524.15-.693.153-.152.342-.398.514-.597.17-.2.228-.34.342-.57.115-.228.058-.428-.03-.598-.086-.17-.776-1.872-1.063-2.563-.28-.67-.565-.579-.776-.59l-.663-.012a1.272 1.272 0 0 0-.92.43c-.316.342-1.206 1.178-1.206 2.872s1.235 3.332 1.406 3.563c.17.228 2.43 3.712 5.888 5.207.824.355 1.467.568 1.968.727.826.263 1.578.226 2.172.137.662-.099 2.024-.828 2.31-1.627.285-.8.285-1.485.2-1.628-.086-.143-.315-.228-.657-.4Z" />
    </svg>
);

function buildShareUrl(): string {
    try {
        const url = window.location.href;
        const message =
            `🙏 Jai Jagannath!\n\n` +
            `Tomorrow at 3:00 PM, experience an interactive Jagannath Rath Yatra where devotees can symbolically pull the sacred Rath while watching Live Darshan.\n\n` +
            `Join here:\n` +
            `${url}\n\n` +
            `Jai Jagannath 🙏`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    } catch {
        return 'https://wa.me/';
    }
}

function Toast({ visible, message }: { visible: boolean; message: string }) {
    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                left: '50%',
                transform: `translateX(-50%) translateY(${visible ? '0' : '2rem'})`,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                background: 'rgba(30,30,30,0.92)',
                color: '#fff',
                padding: '0.65rem 1.4rem',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontFamily: 'sans-serif',
                fontWeight: 500,
                boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
                pointerEvents: 'none',
                zIndex: 9999,
                whiteSpace: 'nowrap',
            }}
        >
            {message}
        </div>
    );
}

export default function WhatsAppShare() {
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((msg: string) => {
        try {
            if (toastTimer.current) clearTimeout(toastTimer.current);
            setToastMsg(msg);
            setToastVisible(true);
            toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
        } catch {
            /* fail silently */
        }
    }, []);

    const handleWhatsApp = useCallback(() => {
        try {
            const waUrl = buildShareUrl();
            // On desktop, WhatsApp Web is the universal fallback
            window.open(waUrl, '_blank', 'noopener,noreferrer');
        } catch {
            /* fail silently */
        }
    }, []);

    const handleCopyLink = useCallback(async () => {
        try {
            const url = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for older browsers
                const ta = document.createElement('textarea');
                ta.value = url;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            showToast('Website link copied.');
        } catch {
            showToast('Could not copy link.');
        }
    }, [showToast]);

    return (
        <>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    marginTop: '0.25rem',
                }}
            >
                {/* WhatsApp Share Button */}
                <button
                    id="whatsapp-share-btn"
                    onClick={handleWhatsApp}
                    aria-label="Share on WhatsApp"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.9rem 1.5rem',
                        borderRadius: '999px',
                        border: 'none',
                        background: '#25D366',
                        color: '#fff',
                        fontSize: '0.93rem',
                        fontWeight: 700,
                        fontFamily: 'sans-serif',
                        letterSpacing: '0.02em',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                        outline: 'none',
                        WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.50)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.35)';
                    }}
                    onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.transform = 'scale(0.98)';
                    }}
                    onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                    }}
                >
                    {WHATSAPP_ICON}
                    📲 Share with Family on WhatsApp
                </button>

                {/* Copy Link Button */}
                <button
                    id="copy-link-btn"
                    onClick={handleCopyLink}
                    aria-label="Copy website link"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        width: '100%',
                        padding: '0.65rem 1rem',
                        borderRadius: '999px',
                        border: '1.5px solid rgba(78,52,46,0.18)',
                        background: 'rgba(255,255,255,0.72)',
                        color: '#4E342E',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        fontFamily: 'sans-serif',
                        letterSpacing: '0.01em',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease, border-color 0.15s ease',
                        outline: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        backdropFilter: 'blur(6px)',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
                        e.currentTarget.style.borderColor = 'rgba(78,52,46,0.35)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.72)';
                        e.currentTarget.style.borderColor = 'rgba(78,52,46,0.18)';
                    }}
                >
                    🔗 Copy Website Link
                </button>
            </div>

            <Toast visible={toastVisible} message={toastMsg} />
        </>
    );
}
