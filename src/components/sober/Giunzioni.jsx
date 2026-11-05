// Giunzioni: un elemento intero in primo piano, centrato sul punto dove una scena finisce e
// comincia la successiva (come su Bustardo, app/src/paesaggi/giunzioni.jsx: le prime nove
// vengono da lì). Le scene, allungate col proprio bordo specchiato, si toccano proprio lì
// dietro: la giunzione copre il taglio.
// Ogni giunzione va da x=-80 a x=+80 (0 = il punto di contatto) e al centro è più alta di
// qualsiasi scena (cima verso y≈-10): il taglio resta sempre coperto.
// Quale giunzione in quale zona lo decide giunzioniDi (in fondo).

const P = (pts, fill, k) => <polygon key={k} points={pts.map((p) => p.join(',')).join(' ')} fill={fill} />
const R = (x, y, w, h, fill, k) => <rect key={k} x={x} y={y} width={w} height={h} fill={fill} />
const C = (cx, cy, r, fill, k) => <circle key={k} cx={cx} cy={cy} r={r} fill={fill} />
const Merli = ({ x, y, w, c }) => <>{Array.from({ length: Math.floor(w / 4) }, (_, k) => R(x + k * 4, y - 2, 2.2, 2.2, c, k))}</>

// abete in primo piano (più scuro di quelli delle scene)
const abete = (dx, y, h, k, c1 = '#2A4F33', c2 = '#1F3D28') => <g key={k}>
  {P([[dx, y - h], [dx + h * 0.3, y], [dx - h * 0.3, y]], c1)}{P([[dx, y - h], [dx + h * 0.3, y], [dx, y]], c2)}
</g>
const abeti = (lista) => lista.map(([dx, y, h], k) => abete(dx, y, h, k))
// prato ai piedi, uguale per tutte: si raccorda col terreno comune
const piede = (c = '#7FAE63') => P([[-82, 72], [-56, 60], [-20, 64], [20, 58], [56, 62], [82, 72]], c)
// pioppo e cipresso alti
const pioppo = (x, y, h, k) => <g key={k}>{R(x - 0.8, y - h * 0.25, 1.6, h * 0.25, '#6E5A44')}{P([[x - 4, y - h * 0.22], [x - 3, y - h * 0.8], [x, y - h], [x + 3, y - h * 0.8], [x + 4, y - h * 0.22]], '#6E9E4E')}{P([[x, y - h], [x + 3, y - h * 0.8], [x + 4, y - h * 0.22], [x, y - h * 0.22]], '#5A8A3E')}</g>
const cipresso = (x, y, h, k) => <g key={k}>{P([[x, y - h], [x + 3.2, y - h * 0.45], [x + 2.6, y], [x - 2.6, y], [x - 3.2, y - h * 0.45]], '#3A6436')}{P([[x, y - h], [x + 3.2, y - h * 0.45], [x + 2.6, y], [x, y]], '#2E5530')}</g>

/* ================= dalle Alpi (come Bustardo) ================= */
export const Boscosa = () => <>
  {P([[-80, 72], [-30, 24], [-8, 0], [6, -4], [26, 14], [52, 36], [80, 72]], '#6E9A5C')}
  {P([[6, -4], [26, 14], [52, 36], [80, 72], [10, 72]], '#5C8A4C')}
  {P([[-8, 0], [6, -4], [12, 4], [0, 8]], '#8FB27C')}
  {abeti([[-50, 70, 16], [-36, 70, 20], [44, 70, 18], [58, 70, 14], [-22, 52, 14], [30, 56, 14], [-4, 40, 12]])}
</>
export const Rocciosa = () => <>
  {P([[-80, 72], [-44, 34], [-20, 12], [-4, -6], [10, 2], [36, 26], [60, 44], [82, 72]], '#A5AFB8')}
  {P([[-4, -6], [10, 2], [36, 26], [60, 44], [82, 72], [8, 72]], '#8E99A4')}
  {P([[-20, 12], [-4, -6], [10, 2], [4, 8], [-6, 4], [-12, 14]], '#FFFFFF')}
  {piede()}
