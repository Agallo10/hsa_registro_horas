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

const HOSPITAL = 'HOSPITAL SAN ANDRÉS DE TUMACO';
const SUBPROCESO = 'SUB-PROCESO DE FACTURACIÓN';

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

function nombreMes(value: string): string {
  return MESES.find((m) => m.value === value)?.label.toUpperCase() ?? '';
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

  const exportarReporte = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Recargos');

    ws.mergeCells('A1:J1');
    ws.mergeCells('A2:J2');
    ws.mergeCells('A3:J3');

    ws.getCell('A1').value =
      `REPORTE DE HORAS EXTRAS - RECARGOS MES DE ${nombreMes(month)} ${year}`;
    ws.getCell('A2').value = HOSPITAL;
    ws.getCell('A3').value = SUBPROCESO;

    ws.getCell('A1').font = { bold: true, size: 12 };
    ws.getCell('A2').font = { bold: true, size: 11 };
    ws.getCell('A3').font = { bold: true, size: 11 };
    ws.getCell('A1').alignment = { horizontal: 'center' };
    ws.getCell('A2').alignment = { horizontal: 'center' };
    ws.getCell('A3').alignment = { horizontal: 'center' };

    ws.getCell('A4').value = 'NOMBRE Y APELLIDOS';
    ws.getCell('B4').value = 'CÉDULA';
    ws.getCell('C4').value = 'ÁREA';
    ws.getCell('D4').value = 'DÍAS';
    ws.getCell('E4').value = 'RECARGOS ORDINARIOS';
    ws.getCell('G4').value = 'RECARGOS FESTIVOS';
    ws.getCell('I4').value = 'HORAS EXTRAORDINARIAS';
    ws.getCell('J4').value = 'TOTALES HORAS';

    ws.mergeCells('A4:A5');
    ws.mergeCells('B4:B5');
    ws.mergeCells('C4:C5');
    ws.mergeCells('D4:D5');
    ws.mergeCells('E4:F4');
    ws.mergeCells('G4:H4');
    ws.mergeCells('I4:I5');
    ws.mergeCells('J4:J5');

    ws.getCell('E5').value = 'DIURNOS';
    ws.getCell('F5').value = 'NOCTURNOS';
    ws.getCell('G5').value = 'DIURNOS';
    ws.getCell('H5').value = 'NOCTURNOS';

    const headerCells = [
      'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4',
      'E5', 'F5', 'G5', 'H5',
    ];
    for (const cell of headerCells) {
      ws.getCell(cell).font = { bold: true };
      ws.getCell(cell).alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getCell(cell).border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    }

    let rowIndex = 6;
    for (const f of filas) {
      ws.getCell(`A${rowIndex}`).value = f.nombre;
      ws.getCell(`B${rowIndex}`).value = f.documento;
      ws.getCell(`C${rowIndex}`).value = f.area ?? '';
      ws.getCell(`D${rowIndex}`).value = f.diasRegistrados;
      ws.getCell(`E${rowIndex}`).value = f.recargoOrdinarioDiurno;
      ws.getCell(`F${rowIndex}`).value = f.recargoOrdinarioNocturno;
      ws.getCell(`G${rowIndex}`).value = f.recargoFestivoDiurno;
      ws.getCell(`H${rowIndex}`).value = f.recargoFestivoNocturno;
      ws.getCell(`I${rowIndex}`).value = f.horasExtraordinarias;
      ws.getCell(`J${rowIndex}`).value = f.totalHoras;
      rowIndex += 1;
    }

    // Fila de totales
    ws.getCell(`A${rowIndex}`).value = 'TOTALES';
    ws.getCell(`E${rowIndex}`).value = filas.reduce((s, f) => s + f.recargoOrdinarioDiurno, 0);
    ws.getCell(`F${rowIndex}`).value = filas.reduce((s, f) => s + f.recargoOrdinarioNocturno, 0);
    ws.getCell(`G${rowIndex}`).value = filas.reduce((s, f) => s + f.recargoFestivoDiurno, 0);
    ws.getCell(`H${rowIndex}`).value = filas.reduce((s, f) => s + f.recargoFestivoNocturno, 0);
    ws.getCell(`I${rowIndex}`).value = filas.reduce((s, f) => s + f.horasExtraordinarias, 0);
    ws.getCell(`J${rowIndex}`).value = filas.reduce((s, f) => s + f.totalHoras, 0);
    for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
      ws.getCell(`${col}${rowIndex}`).font = { bold: true };
    }
    ws.mergeCells(`A${rowIndex}:D${rowIndex}`);

    // Firma
    const firmaRow = rowIndex + 3;
    ws.mergeCells(`A${firmaRow}:E${firmaRow}`);
    ws.mergeCells(`F${firmaRow}:J${firmaRow}`);
    ws.getCell(`A${firmaRow}`).value = 'COORDINADOR DE FACTURACIÓN';
    ws.getCell(`F${firmaRow}`).value = 'SUBGERENTE ADMINISTRATIVA';
    ws.getCell(`A${firmaRow}`).alignment = { horizontal: 'center' };
    ws.getCell(`F${firmaRow}`).alignment = { horizontal: 'center' };
    ws.getCell(`A${firmaRow}`).font = { bold: true };
    ws.getCell(`F${firmaRow}`).font = { bold: true };

    ws.columns = [
      { width: 28 },
      { width: 16 },
      { width: 24 },
      { width: 8 },
      { width: 11 },
      { width: 11 },
      { width: 11 },
      { width: 11 },
      { width: 14 },
      { width: 13 },
    ];

    descargar(await wb.xlsx.writeBuffer(), `horas_extras_${year}_${month}.xlsx`);
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
      { header: 'Ord. Diurno', key: 'rod', width: 12 },
      { header: 'Ord. Nocturno', key: 'ron', width: 12 },
      { header: 'Fest. Diurno', key: 'rfd', width: 12 },
      { header: 'Fest. Nocturno', key: 'rfn', width: 12 },
      { header: 'Extraordinarias', key: 'extra', width: 14 },
      { header: 'Observaciones', key: 'obs', width: 30 },
    ];
    for (const d of detalle as DetalleFila[]) {
      ws.addRow({
        nombre: d.nombre,
        documento: d.documento,
        fecha: d.fecha,
        inicio: d.horaInicio,
        fin: d.horaFin,
        rod: d.recargoOrdinarioDiurno,
        ron: d.recargoOrdinarioNocturno,
        rfd: d.recargoFestivoDiurno,
        rfn: d.recargoFestivoNocturno,
        extra: d.horasExtraordinarias,
        obs: d.observaciones ?? '',
      });
    }
    ws.getRow(1).font = { bold: true };
    descargar(await wb.xlsx.writeBuffer(), `detalle_${year}_${month}.xlsx`);
  };

  const totalGeneral = filas.reduce((s, f) => s + f.totalHoras, 0);

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
            <Button onClick={exportarReporte} disabled={loading}>
              Exportar reporte
            </Button>
            <Button variant="default" onClick={exportarDetalle} disabled={loading}>
              Exportar detalle
            </Button>
          </Group>
        </Group>
      </Paper>

      <Paper withBorder p="md">
        <Table.ScrollContainer minWidth={1100}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Persona</Table.Th>
                <Table.Th>Documento</Table.Th>
                <Table.Th>Área</Table.Th>
                <Table.Th>Días</Table.Th>
                <Table.Th ta="center" colSpan={2}>
                  Recargos ordinarios
                </Table.Th>
                <Table.Th ta="center" colSpan={2}>
                  Recargos festivos
                </Table.Th>
                <Table.Th>Extraordinarias</Table.Th>
                <Table.Th ta="right">Total</Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th />
                <Table.Th />
                <Table.Th />
                <Table.Th />
                <Table.Th>Diurno</Table.Th>
                <Table.Th>Nocturno</Table.Th>
                <Table.Th>Diurno</Table.Th>
                <Table.Th>Nocturno</Table.Th>
                <Table.Th />
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filas.map((f) => (
                <Table.Tr key={f.personaId}>
                  <Table.Td fw={500}>{f.nombre}</Table.Td>
                  <Table.Td>{f.documento}</Table.Td>
                  <Table.Td>{f.area ?? '—'}</Table.Td>
                  <Table.Td>{f.diasRegistrados}</Table.Td>
                  <Table.Td>{f.recargoOrdinarioDiurno}</Table.Td>
                  <Table.Td>{f.recargoOrdinarioNocturno}</Table.Td>
                  <Table.Td>{f.recargoFestivoDiurno}</Table.Td>
                  <Table.Td>{f.recargoFestivoNocturno}</Table.Td>
                  <Table.Td>{f.horasExtraordinarias}</Table.Td>
                  <Table.Td ta="right" fw={600}>
                    {f.totalHoras}
                  </Table.Td>
                </Table.Tr>
              ))}
              {filas.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={10}>
                    <Text c="dimmed" ta="center">
                      Sin personas registradas.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Group justify="flex-end" mt="md">
          <Badge size="lg" variant="light">
            Total general: {totalGeneral} h
          </Badge>
        </Group>
      </Paper>
    </Stack>
  );
}
