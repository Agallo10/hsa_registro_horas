import { describe, it, expect } from 'vitest';
import {
  computeHoras,
  overlaps,
  timeToMinutes,
} from './registros.service.js';

describe('computeHoras', () => {
  it('calcula horas decimales', () => {
    expect(computeHoras('08:00', '12:00')).toBe(4);
    expect(computeHoras('08:00', '12:30')).toBe(4.5);
    expect(computeHoras('08:15', '10:00')).toBe(1.75);
  });

  it('devuelve 0 para bloques de igual hora', () => {
    expect(computeHoras('08:00', '08:00')).toBe(0);
  });
});

describe('timeToMinutes', () => {
  it('convierte HH:mm a minutos', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('08:00')).toBe(480);
    expect(timeToMinutes('23:59')).toBe(1439);
  });
});

describe('overlaps', () => {
  it('detecta solapamiento', () => {
    expect(overlaps(480, 720, 660, 780)).toBe(true); // 08-12 vs 11-13
    expect(overlaps(480, 720, 600, 660)).toBe(true); // contenido
  });

  it('permite bloques que solo se tocan en el borde', () => {
    expect(overlaps(480, 720, 720, 780)).toBe(false); // 08-12 vs 12-13
    expect(overlaps(480, 720, 300, 480)).toBe(false); // 05-08 vs 08-12
  });

  it('no solapa bloques separados', () => {
    expect(overlaps(480, 720, 780, 900)).toBe(false);
  });
});