</>
export const Dolomitica = () => <>
  {P([[-80, 72], [-50, 40], [-36, 12], [-28, 14], [-20, 30], [-10, -2], [-2, -6], [6, 22], [18, 8], [26, 10], [40, 40], [80, 72]], '#DCCBC0')}
  {P([[-10, -2], [-2, -6], [6, 22], [-6, 46]], '#C4AFA2')}{P([[18, 8], [26, 10], [40, 40], [24, 50]], '#C4AFA2')}
  {P([[-10, -2], [-2, -6], [-3, 0], [-9, 1]], '#ECCDC4')}
  {P([[-80, 72], [-44, 54], [0, 58], [40, 52], [80, 72]], '#3E6A44')}
  {abeti([[-56, 70, 16], [-42, 70, 20], [-28, 70, 16], [34, 70, 18], [48, 70, 22], [62, 70, 16]])}
</>
export const Cuneo = () => <>
  {P([[-80, 72], [-40, 40], [-14, 10], [4, -8], [12, -6], [34, 30], [80, 72]], '#D6C7BC')}
  {P([[4, -8], [12, -6], [34, 30], [80, 72], [16, 72]], '#BFAB9C')}
  {P([[4, -8], [12, -6], [10, 0], [2, 0]], '#F2E6E0')}
  {[-30, -18, 22].map((x, k) => R(x, 30 + k * 6, 0.8, 18, '#B09A8A', k))}
  {piede('#3E6A44')}
  {abeti([[-60, 70, 14], [-48, 70, 18], [50, 70, 16], [64, 70, 14]])}
</>
export const Ghiacciaio = () => <>
  {P([[-80, 72], [-50, 30], [-26, 2], [-10, 18], [6, -6], [30, 20], [56, 40], [80, 72]], '#A9B7C6')}
  {P([[6, -6], [30, 20], [56, 40], [80, 72], [12, 72]], '#95A5B6')}
  {P([[-36, 12], [-26, 2], [-16, 12], [-10, 18], [-2, 4], [6, -6], [18, 6], [10, 12], [0, 24], [-12, 26], [-24, 16]], '#FFFFFF')}
  {P([[-10, 18], [0, 24], [-4, 40], [-14, 36]], '#E6EEF5')}
  {piede()}
</>
export const RupeCastello = () => <>
  {P([[-80, 72], [-52, 50], [-30, 20], [-18, 4], [18, 4], [30, 22], [54, 48], [80, 72]], '#B7B2A6')}
  {P([[18, 4], [30, 22], [54, 48], [80, 72], [20, 72]], '#A39E92')}
  {R(-6, -10, 12, 16, '#D8CDB4')}{R(2, -10, 4, 16, '#C6B795')}<Merli x={-6} y={-10} w={12} c="#D8CDB4" />
  {R(-18, 0, 36, 6, '#CFC2A5')}<Merli x={-18} y={0} w={36} c="#CFC2A5" />
  {R(-2, -4, 2.4, 3.5, '#6E6252')}
  {piede()}
  {abeti([[-58, 70, 14], [-44, 70, 16], [46, 70, 16], [60, 70, 12]])}
</>
export const ColleChiesa = () => <>
  {P([[-80, 72], [-44, 34], [-16, 10], [16, 8], [44, 30], [80, 72]], '#8DB86A')}
  {P([[16, 8], [44, 30], [80, 72], [20, 72]], '#7AA65A')}
  {R(-14, 0, 22, 10, '#EEE6D4')}{P([[-16, 0], [-3, -6], [10, 0]], '#A64B2F')}
  {R(8, -12, 6, 22, '#E4DDCB')}{P([[7, -12], [11, -20], [15, -12]], '#7D6A58')}{R(10, -8, 2, 3, '#6E6252')}
  {[[-30, 36, 16], [-22, 30, 14], [30, 30, 14], [38, 36, 16]].map(([x, y, h], k) => cipresso(x, y, h, k))}
  {piede('#9CC27A')}
</>
export const BoscoAlto = () => <>
  {P([[-80, 72], [-46, 34], [-14, 10], [14, 8], [46, 32], [80, 72]], '#3E6A44')}
  {abeti([[-60, 70, 22], [-48, 66, 26], [-36, 58, 28], [-24, 48, 30], [-12, 38, 34], [0, 34, 40], [12, 38, 34], [24, 48, 30], [36, 58, 28], [48, 66, 24], [60, 70, 20],
    [-30, 70, 20], [-6, 70, 24], [18, 70, 22], [42, 70, 18]])}
