import { useEffect, useMemo, useState } from 'react';
import { Badge, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { openContextModal } from '@mantine/modals';
import dayjs from 'dayjs';
import { registrosApi } from '../../api/endpoints';
import type { Registro } from '../../types';

export function CalendarioView() {
  const [month, setMonth] = useState(() => dayjs().format('YYYY-MM'));
  const [registros, setRegistros] = useState<Registro[]>([]);

  const range = useMemo(() => {
    const start = dayjs(`${month}-01`);
    const end = start.endOf('month');
    return {
      desde: start.format('YYYY-MM-DD'),
      hasta: end.format('YYYY-MM-DD'),
    };
  }, [month]);

  const refresh = async () => {
    const data = await registrosApi.list(range.desde, range.hasta);
    setRegistros(data);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [range.desde, range.hasta]);

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
          <Title order={2}>Calendario</Title>
          <Text c="dimmed" size="sm">
            Haz clic en un día para registrar tus horas.
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
