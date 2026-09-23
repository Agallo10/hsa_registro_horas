import { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { ContextModalProps, modals } from '@mantine/modals';
import { registrosApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import type { Registro } from '../../types';

interface LocalBlock {
  id?: string;
  horaInicio: string;
  horaFin: string;
  observaciones: string;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function hoursBetween(inicio: string, fin: string): number {
  const diff = toMinutes(fin) - toMinutes(inicio);
  return Math.round((diff / 60) * 100) / 100;
}

interface RegistroModalProps {
  fecha: string;
  registros: Registro[];
  onChanged: () => void;
}

export function RegistroModal({
  context,
  id,
  innerProps,
}: ContextModalProps<RegistroModalProps>) {
  const { fecha, registros, onChanged } = innerProps;

  const [blocks, setBlocks] = useState<LocalBlock[]>(() =>
    registros.map((r) => ({
      id: r.id,
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      observaciones: r.observaciones ?? '',
    })),
  );
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBlock = (
    index: number,
    field: keyof LocalBlock,
    value: string,
  ) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    );
  };

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { horaInicio: '', horaFin: '', observaciones: '' },
    ]);
  };

  const removeBlock = (index: number) => {
    const block = blocks[index];
    if (block.id) {
      setRemovedIds((prev) => [...prev, block.id as string]);
    }
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    setError(null);

    for (const block of blocks) {
      if (!block.horaInicio || !block.horaFin) {
        setError('Todos los bloques deben tener hora de inicio y fin');
        return;
      }
      if (toMinutes(block.horaFin) <= toMinutes(block.horaInicio)) {
        setError('La hora de fin debe ser mayor a la de inicio');
        return;
      }
    }

    setSaving(true);
    try {
      await Promise.all(removedIds.map((rid) => registrosApi.remove(rid)));

      await Promise.all(
        blocks.map((block) => {
          const payload = {
            horaInicio: block.horaInicio,
            horaFin: block.horaFin,
            observaciones: block.observaciones || undefined,
          };
          if (block.id) {
            return registrosApi.update(block.id, payload);
          }
          return registrosApi.create({ fecha, ...payload });
        }),
      );

      onChanged();
      context.closeModal(id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (index: number) => {
    if (blocks[index].id) {
      modals.openConfirmModal({
        title: 'Eliminar bloque',
        children: (
          <Text size="sm">
            ¿Seguro que deseas eliminar este bloque de horas?
          </Text>
        ),
        labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
        confirmProps: { color: 'red' },
        onConfirm: () => removeBlock(index),
      });
    } else {
      removeBlock(index);
    }
  };

  const total = blocks.reduce(
    (sum, b) =>
      sum + (b.horaInicio && b.horaFin ? hoursBetween(b.horaInicio, b.horaFin) : 0),
    0,
  );

  return (
    <Stack>
      <Text size="sm" c="dimmed">
        {fecha}
      </Text>

      {error && <Alert color="red">{error}</Alert>}

      {blocks.length === 0 && (
        <Text size="sm" c="dimmed">
          Sin horas registradas este día.
        </Text>
      )}

      {blocks.map((block, index) => (
        <div key={block.id ?? `nuevo-${index}`}>
          {index > 0 && <Divider my="xs" />}
          <Group align="flex-end" wrap="nowrap">
            <TimeInput
              label="Inicio"
              value={block.horaInicio}
              onChange={(e) =>
                updateBlock(index, 'horaInicio', e.currentTarget.value)
              }
              style={{ flex: 1 }}
            />
            <TimeInput
              label="Fin"
              value={block.horaFin}
              onChange={(e) =>
                updateBlock(index, 'horaFin', e.currentTarget.value)
              }
              style={{ flex: 1 }}
            />
            <Text size="sm" c="dimmed" mb={4}>
              {block.horaInicio && block.horaFin
                ? `${hoursBetween(block.horaInicio, block.horaFin)} h`
                : ''}
            </Text>
            <ActionIcon
              color="red"
              variant="subtle"
              mb={2}
              onClick={() => confirmDelete(index)}
            >
              ✕
            </ActionIcon>
          </Group>
          <Textarea
            mt="xs"
            placeholder="Observaciones (opcional)"
            autosize
            minRows={1}
            maxRows={3}
            value={block.observaciones}
            onChange={(e) =>
              updateBlock(index, 'observaciones', e.currentTarget.value)
            }
          />
        </div>
      ))}

      <Button variant="light" onClick={addBlock}>
        + Agregar bloque
      </Button>

      <Group justify="space-between" mt="sm">
        <Text size="sm" fw={600}>
          Total: {total} h
        </Text>
        <Group gap="sm">
          <Button variant="default" onClick={() => context.closeModal(id)}>
            Cancelar
          </Button>
          <Button loading={saving} onClick={save}>
            Guardar
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
