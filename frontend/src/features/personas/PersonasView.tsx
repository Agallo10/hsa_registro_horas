import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { personasApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import type { Persona } from '../../types';

interface FormState {
  id: string | null;
  nombre: string;
  documento: string;
  correo: string;
  area: string;
}

const emptyForm: FormState = {
  id: null,
  nombre: '',
  documento: '',
  correo: '',
  area: '',
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card padding="md" radius="md" withBorder>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fw={700} fz={28} c={color} lh={1.1}>
        {value}
      </Text>
    </Card>
  );
}

export function PersonasView() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setPersonas(await personasApi.list());
  }, []);

  useEffect(() => {
    cargar().catch(() => undefined);
  }, [cargar]);

  const activas = useMemo(
    () => personas.filter((p) => p.activo).length,
    [personas],
  );

  const abrirNueva = () => {
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  };

  const abrirEditar = (p: Persona) => {
    setForm({
      id: p.id,
      nombre: p.nombre,
      documento: p.documento,
      correo: p.correo ?? '',
      area: p.area ?? '',
    });
    setError(null);
    setOpen(true);
  };

  const guardar = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        documento: form.documento,
        correo: form.correo || undefined,
        area: form.area || undefined,
      };
      if (form.id) {
        await personasApi.update(form.id, payload);
      } else {
        await personasApi.create(payload);
      }
      setOpen(false);
      await cargar();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (p: Persona) => {
    await personasApi.update(p.id, { activo: !p.activo });
    await cargar();
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Personas</Title>
          <Text c="dimmed" size="sm">
            Haz clic en una persona para registrar sus horas.
          </Text>
        </div>
        <Button onClick={abrirNueva}>Nueva persona</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 3 }}>
        <StatCard label="Total" value={personas.length} color="hsaGreen.7" />
        <StatCard label="Activas" value={activas} color="hsaGreen.6" />
        <StatCard
          label="Inactivas"
          value={personas.length - activas}
          color="gray.6"
        />
      </SimpleGrid>

      <Paper withBorder radius="lg" p={0} style={{ overflow: 'hidden' }}>
        <Table
          className="hsa-table"
          highlightOnHover
          horizontalSpacing="md"
          verticalSpacing="sm"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Documento</Table.Th>
              <Table.Th>Área</Table.Th>
              <Table.Th>Correo</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {personas.map((p) => (
              <Table.Tr
                key={p.id}
                className={p.activo ? 'hsa-row-clickable' : undefined}
                onClick={() => p.activo && navigate(`/persona/${p.id}`)}
              >
                <Table.Td fw={600}>{p.nombre}</Table.Td>
                <Table.Td>{p.documento}</Table.Td>
                <Table.Td>{p.area ?? '—'}</Table.Td>
                <Table.Td>{p.correo ?? '—'}</Table.Td>
                <Table.Td>
                  {p.activo ? (
                    <Badge color="hsaGreen" variant="light">
                      Activo
                    </Badge>
                  ) : (
                    <Badge color="gray" variant="light">
                      Inactivo
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group
                    gap="xs"
                    justify="flex-end"
                    wrap="nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={p.activo}
                      onChange={() => toggleActivo(p)}
                      aria-label="Activar/desactivar"
                      color="hsaGreen"
                    />
                    <ActionIcon
                      variant="subtle"
                      color="hsaGreen"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEditar(p);
                      }}
                      aria-label="Editar"
                    >
                      ✎
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {personas.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" ta="center" py="lg">
                    No hay personas registradas. Crea la primera con “Nueva
                    persona”.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={form.id ? 'Editar persona' : 'Nueva persona'}
        centered
      >
        <Stack>
          {error && <Alert color="red">{error}</Alert>}
          <TextInput
            label="Nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) =>
              setForm((f) => ({ ...f, nombre: e.currentTarget.value }))
            }
          />
          <TextInput
            label="Documento"
            placeholder="Número de documento"
            value={form.documento}
            onChange={(e) =>
              setForm((f) => ({ ...f, documento: e.currentTarget.value }))
            }
          />
          <TextInput
            label="Área (opcional)"
            placeholder="Facturación Urgencias"
            value={form.area}
            onChange={(e) =>
              setForm((f) => ({ ...f, area: e.currentTarget.value }))
            }
          />
          <TextInput
            label="Correo (opcional)"
            type="email"
            value={form.correo}
            onChange={(e) =>
              setForm((f) => ({ ...f, correo: e.currentTarget.value }))
            }
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={guardar}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