</>
export const ParetCascata = () => <>
  {P([[-80, 72], [-46, 30], [-24, 2], [-8, -6], [12, -4], [30, 12], [54, 40], [80, 72]], '#9AA59A')}
  {P([[12, -4], [30, 12], [54, 40], [80, 72], [14, 72]], '#87928A')}
  {P([[-6, 4], [6, 4], [8, 66], [-8, 66]], '#CFE8F2')}
  {[-3, 1, 4].map((x, k) => R(x, 6, 0.9, 58, '#FFFFFF', k))}
  {C(0, 66, 9, '#E8F4F8')}
  {piede('#5E8A4A')}
  {abeti([[-56, 70, 18], [-42, 70, 22], [44, 70, 20], [58, 70, 16]])}
</>

/* ================= ferroviarie e d'Italia (Trenitardo) ================= */
// galleria: il portale di un tunnel in una montagna boscosa
export const Galleria = () => <>
  {P([[-80, 72], [-40, 30], [-12, 2], [8, -6], [30, 12], [56, 38], [80, 72]], '#7E9A6A')}
  {P([[8, -6], [30, 12], [56, 38], [80, 72], [12, 72]], '#6B8758')}
  {P([[-12, 2], [8, -6], [10, 4], [-4, 10]], '#9DB58A')}
  {abeti([[-46, 46, 14], [-30, 34, 14], [34, 30, 12], [48, 44, 14], [-14, 22, 12]])}
  {/* portale in pietra con l'arco nero */}
  {R(-22, 40, 44, 32, '#BDB4A3')}{R(-24, 38, 48, 4, '#A99F8C')}
  <path d="M-14,72 V56 A14,14 0 0 1 14,56 V72 Z" fill="#1E2328" />
  {[-20, -10, 0, 10].map((x, k) => R(x, 43, 8, 1, '#A99F8C', k))}
  {piede('#7FAE63')}
</>
// viadotto in muratura con le arcate alte, davanti a un colle boscoso
export const Viadotto = () => <>
  {P([[-80, 72], [-44, 26], [-14, 0], [12, -6], [40, 18], [80, 72]], '#4F7A44')}
  {abeti([[-40, 40, 14], [-20, 22, 14], [16, 14, 12], [34, 28, 14]])}
  {/* impalcato e pile */}
  {R(-80, 24, 160, 7, '#C9B79A')}{R(-80, 22, 160, 2, '#B3A182')}
  {[-80, -46, -12, 22, 56].map((x, k) => <path key={k} d={`M${x},31 h24 v41 h-3 v-26 a9,13 0 0 0 -18,0 v26 h-3 z`} fill="#D6C6A8" />)}
  {[-80, -46, -12, 22, 56].map((x, k) => R(x + 16, 31, 8, 41, '#C2B08F', 'o' + k))}
  {piede('#5E8A4A')}
  {abeti([[-64, 72, 14], [-30, 72, 16], [4, 72, 14], [38, 72, 16], [70, 72, 12]])}
</>
// casello ferroviario con la torre dell'acqua
export const Casello = () => <>
  {P([[-80, 72], [-50, 46], [-10, 34], [30, 38], [80, 72]], '#9CC27A')}
  {/* torre dell'acqua al centro */}
  {R(-4, 10, 8, 62, '#B5532F')}{R(1, 10, 3, 62, '#9A4426')}
  {R(-12, -6, 24, 16, '#7E8A92')}{R(4, -6, 8, 16, '#6A757D')}{P([[-14, -6], [0, -14], [14, -6]], '#5A6268')}
  {/* fabbricato col tetto e la pensilina */}
  {R(-56, 40, 44, 32, '#E8C98E')}{R(-24, 40, 12, 32, '#D6B47A')}{P([[-60, 41], [-34, 30], [-8, 41]], '#9A4426')}
  {[-50, -40, -30].map((x, k) => <g key={k}>{R(x, 48, 5, 7, '#6B4A33')}{R(x, 60, 5, 9, '#6B4A33')}</g>)}
  {R(-60, 56, 52, 2, '#5A6268')}
  {R(14, 50, 30, 22, '#EAD8B6')}{P([[12, 51], [29, 44], [46, 51]], '#B5532F')}{R(24, 58, 6, 14, '#6B4A33')}
  {piede('#9CC27A')}
  {[[-70, 72, 18], [58, 72, 20], [70, 72, 16]].map(([x, y, h], k) => pioppo(x, y, h, k))}
