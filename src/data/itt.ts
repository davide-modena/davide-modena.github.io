// Testi della pagina sul lavoro all'ITT Buonarroti (src/views/IttView.astro).
type L = { it: string; en: string };

export const ittVideo = '/video/itt-drone.mp4';
export const ittPoster = '/video/itt-drone.jpg';

export const ittCopy = {
  title: { it: 'Insegno informatica a Trento', en: 'I teach computer science in Trento' } as L,
  lead: {
    it: "Sono docente di laboratorio di informatica all'ITT Buonarroti di Trento, la scuola dove mi sono diplomato. È il mio secondo anno.",
    en: "I'm a computer science lab teacher at ITT Buonarroti in Trento, the school where I got my diploma. This is my second year.",
  } as L,
  role: {
    label: { it: 'il mio ruolo', en: 'my role' } as L,
    title: { it: "Cos'è un ITP", en: 'What an ITP does' } as L,
    text: {
      it: [
        "ITP sta per insegnante tecnico-pratico. Il mio posto è il laboratorio: affianco il docente di teoria e porto i ragazzi a fare davvero le cose, dal primo programma alla soluzione di un problema.",
        'Insegno dalla prima alla quinta superiore, indirizzo Informatica e Telecomunicazioni, articolazione Informatica.',
      ],
      en: [
        "ITP stands for technical-practical teacher. My place is the lab: I work alongside the theory teacher and get students to actually build things, from their first program to solving a real problem.",
        'I teach from the first to the fifth year of secondary school, computer science track.',
      ],
    },
  },
  teach: {
    label: { it: 'cosa insegno', en: 'what I teach' } as L,
    title: { it: 'Dalla prima alla quinta', en: 'From year one to year five' } as L,
  },
  years: [
    {
      year: { it: 'prima', en: 'first' } as L,
      subject: 'Informatica',
      topics: ['Fogli di calcolo', { it: 'Algoritmi di flusso', en: 'Flowchart algorithms' }, 'Python'],
    },
    {
      year: { it: 'seconda', en: 'second' } as L,
      subject: 'Informatica',
      topics: [{ it: 'Python avanzato', en: 'Advanced Python' }],
    },
    {
      year: { it: 'terza', en: 'third' } as L,
      subject: 'Informatica',
      topics: [{ it: 'Web statico (HTML, CSS)', en: 'Static web (HTML, CSS)' }, { it: 'Java e algoritmi', en: 'Java and algorithms' }],
    },
    {
      year: { it: 'quarta', en: 'fourth' } as L,
      subject: 'Informatica',
      topics: [{ it: 'Java a oggetti', en: 'Object-oriented Java' }, { it: 'Web dinamico (JavaScript)', en: 'Dynamic web (JavaScript)' }],
    },
    {
      year: { it: 'quinta', en: 'fifth' } as L,
      subject: 'Informatica',
      topics: [{ it: 'PHP: server e database', en: 'PHP: server and databases' }],
    },
    {
      year: { it: 'quinta', en: 'fifth' } as L,
      subject: 'TPSIT',
      subjectFull: {
        it: 'Tecnologie e progettazione di sistemi informatici e di telecomunicazioni',
        en: 'Computer and telecommunications systems design',
      } as L,
      topics: [
        'Thread',
        { it: 'Semafori', en: 'Semaphores' },
        { it: 'Socket UDP e TCP', en: 'UDP and TCP sockets' },
        'Servlet e JSP',
      ],
    },
  ],
  how: {
    label: { it: 'come lavoro', en: 'how I work' } as L,
    title: { it: 'In classe e in laboratorio', en: 'In class and in the lab' } as L,
    items: [
      { t: { it: 'Slide', en: 'Slides' } as L, d: { it: "Per entrare nell'argomento: poche idee per volta, esempi che si possono provare subito.", en: 'To get into a topic: a few ideas at a time, with examples you can try right away.' } as L },
      { t: { it: 'Laboratorio', en: 'Lab work' } as L, d: { it: 'La parte centrale: si scrive codice, si sbaglia, si corregge.', en: 'The core: you write code, get it wrong, fix it.' } as L },
      { t: { it: 'Progetti di gruppo', en: 'Group projects' } as L, d: { it: 'Un problema da risolvere insieme, dividendosi il lavoro come si fa nei progetti veri.', en: 'A problem to solve together, splitting the work like in real projects.' } as L },
      { t: { it: 'Verifiche pratiche', en: 'Practical tests' } as L, d: { it: 'Si valuta quello che sanno fare, non quello che ricordano a memoria.', en: 'They are graded on what they can do, not on what they can recite.' } as L },
    ],
  },
  why: {
    label: { it: 'perché', en: 'why' } as L,
    title: { it: "Cosa mi piace dell'insegnare", en: 'What I like about teaching' } as L,
    text: {
      it: [
        'Mi piace stare a contatto con i ragazzi e vedere il momento in cui una cosa, prima oscura, funziona.',
        "Mi piace collaborare ai loro progetti, e imparare cose nuove proprio perché devo spiegarle: se non riesco a dirla semplice, non l'ho capita abbastanza.",
      ],
      en: [
        'I like being around students and seeing the moment when something that looked obscure starts to work.',
        "I like collaborating on their projects, and learning new things precisely because I have to explain them: if I can't say it simply, I haven't understood it well enough.",
      ],
    },
  },
  back: { it: 'torna a chi sono', en: 'back to about' } as L,
  more: { it: 'insegno informatica a Trento →', en: 'I teach computer science in Trento →' } as L,
};
