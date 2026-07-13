import React, { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_LINKS = [
    { href: '#hero', label: 'अनुभव' },
    { href: '#history', label: 'इतिहास' },
    { href: '#schedule', label: 'कार्यक्रम' },
];

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="absolute top-0 left-0 w-full z-50 py-6 px-6 md:px-12 flex items-center justify-between pointer-events-none">
            <div className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-[#B71C1C] drop-shadow-md pointer-events-auto cursor-pointer">
                JAGANNATH
            </div>
            <nav className="hidden md:flex gap-8 font-sans text-sm tracking-[0.2em] font-semibold text-amber-950 uppercase pointer-events-auto">
                {NAV_LINKS.map((link) => (
                    <a key={link.href} href={link.href} className="hover:text-[#B71C1C] transition-colors">{link.label}</a>
                ))}
            </nav>

            {/* Mobile menu toggle */}
            <button
                type="button"
                aria-label={menuOpen ? 'मेनू बंद करें' : 'मेनू खोलें'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md border border-white/50 text-[#B71C1C] shadow-lg"
            >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <AnimatePresence>
                {menuOpen && (
                    <motion.nav
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden absolute top-full right-6 mt-2 flex flex-col gap-1 bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl overflow-hidden pointer-events-auto min-w-[180px]"
                    >
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="font-sans text-sm tracking-[0.15em] font-semibold text-amber-950 uppercase px-6 py-3 hover:bg-[#FFD54A]/30 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}

export function Footer() {
    return (
        <footer className="w-full bg-[#4E342E] text-[#FFFDF7] py-16 px-8 md:px-24 relative z-20">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
                <div>
                    <h3 className="font-serif text-3xl mb-4 text-[#FFC107]">श्री मंदिर</h3>
                    <p className="font-sans text-sm text-white/70 leading-relaxed mb-6">
                        दुनिया के सबसे भव्य महोत्सव की डिजिटल तीर्थयात्रा का अनुभव करें। भगवान जगन्नाथ की दिव्य उपस्थिति को दुनियाभर के भक्तों तक पहुँचाना।
                    </p>
                    <button className="flex items-center gap-2 bg-[#B71C1C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#F57C00] transition-colors text-sm uppercase tracking-wider">
                        <Heart className="w-4 h-4" /> सेवा अर्पित करें
                    </button>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-serif text-xl mb-4 text-[#FFD54A]">लिंक</h4>
                        <ul className="font-sans text-sm flex flex-col gap-3 text-white/70">
                            <li><a href="#" className="hover:text-white transition-colors">लाइव दर्शन</a></li>
                            <li><a href="#history" className="hover:text-white transition-colors">मंदिर का इतिहास</a></li>
                            <li><a href="#schedule" className="hover:text-white transition-colors">अनुष्ठान</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">प्रायोजन</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-serif text-xl mb-4 text-[#FFD54A]">सहयोगी</h4>
                        <div className="flex flex-col gap-3 font-sans text-sm text-white/70">
                            <span className="opacity-50 uppercase tracking-widest text-xs">मुख्य प्रायोजक</span>
                            <span className="font-semibold text-white">श्री गोल्ड डिवोशनल्स</span>
                            <span className="opacity-50 uppercase tracking-widest text-xs mt-2">स्ट्रीमिंग पार्टनर</span>
                            <span className="font-semibold text-white">ओड़िया लाइव मीडिया</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 text-center font-sans text-xs text-white/40 uppercase tracking-widest">
                © {new Date().getFullYear()} डिजिटल रथ यात्रा अनुभव। श्रद्धा से निर्मित।
            </div>
        </footer>
    );
}
