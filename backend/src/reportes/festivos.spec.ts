import { describe, it, expect } from 'vitest';
import { festivosColombia } from './festivos.js';

describe('festivosColombia', () => {
  it('incluye festivos de fecha fija', () => {
    const festivos = festivosColombia(2026);
    expect(festivos.has('2026-01-01')).toBe(true);
    expect(festivos.has('2026-05-01')).toBe(true);
    expect(festivos.has('2026-07-20')).toBe(true);
    expect(festivos.has('2026-08-07')).toBe(true);
    expect(festivos.has('2026-12-08')).toBe(true);
    expect(festivos.has('2026-12-25')).toBe(true);
  });

  it('incluye festivos de Semana Santa', () => {
    const festivos = festivosColombia(2026);
    expect(festivos.has('2026-04-02')).toBe(true); // Jueves Santo
    expect(festivos.has('2026-04-03')).toBe(true); // Viernes Santo
    expect(festivos.has('2026-05-18')).toBe(true); // Ascensión
    expect(festivos.has('2026-06-08')).toBe(true); // Corpus Christi
    expect(festivos.has('2026-06-15')).toBe(true); // Sagrado Corazón
  });

  it('traslada festivos Emiliani al lunes', () => {
    const festivos = festivosColombia(2026);
    expect(festivos.has('2026-01-12')).toBe(true); // Reyes
    expect(festivos.has('2026-03-23')).toBe(true); // San José
    expect(festivos.has('2026-06-29')).toBe(true); // San Pedro y San Pablo (lunes)
    expect(festivos.has('2026-08-17')).toBe(true); // Asunción
    expect(festivos.has('2026-11-02')).toBe(true); // Todos los Santos
    expect(festivos.has('2026-11-16')).toBe(true); // Cartagena
  });

  it('no marca un día normal como festivo', () => {
    const festivos = festivosColombia(2026);
    expect(festivos.has('2026-02-10')).toBe(false);
  });
});
