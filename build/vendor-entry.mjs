import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import * as animejs from 'animejs';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';

window.THREE = { ...THREE, CSS3DRenderer, CSS3DObject };
window.anime = animejs;
window.Lenis = Lenis;
window.confetti = confetti;
