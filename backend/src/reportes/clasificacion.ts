export interface Clasificacion {
  recargoOrdinarioDiurno: number;
  recargoOrdinarioNocturno: number;
  recargoFestivoDiurno: number;
  recargoFestivoNocturno: number;
  horasExtraordinarias: number;
}

export const CLASIFICACION_VACIA: Clasificacion = {
  recargoOrdinarioDiurno: 0,
  recargoOrdinarioNocturno: 0,
  recargoFestivoDiurno: 0,
  recargoFestivoNocturno: 0,
  horasExtraordinarias: 0,
};

const DIURNO_INICIO = 6 * 60; // 06:00
const DIURNO_FIN = 21 * 60; // 21:00
const EXTRA_INICIO = 16 * 60; // 16:00
const FIN_DIA = 24 * 60; // 24:00

export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const overlap = (
  inicio: number,
  fin: number,
  desde: number,
  hasta: number,
): number => Math.max(0, Math.min(fin, hasta) - Math.max(inicio, desde));

const redondear = (minutos: number): number =>
  Math.round((minutos / 60) * 100) / 100;

export function dayOfWeek(fecha: string): number {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}

/**
 * Clasifica un bloque de horas (dentro de un mismo día) en las categorías del reporte.
 * - domingo/festivo  -> recargo festivo (diurno 06-21 / nocturno 21-06)
 * - sábado           -> recargo ordinario (diurno/nocturno)
 * - lunes a viernes  -> solo las horas después de las 16:00 son extraordinarias
 */
export function clasificarBloque(
  fecha: string,
  horaInicio: string,
  horaFin: string,
  festivos: Set<string>,
): Clasificacion {
  const resultado: Clasificacion = { ...CLASIFICACION_VACIA };

  const inicio = timeToMinutes(horaInicio);
  const fin = timeToMinutes(horaFin);
  if (fin <= inicio) {
    return resultado;
  }

  const dow = dayOfWeek(fecha);
  const esFestivo = dow === 0 || festivos.has(fecha);
  const esSabado = dow === 6;

  const diurno = overlap(inicio, fin, DIURNO_INICIO, DIURNO_FIN);
  const nocturno = fin - inicio - diurno;

  if (esFestivo) {
    resultado.recargoFestivoDiurno = redondear(diurno);
    resultado.recargoFestivoNocturno = redondear(nocturno);
  } else if (esSabado) {
    resultado.recargoOrdinarioDiurno = redondear(diurno);
    resultado.recargoOrdinarioNocturno = redondear(nocturno);
  } else {
    resultado.horasExtraordinarias = redondear(
      overlap(inicio, fin, EXTRA_INICIO, FIN_DIA),
    );
  }

  return resultado;
}
