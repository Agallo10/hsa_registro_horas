import { describe, it, expect } from 'vitest';
import { clasificarBloque } from './clasificacion.js';

const SIN_FESTIVOS = new Set<string>();
const FESTIVO = new Set<string>(['2026-09-25']);

describe('clasificarBloque', () => {
  it('domingo -> recargo festivo diurno', () => {
    const c = clasificarBloque('2026-09-27', '08:00', '12:00', SIN_FESTIVOS);
    expect(c.recargoFestivoDiurno).toBe(4);
    expect(c.recargoFestivoNocturno).toBe(0);
  });

  it('domingo nocturno -> recargo festivo nocturno', () => {
    const c = clasificarBloque('2026-09-27', '22:00', '23:00', SIN_FESTIVOS);
    expect(c.recargoFestivoNocturno).toBe(1);
  });

  it('día festivo -> recargo festivo', () => {
    const c = clasificarBloque('2026-09-25', '08:00', '12:00', FESTIVO);
    expect(c.recargoFestivoDiurno).toBe(4);
  });

  it('sábado -> recargo ordinario diurno/nocturno', () => {
    const diurno = clasificarBloque('2026-09-26', '08:00', '12:00', SIN_FESTIVOS);
    expect(diurno.recargoOrdinarioDiurno).toBe(4);

    const nocturno = clasificarBloque(
      '2026-09-26',
      '22:00',
      '23:00',
      SIN_FESTIVOS,
    );
    expect(nocturno.recargoOrdinarioNocturno).toBe(1);
  });

  it('lunes-viernes después de las 16:00 -> extraordinarias', () => {
    const c = clasificarBloque('2026-09-24', '17:00', '19:00', SIN_FESTIVOS);
    expect(c.horasExtraordinarias).toBe(2);
  });

  it('lunes-viernes antes de las 16:00 -> excluido', () => {
    const c = clasificarBloque('2026-09-24', '08:00', '12:00', SIN_FESTIVOS);
    expect(c.horasExtraordinarias).toBe(0);
    expect(c.recargoFestivoDiurno).toBe(0);
    expect(c.recargoOrdinarioDiurno).toBe(0);
  });

  it('bloque que cruza las 16:00 cuenta solo la parte extra', () => {
    const c = clasificarBloque('2026-09-24', '15:00', '17:00', SIN_FESTIVOS);
    expect(c.horasExtraordinarias).toBe(1);
  });

  it('bloque festivo que cruza 21:00 se divide diurno/nocturno', () => {
    const c = clasificarBloque('2026-09-25', '20:00', '22:00', FESTIVO);
    expect(c.recargoFestivoDiurno).toBe(1);
    expect(c.recargoFestivoNocturno).toBe(1);
  });
});
