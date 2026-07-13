---
name: Screenshot tool tall-viewport caveat
description: A single static Screenshot capture never scrolls, so scroll-triggered animations/content below the fold can look "missing" even when the code is correct.
---

The Screenshot tool captures the page at scroll position 0 with a single fixed viewport (max height ~3000px). It does not simulate a real user scrolling down the page over time.

**Why this matters:** If a page uses scroll-linked reveal animations (e.g. GSAP ScrollTrigger, IntersectionObserver-based fade-ins), content far down the document will still be in its "not yet revealed" state (opacity 0, translated, etc.) in the screenshot — this is expected and correct behavior for a real visitor who hasn't scrolled there yet, not evidence of a bug. A tall (~3000px) viewport can make this doubly confusing because it makes it look like the sections *should* be in view/rendered by now.

**How to apply:** Before concluding "content is missing/broken" from a Screenshot result, check whether the affected content depends on scroll position or an animation library. If so, verify via code review (are the elements in the DOM? does the animation library have correct trigger setup?) rather than assuming the screenshot proves absence. Only ask the user to visually confirm scroll-dependent behavior if code review doesn't settle it.
