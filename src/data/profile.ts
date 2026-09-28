// Dati personali e curriculum. Testi bilingui come { it, en }.
type L = { it: string; en: string };

export const contact = {
  email: 'modena.davide56@gmail.com',
  linkedin: 'https://www.linkedin.com/in/davide-modena-8461862a9/',
  github: 'https://github.com/davide-modena',
};

export const location = { city: 'Trento', coords: '46.07°N 11.12°E', tz: 'Europe/Rome' };

export interface Job {
  from: string;
  to?: string;
  org: string;
  role: L;
  text: L;
  tags?: string[];
}

export const experience: Job[] = [
  {
    from: '2025-05',
    org: 'ITT Buonarroti, Trento',
    role: { it: 'Docente ITP di informatica', en: 'Computer science lab teacher' },
    text: {
      it: 'Affianco classi dal primo al quinto anno nei laboratori di informatica: Java, C, Python, fogli di calcolo, statistica e gestione di progetti IT.',
      en: 'I teach computer science labs to students aged 14 to 19: Java, C, Python, spreadsheets, statistics and IT project management.',
    },
    tags: ['Java', 'C', 'Python'],
  },
  {
    from: '2024-03',
    to: '2025-05',
    org: 'Fiverr',
    role: { it: 'Freelance, AI audio', en: 'Freelancer, AI audio' },
    text: {
      it: 'Lavori su commissione di clonazione e manipolazione della voce con modelli AI.',
      en: 'Commissioned voice cloning and voice manipulation work with AI models.',
    },
  },
  {
    from: '2023-08',
    to: '2023-09',
    org: 'Arcreate, Avio',
    role: { it: 'Web designer e sviluppatore', en: 'Web designer & developer' },
    text: {
      it: 'Design e sviluppo del sito di uno studio di architettura, in HTML, CSS e JavaScript senza framework.',
      en: 'Designed and built the website of an architecture studio in plain HTML, CSS and JavaScript.',
    },
    tags: ['HTML', 'CSS', 'JS'],
  },
  {
    from: '2023-07',
    to: '2023-07',
    org: 'Fondazione Bruno Kessler',
    role: { it: 'Stage in cybersecurity', en: 'Cybersecurity intern' },
    text: {
      it: 'Tipi e fasi degli attacchi informatici, difesa dei dati personali, materiali divulgativi sui rischi della condivisione online.',
      en: 'Attack types and phases, personal data protection, awareness material about the risks of oversharing online.',
    },
  },
];

export const education: Job[] = [
  {
    from: '2024-09',
    org: 'Università di Trento',
    role: { it: 'Laurea in Informatica', en: 'BSc in Computer Science' },
    text: { it: 'In corso.', en: 'Ongoing.' },
  },
  {
    from: '2019-09',
    to: '2024-07',
    org: 'ITT Buonarroti, Trento',
    role: { it: 'Diploma in Informatica e Telecomunicazioni', en: 'Technical diploma in Computer Science' },
    text: { it: 'Indirizzo Informatica e Telecomunicazioni, articolazione Informatica.', en: 'Computer science and telecommunications track.' },
  },
];

export const skills: { group: L; items: string[]; main?: boolean }[] = [
  { group: { it: 'web', en: 'web' }, items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'React', 'Astro', 'Bootstrap', 'PHP'], main: true },
  { group: { it: 'dati', en: 'data' }, items: ['SQL', 'MySQL', 'MongoDB', 'PostgreSQL', 'JSON', 'XML'] },
  { group: { it: 'linguaggi', en: 'languages' }, items: ['Java', 'Python', 'C', 'C++', 'Kotlin'] },
  { group: { it: 'strumenti', en: 'tools' }, items: ['Git', 'Netlify', 'Figma', 'Photoshop', 'Illustrator', 'Blender'] },
  { group: { it: 'hardware', en: 'hardware' }, items: ['ESP32', 'Arduino', 'BLE', 'OLED / TFT'] },
];

export const offline: { title: L; text: L; items: string[] }[] = [
  {
    title: { it: 'musica', en: 'music' },
    text: {
      it: 'Suono chitarra, basso, tastiera, batteria e ukulele. Produco e mixo in FL Studio, e ho un po’ di palco alle spalle.',
      en: 'I play guitar, bass, keys, drums and ukulele. I produce and mix in FL Studio, and I’ve spent some time on stage.',
    },
    items: ['chitarra', 'basso', 'tastiera', 'batteria', 'ukulele', 'FL Studio'],
  },
  {
    title: { it: 'design e 3D', en: 'design & 3D' },
    text: {
      it: 'Grafica con Photoshop e Illustrator, interfacce in Figma, modellazione e render in Blender.',
      en: 'Graphics in Photoshop and Illustrator, interfaces in Figma, modelling and rendering in Blender.',
    },
    items: ['Figma', 'Photoshop', 'Illustrator', 'Blender'],
  },
];

export const languages: { name: L; level: string; pct: number }[] = [
  { name: { it: 'italiano', en: 'Italian' }, level: 'native', pct: 100 },
  { name: { it: 'inglese', en: 'English' }, level: 'C1', pct: 85 },
  { name: { it: 'tedesco', en: 'German' }, level: 'B1', pct: 55 },
  { name: { it: 'spagnolo', en: 'Spanish' }, level: 'A2', pct: 30 },
];
