import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { Share2, ArrowDown, RotateCcw, Lock } from 'lucide-react';
import { RathScene } from '../components/RathScene';
import { pullState, audioManager, usePullState, getDevoteeTier } from '../store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function SuccessOverlay() {
    const { success, pullCount, justLeveledUp } = usePullState();
    const { current, next } = getDevoteeTier(pullCount);

    // Clicking outside the "Share Participation" card, or the Pull Again
    // button, dismisses the overlay and resets the rope so devotees can pull
    // it again instead of getting stuck after a single pull.
    const handleDismiss = () => pullState.reset();

    return (
        <AnimatePresence>
            {success && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-4"
                    onClick={handleDismiss}
                >
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', damping: 20, delay: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-card p-8 md:p-12 rounded-3xl text-center max-w-md mx-auto relative shadow-[0_20px_60px_rgba(183,28,28,0.3)] border border-[#FFD700]/50"
                    >
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                            className="w-20 h-20 bg-gradient-to-br from-[#FFD54A] to-[#F57C00] rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner"
                        >
                            <span className="text-4xl text-white">🙏</span>
                        </motion.div>
                        
                        <h3 className="font-serif text-3xl md:text-4xl text-[#B71C1C] mb-4">जय जगन्नाथ!</h3>
                        <p className="font-sans text-lg text-[#4E342E] mb-6 leading-relaxed">
                            आपने पवित्र रथ यात्रा में सांकेतिक रूप से भाग लिया है। भगवान जगन्नाथ आपको शांति और समृद्धि का आशीर्वाद दें।
                        </p>

                        {/* Streak / tier badge -- gives devotees a reason to pull again */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="mb-8 rounded-2xl bg-gradient-to-r from-[#FFD54A]/30 via-[#FFC107]/20 to-[#F57C00]/20 border border-[#FFD54A]/60 px-5 py-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="text-left">
                                    <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#4E342E]/60">
                                        {justLeveledUp ? 'नई उपाधि अनलॉक!' : 'आपकी उपाधि'}
                                    </div>
                                    <div className="font-serif text-xl text-[#B71C1C]">{current.title}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#4E342E]/60">खिंचाव</div>
                                    <div className="font-serif text-2xl text-[#4E342E]">{pullCount}</div>
                                </div>
                            </div>
                            {next && (
                                <div className="mt-3 font-sans text-xs text-[#4E342E]/70">
                                    <span className="font-semibold">{next.title}</span> बनने के लिए <span className="font-bold text-[#F57C00]">{next.threshold - pullCount}</span> बार और खींचें
                                </div>
                            )}
                        </motion.div>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDismiss}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#F57C00] to-[#B71C1C] text-white px-8 py-4 rounded-full font-sans font-bold text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(245,124,0,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(245,124,0,0.6)] transition-all"
                            >
                                <RotateCcw className="w-5 h-5" /> फिर से खींचें
                            </button>
                            <button className="w-full flex items-center justify-center gap-3 bg-white/70 text-[#4E342E] px-8 py-3.5 rounded-full font-sans font-bold text-sm uppercase tracking-widest border border-[#4E342E]/10 hover:bg-white transition-all">
                                <Share2 className="w-5 h-5" /> भागीदारी साझा करें
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function LiveDarshanCard() {
    return (
        <div className="glass-card w-full rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/60">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B71C1C] via-[#F57C00] to-[#FFD54A]" />
            <div className="flex justify-between items-start mb-6">
                <h2 className="font-serif text-3xl md:text-4xl text-[#4E342E] font-bold">
                    लाइव दर्शन
                </h2>
                <span className="px-3 py-1 bg-[#B71C1C] text-white text-[10px] font-bold rounded-full uppercase tracking-[0.2em] animate-pulse flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" /> लाइव
                </span>
            </div>
            
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-inner relative border border-[#4E342E]/20">
                <iframe
                    width="100%" height="100%"
                    src="https://www.youtube.com/embed/1DScORQ1YL0?autoplay=1&mute=1&controls=0&modestbranding=1"
                    title="Puri Rath Yatra Live"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                ></iframe>
            </div>
            
            <div className="mt-6 flex flex-col gap-4 font-sans text-sm text-[#4E342E]">
                <div className="flex justify-between items-center border-b border-[#4E342E]/10 pb-3">
                    <span className="font-semibold uppercase tracking-widest text-xs opacity-70">स्थान</span>
                    <span className="font-medium">पुरी बड़ा डांडा (ग्रैंड रोड)</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#4E342E]/10 pb-3">
                    <span className="font-semibold uppercase tracking-widest text-xs opacity-70">आयोजन</span>
                    <span className="font-medium">पहंडी बिजे</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold uppercase tracking-widest text-xs opacity-70">स्थानीय समय</span>
                    <span className="font-medium">
                        {new Date().toLocaleTimeString('hi-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute:'2-digit' })} IST
                    </span>
                </div>
            </div>
        </div>
    );
}

let emojiIdCounter = 0;

// The sacred rope-pull opens exactly at 3:00 PM IST on 16 July -- kept as a
// fixed UTC instant (IST = UTC+5:30) so it's correct regardless of the
// visitor's own timezone.
const ROPE_OPENS_AT = new Date('2026-07-16T09:30:00Z');

function useCountdown(target: Date) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const diffMs = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    return {
        isLive: diffMs <= 0,
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    };
}

function Hero() {
    const { success, progress, pullCount } = usePullState();
    const [emojis, setEmojis] = useState<{ id: number; x: number }[]>([]);
    const lastEmojiSpawnRef = useRef(0);
    const { current: currentTier } = getDevoteeTier(pullCount);
    const { isLive, days, hours, minutes, seconds } = useCountdown(ROPE_OPENS_AT);

    // Drag logic for pulling the Rath
    const bind = useDrag(({ delta: [dx, dy], dragging }) => {
        if (!isLive) return;
        if (dragging && dy > 0) {
            pullState.progress = Math.min(100, pullState.progress + (dy * 0.3));
            pullState.velocity = dy;

            // Spawn a prayer emoji rising from the rope while actively pulling,
            // throttled so it reads as a steady stream rather than a flood.
            const now = performance.now();
            if (now - lastEmojiSpawnRef.current > 220) {
                lastEmojiSpawnRef.current = now;
                setEmojis((prev) => [
                    ...prev.slice(-12),
                    { id: emojiIdCounter++, x: (Math.random() - 0.5) * 70 },
                ]);
            }
        } else if (!dragging) {
            pullState.velocity = 0;
        }
        
        if (pullState.progress >= 100 && !pullState.success) {
            pullState.success = true;
            pullState.recordPull();
            audioManager.playSuccess();
        }
        pullState.notify();
    }, { filterTaps: true });

    return (
        <section id="hero" className="relative w-full min-h-[100dvh] flex flex-col md:flex-row overflow-hidden bg-black">
            {/* Left 3D Chariot Half */}
            <div className="w-full md:w-[50%] lg:w-[55%] h-[60vh] md:h-screen relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F57C00]/10 to-[#B71C1C]/40 mix-blend-overlay pointer-events-none z-10" />
                <RathScene />
                
                {/* Drag Interaction Overlay */}
                <div {...(isLive ? bind() : {})} className={`absolute inset-0 z-20 touch-none flex flex-col justify-end items-center pb-12 md:pb-24 ${isLive ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}`}>
                    {/* Prayer emojis rising from the rope while it's being pulled */}
                    <div className="absolute bottom-24 md:bottom-32 inset-x-0 h-0 flex justify-center pointer-events-none z-30">
                        <AnimatePresence>
                            {emojis.map((e) => (
                                <motion.div
                                    key={e.id}
                                    initial={{ opacity: 1, y: 0, x: e.x, scale: 0.7 }}
                                    animate={{ opacity: 0, y: -220, scale: 1.15 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 2, ease: 'easeOut' }}
                                    onAnimationComplete={() =>
                                        setEmojis((prev) => prev.filter((p) => p.id !== e.id))
                                    }
                                    className="absolute text-2xl md:text-3xl select-none"
                                >
                                    🙏
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isLive ? (
                            <motion.div
                                key="countdown"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-card flex flex-col items-center gap-3 px-6 py-5 md:px-8 md:py-6 rounded-3xl border border-white/50 shadow-2xl max-w-[280px] md:max-w-xs mx-4 text-center"
                            >
                                <div className="flex items-center gap-2 text-[#B71C1C] font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] font-semibold">
                                    <Lock className="w-3.5 h-3.5" /> पवित्र रस्सी शीघ्र खुलेगी
                                </div>
                                <p className="font-serif text-lg md:text-xl text-[#4E342E]">
                                    16 जुलाई, अपराह्न 3:00 बजे (IST)
                                </p>
                                <div className="flex items-stretch gap-2 md:gap-3">
                                    {[
                                        { label: 'दिन', value: days },
                                        { label: 'घंटे', value: hours },
                                        { label: 'मिनट', value: minutes },
                                        { label: 'सेकंड', value: seconds },
                                    ].map((unit) => (
                                        <div key={unit.label} className="flex flex-col items-center bg-white/70 rounded-xl px-3 py-2 min-w-[52px] md:min-w-[60px] border border-white/60 shadow-inner">
                                            <span className="font-serif text-xl md:text-2xl text-[#B71C1C] tabular-nums">
                                                {String(unit.value).padStart(2, '0')}
                                            </span>
                                            <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-widest text-[#4E342E]/60">{unit.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="font-sans text-[11px] md:text-xs text-[#4E342E]/70 leading-relaxed">
                                    रथ खींचने का यह पुण्य अवसर निर्धारित समय पर स्वतः आरंभ हो जाएगा — तब तक धैर्य रखें
                                </p>
                            </motion.div>
                        ) : !success && (
                            <motion.div 
                                key="pull-prompt"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="text-[#4E342E] bg-white/60 backdrop-blur-md px-6 py-3 rounded-full font-sans text-xs md:text-sm tracking-[0.2em] uppercase shadow-xl animate-pulse flex items-center gap-3 border border-white/40">
                                    <ArrowDown className="w-4 h-4 text-[#B71C1C]" /> 
                                    रथ खींचने के लिए नीचे खींचें
                                </div>
                                {/* Progress Indicator */}
                                <div className="w-48 h-1.5 bg-black/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#FFC107] to-[#B71C1C] transition-all duration-75"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                {/* Streak chip -- entices repeat pulling across visits */}
                                {pullCount > 0 && (
                                    <div className="text-[#B71C1C] bg-[#FFD54A]/80 backdrop-blur-md px-4 py-1.5 rounded-full font-sans text-[10px] md:text-xs tracking-[0.15em] uppercase shadow-md border border-white/40">
                                        {currentTier.title} · {pullCount} खिंचाव
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <SuccessOverlay />
            </div>

            {/* Right UI Half */}
            <div className="w-full md:w-[50%] lg:w-[45%] h-auto md:h-screen overflow-y-auto px-4 py-12 md:p-12 shrink-0 flex flex-col justify-center items-center relative z-20 bg-gradient-to-br from-[#FFFDF7] via-[#FFFDF7] to-[#FFD54A]/30">
                <div className="w-full max-w-lg flex flex-col gap-6">
                    {/* Top Sponsor */}
                    <div className="w-full min-h-[90px] rounded-xl flex items-center justify-center bg-white border border-[#FFD54A]/60 shadow-[0_10px_30px_rgba(245,124,0,0.05)] relative overflow-hidden group hover:border-[#FFC107] transition-colors cursor-pointer px-4 py-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="text-[10px] font-sans text-gray-400 absolute top-2 left-3 uppercase tracking-widest">प्रस्तुतकर्ता</span>
                        <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-[#4E342E] mt-3 tracking-wide text-center">श्री गोल्ड डिवोशनल्स</h3>
                    </div>

                    <LiveDarshanCard />

                    {/* Bottom Sponsor */}
                    <div className="w-full min-h-[90px] rounded-xl flex items-center justify-center bg-white border border-[#FFD54A]/60 shadow-sm relative overflow-hidden group px-4 py-4">
                        <span className="text-[10px] font-sans text-gray-400 absolute top-2 left-3 uppercase tracking-widest">स्ट्रीमिंग पार्टनर</span>
                        <div className="font-sans font-bold text-base sm:text-lg md:text-xl text-[#B71C1C] mt-3 tracking-widest text-center">ओड़िया लाइव मीडिया</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function BelowHero() {
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        sectionRefs.current.forEach((el) => {
            if (!el) return;
            gsap.fromTo(el,
                { y: 60, opacity: 0 },
                { 
                    y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 85%' }
                }
            );
        });
    }, []);

    const addToRefs = (el: HTMLElement | null) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

    return (
        <div className="bg-[#FFFDF7] w-full z-20 relative font-sans text-[#4E342E] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-[#FFD54A]/20 to-transparent pointer-events-none" />
            
            <section id="history" ref={addToRefs} className="py-24 md:py-32 px-6 md:px-12 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h4 className="text-[#F57C00] font-sans text-sm font-bold uppercase tracking-[0.3em] mb-4">विरासत</h4>
                    <h2 className="text-4xl md:text-5xl font-serif text-[#B71C1C] mb-8 leading-tight">जगत के स्वामी की यात्रा</h2>
                    <p className="text-lg text-[#4E342E]/80 leading-relaxed font-sans mb-6">
                        रथ यात्रा, रथों का महोत्सव, केवल एक शोभायात्रा नहीं बल्कि एक गहन आध्यात्मिक यात्रा है जिसने सदियों से करोड़ों लोगों को मंत्रमुग्ध किया है। वर्ष में एक बार, भगवान जगन्नाथ अपने भाई-बहन बलभद्र और देवी सुभद्रा के साथ 12वीं शताब्दी के मंदिर के गर्भगृह से बाहर निकलकर बड़ा डांडा पर सीधे अपने भक्तों से मिलते हैं।
                    </p>
                    <p className="text-lg text-[#4E342E]/80 leading-relaxed font-sans">
                        यह सार्वभौमिक भाईचारे का प्रतीक है, जहाँ जाति, पंथ या धर्म के भेदभाव के बिना ईश्वर स्वयं मानवता को गले लगाने आते हैं।
                    </p>
                </div>
                <div className="relative">
                    <div className="aspect-square rounded-full bg-gradient-to-br from-[#FFD54A] to-[#F57C00] opacity-20 absolute -inset-8 blur-3xl animate-pulse" />
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] bg-white p-2 relative z-10 border border-[#FFD54A]/50">
                        <div className="w-full h-full bg-[#FFFDF7] rounded-[1.5rem] border border-dashed border-[#F57C00]/30 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
                            <h3 className="font-serif text-3xl text-[#4E342E] mb-2 z-10">नंदीघोष</h3>
                            <p className="font-sans text-sm text-[#4E342E]/60 uppercase tracking-widest z-10">पीला रथ</p>
                            <div className="w-24 h-24 border-4 border-[#FFD54A] rounded-full mt-8 flex items-center justify-center text-[#B71C1C] z-10 font-bold">16 पहिए</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="schedule" ref={addToRefs} className="py-24 px-6 md:px-12 bg-[#FFD54A]/10 border-y border-[#FFD54A]/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h4 className="text-[#F57C00] font-sans text-sm font-bold uppercase tracking-[0.3em] mb-4">अनुष्ठान</h4>
                        <h2 className="text-4xl md:text-5xl font-serif text-[#4E342E]">महोत्सव कार्यक्रम</h2>
                    </div>
                    
                    <div className="flex flex-col gap-6 relative">
                        {/* Timeline line */}
                        <div className="absolute left-[27px] md:left-1/2 top-4 bottom-4 w-[2px] bg-[#FFC107]/50 -translate-x-1/2" />
                        
                        {[
                            { time: "सुबह 06:00", title: "मंगल आरती", desc: "देवी-देवताओं का जागरण और प्रकाश की पहली शुभ भेंट।" },
                            { time: "सुबह 09:30", title: "पहंडी बिजे", desc: "वह भव्य शोभायात्रा जिसमें देवताओं को लयबद्ध रूप से झूमते हुए उनके-उनके रथों तक ले जाया जाता है।" },
                            { time: "दोपहर 01:00", title: "छेरा पहनरा", desc: "गजपति राजा सोने की झाड़ू से रथों की सफाई करते हैं, यह दर्शाते हुए कि प्रभु के समक्ष सभी समान हैं।" },
                            { time: "दोपहर 03:00", title: "रथ खींचना", desc: "करोड़ों हाथ पवित्र रस्सियों को छूकर इन भव्य काष्ठ मंदिरों को गुंडिचा मंदिर की ओर खींचते हैं।" }
                        ].map((item, i) => (
                            <div key={i} className={`flex flex-col md:flex-row gap-6 md:gap-12 relative z-10 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="hidden md:block w-1/2" />
                                <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-[#B71C1C] rounded-full top-6 -translate-x-1/2 border-4 border-[#FFFDF7] shadow-md" />
                                <div className={`ml-16 md:ml-0 w-full md:w-1/2 glass-card p-8 rounded-2xl border border-[#FFD54A]/40 shadow-lg ${i % 2 === 0 ? 'md:text-right md:pr-16' : 'md:pl-16'}`}>
                                    <span className="inline-block bg-[#F57C00]/10 text-[#F57C00] font-bold font-sans text-xs px-3 py-1 rounded-full tracking-widest mb-4">{item.time}</span>
                                    <h3 className="font-serif text-2xl text-[#B71C1C] mb-3">{item.title}</h3>
                                    <p className="font-sans text-[#4E342E]/80 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
        </div>
    );
}

export default function Home() {
    return (
        <main className="w-full bg-[#FFFDF7]">
            <Hero />
            <BelowHero />
        </main>
    );
}
