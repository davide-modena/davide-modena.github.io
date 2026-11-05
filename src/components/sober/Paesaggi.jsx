// Copiato da trenitardo/app/src/components/sober/Paesaggi.jsx, senza il castello di Sabbionara.
// Tessere di paesaggio low poly per l'hero "Sobrio": 240 x 80, il terreno arriva a y=80
// (lì passano i binari). Ogni tessera è un pezzo d'Italia; i bordi a sinistra e a destra
// stanno sulla stessa quota (prato a y≈70) così si accostano in qualsiasi ordine.
// Nel tema scuro i colori si abbassano via CSS (filter), qui sono quelli di giorno.

const P = (pts, fill, k) => <polygon key={k} points={pts.map((p) => p.join(',')).join(' ')} fill={fill} />
const R = (x, y, w, h, fill, k) => <rect key={k} x={x} y={y} width={w} height={h} fill={fill} />

// prato di base comune: ondulato ma con i bordi a y=70
const Prato = ({ c1 = '#B9D98C', c2 = '#A6CE72' }) => <>
  {P([[0, 70], [60, 64], [120, 70], [180, 65], [240, 70], [240, 80], [0, 80]], c1)}
  {P([[60, 64], [120, 70], [60, 80]], c2)}
  {P([[180, 65], [240, 70], [180, 80]], c2)}
</>

// cipresso / albero tondo / ulivo
const Cipresso = ({ x, y = 70, h = 26 }) => <>
  {P([[x, y - h], [x + 4, y], [x - 4, y]], '#3F6B3A')}
  {P([[x, y - h], [x + 4, y], [x, y]], '#2F5530')}
</>
const Albero = ({ x, y = 70, r = 9 }) => <>
  {R(x - 1, y - 6, 2, 6, '#7A5A3A')}
  {P([[x - r, y - 6], [x, y - 6 - r * 1.6], [x + r, y - 6]], '#6FA65A')}
  {P([[x, y - 6 - r * 1.6], [x + r, y - 6], [x, y - 6]], '#5A8F4A')}
</>
const Ulivo = ({ x, y = 70 }) => <>
  {R(x - 1, y - 7, 2, 7, '#8A7050')}
  {P([[x - 9, y - 7], [x - 4, y - 15], [x + 5, y - 16], [x + 10, y - 8]], '#9DAE7E')}
  {P([[x + 5, y - 16], [x + 10, y - 8], [x, y - 8]], '#86996A')}
</>

/* ---- Alpi: picchi innevati ---- */
const Alpi = () => <>
  {P([[0, 70], [30, 30], [58, 52], [96, 8], [134, 46], [164, 22], [204, 56], [240, 70]], '#A9B7C6')}
  {P([[30, 30], [58, 52], [30, 70]], '#95A5B6')}
  {P([[96, 8], [134, 46], [96, 70]], '#95A5B6')}
  {P([[164, 22], [204, 56], [164, 70]], '#95A5B6')}
  {P([[96, 8], [108, 20], [100, 24], [92, 18], [86, 20]], '#FFFFFF')}
  {P([[164, 22], [173, 31], [166, 33], [158, 30]], '#FFFFFF')}
  {P([[30, 30], [37, 39], [30, 41], [24, 38]], '#FFFFFF')}
  {P([[0, 70], [50, 52], [110, 66], [170, 50], [240, 70]], '#8DBB6A')}
  <Prato />
  <Albero x={70} /><Albero x={84} r={7} /><Albero x={196} />
</>

/* ---- Colline toscane: dolci, con cipressi e casale ---- */
const Colline = () => <>
  {P([[0, 70], [50, 44], [110, 58], [170, 38], [240, 62], [240, 70]], '#D7CC8A')}
  {P([[50, 44], [110, 58], [50, 70]], '#CBBE74')}
  {P([[170, 38], [240, 62], [170, 70]], '#CBBE74')}
  <Prato c1="#C4D88A" c2="#B2C977" />
  {/* casale */}
  {R(118, 46, 26, 14, '#E8D2A8')}
  {P([[114, 47], [131, 38], [148, 47]], '#B5532F')}
  {R(124, 51, 4, 5, '#6B4A33')}{R(134, 51, 4, 5, '#6B4A33')}
  {[150, 160, 170, 180, 190].map((x, i) => <Cipresso key={i} x={x} y={58 + i * 1.5} h={20} />)}
  <Cipresso x={30} /><Cipresso x={40} h={22} />
</>

/* ---- Mare: costa con case colorate liguri ---- */
const Mare = () => <>
  {/* mare a tutta larghezza con la battigia: ai bordi sfuma da solo (vedi Tessera) */}
  {R(0, 56, 240, 14, '#6FB2D8')}
  {R(0, 56, 240, 3, '#8FC6E4')}
  {R(0, 67, 240, 3, '#E8D9A8')}
  {P([[40, 66], [70, 64], [110, 67]], '#5BA2CB')}
  {P([[130, 63], [170, 61], [200, 64]], '#5BA2CB')}
  {/* promontorio con case */}
  {P([[150, 70], [170, 44], [214, 40], [240, 56], [240, 70]], '#8DAA6A')}
  {[[172, 42, '#E8A94A'], [182, 38, '#D76A4A'], [192, 40, '#F0D38A'], [202, 36, '#C9604C'], [212, 42, '#E8C27A']].map(([x, y, c], i) => <g key={i}>
    {R(x, y - 8, 9, 14, c)}
    {P([[x - 1, y - 8], [x + 4.5, y - 12], [x + 10, y - 8]], '#9A4A34')}
    {R(x + 3, y - 4, 3, 3, '#4A4A4A')}
  </g>)}
  {/* barca a vela */}
  {P([[60, 60], [72, 60], [70, 63], [62, 63]], '#FFFFFF')}
  {P([[66, 60], [66, 48], [74, 59]], '#FFFFFF')}
  <Prato />
</>

