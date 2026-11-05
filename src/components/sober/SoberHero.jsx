// La hero "Sobria" di Trenitardo (app/src/components/sober/SoberHero.jsx) per il portfolio: stessa scena,
// ma resa solo lato server. Il testo, il ritardo e lo scorrimento (classe `in-moto`) li aggiorna lo script di
// TrainSoberHero.astro seguendo il viaggio finto di src/scripts/trenSim.ts.
// Il treno è disegnato due volte, di giorno e di notte coi vetri accesi: il CSS mostra quello del tema.
import { TRENI, GIORNO, NOTTE, LUCI } from './Treni.jsx';
import { sequenza, Striscia, chiaviDi, POSTO } from './Paesaggi.jsx';
import { giunzioniDi } from './Giunzioni.jsx';

export default function SoberHero({ fermate, seed, modello = 'regionale', id = 'sh', testo }) {
  const m = TRENI[modello] || TRENI.regionale;
  const tessere = sequenza(seed, 6, fermate.map((stazione) => ({ stazione })), 0);
  const giunzioni = giunzioniDi(chiaviDi(tessere), seed);
  const giroPx = (tessere.length * POSTO * 320) / 240;

  return (
    <div className="shero" data-shero>
      <div className="shero-paesaggio" aria-hidden="true" style={{ '--giro': `-${giroPx}px`, animationDuration: `${giroPx / 87.3}s` }}>
        <Striscia scene={tessere} giunzioni={giunzioni} ripeti={2} id={id + 'st'} />
      </div>
      <div className="shero-binari" aria-hidden="true" />
      <svg className="shero-treno" viewBox={`0 ${m.top} ${m.w} ${112 - m.top}`} style={{ aspectRatio: `${m.w} / ${112 - m.top}` }} aria-hidden="true">
        <defs>
          <filter id={id + 'g'} x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        <g className="giorno"><m.Corpo C={GIORNO} /></g>
        <g className="notte">
          <m.Corpo C={NOTTE} />
          <g filter={`url(#${id}g)`} opacity=".7"><m.Corpo C={LUCI} /></g>
        </g>
      </svg>
      <div className="shero-testo">
        <div className="sx">
          <div className="k" data-k>{testo.k}</div>
          <div className="dove" data-dove>{testo.dove}</div>
        </div>
        <div className="dx">
          <div className="k">Arriva a {testo.arrivo}</div>
          <div className="eta" data-eta>{testo.eta}</div>
        </div>
      </div>
      <div className="shero-ritardo late" data-ritardo>{testo.ritardo}</div>
    </div>
  );
}
