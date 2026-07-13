---
name: Lenis + GSAP ScrollTrigger integration
description: Required wiring so GSAP ScrollTrigger reveal animations actually fire when Lenis drives smooth scrolling.
---

When a page uses Lenis for smooth scrolling AND GSAP ScrollTrigger for scroll-based reveal animations, you must explicitly connect them:

```js
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

**Why:** ScrollTrigger listens for native scroll events by default. If Lenis's raf loop isn't tied into ScrollTrigger's update cycle (and vice versa via gsap.ticker driving Lenis instead of a bare `requestAnimationFrame` loop), reveal animations set up with `gsap.fromTo(el, { opacity: 0 }, { opacity: 1, scrollTrigger: {...} })` can end up never firing — the sections stay invisible even though they're correctly in the DOM and occupy layout space (easy to mistake for a "missing content" bug rather than an animation-timing bug).

**How to apply:** Whenever both Lenis and ScrollTrigger appear together in a project (e.g. a single Lenis instance created once at the app root), do this wiring at setup time in the same effect that creates the Lenis instance, and register `gsap.registerPlugin(ScrollTrigger)` once.