/* ---- Puglia: trulli e ulivi ---- */
const Trullo = ({ x, s = 1 }) => <>
  {R(x - 9 * s, 70 - 14 * s, 18 * s, 14 * s, '#F4F1E8')}
  {R(x + 5 * s, 70 - 14 * s, 4 * s, 14 * s, '#E2DDD0')}
  {P([[x - 10 * s, 70 - 14 * s], [x, 70 - 30 * s], [x + 10 * s, 70 - 14 * s]], '#8E8A84')}
  {P([[x, 70 - 30 * s], [x + 10 * s, 70 - 14 * s], [x, 70 - 14 * s]], '#77736E')}
  <circle cx={x} cy={70 - 31 * s} r={1.6 * s} fill="#F4F1E8" />
  {R(x - 3 * s, 70 - 8 * s, 6 * s, 8 * s, '#6B5A48')}
</>
const Puglia = () => <>
  {P([[0, 70], [80, 58], [160, 62], [240, 56], [240, 70]], '#D8CFA0')}
  <Prato c1="#CFC98E" c2="#BDB77A" />
  <Trullo x={60} /><Trullo x={82} s={0.8} /><Trullo x={150} s={1.1} />
  <Ulivo x={20} /><Ulivo x={110} /><Ulivo x={124} /><Ulivo x={200} /><Ulivo x={220} />
</>

/* ---- Città: grattacieli ---- */
const Citta = () => {
  const torri = [[14, 30, 22], [40, 14, 20], [64, 36, 18], [86, 6, 24], [114, 26, 16], [134, 18, 22], [160, 40, 20], [184, 10, 18], [206, 32, 24]]
  return <>
    {torri.map(([x, y, w], i) => <g key={i}>
      {R(x, y, w, 70 - y, i % 2 ? '#B8C4CF' : '#A9B6C3')}
      {P([[x + w * 0.6, y], [x + w, y], [x + w, 70], [x + w * 0.6, 70]], i % 2 ? '#9DABB9' : '#8F9EAD')}
      {Array.from({ length: Math.floor((66 - y) / 8) }, (_, k) => R(x + 3, y + 5 + k * 8, w * 0.6 - 5, 2.5, '#DCE5EE', k))}
    </g>)}
    {/* guglia */}
    {P([[95, 6], [98, -4], [101, 6]], '#8F9EAD')}
    <Prato c1="#A9C98A" c2="#97BA77" />
  </>
}

/* ---- Paese: case con tetti in coppi e campanile ---- */
const Paese = () => {
  const case_ = [[20, 50, 24, '#EBD9B4'], [46, 54, 20, '#E7B98A'], [104, 48, 26, '#F0E2C2'], [132, 53, 22, '#D99A74'], [176, 50, 24, '#EAD3A2'], [202, 55, 20, '#E2C29A']]
  return <>
    {P([[0, 70], [60, 50], [140, 58], [240, 46], [240, 70]], '#A8C882')}
    {case_.map(([x, y, w, c], i) => <g key={i}>
      {R(x, y, w, 70 - y, c)}
      {P([[x - 2, y], [x + w / 2, y - 9], [x + w + 2, y]], '#B5532F')}
      {P([[x + w / 2, y - 9], [x + w + 2, y], [x + w / 2, y]], '#9A4426')}
      {R(x + 4, y + 5, 4, 4, '#5A4A3A')}{R(x + w - 8, y + 5, 4, 4, '#5A4A3A')}
    </g>)}
    {/* campanile */}
    {R(78, 22, 14, 48, '#E5D3AE')}
    {R(87, 22, 5, 48, '#D2BE96')}
    {R(81, 30, 8, 8, '#6B5A48')}
    {P([[76, 22], [85, 10], [94, 22]], '#9A4426')}
    <Prato />
  </>
}

/* ---- Vulcano (Campania/Sicilia) ---- */
const Vulcano = () => <>
  {P([[10, 70], [100, 14], [124, 14], [230, 70]], '#9C8E86')}
  {P([[112, 14], [124, 14], [230, 70], [140, 70]], '#857770')}
  {P([[100, 14], [112, 20], [124, 14], [112, 12]], '#6E625C')}
  {/* fumo */}
  <circle cx={116} cy={6} r={5} fill="#E6E6E6" /><circle cx={124} cy={0} r={6} fill="#EFEFEF" /><circle cx={134} cy={-4} r={5} fill="#F5F5F5" />
  <Prato c1="#B5CF86" c2="#A0BD70" />
  <Albero x={30} /><Albero x={210} r={8} />
</>

/* ---------------- Monumenti (rari) ---------------- */
const Pisa = () => <>
  <Prato />
  <g transform="rotate(5 120 70)">
    {R(108, 14, 24, 56, '#F2EFE6')}
    {R(124, 14, 8, 56, '#DCD7C8')}
    {[22, 30, 38, 46, 54, 62].map((y, i) => R(108, y, 24, 1.5, '#C9C2AE', i))}
    {R(111, 6, 18, 8, '#EAE5D8')}
  </g>
  <Cipresso x={60} /><Cipresso x={176} /><Cipresso x={186} h={20} />
