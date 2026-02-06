// CONFIGURACIÓN MAESTRA DE LOS CURSOS
export const COURSE_CONFIG = {
  'aleman-1': {
    title: 'Alemán 1: Fundamentos',
    path: 'aleman1',
    weeks: [
      { id: 'a1-w1', title: 'Woche 1: Begrüßungen', active: true },
      { id: 'a1-w2', title: 'Woche 2: W-Fragen und Zahlen bis 12', active: true },
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
  'aleman-2': {
    title: 'Alemán 2: Intermedio',
    path: 'aleman2',
    weeks: [
      { id: 'a2-w1', title: 'Woche 1: Konrads Geschichte', active: true },
      { id: 'a2-w2', title: 'Woche 2: Tagesablauf und Uhrzeit', active: true },
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

// FUNCIÓN DE RENDERIZADO (Reutilizable)
export function renderRoadmap(containerId, level) {
  const container = document.getElementById(containerId);
  const config = COURSE_CONFIG[level];
  
  // Seguridad: Si el nivel no existe, no renderizamos nada o mostramos error
  if (!config) {
    container.innerHTML = '<p style="color:red">Error: Nivel no asignado. Contacta al profesor.</p>';
    return;
  }

  let html = `<div class="card" style="border-color: var(--accent-primary);">
                <h2 style="font-size:1.2rem; margin-bottom:1.5rem;">🚀 Tu Ruta: ${config.title}</h2>
                <div style="display:flex; flex-direction:column; gap:0.8rem;">`;

  config.weeks.forEach(week => {
    const isLocked = !week.active;
    const icon = isLocked ? '🔒' : '🟢';
    
    // Generamos el link correcto: /aleman1/week1 o /aleman2/week1
    // Extraemos el número de semana del ID (ej: a1-w1 -> 1)
    const weekNum = week.id.split('-w')[1];
    const link = `/${config.path}/week${weekNum}`;

    const content = `
      <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <span>${icon} ${week.title}</span>
        ${!isLocked ? '<span class="status-badge">IR A CLASE →</span>' : ''}
      </div>
    `;

    html += `
      <div class="card" style="padding:1rem; margin-bottom:0; ${isLocked ? 'opacity:0.4;' : 'cursor:pointer; border-color:var(--border-color);'}">
        ${!isLocked ? '<a href="' + link + '" style="text-decoration:none; color:inherit; display:block;">' + content + '</a>' : content}
      </div>
    `;
  });

  html += '</div></div>';
  container.innerHTML = html;
}
