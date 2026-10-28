// Altezza "stabile" della finestra. Su Android (Chrome) la barra degli indirizzi appare e scompare mentre si
// scorre, e `innerHeight` cambia di poco a ogni passaggio: chi fa i calcoli dello scroll con quel valore vede la
// pagina scattare. Qui si usa invece 100svh (l'altezza con la barra mostrata), che non cambia scorrendo; si
// rimisura solo quando cambia la larghezza (rotazione, finestra ridimensionata).
let probe: HTMLElement | null = null;
let cached = 0;
let cachedW = -1;

export function stableHeight(): number {
  if (cached && cachedW === innerWidth) return cached;
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
    document.body.append(probe);
  }
  cachedW = innerWidth;
  cached = probe.offsetHeight || innerHeight;
  return cached;
}
