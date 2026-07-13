import { useEffect, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header, Footer } from './components/HeaderFooter';
import { Loader } from './components/Loader';
import Home from './pages/Home';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Lenis takes over native scrolling, so ScrollTrigger (used for the
    // History/Schedule reveal animations) needs to be driven from Lenis's own
    // scroll ticks -- otherwise it never fires and that content stays hidden.
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);

  return (
    <div className="font-sans text-[#4E342E] bg-background w-full">
      <Header />
      <Suspense fallback={<Loader />}>
        <Home />
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
