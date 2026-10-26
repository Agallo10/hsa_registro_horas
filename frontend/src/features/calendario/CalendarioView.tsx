import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
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

  const resumen = useMemo(() => {
    const dias = Object.keys(totals).length;
    const horas = Object.values(totals).reduce((s, h) => s + h, 0);
    return { dias, horas: Math.round(horas * 100) / 100 };
  }, [totals]);

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
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Button
            variant="subtle"
            size="xs"
            color="hsaGreen"
            px={0}
            mb={4}
            onClick={() => navigate('/')}
          >
            ← Personas
          </Button>
          <Group gap="sm">
            <Title order={2}>{persona?.nombre ?? 'Cargando…'}</Title>
            {persona?.area && (
              <Badge color="hsaLime" variant="light" tt="none">
                {persona.area}
              </Badge>
            )}
          </Group>
          <Text c="dimmed" size="sm">
            Haz clic en un día para registrar las horas trabajadas.
          </Text>
        </div>
      </Group>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card padding="lg">
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
                  <Box>
                    <div>{dayjs(date).date()}</div>
                    {total > 0 && (
                      <Badge
                        size="xs"
                        variant="filled"
                        color="hsaGreen"
                        fullWidth
                        mt={2}
                        px={0}
                      >
                        {total}h
                      </Badge>
                    )}
                  </Box>
                );
              }}
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="lg">
            <Card padding="lg">
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Resumen del mes
              </Text>
              <Group mt="md" justify="space-between">
                <Stack gap={2}>
                  <Text size="sm" c="dimmed">
                    Horas registradas
                  </Text>
                  <Text fw={700} fz={32} c="hsaGreen.7" lh={1}>
                    {resumen.horas}
                  </Text>
                </Stack>
                <Divider orientation="vertical" />
                <Stack gap={2}>
                  <Text size="sm" c="dimmed">
                    Días con horas
                  </Text>
                  <Text fw={700} fz={32} c="hsaGreen.7" lh={1}>
                    {resumen.dias}
                  </Text>
                </Stack>
              </Group>
            </Card>

            <Card padding="lg">
              <Text size="sm" fw={600} mb="xs">
                Cómo registrar
              </Text>
              <Text size="sm" c="dimmed">
                1. Selecciona el día en el calendario.
              </Text>
              <Text size="sm" c="dimmed">
                2. Agrega uno o varios bloques de horas (inicio y fin).
              </Text>
              <Text size="sm" c="dimmed">
                3. Guarda. Los días con horas muestran un indicador verde.
              </Text>
              <Divider my="sm" />
              <Text size="xs" c="dimmed">
                Los días de fin de semana y festivos se clasifican
                automáticamente como recargos en el reporte.
              </Text>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
