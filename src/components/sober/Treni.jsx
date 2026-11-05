// Treni dell'hero "Sobrio": disegni low poly ORIGINALI (nessuna livrea reale), nei colori
// di Trenitardo: cassa chiara neutra, fascia rossa, vetri scuri. Due modelli, scelti dalla categoria del treno (vedi modelloTreno):
//   regionale  — elettrotreno basso a 3 casse con musi arrotondati (ispirato ai regionali moderni)
//   alta       — alta velocità con muso lungo e affilato
// Ogni treno poggia su y=112 (sui binari). Larghezza in TRENI[m].w.

// Palette: ogni disegno riceve i colori come prop `C`, così lo stesso treno esiste di giorno e di notte.
export const GIORNO = {
  cassa: '#F1F1EF', cassaOmbra: '#DCDCD8', cassaLuce: '#FFFFFF',
  rosso: '#D71921', rossoScuro: '#A8131A',
  vetro: '#22292F', vetroRiflesso: '#3A4650', parabrezza: '#22292F', parabrezzaRiflesso: '#3A4650',
  grigio: '#4A4F54', sotto: '#2E3236', porta: '#E2E2DE', luce: '#FFF6C8', montante: '#3B444C', mozzo: '#8A9096',
}
// di notte: cassa al buio come il cielo, finestrini e vetri di testa e coda accesi a luce calda, fari accesi
export const NOTTE = {
  cassa: '#8E959D', cassaOmbra: '#757C84', cassaLuce: '#A3A9B0',
  rosso: '#8E1419', rossoScuro: '#6C0F13',
  vetro: '#FFC468', vetroRiflesso: '#FFDB9A', parabrezza: '#FFBE5C', parabrezzaRiflesso: '#FFD58C',
  grigio: '#33383D', sotto: '#1B1E22', porta: '#7D848B', luce: '#FFF4CF', montante: '#C98F3E', mozzo: '#5A6066',
}
// solo le luci (finestrini e fari), il resto trasparente: è lo strato che si sfoca per il bagliore
export const LUCI = Object.fromEntries(Object.keys(NOTTE).map((k) => [k, ['vetro', 'vetroRiflesso', 'parabrezza', 'parabrezzaRiflesso', 'luce'].includes(k) ? NOTTE[k] : 'none']))

const R = (x, y, w, h, fill, r = 2) => <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} />
const P = (pts, fill) => <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fill} />

// carrelli: due per cassa, ognuno con due ruote
function Carrelli({ x0, x1, C }) {
  const out = []
  for (const cx of [x0 + 26, x1 - 26]) {
    out.push(<g key={cx}>
      {R(cx - 20, 103, 40, 6, C.sotto, 2)}
      <circle cx={cx - 11} cy={108} r={4.5} fill={C.grigio} />
      <circle cx={cx + 11} cy={108} r={4.5} fill={C.grigio} />
      <circle cx={cx - 11} cy={108} r={1.6} fill={C.mozzo} />
      <circle cx={cx + 11} cy={108} r={1.6} fill={C.mozzo} />
    </g>)
  }
  return out
}

// divide [a,b] in n casse separate da un mantice di larghezza gap
function casse(a, b, n, gap = 6) {
  const w = (b - a - gap * (n - 1)) / n
  return Array.from({ length: n }, (_, i) => [a + i * (w + gap), a + i * (w + gap) + w])
}

// muso destro specchiato a sinistra
const Specchio = ({ w, children }) => <g transform={`matrix(-1 0 0 1 ${w} 0)`}>{children}</g>

