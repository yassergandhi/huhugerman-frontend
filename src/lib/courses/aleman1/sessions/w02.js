// src/lib/courses/aleman1/sessions/w02.js
export default {
  id: 'a1-w02',
  level: 'aleman1',
  slug: 'w02',
  title: 'Woche 2: Zahlen & Herkunft',
  type: 'guided',
  
  instructions: {
    intro: 'Heute üben wir die Zahlen und sagen, woher wir kommen.',
    grammarReminder: [
      'Wie alt bist du? - Ich bin ... Jahre alt.',
      'Woher kommst du? - Ich komme aus ...',
      'Zahlen: eins, zwei, drei ... zehn, zwanzig...'
    ]
  },

  activity: {
    title: 'Übung: Meine Daten',
    parts: [
      {
        id: 'part1',
        label: 'Zahlen schreiben',
        help: 'Schreibe diese Zahlen als Wort: 5, 8, 12, 20',
        placeholder: 'Beispiel: fünf, acht...',
        rows: 2
      },
      {
        id: 'part2',
        label: 'Über dich',
        help: 'Antworte: Wie alt bist du? Woher kommst du?',
        placeholder: 'Ich bin... Ich komme aus...',
        rows: 3
      }
    ]
  },

  source: {
    type: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/iG985-t8Xoo' // Video über Zahlen (Platzhalter)
  }
};