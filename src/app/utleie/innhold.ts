/*
  All tekst på bodega.part.no/utleie står i denne fila.

  Endre fra mobilen: åpne fila på github.com/wariorural/bodegaweb, trykk blyanten,
  rediger, «Commit changes». Vercel bygger og publiserer av seg selv i løpet av et
  minutt.

  Trygt å endre:
    – ord og setninger INNE i anførselstegnene '…'
    – å legge til eller fjerne en hel linje i en liste, så lenge den ser ut som
      naboene og slutter med komma

  Ikke rør:
    – anførselstegn, komma, krøll- og hakeparenteser
    – ordene til venstre for : (label, verdi, dag, tid, src, alt)
    – \u00a0 i prisen — det er et mellomrom som ikke kan brytes, så «3 750 kr»
      aldri deles over to linjer

  Brekker du noe, feiler bygget OG DEN GAMLE SIDEN BLIR STÅENDE. Ingenting går i
  stykker for besøkende — du ser en rød X på GitHub, og kan rette eller angre.
*/

export const INTRO =
  'Bodega er et lite lokale med stor stemme — 67 plasser, bar, scene og projektor. ' +
  'Vi leier ut til bursdager, slipp, visninger, firmafester og alt som tåler å bli ' +
  'litt høyt. Dere får lokalet som det er: rødt, lavt under taket og allerede i stemning.';

export const PRIS = {
  pris: '3\u00a0750\u00a0kr',
  tittel: 'Hele lokalet',
  detalj: 'Inkludert moms. Vi rigger og står i baren, så dere slipper å tenke på det.',
};

export const FAKTA = [
  { label: 'Kapasitet', verdi: '67 personer' },
  { label: 'Lukket arrangement', verdi: 'Mandag–onsdag' },
  { label: 'Åpent arrangement', verdi: 'Alle dager — dere booker alle bordene, lokalet er åpent' },
  { label: 'Skjenkebevilling', verdi: 'Alkoholklasse 1 og 2' },
  { label: 'Mat', verdi: 'Lokalet har ikke kjøkken, så mat må ordnes utenfra' },
  { label: 'Adresse', verdi: 'Kong Oscars gate 23, 5017 Bergen' },
];

export const APNINGSTIDER = [
  { dag: 'Mandag–onsdag', tid: 'Stengt' },
  { dag: 'Torsdag', tid: '19–00' },
  { dag: 'Fredag', tid: '15.30–01' },
  { dag: 'Lørdag', tid: '19–01' },
  { dag: 'Søndag', tid: 'Stengt' },
];

export const APNINGSTIDER_NOTE =
  'Mandag til onsdag holder vi stengt for vanlig drift, men åpner for lukkede ' +
  'arrangementer. Under Bergenfest, Nattjazz og Festspillene kan bevillingen forlenges.';

// Venter på Mario — fakta.md oppgir bare projektor, lerret og mikrofon.
export const TEKNISK = [
  'Projektor og lerret',
  'Mikrofon',
  'Lydanlegg',
];

export const TEKNISK_NOTE =
  'Lyd og lys er inkludert i leien. Trenger dere noe utover dette, skriv det i ' +
  'skjemaet — det er oftest løsbart.';

export const BILDER = [
  { src: '/lokalet-1.jpg', alt: 'Bord ved vinduet mot Kong Oscars gate i dagslys' },
  { src: '/lokalet-2.jpg', alt: 'Langbord dekket til middag, med blomster og glass' },
  { src: '/lokalet-3.jpg', alt: 'Fullt lokale under et arrangement' },
  { src: '/lokalet-4.jpg', alt: 'Folk tett i tett foran den røde veggen' },
];

// Sett denne når plantegningen finnes, så dukker seksjonen opp av seg selv.
export const PLANTEGNING: { src: string; alt: string } | null = null;