/* ---------------- Regionale ---------------- */
const REG_W = 620
function MusoRegionale({ x, C }) {
  return <g>
    {P([[x, 30], [x + 26, 30], [x + 48, 50], [x + 57, 78], [x + 56, 103], [x, 103]], C.cassa)}
    {P([[x + 26, 30], [x + 48, 50], [x + 30, 40]], C.cassaLuce)}
    {P([[x + 48, 50], [x + 57, 78], [x + 44, 78]], C.cassaOmbra)}
    {P([[x + 6, 36], [x + 26, 36], [x + 46, 56], [x + 50, 70], [x + 6, 66]], C.parabrezza)}
    {P([[x + 26, 36], [x + 46, 56], [x + 34, 52]], C.parabrezzaRiflesso)}
    {P([[x, 82], [x + 57, 82], [x + 57, 92], [x, 92]], C.rosso)}
    {P([[x + 30, 82], [x + 57, 82], [x + 56, 92]], C.rossoScuro)}
    {R(x + 44, 74, 8, 4, C.luce, 1)}
    {P([[x, 96], [x + 56, 96], [x + 54, 103], [x, 103]], C.sotto)}
  </g>
}
// w: larghezza totale, n: casse, carrelli: false nella versione dei giochi (ci sono le ruote grandi)
function Regionale({ C = GIORNO, w = REG_W, n = 3, carrelli = true }) {
  const cs = casse(57, w - 57, n)
  return <>
    {cs.map(([a, b], i) => {
      const mid = (a + b) / 2
      return <g key={i}>
        {R(a - (i === 0 ? 1 : 0), 30, b - a + (i === 0 || i === n - 1 ? 1 : 0), 73, C.cassa, 0)}
        {R(a, 30, b - a, 5, C.cassaOmbra, 0)}
        {R(a, 82, b - a, 10, C.rosso, 0)}
        {R(a, 96, b - a, 7, C.sotto, 0)}
        {/* finestrini */}
        {[0, 1, 2, 3].map((k) => R(a + 10 + k * 36 + (k > 1 ? 16 : 0), 44, 26, 20, C.vetro, 3))}
        {/* porta centrale */}
        {R(mid - 12, 40, 24, 56, C.porta, 2)}
        {R(mid - 10, 44, 9, 30, C.vetro, 2)}
        {R(mid + 1, 44, 9, 30, C.vetro, 2)}
        {carrelli && <Carrelli x0={a} x1={b} C={C} />}
      </g>
    })}
    {cs.slice(1).map(([a], i) => R(a - 6, 36, 6, 62, C.grigio, 1))}
    <MusoRegionale x={w - 57} C={C} />
    <Specchio w={w}><MusoRegionale x={w - 57} C={C} /></Specchio>
  </>
}

/* ---------------- Alta velocità ---------------- */
const AV_W = 680
function MusoAlta({ x, C }) {
  return <g>
    {P([[x, 38], [x + 34, 40], [x + 72, 58], [x + 98, 86], [x + 100, 96], [x + 90, 103], [x, 103]], C.cassa)}
    {P([[x + 34, 40], [x + 72, 58], [x + 40, 52]], C.cassaLuce)}
    {P([[x + 72, 58], [x + 98, 86], [x + 70, 80]], C.cassaOmbra)}
    {P([[x + 30, 44], [x + 46, 46], [x + 74, 62], [x + 52, 64]], C.parabrezza)}
    {P([[x + 46, 46], [x + 74, 62], [x + 60, 56]], C.parabrezzaRiflesso)}
    {/* fascia rossa che scende verso la punta */}
    {P([[x, 72], [x + 54, 72], [x + 99, 92], [x + 96, 98], [x, 82]], C.rosso)}
    {P([[x + 54, 72], [x + 99, 92], [x + 80, 88]], C.rossoScuro)}
    {R(x + 84, 84, 7, 3, C.luce, 1)}
    {P([[x, 96], [x + 70, 96], [x + 90, 103], [x, 103]], C.sotto)}
  </g>
}
function Alta({ C = GIORNO, w = AV_W, n = 3, carrelli = true }) {
  const cs = casse(100, w - 100, n, 4)
  return <>
    {cs.map(([a, b], i) => <g key={i}>
      {R(a - 1, 38, b - a + 2, 65, C.cassa, 0)}
      {R(a, 38, b - a, 4, C.cassaOmbra, 0)}
      {/* fascia vetrata continua */}
      {R(a + 6, 50, b - a - 12, 13, C.vetro, 3)}
      {Array.from({ length: Math.floor((b - a - 12) / 22) }, (_, k) => R(a + 6 + (k + 1) * 22 - 1, 50, 2, 13, C.montante, 0))}
      {R(a, 72, b - a, 4, C.rosso, 0)}
      {R(a, 80, b - a, 2, C.cassaOmbra, 0)}
      {R(a, 96, b - a, 7, C.sotto, 0)}
      {R(a + 8, 46, 14, 46, C.porta, 2)}
      {R(a + 11, 50, 8, 18, C.vetro, 2)}
      {carrelli && <Carrelli x0={a} x1={b} C={C} />}
    </g>)}
    {cs.slice(1).map(([a]) => R(a - 4, 42, 4, 56, C.grigio, 1))}
    <MusoAlta x={w - 100} C={C} />
    <Specchio w={w}><MusoAlta x={w - 100} C={C} /></Specchio>
  </>
}

export { Regionale, Alta }
export const TRENI = {
  // fari: quota dei fari anteriori (per il fascio di luce di notte)
  regionale: { w: REG_W, top: 28, fari: 76, Corpo: Regionale },
  alta: { w: AV_W, top: 36, fari: 85, Corpo: Alta },
}

// Frecce (FR/FA/FB) → alta velocità; tutto il resto → regionale
export function modelloTreno(dati) {
  // VT a volte lascia `categoria` vuota e mette la sigla solo in compNumeroTreno («FR 9541»): si guardano entrambe
  const af = [dati?.categoria, dati?.compNumeroTreno].some((c) => /^(FR|FA|FB|ES)/.test(String(c || '').trim().toUpperCase()))
  return af ? 'alta' : 'regionale'
}