</>
const Colosseo = () => {
  // ellisse vista di tre quarti: anelli di archi che seguono la curva, lato destro crollato più basso
  const archi = []
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 11; k++) {
      const t = (k + 0.5) / 11 // 0..1 lungo la facciata
      const x = 52 + t * 136
      const bomb = Math.sin(t * Math.PI) // pancia: al centro la facciata è più alta e gli archi più larghi
      const top = 30 - bomb * 8 + r * 13
      if (t > 0.78 && r === 0) continue // crollo dell'anello alto sul lato destro
      archi.push(<path key={`${r}-${k}`} d={`M${x - 3.5 - bomb * 1.5},${top + 10} v-6 a${3.5 + bomb * 1.5},3.5 0 0 1 ${7 + bomb * 3},0 v6 z`} fill="#9A7E58" />)
    }
  }
  return <>
    <Prato c1="#C4D88A" c2="#B2C977" />
    {/* corpo ellittico */}
    <path d="M50,70 L50,30 Q120,10 190,28 L190,40 Q176,38 166,44 L166,70 Z" fill="#D9BE92" />
    <path d="M166,44 Q176,38 190,40 L192,70 L166,70 Z" fill="#C3A67A" />
    <path d="M50,30 Q120,10 190,28 L190,32 Q120,15 50,34 Z" fill="#E6CFA6" />
    <path d="M50,48 Q120,30 190,46 L190,47.5 Q120,32 50,49.5 Z" fill="#C3A67A" />
    <path d="M50,61 Q120,43 190,59 L190,60.5 Q120,45 50,62.5 Z" fill="#C3A67A" />
    {archi}
    {/* interno visibile dal crollo */}
    <path d="M166,44 Q176,36 190,40 L186,46 Q176,44 168,48 Z" fill="#A8885E" />
  </>
}
const Mole = () => <>
  <Prato />
  {R(96, 46, 48, 24, '#E6DCC6')}
  {P([[96, 46], [120, 20], [144, 46]], '#B8B0A0')}
  {P([[120, 20], [144, 46], [120, 46]], '#A39A88')}
  {P([[118, 20], [120, -6], [122, 20]], '#A39A88')}
  {[100, 110, 126, 136].map((x, i) => R(x, 52, 4, 12, '#9A8E78', i))}
  <Albero x={60} /><Albero x={180} />
</>

/* ---- Dolomiti: torri di roccia chiara, rosate ---- */
const Dolomiti = () => <>
  {P([[0, 70], [14, 34], [22, 38], [30, 14], [38, 16], [46, 40], [58, 30], [66, 8], [74, 6], [82, 36], [100, 50], [120, 54], [140, 26], [148, 12], [156, 14], [164, 30], [176, 22], [184, 4], [192, 6], [200, 34], [220, 46], [240, 70]], '#D9CBBE')}
  {P([[30, 14], [38, 16], [46, 40], [34, 56]], '#C2AE9E')}
  {P([[66, 8], [74, 6], [82, 36], [70, 56]], '#C2AE9E')}
  {P([[148, 12], [156, 14], [164, 30], [150, 54]], '#C2AE9E')}
  {P([[184, 4], [192, 6], [200, 34], [186, 54]], '#C2AE9E')}
  {P([[66, 8], [74, 6], [72, 12], [66, 13]], '#E9C9C0')}
  {P([[184, 4], [192, 6], [190, 10], [184, 11]], '#E9C9C0')}
  {P([[0, 70], [40, 50], [90, 60], [140, 46], [200, 58], [240, 70]], '#7FAE63')}
  <Prato />
  {[20, 30, 108, 118, 128, 214].map((x, i) => <Albero key={i} x={x} r={6} />)}
</>

/* ---- Risaie: campi allagati che riflettono il cielo, filari di pioppi ---- */
const Risaie = () => <>
  {P([[0, 70], [0, 54], [240, 54], [240, 70]], '#BFD9A0')}
  {[[0, 56, 70], [74, 57, 80], [158, 56, 82]].map(([x, y, w], i) => <g key={i}>
    {R(x + 2, y, w - 4, 8, '#BFE0F0')}
    {R(x + 2, y, w - 4, 2, '#DDEFF8')}
    {Array.from({ length: Math.floor(w / 8) }, (_, k) => R(x + 6 + k * 8, y + 2, 1.2, 4, '#7FB35C', k))}
  </g>)}
  {[10, 22, 34, 46, 190, 202, 214, 226].map((x, i) => <g key={i}>
    {R(x - 0.8, 42, 1.6, 12, '#7A5A3A')}
    {P([[x - 3.5, 46], [x, 20], [x + 3.5, 46]], '#7FAE5A')}
    {P([[x, 20], [x + 3.5, 46], [x, 46]], '#6A984A')}
  </g>)}
  {/* cascina */}
  {R(104, 38, 34, 16, '#EAD8B6')}{P([[100, 39], [121, 30], [142, 39]], '#B5532F')}
  {R(110, 44, 5, 6, '#6B4A33')}{R(126, 44, 5, 6, '#6B4A33')}
  {P([[0, 70], [80, 66], [160, 68], [240, 70], [240, 80], [0, 80]], '#A6CE72')}
</>

/* ---- Milano: Duomo gotico con guglie ---- */
const Duomo = () => {
  const guglie = [70, 82, 94, 106, 134, 146, 158, 170]
  return <>
    <Prato />
    {R(66, 36, 108, 34, '#F1ECE2')}
    {P([[66, 36], [120, 16], [174, 36]], '#E4DCCC')}
    {P([[120, 16], [174, 36], [120, 36]], '#D3C9B5')}
    {guglie.map((x, i) => <g key={i}>{R(x - 1.5, 22, 3, 14, '#E4DCCC')}{P([[x - 2, 22], [x, 12], [x + 2, 22]], '#D3C9B5')}</g>)}
    {R(118, 2, 4, 14, '#E4DCCC')}{P([[117, 2], [120, -8], [123, 2]], '#D8B44A')}
    {[78, 98, 142, 162].map((x, i) => <path key={i} d={`M${x - 4},66 v-14 a4,5 0 0 1 8,0 v14 z`} fill="#8E8676" />)}
    <path d="M113,70 v-20 a7,8 0 0 1 14,0 v20 z" fill="#6E6656" />
    <circle cx={120} cy={32} r={4} fill="#B9AE98" />
  </>
}

