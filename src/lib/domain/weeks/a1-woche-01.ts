import type { WochenKontext } from '../schemas/week-context.schema';

export const A1_WOCHE_01: WochenKontext = {
  kurs: "A1",
  woche: 1,
  title: "Begrüßungen und Personalpronomen",
  
  gelernt: {
    grammatik: {
      verbzweistellung: true,
      konjugation: {
        verben: ["heißen", "sein", "wohnen", "kommen"],
        personalpronomen: ["ich", "du", "er", "sie", "Sie"]
      },
      wFragen: ["Wie", "Woher", "Wo"]
    },
    wortschatz: {
      themen: ["Begrüßungen", "Abschied", "Herkunft", "Wohnort"],
      ausdrücke: {
        begrüßung: ["Hallo", "Guten Tag"],
        verabschiedung: ["Tschüss", "Auf Wiedersehen"]
      }
    },
    soziopragmatik: ["du/Sie", "formelle Situation", "informelle Situation"]
  },
  
  nicht_gelernt: {
    grammatik: ["Akkusativ", "Dativ", "Plural"],
    soziopragmatik: ["nonverbale Kommunikation"]
  },
  
  korrektur: {
    darf_korrigieren: ["Begrüßung", "Abschied", "Verbformen", "Wortstellung"],
    darf_nicht_korrigieren: ["Großschreibung", "Artikeldeklination", "Perfekt"],
    max_fehler: 3,
    ueberkorrektur_vermeiden: true
  }
};