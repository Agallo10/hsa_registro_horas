import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
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
    <Center mih="100vh" className="hsa-login-bg" p="md">
      <Paper
        w={400}
        radius="lg"
        shadow="xl"
        style={{ overflow: 'hidden' }}
        withBorder={false}
      >
        <Box className="hsa-brand-bar" p="lg">
          <Group gap="sm" wrap="nowrap">
            <Box
              w={44}
              h={44}
              style={{
                background: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#038C25',
                fontWeight: 800,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              HSA
            </Box>
            <div>
              <Text fw={700} c="white" lh={1.2}>
                Hospital San Andrés E.S.E.
              </Text>
              <Text size="xs" c="green.1" lh={1.2}>
                Calidad y Calidez a su Servicio
              </Text>
            </div>
          </Group>
        </Box>

        <Box p="xl">
          <form onSubmit={onSubmit}>
            <Stack>
              <div>
                <Title order={3}>Registro de Horas</Title>
                <Text size="sm" c="dimmed">
                  Ingresa con tu cuenta de supervisor.
                </Text>
              </div>

              {error && <Alert color="red">{error}</Alert>}

              <TextInput
                label="Correo"
                type="email"
                placeholder="usuario@hospital.local"
                required
                autoFocus
                size="md"
                value={correo}
                onChange={(e) => setCorreo(e.currentTarget.value)}
              />
              <PasswordInput
                label="Contraseña"
                placeholder="Tu contraseña"
                required
                size="md"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <Button type="submit" loading={loading} fullWidth size="md" mt="xs">
                Ingresar
              </Button>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Center>
  );
}
