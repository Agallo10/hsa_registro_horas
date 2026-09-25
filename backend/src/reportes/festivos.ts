const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * MS_PER_DAY);
}

/** Devuelve el lunes siguiente si la fecha no es lunes; si ya es lunes, la misma fecha. */
function emiliani(d: Date): Date {
  const dow = d.getUTCDay();
  if (dow === 1) {
    return d;
  }
  const delta = (8 - dow) % 7;
  return addDays(d, delta);
}

/** Domingo de Resurrección (Pascua) según el algoritmo de Meeus/Jones/Butcher. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Devuelve un Set con los festivos de Colombia (formato `YYYY-MM-DD`) del año dado:
 * festivos de fecha fija, festivos "Emiliani" (trasladados a lunes) y los basados en Semana Santa.
 */
export function festivosColombia(year: number): Set<string> {
  const festivos = new Set<string>();

  const fijos: Array<[number, number]> = [
    [1, 1], // Año Nuevo
    [5, 1], // Día del Trabajo
    [7, 20], // Independencia
    [8, 7], // Batalla de Boyacá
    [12, 8], // Inmaculada Concepción
    [12, 25], // Navidad
  ];
  for (const [m, d] of fijos) {
    festivos.add(toDateString(new Date(Date.UTC(year, m - 1, d))));
  }

  const emilianis: Array<[number, number]> = [
    [1, 6], // Reyes Magos
    [3, 19], // San José
    [6, 29], // San Pedro y San Pablo
    [8, 15], // Asunción
    [10, 12], // Día de la Raza
    [11, 1], // Todos los Santos
    [11, 11], // Independencia de Cartagena
  ];
  for (const [m, d] of emilianis) {
    festivos.add(toDateString(emiliani(new Date(Date.UTC(year, m - 1, d)))));
  }

  const easter = easterSunday(year);
  festivos.add(toDateString(addDays(easter, -3))); // Jueves Santo
  festivos.add(toDateString(addDays(easter, -2))); // Viernes Santo
  festivos.add(toDateString(addDays(easter, 43))); // Ascensión del Señor
  festivos.add(toDateString(addDays(easter, 64))); // Corpus Christi
  festivos.add(toDateString(addDays(easter, 71))); // Sagrado Corazón

  return festivos;
}
