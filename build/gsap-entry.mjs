// GSAP + the full free plugin set (free since 3.13), bundled to
// scripts/gsap.bundle.js. ScrollSmoother is deliberately absent: Lenis
// owns smooth scrolling here and the two fight over the scroller.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(
  ScrollTrigger, ScrollToPlugin, SplitText, ScrambleTextPlugin, TextPlugin,
  DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, Flip, Observer,
  Draggable, InertiaPlugin, Physics2DPlugin, CustomEase
);

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.SplitText = SplitText;
window.Flip = Flip;
window.Observer = Observer;
window.Draggable = Draggable;
window.CustomEase = CustomEase;
