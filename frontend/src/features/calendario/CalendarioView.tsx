import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { openContextModal } from '@mantine/modals';
import dayjs from 'dayjs';
import { personasApi, registrosApi } from '../../api/endpoints';
import type { Persona, Registro } from '../../types';

export function CalendarioView() {
  const { id: personaId = '' } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [month, setMonth] = useState(() => dayjs().format('YYYY-MM'));
  const [registros, setRegistros] = useState<Registro[]>([]);

  useEffect(() => {
    personasApi
      .findById(personaId)
      .then(setPersona)
      .catch(() => setPersona(null));
  }, [personaId]);

  const range = useMemo(() => {
    const start = dayjs(`${month}-01`);
    const end = start.endOf('month');
    return {
      desde: start.format('YYYY-MM-DD'),
      hasta: end.format('YYYY-MM-DD'),
    };
  }, [month]);

  const refresh = async () => {
    const data = await registrosApi.list({
      personaId,
      fechaDesde: range.desde,
      fechaHasta: range.hasta,
    });
    setRegistros(data);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaId, range.desde, range.hasta]);

  const { byFecha, totals } = useMemo(() => {
    const byFecha: Record<string, Registro[]> = {};
    const totals: Record<string, number> = {};
    for (const r of registros) {
      (byFecha[r.fecha] ??= []).push(r);
      totals[r.fecha] = (totals[r.fecha] ?? 0) + r.horasTotales;
    }
    return { byFecha, totals };
  }, [registros]);

  const openDia = (fecha: string) => {
    openContextModal({
      modal: 'registro',
      title: 'Registro de horas',
      size: 'lg',
      innerProps: {
        personaId,
        fecha,
        registros: byFecha[fecha] ?? [],
        onChanged: refresh,
      },
    });
  };

  return (
    <Stack>
      <Group justify="space-between">
        <div>
          <Group gap="xs">
            <Button variant="subtle" size="xs" onClick={() => navigate('/')}>
              ← Personas
            </Button>
          </Group>
          <Title order={2}>{persona?.nombre ?? 'Cargando…'}</Title>
          <Text c="dimmed" size="sm">
            Haz clic en un día para registrar las horas trabajadas.
          </Text>
        </div>
      </Group>

      <Paper withBorder p="md" maw={520}>
        <Calendar
          date={`${month}-01`}
          maxLevel="month"
          minLevel="month"
          onNextMonth={(d) => setMonth(d.slice(0, 7))}
          onPreviousMonth={(d) => setMonth(d.slice(0, 7))}
          getDayProps={(date) => ({
            onClick: () => openDia(date),
          })}
          renderDay={(date) => {
            const total = totals[date] ?? 0;
            return (
              <div>
                <div>{dayjs(date).date()}</div>
                {total > 0 && (
                  <Badge size="xs" variant="filled" fullWidth mt={2}>
                    {total}h
                  </Badge>
                )}
              </div>
            );
          }}
        />
      </Paper>
    </Stack>
  );
}
