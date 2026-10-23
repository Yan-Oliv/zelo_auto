import fs from 'node:fs';
const p='src/features/landing/LandingPage.tsx';let s=fs.readFileSync(p,'utf8').replaceAll('showroom-reference','showroom-final');s=s.replace('          <div className="zelo-showroom-sign" aria-hidden="true"><span>ZELO</span><small>AUTO ESTÉTICA</small></div>\r\n','');fs.writeFileSync(p,s);
const css='src/features/landing/CinematicHero.css';s=fs.readFileSync(css,'utf8');s+=`
/* POST-ZE09: reference plane is 1672 × 940, preserved instead of viewport cropping. */
@media (min-width: 1051px) {
  .zelo-hero { height: auto; min-height: 0; aspect-ratio: 1672 / 940; }
  .zelo-hero-car { left: 49.82%; top: 42.553%; width: 42.464%; aspect-ratio: 710 / 360; }
}
.zelo-hero-backdrop { filter: none; object-fit: fill; }
.zelo-hero-car-body { filter: none; }
.zelo-hero-edge-fade,.zelo-hero-top-fade { background: none; }
.zelo-hero-stage::after { background: radial-gradient(ellipse 28% 27% at 50% 34%,rgba(0,0,0,.5),transparent 100%); }
.zelo-hero-car::before { bottom: -4%; height: 16%; }
.zelo-hero-ground-shadow { bottom: -1%; height: 11%; }
.zelo-hero-reflection { opacity: .32; }
.zelo-header-budget { background: linear-gradient(180deg,#cba452,#95691d); }
.zelo-header-search,.zelo-header-menu { background: #aaa; }
@media (max-width: 1050px) and (min-aspect-ratio: 1/1) {
  .zelo-hero { height: auto; min-height: 0; aspect-ratio: 1672 / 940; }
  .zelo-hero-backdrop { object-fit: fill; }
  .zelo-hero-car { left: 49.82%; top: 42.553%; width: 42.464%; }
  .zelo-hero-wordmark { top: 20.32%; width: 49.34%; }
  .zelo-hero-slogan { top: 50.35%; padding-inline: 6.5%; font-size: 1.19vw; letter-spacing: .55em; }
  .zelo-hero-scroll-hint { bottom: 3.65%; font-size: 8px; }
  .zelo-hero-scroll-hint::before { height: 15px; margin-bottom: 0; }
  .zelo-header-inner { padding-block: 15px; }
}
@media (max-aspect-ratio: 1/1) and (max-width: 1050px) {
  .zelo-hero { height: 100svh; min-height: 560px; max-height: none; aspect-ratio: auto; }
  .zelo-hero-backdrop { object-fit: cover; object-position: center; }
  .zelo-hero-top-fade { background: linear-gradient(180deg,rgba(255,255,255,.9),transparent 23%,transparent 77%,rgba(255,255,255,.9)); }
  .zelo-hero-wordmark { left: 50%; top: 30%; width: min(88vw,46svh); }
  .zelo-hero-car { left: 50%; top: 56%; width: min(88vw,60svh); }
  .zelo-hero-slogan { display: contents; font-size: clamp(11px,2.8vw,16px); letter-spacing: .25em; }
  .zelo-hero-slogan::before,.zelo-hero-slogan::after { display: none; }
  .zelo-hero-slogan-left,.zelo-hero-slogan-right { position: absolute; z-index: 4; left: 0; width: 100%; text-align: center; }
  .zelo-hero-slogan-left { top: calc(30% - 36px); }
  .zelo-hero-slogan-right { top: calc(30% + min(30.51vw,15.95svh) + 18px); }
  .zelo-hero-scroll-hint { bottom: 4%; }
}
@media (max-height: 500px) and (min-aspect-ratio: 1/1) {
  .zelo-hero { min-height: 430px; }
  .zelo-hero-wordmark { top: 23%; }
  .zelo-hero-slogan { top: 51%; }
  .zelo-hero-scroll-hint::before { display: none; }
}
`;fs.writeFileSync(css,s);
