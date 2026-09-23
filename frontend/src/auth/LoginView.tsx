import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useAuth } from './AuthContext';
import { getErrorMessage } from '../api/client';

export function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(correo, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh" bg="gray.0">
      <Paper withBorder shadow="md" p="xl" w={360} radius="md">
        <form onSubmit={onSubmit}>
          <Stack>
            <Title order={3}>Registro de Horas</Title>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label="Correo"
              type="email"
              required
              autoFocus
              value={correo}
              onChange={(e) => setCorreo(e.currentTarget.value)}
            />
            <PasswordInput
              label="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button type="submit" loading={loading} fullWidth mt="sm">
              Ingresar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
