// Bundled to scripts/vendor.bundle.js as a single IIFE classic script.
// Everything is exposed as a window global so plain <script> tags work,
// same pattern as the Mount One site.
import * as THREE from 'three';
import * as animejs from 'animejs';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';

window.THREE = THREE;
window.anime = animejs;
window.Lenis = Lenis;
window.confetti = confetti;
