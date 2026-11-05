// Tutte le scene della hero "Sobria" (paesaggi e monumenti), ognuna col suo nome. Resa solo lato server.
import { PAESAGGI, MONUMENTI, Tessera } from './Paesaggi.jsx';

const NOMI = {
  alpi: 'Alpi', dolomiti: 'Dolomiti', colline: 'Colline toscane', mare: 'Mare', puglia: 'Puglia', citta: 'Città',
  paese: 'Paese', vulcano: 'Vesuvio ed Etna', risaie: 'Risaie',
  pisa: 'Torre di Pisa', colosseo: 'Colosseo', mole: 'Mole Antonelliana', duomo: 'Duomo di Milano',
  pontevecchio: 'Ponte Vecchio', sanmarco: 'San Marco', duomotrento: 'Duomo di Trento', doss: 'Doss Trento',
  buonconsiglio: 'Castello del Buonconsiglio', albere: 'MUSE e Albere',
};

export default function Galleria() {
  const voci = [
    ...Object.entries(PAESAGGI).map(([k, T]) => ({ k, T, tipo: 'paesaggio' })),
    ...Object.entries(MONUMENTI).map(([k, T]) => ({ k, T, tipo: 'monumento' })),
  ];
  return (
    <ul className="sgal">
      {voci.map(({ k, T, tipo }) => (
        <li key={k}>
          <div className="scena"><Tessera T={T} /></div>
          <p><b>{NOMI[k] || k}</b> <span>{tipo}</span></p>
        </li>
      ))}
    </ul>
  );
}