/* ---- Firenze: Ponte Vecchio sull'Arno ---- */
const PonteVecchio = () => <>
  {R(0, 58, 240, 12, '#7FA9A0')}
  {R(0, 58, 240, 2, '#9BC2B8')}
  {/* ponte con tre arcate */}
  <path d="M30,58 L30,42 L210,42 L210,58 L190,58 A22,12 0 0 0 150,58 L140,58 A20,12 0 0 0 100,58 L90,58 A22,12 0 0 0 50,58 Z" fill="#D9B98A" />
  {/* botteghe sopra */}
  {[[34, 26, '#E8C27A'], [52, 30, '#E3A86A'], [68, 24, '#F0D38A'], [86, 30, '#D99A74'], [104, 22, '#E8C27A'], [122, 28, '#E3A86A'], [140, 26, '#F0D38A'], [158, 30, '#D99A74'], [176, 24, '#E8C27A'], [192, 28, '#E3A86A']].map(([x, y, c], i) => <g key={i}>
    {R(x, y, 16, 42 - y, c)}
    {P([[x - 1, y], [x + 8, y - 4], [x + 17, y]], '#A8502F')}
    {R(x + 4, y + 4, 3, 4, '#5A4A3A')}{R(x + 10, y + 4, 3, 4, '#5A4A3A')}
  </g>)}
  {R(30, 40, 180, 2.5, '#B89A6A')}
  <Prato c1="#B5CF86" c2="#A0BD70" />
</>

/* ---- Venezia: piazza San Marco, campanile e basilica sulla laguna ---- */
const SanMarco = () => <>
  {R(0, 60, 240, 10, '#7FB6C9')}
  {R(0, 60, 240, 1.5, '#A4CEDC')}
  {/* basilica: facciata con cupole */}
  {R(110, 40, 90, 20, '#EADBC0')}
  {[124, 146, 168, 188].map((x, i) => <g key={i}>
    <path d={`M${x - 8},40 a8,8 0 0 1 16,0 z`} fill="#B8C7C2" />
    {R(x - 0.6, 28, 1.2, 4, '#C9A44A')}
    <path d={`M${x - 5},58 v-8 a5,5 0 0 1 10,0 v8 z`} fill="#8E7A5A" />
  </g>)}
  <path d="M136,40 a10,12 0 0 1 20,0 z" fill="#C7D3CF" />
  {/* campanile */}
  {R(70, 12, 16, 48, '#C9785A')}
  {R(80, 12, 6, 48, '#B0644A')}
  {R(70, 6, 16, 8, '#EADBC0')}{R(73, 8, 3, 5, '#6E5A48')}{R(80, 8, 3, 5, '#6E5A48')}
  {P([[69, 6], [78, -10], [87, 6]], '#7E9A86')}
  {R(77.4, -14, 1.2, 5, '#C9A44A')}
  {/* gondola */}
  <path d="M20,64 q20,4 40,0 l2,-3 q-22,5 -44,0 z" fill="#1E2328" />
  {P([[0, 70], [80, 68], [160, 69], [240, 70], [240, 80], [0, 80]], '#A6CE72')}
</>

const Merli = ({ x, y, w, c }) => <>{Array.from({ length: Math.floor(w / 4) }, (_, k) => R(x + k * 4, y - 2, 2.2, 2.2, c, k))}</>
// tinta più scura di un colore esadecimale (le ombre: l'esportazione Android non ha trasparenze)
const scuro = (hex, f = 0.1) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - f)).toString(16).padStart(2, '0')).join('')
// casa del paese: muro, tetto a due falde, due finestre
const Casa = ({ x, y, w, h, muro, tetto }) => <>
  {R(x, y, w, h, muro)}{R(x + w * 0.55, y, w * 0.45, h, scuro(muro, 0.08))}
  {P([[x - 1.5, y], [x + w / 2, y - 6], [x + w + 1.5, y]], tetto)}{P([[x + w / 2, y - 6], [x + w + 1.5, y], [x + w / 2, y]], scuro(tetto, 0.18))}
  {R(x + w * 0.2, y + 3, 2.4, 3.6, '#6E6252')}{R(x + w * 0.6, y + 3, 2.4, 3.6, '#6E6252')}
</>
const MontiTrento = () => <>
  {P([[0, 70], [0, 34], [40, 22], [84, 30], [130, 16], [176, 28], [214, 20], [240, 26], [240, 70]], '#8FAF84')}
  {P([[40, 22], [84, 30], [60, 44]], '#7E9E74')}{P([[130, 16], [176, 28], [150, 42]], '#7E9E74')}
  {P([[124, 20], [130, 16], [138, 22], [130, 26]], '#B9C4B4')}
</>

/* ---- Piazza Duomo: Torre Civica, Palazzo Pretorio merlato, Duomo romanico col tiburio e il campanile a cipolla ---- */
const DuomoTrento = () => <>
  <MontiTrento />
  {/* Torre Civica */}
  {R(26, 6, 18, 64, '#E4DDCB')}{R(38, 6, 6, 64, '#CFC6B0')}
  {R(24, 2, 22, 6, '#DCD4C0')}<Merli x={24} y={2} w={22} c="#DCD4C0" />
  {R(29, 22, 9, 9, '#C9A44A')}<circle cx={33.5} cy={26.5} r={3.2} fill="#F3EBD2" />
  {R(31, 10, 6, 7, '#6E6252')}
  {/* Palazzo Pretorio */}
  {R(44, 38, 56, 32, '#E8E1CF')}{R(88, 38, 12, 32, '#D3CAB4')}
  <Merli x={44} y={38} w={56} c="#E8E1CF" />
  {[50, 60, 70, 80].map((x, i) => <g key={i}>{R(x, 46, 4, 6, '#7A6C58')}{R(x, 57, 4, 6, '#7A6C58')}</g>)}
  {R(66, 44, 2, 22, '#B5352F')}
  {/* Duomo */}
  {R(112, 38, 74, 32, '#EEE8DA')}{R(170, 38, 16, 32, '#D9D1BE')}
  {P([[110, 39], [130, 30], [150, 39]], '#7D7F80')}{P([[150, 39], [168, 32], [188, 39]], '#6C6E70')}
  {/* facciata col rosone */}
  {R(116, 40, 26, 30, '#F4EFE3')}
  {P([[114, 41], [129, 32], [144, 41]], '#E6DFCD')}
  <circle cx={129} cy={50} r={5} fill="#BFB49A" /><circle cx={129} cy={50} r={2.4} fill="#8E8270" />
  <path d="M125,70 v-8 a4,4 0 0 1 8,0 v8 z" fill="#7A6C58" />
  {/* tiburio */}
  {R(148, 22, 16, 14, '#E8E1CF')}{P([[146, 23], [156, 14], [166, 23]], '#6C6E70')}
  {[151, 157].map((x, i) => R(x, 26, 3, 6, '#7A6C58', i))}
  {[156, 164, 172, 180].map((x, i) => <path key={i} d={`M${x},60 v-6 a2,2 0 0 1 4,0 v6 z`} fill="#A3967E" />)}
  {/* campanile con la cipolla */}
  {R(190, 14, 14, 56, '#E4DDCB')}{R(199, 14, 5, 56, '#CFC6B0')}
  {R(193, 22, 3, 6, '#6E6252')}{R(193, 34, 3, 6, '#6E6252')}
  <path d="M190,14 q7,-14 14,0 z" fill="#6C6E70" />{R(196.4, -2, 1.2, 6, '#6C6E70')}
  {/* fontana del Nettuno */}
  {R(92, 64, 14, 6, '#C7B597')}{R(97, 56, 4, 8, '#BCA98A')}<circle cx={99} cy={54} r={2} fill="#9C8B6E" />
  <Prato c1="#C9C3B4" c2="#BDB6A6" />
