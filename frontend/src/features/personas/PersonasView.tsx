import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
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
}

const emptyForm: FormState = {
  id: null,
  nombre: '',
  documento: '',
  correo: '',
};

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
    <Stack>
      <Group justify="space-between">
        <div>
          <Title order={2}>Personas</Title>
          <Text c="dimmed" size="sm">
            Haz clic en una persona para registrar sus horas.
          </Text>
        </div>
        <Button onClick={abrirNueva}>Nueva persona</Button>
      </Group>

      <Paper withBorder p="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Documento</Table.Th>
              <Table.Th>Correo</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {personas.map((p) => (
              <Table.Tr
                key={p.id}
                style={{ cursor: p.activo ? 'pointer' : 'default' }}
                onClick={() => p.activo && navigate(`/persona/${p.id}`)}
              >
                <Table.Td fw={500}>{p.nombre}</Table.Td>
                <Table.Td>{p.documento}</Table.Td>
                <Table.Td>{p.correo ?? '—'}</Table.Td>
                <Table.Td>
                  {p.activo ? (
                    <Badge color="teal">Activo</Badge>
                  ) : (
                    <Badge color="gray">Inactivo</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end" wrap="nowrap">
                    <Switch
                      checked={p.activo}
                      onChange={() => toggleActivo(p)}
                      aria-label="Activar/desactivar"
                    />
                    <ActionIcon
                      variant="subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEditar(p);
                      }}
                    >
                      ✎
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {personas.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center">
                    No hay personas registradas.
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
      >
        <Stack>
          {error && <Alert color="red">{error}</Alert>}
          <TextInput
            label="Nombre"
            value={form.nombre}
            onChange={(e) =>
              setForm((f) => ({ ...f, nombre: e.currentTarget.value }))
            }
          />
          <TextInput
            label="Documento"
            value={form.documento}
            onChange={(e) =>
              setForm((f) => ({ ...f, documento: e.currentTarget.value }))
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
          <Group justify="flex-end">
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
