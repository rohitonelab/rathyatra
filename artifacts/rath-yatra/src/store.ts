import { useState, useEffect } from 'react';
import { Howl } from 'howler';

const PULL_COUNT_KEY = 'rathYatra.pullCount';

function loadPullCount(): number {
    if (typeof window === 'undefined') return 0;
    const raw = window.localStorage.getItem(PULL_COUNT_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
}

// Devotee tiers -- each successful pull moves the devotee closer to the next
// title, giving a reason to keep pulling instead of stopping after one.
export const DEVOTEE_TIERS = [
    { threshold: 1, title: 'Seva Beginner' },
    { threshold: 3, title: 'Devoted Pilgrim' },
    { threshold: 5, title: 'Rath Sevak' },
    { threshold: 10, title: 'Grand Road Devotee' },
    { threshold: 20, title: 'Jagannath Sevadhari' },
    { threshold: 50, title: 'Eternal Pilgrim' },
] as const;

type DevoteeTier = (typeof DEVOTEE_TIERS)[number];

export function getDevoteeTier(count: number) {
    let current: DevoteeTier = DEVOTEE_TIERS[0];
    for (const tier of DEVOTEE_TIERS) {
        if (count >= tier.threshold) current = tier;
    }
    const next = DEVOTEE_TIERS.find((t) => t.threshold > count);
    return { current, next };
}

// Simple mutable store for high-frequency 3D/gesture updates
export const pullState = {
    progress: 0,
    velocity: 0,
    success: false,
    pullCount: loadPullCount(),
    justLeveledUp: false,
    listeners: new Set<() => void>(),
    subscribe: (fn: () => void) => {
        pullState.listeners.add(fn);
        return () => pullState.listeners.delete(fn);
    },
    notify: () => {
        pullState.listeners.forEach(fn => fn());
    },
    // Called once per completed pull -- persists the streak so the devotee's
    // progress carries across visits and keeps them coming back to pull more.
    recordPull: () => {
        const before = getDevoteeTier(pullState.pullCount).current;
        pullState.pullCount += 1;
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(PULL_COUNT_KEY, String(pullState.pullCount));
        }
        const after = getDevoteeTier(pullState.pullCount).current;
        pullState.justLeveledUp = after.title !== before.title;
    },
    reset: () => {
        pullState.success = false;
        pullState.progress = 0;
        pullState.velocity = 0;
        pullState.justLeveledUp = false;
        pullState.notify();
    },
};

// React hook to access pull state safely for UI
export function usePullState() {
    const [state, setState] = useState({
        progress: pullState.progress,
        success: pullState.success,
        pullCount: pullState.pullCount,
        justLeveledUp: pullState.justLeveledUp,
    });

    useEffect(() => {
        const unsubscribe = pullState.subscribe(() => {
            setState({
                progress: pullState.progress,
                success: pullState.success,
                pullCount: pullState.pullCount,
                justLeveledUp: pullState.justLeveledUp,
            });
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return state;
}

class AudioManager {
    bells?: Howl; chant?: Howl; wheels?: Howl; success?: Howl; song?: Howl;
    initialized = false;
    songFadingIn = false;
    songFadingOut = false;

    init() {
        if (this.initialized) return;
        this.initialized = true;

        this.bells = new Howl({ src: ['/audio/bells.mp3'], loop: true, volume: 0 });
        this.chant = new Howl({ src: ['/audio/chant.mp3'], loop: true, volume: 0.1 });
        this.wheels = new Howl({ src: ['/audio/wheels.mp3'], loop: true, volume: 0 });
        this.success = new Howl({ src: ['/audio/success.mp3'], volume: 0.8 });
        // Devotional song that plays for as long as the devotee is actively
        // pulling the rope -- the reward/feedback layer for the gesture itself.
        this.song = new Howl({ src: ['/audio/pull-song.mp3'], loop: true, volume: 0 });

        this.bells.play();
        this.chant.play();
    }

    update() {
        if (!this.initialized) return;
        const p = pullState.progress;
        const pulling = pullState.velocity > 0.1;

        // Dynamic volume based on pull progress
        this.bells?.volume(0.1 + (p / 100) * 0.5);
        
        if (pulling && !this.wheels?.playing()) {
            this.wheels?.play();
        } else if (!pulling && this.wheels?.playing()) {
            this.wheels?.pause();
        }

        if (this.song) {
            if (pulling) {
                this.songFadingOut = false;
                if (!this.song.playing()) {
                    this.song.play();
                    this.song.volume(0);
                }
                if (!this.songFadingIn && this.song.volume() < 0.7) {
                    this.songFadingIn = true;
                    this.song.fade(this.song.volume(), 0.7, 600);
                    this.song.once('fade', () => { this.songFadingIn = false; });
                }
            } else if (this.song.playing()) {
                this.songFadingIn = false;
                if (!this.songFadingOut) {
                    this.songFadingOut = true;
                    this.song.fade(this.song.volume(), 0, 800);
                    this.song.once('fade', () => {
                        this.songFadingOut = false;
                        this.song?.pause();
                    });
                }
            }
        }
    }

    playSuccess() {
        this.success?.play();
    }
}

export const audioManager = new AudioManager();