</>

/* ---- Doss Trento: il colle boscoso col Mausoleo di Cesare Battisti (tempietto rotondo a colonne) ---- */
const Doss = () => <>
  <MontiTrento />
  {/* colle con parete di roccia verso il fiume */}
  {P([[40, 70], [70, 40], [110, 26], [150, 28], [182, 44], [206, 70]], '#6E9A55')}
  {P([[150, 28], [182, 44], [206, 70], [168, 70]], '#5C8646')}
  {P([[168, 46], [184, 48], [196, 68], [176, 68]], '#B7AE9C')}
  {[64, 76, 90, 104, 160, 172].map((x, i) => <Albero key={i} x={x} y={52 + (i % 2) * 4} r={6} />)}
  {/* mausoleo: basamento, anello di colonne, cornice */}
  {R(108, 24, 46, 5, '#E2DDD2')}
  {R(112, 12, 38, 12, '#F1EDE4')}
  {Array.from({ length: 8 }, (_, k) => R(113 + k * 4.8, 13, 2.6, 11, '#CFC8B8', k))}
  {R(110, 9, 42, 3, '#E2DDD2')}
  {/* l'Adige ai piedi */}
  {P([[0, 70], [16, 64], [56, 64], [70, 70]], '#7FB0C4')}
  <Prato />
</>

