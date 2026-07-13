import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export function Loader() {
    const { active, progress } = useProgress();

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1, ease: 'easeInOut' } }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFD54A] devotional-gradient overflow-hidden"
                >
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
                    
                    {/* Glowing Aura */}
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-[300px] h-[300px] bg-white/20 blur-[60px] rounded-full"
                    />

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="font-serif text-5xl text-[#B71C1C] mb-8 drop-shadow-lg"
                        >
                            JAGANNATH
                        </motion.div>
                        
                        <div className="w-64 h-1 bg-[#4E342E]/20 rounded-full overflow-hidden relative">
                            <motion.div 
                                className="h-full bg-[#B71C1C] absolute top-0 left-0"
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: 'easeOut' }}
                            />
                        </div>
                        
                        <div className="mt-4 font-sans text-sm tracking-widest uppercase text-[#4E342E]/70 font-semibold">
                            दर्शन तैयार हो रहा है... {Math.round(progress)}%
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
