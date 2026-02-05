// src/lib/courses/aleman2/sessions/w02.js
export default {
  id: 'a2-w02',
  level: 'aleman2',
  slug: 'w02',
  title: 'Woche 2: Mein Tagesablauf und die Uhrzeit',
  type: 'guided',
  
  instructions: {
    intro: 'Wir beschreiben heute unseren Alltag mit trennbaren Verben und präzisen Zeitangaben.',
    grammarReminder: [
      'Trennbare Verben: Das Präfix steht am Ende (z.B. Ich kaufe ein).',
      'Uhrzeit: "Um wie viel Uhr...?" -> "Um 8 Uhr."',
      'Akkusativ: Ich sehe den Film (maskulin: den/einen).'
    ]
  },

  activity: {
    title: 'Ein typischer Tag',
    parts: [
      {
        id: 'part1',
        label: 'Morgenroutine (Trennbare Verben)',
        help: 'Wann stehst du auf? (aufstehen) Wann fängt dein Kurs an? (anfangen)',
        placeholder: 'Ich stehe um ... Uhr auf.',
        rows: 2
      },
      {
        id: 'part2',
        label: 'Aktivitäten am Mittag/Abend',
        help: 'Was kaufst du ein? Wen rufst du an? (einkaufen, anrufen)',
        placeholder: 'Ich kaufe einen Apfel ein. Ich rufe den Lehrer an.',
        rows: 2
      },
      {
        id: 'part3',
        label: 'Uhrzeit formal und informal',
        help: 'Wie spät ist es jetzt? Schreibe es auf zwei Arten.',
        placeholder: 'Es ist ... Uhr (formal). Es ist ... (informal).',
        rows: 2
      }
    ]
  },

  source: {
    type: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/MvYMa9mXpG8' // Beispiel-Video zu Tagesablauf
  }
};