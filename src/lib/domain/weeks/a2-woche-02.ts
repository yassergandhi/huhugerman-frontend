import type { WochenKontext } from '../schemas/week-context.schema';

export const A2_WOCHE_02: WochenKontext = {
  kurs: "A2",
  woche: 2,
  title: "Freizeit und Modalverben",
  
  gelernt: {
    grammatik: {
      verbzweistellung: true,
      modalverben: {
        gelernt: true,
        verben: ["können", "wollen"],
        konjugiert: true
      }
    },
    wortschatz: {
      themen: ["Hobbys", "Fähigkeiten"],
      aktivitäten: { gelernt: true, wochenende: ["Sport machen", "lesen"] }
    },
    soziopragmatik: ["informelle Situation"]
  },
  
  nicht_gelernt: {
    grammatik: ["Präteritum", "Passiv"],
    soziopragmatik: ["Regionalismen"]
  },
  
  korrektur: {
    darf_korrigieren: ["Modalverben", "Satzbau", "Vokabular gelernt"],
    darf_nicht_korrigieren: ["Nebensätze", "Artikeldeklination"],
    max_fehler: 4,
    ueberkorrektur_vermeiden: true
  }
};