/* ---- Castello del Buonconsiglio: Torre d'Augusto rotonda, Castelvecchio merlato con la loggia, mura ---- */
const Buonconsiglio = () => <>
  <MontiTrento />
  {/* Torre d'Augusto */}
  {R(30, 4, 30, 66, '#DCCFB2')}{R(48, 4, 12, 66, '#C6B795')}
  {R(28, 0, 34, 6, '#D3C5A6')}<Merli x={28} y={0} w={34} c="#D3C5A6" />
  {R(40, 18, 4, 7, '#6E6252')}{R(40, 38, 4, 7, '#6E6252')}
  {/* bandiera */}
  {R(44, -12, 1, 12, '#5A5A5A')}{R(45, -12, 3, 5, '#2E8B3A')}{R(48, -12, 3, 5, '#FFFFFF')}{R(51, -12, 3, 5, '#C8202A')}
  {/* Castelvecchio */}
  {R(60, 26, 100, 44, '#E4D7BA')}{R(140, 26, 20, 44, '#CDBF9F')}
  <Merli x={60} y={26} w={100} c="#E4D7BA" />
  {[66, 78, 90].map((x, i) => <g key={i}>{R(x, 34, 4, 6, '#6E6252')}{R(x, 46, 4, 6, '#6E6252')}</g>)}
  {/* loggia veneziana ad archi */}
  {R(102, 32, 34, 14, '#D8CAA8')}
  {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${105 + k * 5.2},45 v-7 a2,2.5 0 0 1 4,0 v7 z`} fill="#5E5243" />)}
  {/* Magno Palazzo più basso a destra */}
  {R(160, 38, 46, 32, '#E9DFC8')}{P([[158, 39], [183, 32], [208, 39]], '#9A4426')}
  {[166, 178, 190].map((x, i) => R(x, 46, 4, 6, '#6E6252', i))}
  {/* mura in primo piano */}
  {R(0, 58, 240, 12, '#D8CBAD')}{R(0, 58, 240, 1.5, '#C2B38F')}
  <Merli x={0} y={58} w={240} c="#D8CBAD" />
  <Prato />
</>

/* ---- MUSE (Renzo Piano, quartiere Le Albere): la sezione è una sequenza di volumi in pietra chiara
   a capanna, ognuno con la falda come una lama sottile coperta di pannelli solari che sporge oltre
   il colmo. Da sinistra: torre uffici, atrio vetrato a V, il volume più alto con la lama più lunga,
   le gallerie a gradoni sotto una lunga falda vetrata, la serra tropicale bassa. Davanti la vasca. ---- */
// lama: falda sottile con i pannelli (da (x0,y0) a (x1,y1), spessore s)
const Lama = ({ x0, y0, x1, y1, s = 3, n = 8 }) => {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = (-dy / l) * s, ny = (dx / l) * s
  return <>
    {P([[x0, y0], [x1, y1], [x1 + nx, y1 + ny], [x0 + nx, y0 + ny]], '#56636D')}
    {Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n, w = 0.42 / n
      const ax = x0 + dx * (t - w), ay = y0 + dy * (t - w), bx = x0 + dx * (t + w), by = y0 + dy * (t + w)
      return P([[ax, ay], [bx, by], [bx + nx * 0.7, by + ny * 0.7], [ax + nx * 0.7, ay + ny * 0.7]], '#9FB3C1', i) })}
  </>
}
const Muse = () => <>
  <MontiTrento />
  {/* torre uffici: piani vetrati e lesene, falda che sale a sinistra */}
  {R(12, 30, 30, 40, '#D9DEE2')}
  {[34, 42, 50, 58].map((y, i) => R(14, y, 26, 5, '#9FB4C2', i))}
  {[20, 28, 36].map((x, i) => R(x, 30, 1.2, 40, '#C5CCD2', i))}
  {P([[42, 70], [42, 22], [58, 32], [58, 70]], '#ECEAE4')}
  <Lama x0={30} y0={14.5} x1={60} y1={33} s={2.6} n={6} />
  {/* atrio vetrato a V */}
  {P([[58, 70], [58, 26], [80, 46], [80, 70]], '#B6C8D3')}
  {[63, 69, 75].map((x, i) => R(x, 32 + i * 5, 0.9, 70 - 32 - i * 5, '#E4EBF0', i))}
  <Lama x0={58} y0={24} x1={82} y1={45} s={2.4} n={5} />
  {/* volume più alto, con la lama lunghissima che buca il cielo */}
  {P([[80, 70], [80, 46], [118, 8], [132, 20], [132, 70]], '#F1EFEA')}
  {P([[118, 8], [132, 20], [132, 70], [118, 70]], '#DCD9D2')}
  {R(122, 30, 1.4, 34, '#C8C4BA')}
  <Lama x0={78} y0={48} x1={128} y1={-8} s={3} n={9} />
  {/* gallerie a gradoni sotto la lunga falda vetrata */}
  {P([[132, 70], [132, 22], [196, 52], [196, 70]], '#B9CAD4')}
  {[0, 1, 2, 3].map((k) => P([[132, 30 + k * 10], [132 + (196 - 132) * ((8 + k * 10) / 30), 30 + k * 10], [132 + (196 - 132) * ((8 + k * 10) / 30), 31.5 + k * 10], [132, 31.5 + k * 10]], '#E9E4D8', k))}
  <Lama x0={132} y0={20} x1={198} y1={51} s={2.6} n={9} />
  {/* serra tropicale */}
  {P([[204, 70], [204, 56], [234, 44], [234, 70]], '#A8C9B4')}
  {P([[214, 70], [218, 58], [224, 70]], '#5E9A52')}<circle cx={219} cy={58} r={5} fill="#6FAE5E" />
  <Lama x0={202} y0={57} x1={236} y1={43} s={2.2} n={5} />
  {/* vasca d'acqua davanti */}
  {R(56, 66, 136, 4, '#8EC3D6')}
  <Prato c1="#7FC060" c2="#6FB052" />
</>

export const PAESAGGI = { alpi: Alpi, dolomiti: Dolomiti, colline: Colline, mare: Mare, puglia: Puglia, citta: Citta, paese: Paese, vulcano: Vulcano, risaie: Risaie }
export const MONUMENTI = { pisa: Pisa, colosseo: Colosseo, mole: Mole, duomo: Duomo, pontevecchio: PonteVecchio, sanmarco: SanMarco,
  duomotrento: DuomoTrento, doss: Doss, buonconsiglio: Buonconsiglio, albere: Muse }


// Da una stazione ai suoi paesaggi PRINCIPALI (paese e città si aggiungono sempre, a
// intervallare). Prima i nomi (monumenti e zone tipiche), poi la regione dedotta dal
// prefisso del codice ViaggiaTreno (S00 Piemonte, S01 Lombardia, … approssimato).
const PER_NOME = [
  [/venezia|mestre/, ['sanmarco']], [/^milano/, ['duomo']], [/^firenze/, ['pontevecchio']], [/^pisa/, ['pisa']],
  [/^trento/, ['duomotrento', 'buonconsiglio', 'albere', 'doss', 'dolomiti', 'alpi']],
  [/serravalle all.adige|^ala$|avio|borghetto/, ['dolomiti', 'alpi']],
  [/^roma/, ['colosseo']], [/^torino/, ['mole']],
  [/napoli|pompei|torre annunziata|ercolano|portici|catania|giarre|acireale/, ['vulcano']],
  [/trento|bolzano|bozen|brennero|rovereto|bressanone|fortezza|vipiteno|merano|chiusa|\bora\b|egna|salorno|mezzocorona|belluno|calalzo|ponte gardena/, ['dolomiti', 'alpi']],
  [/vercelli|novara|mortara|pavia|santhi|trino|casale/, ['risaie']],
  [/genova|spezia|sanremo|savona|levanto|monterosso|vernazza|riomaggiore|rapallo|chiavari|sestri|imperia|alassio|finale/, ['mare']],
  [/bari|lecce|brindisi|monopoli|fasano|ostuni|taranto|foggia|barletta|polignano|martina franca/, ['puglia']],
  [/aosta|domodossola|sondrio|tirano|tarvisio|bardonecchia|oulx|susa|chiavenna|udine|gemona/, ['alpi']],
  [/siena|arezzo|montepulciano|chiusi|empoli|poggibonsi|grosseto/, ['colline']],
  [/rimini|riccione|ancona|pescara|cattolica|senigallia|civitavecchia|salerno|reggio di calabria|palermo|cagliari/, ['mare']],
]
const PER_REGIONE = {
  S00: ['risaie', 'alpi'], S01: ['risaie', 'colline'], S02: ['colline'], S03: ['alpi', 'colline'],
  S04: ['mare'], S05: ['risaie', 'colline'], S06: ['colline'], S07: ['colline', 'mare'],
  S08: ['colline'], S09: ['vulcano', 'mare'], S10: ['mare', 'colline'], S11: ['puglia'], S12: ['mare', 'vulcano'], S13: ['mare'],
}
// vicino a un capoluogo la città esce più spesso del paese
const CAPOLUOGHI = /^(milano|torino|genova|bologna|firenze|roma|napoli|bari|palermo|venezia|verona|padova|trento|bolzano|catania|cagliari|trieste)/
function paesaggioDi(f) {
  const n = String(f?.stazione || '').toLowerCase()
  const out = []
  for (const [re, k] of PER_NOME) if (re.test(n)) { out.push(...k); break }
  // anche la stazione col monumento ha il suo paesaggio di regione intorno
  if (!out.some((k) => PAESAGGI[k])) out.push(...(PER_REGIONE[String(f?.id || '').slice(0, 3)] || []))
  return out
}

/* ---------- Come si fondono le scene (come su Bustardo, app/src/paesaggi/base.jsx) ----------
   Niente sfumature. Ogni scena (240) è ALLUNGATA ai due lati col proprio bordo specchiato
   (ESTENSIONE per parte): colline, prati e acqua proseguono alla stessa quota. Dove una scena
   allungata tocca la successiva c'è una GIUNZIONE (Giunzioni.jsx), un rilievo o un edificio
   intero in primo piano che copre il punto di contatto.
   Ordine di disegno: fondale continuo, scene allungate, giunzioni, terreno continuo davanti. */
export const Fondo = () => <>
  {P([[0, 58], [30, 48], [70, 54], [110, 44], [150, 52], [190, 46], [240, 58], [240, 70], [0, 70]], '#D3E2D6')}
  {P([[0, 64], [40, 56], [90, 62], [140, 54], [200, 62], [240, 64], [240, 70], [0, 70]], '#C2D8B8')}
</>
// fondale alto: una catena lontana azzurrina dietro le colline (dove una scena è bassa resta
// montagna lontana, non un buco di cielo)
export const FondoAlto = () => <>
  {P([[0, 50], [20, 36], [44, 42], [70, 26], [96, 38], [120, 30], [150, 40], [176, 24], [204, 36], [240, 50], [240, 70], [0, 70]], '#C9D7E3')}
  {P([[70, 26], [96, 38], [80, 44]], '#BBCBD9')}{P([[176, 24], [204, 36], [186, 44]], '#BBCBD9')}
  <Fondo />
</>
export const Terreno = () => <>
  {R(0, 70, 240, 10, '#B9D98C')}
  {P([[30, 70], [110, 70], [70, 80]], '#AFD27F')}
  {P([[150, 70], [230, 70], [190, 80]], '#AFD27F')}
</>
/* ---- Stazione ferma: per i treni di un giorno FUTURO (non ancora in servizio). Il treno aspetta in banchina davanti al
   fabbricato viaggiatori, con le imposte e il portone chiusi: niente paesaggio che scorre, niente dipendenza dalle fermate. ---- */
export const StazioneFerma = () => <>
  {/* monti lontani, azzurrini */}
  {P([[0, 40], [30, 20], [64, 32], [100, 12], [140, 30], [176, 16], [210, 28], [240, 20], [240, 70], [0, 70]], '#C9D5CD')}
  {P([[100, 12], [140, 30], [118, 34]], '#B7C6BB')}
  {/* fabbricato viaggiatori: corpo basso, frontone centrale con l'orologio, tetto di coppi */}
  {R(10, 34, 220, 36, '#EADFC7')}{R(10, 34, 220, 3, '#CFC2A3')}{R(10, 66, 220, 4, '#D3C6A8')}
  {P([[6, 34], [120, 18], [234, 34]], '#A85A3C')}{P([[120, 18], [234, 34], [120, 34]], '#8E4A30')}
  {R(98, 24, 44, 12, '#EFE6D0')}{P([[96, 24], [120, 9], [144, 24]], '#EFE6D0')}{P([[120, 9], [144, 24], [120, 24]], '#DCD2B8')}
  <circle cx={120} cy={21} r={6.8} fill="#6E6252" /><circle cx={120} cy={21} r={5.6} fill="#F7F2E0" />{R(119.5, 16.4, 1, 5.1, '#6E6252')}{R(119.5, 20.5, 3.6, 1, '#6E6252')}
  {/* finestre ad arco con le imposte chiuse */}
  {[24, 46, 70, 152, 176, 200].map((x, i) => <g key={i}>{R(x, 45, 12, 18, '#7F8F86')}<path d={`M${x},45 a6,6 0 0 1 12,0 z`} fill="#7F8F86" />{R(x + 5.4, 40, 1.2, 23, '#6A7A72')}</g>)}
  {/* portone chiuso */}
  {R(108, 46, 24, 24, '#6F5B48')}<path d="M108,46 a12,12 0 0 1 24,0 z" fill="#6F5B48" />{R(119.4, 38, 1.2, 32, '#5A4A3A')}{R(113, 56, 2, 2, '#C9A44A')}{R(125, 56, 2, 2, '#C9A44A')}
  {/* lampioni spenti e panchina vuota */}
  {R(5, 40, 2, 30, '#4C5560')}{R(2, 38, 8, 3, '#4C5560')}{R(233, 40, 2, 30, '#4C5560')}{R(230, 38, 8, 3, '#4C5560')}
  {R(34, 64, 22, 2.4, '#7A5A3A')}{R(36, 66, 2, 4, '#5E4630')}{R(52, 66, 2, 4, '#5E4630')}
  {R(184, 64, 22, 2.4, '#7A5A3A')}{R(186, 66, 2, 4, '#5E4630')}{R(202, 66, 2, 4, '#5E4630')}
</>
// banchina al posto del prato: lastra grigia con la linea gialla
export const TerrenoStazione = () => <>
  {R(0, 70, 240, 10, '#B7BBC0')}{R(0, 70, 240, 1.6, '#E4C34A')}
  {P([[20, 71.6], [100, 71.6], [60, 80], [0, 80]], '#AEB2B8')}{P([[150, 71.6], [240, 71.6], [240, 80], [190, 80]], '#AEB2B8')}
</>
// una tessera da sola (anteprime): fondale, scena, terreno
export function Tessera({ T }) {
  return <svg viewBox="0 -10 240 90" preserveAspectRatio="xMidYMax meet"><FondoAlto /><T /><Terreno /></svg>
}

export const ESTENSIONE = 40
export const POSTO = 240 + 2 * ESTENSIONE
// La striscia: `scene` in fila, ripetute `ripeti` volte, con `giunzioni[i]` all'inizio del posto
// i (anche il primo: la striscia si ripete e il punto in cui ricomincia è uguale agli altri).
// `chiudi`: aggiunge la giunzione 0 anche in fondo, per affiancare più copie della striscia
// (sfondi dei giochi: ogni copia porta metà giunzione per lato). `id` univoco nella pagina.
export function Striscia({ scene, giunzioni, ripeti = 2, scala = 320, id = 'st', chiudi = false, larghezzaPx = true }) {
  const e = ESTENSIONE
  const n = scene.length
  const tutte = Array.from({ length: n * ripeti }, (_, i) => i % n)
  const w = tutte.length * POSTO
  const piastrelle = Array.from({ length: Math.ceil(w / 240) }, (_, i) => i * 240)
  const G0 = giunzioni[0]
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 -10 ${w} 90`} preserveAspectRatio="xMinYMax meet"
    {...(larghezzaPx ? { width: (w / 240) * scala, height: (scala * 120) / 320 } : {})}>
    <defs>
      {/* nelle coordinate della scena: a sinistra da -e a 0, a destra da 240 a 240+e */}
      <clipPath id={id + 's'} clipPathUnits="userSpaceOnUse"><rect x={-e} y="-20" width={e} height="110" /></clipPath>
      <clipPath id={id + 'd'} clipPathUnits="userSpaceOnUse"><rect x="240" y="-20" width={e} height="110" /></clipPath>
    </defs>
    {piastrelle.map((x) => <g key={'f' + x} transform={`translate(${x} 0)`}><FondoAlto /></g>)}
    {tutte.map((k, i) => {
      const T = scene[k]
      return <g key={'s' + i} transform={`translate(${i * POSTO + e} 0)`}>
        <T />
        <g clipPath={`url(#${id}s)`}><g transform="scale(-1 1)"><T /></g></g>
        <g clipPath={`url(#${id}d)`}><g transform="translate(480 0) scale(-1 1)"><T /></g></g>
      </g>
    })}
    {tutte.map((k, i) => { const G = giunzioni[k]; return G ? <g key={'g' + i} transform={`translate(${i * POSTO} 0)`}><G /></g> : null })}
    {chiudi && G0 && <g transform={`translate(${w} 0)`}><G0 /></g>}
    {piastrelle.map((x) => <g key={'t' + x} transform={`translate(${x} 0)`}><Terreno /></g>)}
  </svg>
}