</>
// faro su un promontorio roccioso
export const Faro = () => <>
  {P([[-80, 72], [-56, 52], [-30, 34], [-10, 24], [14, 22], [36, 36], [60, 54], [80, 72]], '#A89F92')}
  {P([[14, 22], [36, 36], [60, 54], [80, 72], [16, 72]], '#938A7E')}
  {P([[-30, 34], [-10, 24], [-14, 30], [-28, 38]], '#7FA65A')}
  {/* faro a strisce */}
  {P([[-6, 24], [6, 24], [4, -2], [-4, -2]], '#F4F1EA')}
  {P([[-5.4, 16], [5.4, 16], [5, 10], [-5, 10]], '#C8202A')}{P([[-4.6, 4], [4.6, 4], [4.3, -1], [-4.3, -1]], '#C8202A')}
  {R(-6, -8, 12, 7, '#3A4650')}{R(-4.5, -7, 9, 5, '#FFE7A0')}{P([[-7, -8], [0, -13], [7, -8]], '#2E3236')}
  {R(-12, 18, 10, 6, '#EAE4D6')}{P([[-13, 18], [-7, 14], [-1, 18]], '#9A4426')}
  {piede('#8FB27C')}
</>
// filare fitto di pioppi (pianura padana, risaie)
export const Filare = () => <>
  {P([[-80, 72], [-50, 62], [0, 58], [50, 62], [80, 72]], '#9DC27A')}
  {[[-66, 72, 40], [-54, 72, 52], [-42, 72, 62], [-30, 72, 70], [-18, 72, 78], [-6, 72, 82], [6, 72, 84], [18, 72, 78], [30, 72, 70], [42, 72, 62], [54, 72, 52], [66, 72, 42]]
    .map(([x, y, h], k) => pioppo(x, y, h, k))}
</>
// cipressi su un poggio (Toscana, Umbria)
export const Cipressi = () => <>
  {P([[-80, 72], [-50, 46], [-18, 32], [18, 30], [50, 44], [80, 72]], '#C4C77E')}
  {P([[18, 30], [50, 44], [80, 72], [20, 72]], '#B2B66C')}
  {R(-30, 22, 26, 12, '#EAD8B6')}{P([[-33, 23], [-17, 15], [-1, 23]], '#B5532F')}{R(-24, 26, 4, 5, '#6B4A33')}
  {[[-46, 50, 30], [-40, 46, 36], [2, 32, 46], [8, 32, 52], [14, 32, 44], [44, 48, 34], [52, 54, 28]].map(([x, y, h], k) => cipresso(x, y, h, k))}
  {piede('#B8C878')}
</>
// silo e capannone agricolo (pianura, Puglia)
export const Silo = () => <>
  {P([[-80, 72], [-40, 60], [30, 58], [80, 72]], '#C9C58E')}
  {R(-48, 42, 40, 30, '#C7CDD2')}{P([[-52, 43], [-28, 30], [-4, 43]], '#9AA3AB')}{R(-38, 54, 18, 18, '#7E8A92')}
  {R(-6, -2, 14, 74, '#D9DDE0')}{R(3, -2, 5, 74, '#C2C8CC')}<path d="M-6,-2 a7,6 0 0 1 14,0 z" fill="#B7BEC4" />
  {R(10, 8, 12, 64, '#D9DDE0')}{R(18, 8, 4, 64, '#C2C8CC')}<path d="M10,8 a6,5 0 0 1 12,0 z" fill="#B7BEC4" />
  {[-4, 12].map((x, k) => R(x, 20, 2, 46, '#B7BEC4', k))}
  {piede('#C2C27E')}
  {[[40, 72, 14], [54, 72, 18], [66, 72, 12]].map(([x, y, h], k) => <g key={k}>{R(x - 1, y - 6, 2, 6, '#8A7050')}{P([[x - 8, y - 6], [x - 3, y - h], [x + 6, y - h], [x + 9, y - 7]], '#9DAE7E')}</g>)}
