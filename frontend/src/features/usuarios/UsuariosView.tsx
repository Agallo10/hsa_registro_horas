import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Switch,
  Table,
  TextInput,
  Title,
} from '@mantine/core';
import { usersApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import type { Usuario } from '../../types';

export function UsuariosView() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('facturador');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setUsers(await usersApi.list());
  }, []);

  useEffect(() => {
    cargar().catch(() => undefined);
  }, [cargar]);

  const toggleActivo = async (user: Usuario) => {
    await usersApi.update(user.id, { activo: !user.activo });
    await cargar();
  };

  const crear = async () => {
    setError(null);
    setSaving(true);
    try {
      await usersApi.create({ nombre, correo, password, rol });
      setOpen(false);
      setNombre('');
      setCorreo('');
      setPassword('');
      setRol('facturador');
      await cargar();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (user: Usuario) => {
    const nueva = window.prompt(`Nueva contraseña para ${user.nombre}:`);
    if (!nueva) return;
    await usersApi.resetPassword(user.id, nueva);
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Usuarios</Title>
        <Button onClick={() => setOpen(true)}>Nuevo facturador</Button>
      </Group>

      <Paper withBorder p="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Correo</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th>Activo</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((u) => (
              <Table.Tr key={u.id}>
                <Table.Td>{u.nombre}</Table.Td>
                <Table.Td>{u.correo}</Table.Td>
                <Table.Td>{u.rol}</Table.Td>
                <Table.Td>
                  <Switch
                    checked={u.activo}
                    onChange={() => toggleActivo(u)}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => resetPassword(u)}
                    >
                      Reset password
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title="Nuevo usuario"
      >
        <Stack>
          {error && <Alert color="red">{error}</Alert>}
          <TextInput
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.currentTarget.value)}
          />
          <TextInput
            label="Correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.currentTarget.value)}
          />
          <PasswordInput
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Select
            label="Rol"
            data={[
              { value: 'facturador', label: 'Facturador' },
              { value: 'administrador', label: 'Administrador' },
            ]}
            value={rol}
            onChange={(v) => setRol(v ?? 'facturador')}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={crear}>
              Crear
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
