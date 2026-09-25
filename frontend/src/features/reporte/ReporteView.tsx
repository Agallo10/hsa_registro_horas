import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import ExcelJS from 'exceljs';
import { reportesApi } from '../../api/endpoints';
import type { DetalleFila, ResumenFila } from '../../types';

const MESES = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

function years() {
  const current = new Date().getFullYear();
  const list: string[] = [];
  for (let y = current - 5; y <= current + 1; y += 1) {
    list.push(String(y));
  }
  return list;
}

function descargar(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReporteView() {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [filas, setFilas] = useState<ResumenFila[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportesApi.mensual(Number(year), Number(month));
      setFilas(data);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    cargar().catch(() => undefined);
  }, [cargar]);

  const exportarResumen = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Resumen');
    ws.columns = [
      { header: 'Persona', key: 'nombre', width: 30 },
      { header: 'Documento', key: 'documento', width: 18 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Días registrados', key: 'dias', width: 18 },
      { header: 'Total horas', key: 'horas', width: 14 },
    ];
    for (const f of filas) {
      ws.addRow({
        nombre: f.nombre,
        documento: f.documento,
        correo: f.correo ?? '',
        dias: f.diasRegistrados,
        horas: f.horasTotales,
      });
    }
    ws.getRow(1).font = { bold: true };
    descargar(await wb.xlsx.writeBuffer(), `reporte_${year}_${month}.xlsx`);
  };

  const exportarDetalle = async () => {
    const detalle = await reportesApi.detalle(Number(year), Number(month));
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Detalle');
    ws.columns = [
      { header: 'Persona', key: 'nombre', width: 30 },
      { header: 'Documento', key: 'documento', width: 18 },
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Inicio', key: 'inicio', width: 10 },
      { header: 'Fin', key: 'fin', width: 10 },
      { header: 'Horas', key: 'horas', width: 10 },
      { header: 'Observaciones', key: 'obs', width: 40 },
    ];
    for (const d of detalle as DetalleFila[]) {
      ws.addRow({
        nombre: d.nombre,
        documento: d.documento,
        fecha: d.fecha,
        inicio: d.horaInicio,
        fin: d.horaFin,
        horas: d.horasTotales,
        obs: d.observaciones ?? '',
      });
    }
    ws.getRow(1).font = { bold: true };
    descargar(await wb.xlsx.writeBuffer(), `detalle_${year}_${month}.xlsx`);
  };

  const totalGeneral = filas.reduce((s, f) => s + f.horasTotales, 0);

  return (
    <Stack>
      <Title order={2}>Reporte mensual</Title>

      <Paper withBorder p="md">
        <Group align="flex-end">
          <Select
            label="Año"
            data={years()}
            value={year}
            onChange={(v) => setYear(v ?? String(now.getFullYear()))}
            w={120}
          />
          <Select
            label="Mes"
            data={MESES}
            value={month}
            onChange={(v) => setMonth(v ?? String(now.getMonth() + 1))}
            w={160}
          />
          <Group ml="auto">
            <Button variant="default" onClick={exportarResumen} disabled={loading}>
              Exportar resumen
            </Button>
            <Button variant="default" onClick={exportarDetalle} disabled={loading}>
              Exportar detalle
            </Button>
          </Group>
        </Group>
      </Paper>

      <Paper withBorder p="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Persona</Table.Th>
              <Table.Th>Documento</Table.Th>
              <Table.Th>Días</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Total horas</Table.Th>
              <Table.Th>Estado</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filas.map((f) => (
              <Table.Tr key={f.personaId}>
                <Table.Td fw={500}>{f.nombre}</Table.Td>
                <Table.Td>{f.documento}</Table.Td>
                <Table.Td>{f.diasRegistrados}</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  {f.horasTotales}
                </Table.Td>
                <Table.Td>
                  {f.activo ? (
                    <Badge color="teal">Activo</Badge>
                  ) : (
                    <Badge color="gray">Inactivo</Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
            {filas.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center">
                    Sin personas registradas.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        <Group justify="flex-end" mt="md">
          <Text fw={700}>Total general: {totalGeneral} h</Text>
        </Group>
      </Paper>
    </Stack>
  );
}