// generatore pseudo-casuale deterministico (stesso treno → stesso paesaggio)
function rng(seed) {
  let h = 0x811c9dc5
  for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0 }
  return () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296 }
}
const TUTTE = { ...PAESAGGI, ...MONUMENTI }
const CHIAVE_DI = new Map(Object.entries(TUTTE).map(([k, T]) => [T, k]))
// le chiavi ('alpi', 'duomotrento'…) di una sequenza di tessere, per scegliere le giunzioni
export const chiaviDi = (tessere) => tessere.map((T) => CHIAVE_DI.get(T))

// n tessere (di più se ci sono tanti monumenti) per il tratto che il treno sta percorrendo: guarda la fermata attuale e le due
// successive; paesaggi principali della zona alternati a paese e città;
// il monumento della zona apre la striscia. Se non si riconosce niente: biomi a caso.
export function sequenza(seed, n = 6, fermate = [], idx = 0) {
  const r = rng(seed)
  const vicine = [fermate[idx], fermate[idx + 1], fermate[idx + 2]].filter(Boolean)
  const chiavi = []
  for (const f of vicine) for (const k of paesaggioDi(f) || []) if (!chiavi.includes(k)) chiavi.push(k)
  if (!chiavi.length) {
    const biomi = Object.keys(PAESAGGI), mon = Object.keys(MONUMENTI)
    const out = []
    let b = biomi[Math.floor(r() * biomi.length)]
    while (out.length < n) {
      if (out.length % 2 === 0 && out.length) b = biomi[Math.floor(r() * biomi.length)]
      out.push(r() < 0.12 ? MONUMENTI[mon[Math.floor(r() * mon.length)]] : PAESAGGI[b])
    }
    return out
  }
  const principali = chiavi.filter((k) => PAESAGGI[k])
  // i monumenti solo se sei proprio lì: fermata appena passata (o attuale) e prossima
  const monumenti = [...new Set([fermate[idx], fermate[idx + 1]].filter(Boolean).flatMap(paesaggioDi).filter((k) => MONUMENTI[k]))]
  if (!principali.length) principali.push('paese')
  // intercalari: città e paese, con più città vicino ai capoluoghi
  const capoluogo = vicine.some((f) => CAPOLUOGHI.test(String(f.stazione || '').toLowerCase()))
  const intercalari = capoluogo ? ['citta', 'paese'] : ['paese', 'citta', 'paese']
  // schema: [monumento | principale], intercalare, principale, intercalare, …
  // il monumento apre la striscia (si vede subito, anche a treno fermo). Con più monumenti (Trento)
  // stanno nei posti pari, uno dopo l'altro, e nei dispari si alternano principale e intercalare.
  const tot = Math.max(n, monumenti.length * 2)
  const out = []
  let p = 0, q = 0, m = 0, d = 0
  while (out.length < tot) {
    if (out.length % 2 === 0) out.push(m < monumenti.length ? TUTTE[monumenti[m++]] : TUTTE[principali[p++ % principali.length]])
    else if (monumenti.length > 1 && d++ % 2 === 0) out.push(TUTTE[principali[p++ % principali.length]])
    else out.push(TUTTE[intercalari[q++ % intercalari.length]])
  }
  return out
}