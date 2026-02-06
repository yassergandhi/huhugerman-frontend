import type { WochenKontext } from '../schemas/week-context.schema';

export const A2_WOCHE_01: WochenKontext = {
  kurs: "A2",
  woche: 1,
  title: "Berufe und Alltag",
  
  gelernt: {
    grammatik: {
      verbzweistellung: true,
      kasus: {
        nominativ: { gelernt: true, verwendung: ["Subjekt"] },
        akkusativ: { gelernt: true, artikel: ["den", "die", "das", "einen"] }
      },
      konjugation: {
        verben: ["arbeiten", "machen", "sehen", "essen"]
      }
    },
    wortschatz: {
      themen: ["Berufsleben", "Tagesablauf"],
      berufe: { gelernt: true, beispiele: ["Lehrer", "Arzt", "Ingenieur"] }
    },
    soziopragmatik: ["du/Sie", "formelle Situation"]
  },
  
  nicht_gelernt: {
    grammatik: ["Dativ", "Nebensätze"],
    soziopragmatik: ["Restaurant"]
  },
  
  korrektur: {
    darf_korrigieren: ["Nominativ", "Akkusativ", "Verbformen", "Satzbau"],
    darf_nicht_korrigieren: ["Dativ", "Perfekt"],
    max_fehler: 4,
    ueberkorrektur_vermeiden: true
  }
};