</>
// isolato di palazzi alti con una torre (città)
export const Palazzi = () => <>
  {[[-74, 30, 22, '#B9C4CE'], [-52, 14, 20, '#A9B6C3'], [-32, 22, 18, '#C4CDD5'], [-14, -10, 24, '#9FADBB'], [10, 6, 20, '#B4C0CB'], [30, 18, 22, '#A6B3C0'], [52, 32, 24, '#BFC9D2']]
    .map(([x, y, w, c], k) => <g key={k}>{R(x, y, w, 72 - y, c)}{R(x + w * 0.62, y, w * 0.38, 72 - y, '#8F9EAD')}
      {Array.from({ length: Math.floor((66 - y) / 8) }, (_, r) => R(x + 3, y + 5 + r * 8, w * 0.56, 2.5, '#E3EAF0', r))}</g>)}
  {R(-3, -18, 2, 8, '#8F9EAD')}
  {piede('#A9C98A')}
</>

export const GIUNZIONI = { Boscosa, Rocciosa, Dolomitica, Cuneo, Ghiacciaio, RupeCastello, ColleChiesa, BoscoAlto, ParetCascata, Galleria, Viadotto, Casello, Faro, Filare, Cipressi, Silo, Palazzi }

// giunzioni adatte a ogni scena (chiave della tessera in Paesaggi.jsx)
const ALPINE = [Rocciosa, Ghiacciaio, Boscosa, Galleria, ParetCascata]
const DOLOMITICHE = [Dolomitica, Cuneo, Boscosa, Galleria, RupeCastello, BoscoAlto]
const COLLINARI = [ColleChiesa, Cipressi, Viadotto, Casello, Galleria]
const MARINE = [Faro, Galleria, Viadotto]
const PIANE = [Filare, Silo, Casello]
const URBANE = [Palazzi, Casello, Viadotto]
const PER_SCENA = {
  alpi: ALPINE, dolomiti: DOLOMITICHE, colline: COLLINARI, mare: MARINE, puglia: [Silo, Casello, Faro], citta: URBANE,
  paese: [ColleChiesa, Casello, Viadotto, BoscoAlto], risaie: PIANE, vulcano: [Boscosa, Viadotto, Galleria],
  pisa: COLLINARI, pontevecchio: COLLINARI, colosseo: [Palazzi, ColleChiesa, Cipressi], mole: [Palazzi, Casello, Rocciosa],
  duomo: URBANE, sanmarco: [Casello, Filare, Palazzi],
  duomotrento: [Dolomitica, Boscosa, Palazzi, RupeCastello], doss: DOLOMITICHE, buonconsiglio: [RupeCastello, Dolomitica, Galleria], albere: [Palazzi, Boscosa, Dolomitica],
}

// generatore deterministico (stesso treno → stesse giunzioni)
function rng(seed) {
  let h = 0x9e3779b9 ^ 0
  for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0 }
  return () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296 }
}

// una giunzione all'inizio di ogni scena (anche della prima: la striscia si ripete). Scelta fra
// quelle adatte alla scena prima e a quella dopo; mai due uguali di fila (neanche fra l'ultima e
// la prima, dove la striscia ricomincia). `chiavi`: le chiavi delle scene in ordine.
export function giunzioniDi(chiavi, seed) {
  const r = rng(seed)
  const n = chiavi.length
  const out = []
  for (let i = 0; i < n; i++) {
    const prima = PER_SCENA[chiavi[(i + n - 1) % n]] || COLLINARI
    const dopo = PER_SCENA[chiavi[i]] || COLLINARI
    let pool = [...new Set([...dopo, ...prima])]
    const vieta = [out[i - 1], i === n - 1 ? out[0] : null].filter(Boolean)
    const ok = pool.filter((g) => !vieta.includes(g))
    if (ok.length) pool = ok
    out.push(pool[Math.floor(r() * pool.length)])
  }
  return out
}
