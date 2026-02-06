import type { WochenKontext } from '../schemas/week-context.schema';

export const A1_WOCHE_02: WochenKontext = {
  kurs: "A1",
  woche: 2,
  title: "Zahlen und Alphabet",
  
  gelernt: {
    grammatik: {
      verbzweistellung: true,
      zahlen: {
        kardinale: { gelernt: true, range: { von: 0, bis: 100 } }
      },
      wFragen: ["Wie alt", "Wie ist"]
    },
    wortschatz: {
      themen: ["Zahlen", "Alphabet", "Telefonnummern"],
      alphabet: { gelernt: true, buchstabieren: true }
    },
    soziopragmatik: ["Regionalismen"]
  },
  
  nicht_gelernt: {
    grammatik: ["Possessivartikel", "Negation"],
    soziopragmatik: ["Umgangssprache"]
  },
  
  korrektur: {
    darf_korrigieren: ["Zahlen", "Verbformen", "W-Fragen"],
    darf_nicht_korrigieren: ["Großschreibung", "Dativ"],
    max_fehler: 3,
    ueberkorrektur_vermeiden: true
  }
};