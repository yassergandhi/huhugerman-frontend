// src/lib/roadmap.js

// CONFIGURACIÓN MAESTRA DE LOS CURSOS
// ⚠️ IMPORTANTE: Las claves 'aleman1' y 'aleman2' NO llevan guion.
export const COURSE_CONFIG = {
  'aleman1': { 
    title: 'Alemán 1: Fundamentos',
    path: 'aleman1',
    weeks: [
      { id: 'a1-w1', title: 'Woche 1: Begrüßungen', active: true },
      { id: 'a1-w2', title: 'Woche 2: Zahlen & Uhrzeit', active: false },
      { id: 'a1-w3', title: 'Woche 3: Essen & Trinken', active: false },
      { id: 'a1-w4', title: 'Woche 4: Freizeit', active: false },
      { id: 'a1-w5', title: 'Woche 5: Familie', active: false },
      { id: 'a1-w6', title: 'Woche 6: Wohnen', active: false },
      { id: 'a1-w7', title: 'Woche 7: Körper', active: false },
      { id: 'a1-w8', title: 'Woche 8: Termine', active: false },
      { id: 'a1-w9', title: 'Woche 9: Kleidung', active: false },
      { id: 'a1-w10', title: 'Woche 10: Abschluss', active: false }
    ]
  },
  'aleman2': { 
    title: 'Alemán 2: Intermedio',
    path: 'aleman2',
    weeks: [
      { id: 'a2-w1', title: 'Woche 1: Konrads Geschichte', active: true },
      { id: 'a2-w2', title: 'Woche 2: Reisen & Urlaub', active: false },
      { id: 'a2-w3', title: 'Woche 3: Arbeitswelt', active: false },
      { id: 'a2-w4', title: 'Woche 4: Gesundheit', active: false },
      { id: 'a2-w5', title: 'Woche 5: Medien & Tech', active: false },
      { id: 'a2-w6', title: 'Woche 6: Umwelt', active: false },
      { id: 'a2-w7', title: 'Woche 7: Politik', active: false },
      { id: 'a2-w8', title: 'Woche 8: Geschichte', active: false },
      { id: 'a2-w9', title: 'Woche 9: Zukunft', active: false },
      { id: 'a2-w10', title: 'Woche 10: Finale', active: false }
    ]
  }
};

// Mantenemos esta función por si la usas en el Dashboard, 
// pero ahora es compatible con las nuevas claves.
export function renderRoadmap(containerId, level) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Limpieza: Aseguramos que siempre buscamos sin guion
  const cleanLevel = level ? level.replace('-', '') : '';
  const config = COURSE_CONFIG[cleanLevel];
  
  if (!config) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  let html = `<div class="card border-l-4 border-blue-500 bg-white p-6 shadow-sm">
                <h2 class="text-xl font-bold mb-4 text-slate-800">🚀 Tu Ruta: ${config.title}</h2>
                <div class="flex flex-col gap-3">`;

  config.weeks.forEach(week => {
    const isLocked = !week.active;
    // Regex seguro para sacar el número
    const weekNum = week.id.match(/\d+/)[0]; 
    const link = `/learn/${config.path}/week${weekNum}`; // Usamos la nueva ruta dinámica

    const content = `
      <div class="flex items-center justify-between w-full p-3 rounded-lg ${isLocked ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors'}">
        <span class="font-medium flex items-center gap-2">
          ${isLocked ? '🔒' : '🟢'} ${week.title}
        </span>
        ${!isLocked ? '<span class="text-xs font-bold uppercase tracking-wider">Ir a clase →</span>' : ''}
      </div>
    `;

    html += isLocked ? content : `<a href="${link}" class="block no-underline">${content}</a>`;
  });

  html += '</div></div>';
  container.innerHTML = html;
}
