import {
  AppShell,
  Box,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { palette } from '../theme/theme';

function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <Box
      w={size}
      h={size}
      style={{
        background: '#ffffff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: palette.greenDark,
        fontWeight: 800,
        fontSize: size * 0.32,
        letterSpacing: '-0.5px',
        flexShrink: 0,
      }}
    >
      HSA
    </Box>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 232, breakpoint: 'sm' }}
      padding="lg"
      styles={{ main: { backgroundColor: palette.bg } }}
    >
      <AppShell.Header className="hsa-brand-bar" style={{ border: 'none' }}>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <BrandMark />
            <div>
              <Text fw={700} c="white" lh={1.15} size="sm">
                Hospital San Andrés E.S.E.
              </Text>
              <Text size="xs" c="green.1" lh={1.15}>
                Registro de Horas
              </Text>
            </div>
          </Group>
          <Group gap="md" wrap="nowrap">
            <Text size="sm" c="white" visibleFrom="sm">
              {user?.nombre}
            </Text>
            <Button
              size="xs"
              variant="white"
              color="hsaGreen"
              onClick={handleLogout}
            >
              Salir
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" bg="white">
        <ScrollArea>
          <Stack gap={4}>
            <Text size="xs" fw={600} c="dimmed" px="xs" mb={4}>
              MENÚ
            </Text>
            <NavLink
              component={RouterNavLink}
              to="/"
              label="Personas"
              end
              variant="light"
              styles={{
                root: { borderRadius: 8 },
                label: { fontWeight: 500 },
              }}
            />
            <NavLink
              component={RouterNavLink}
              to="/reporte"
              label="Reporte mensual"
              variant="light"
              styles={{
                root: { borderRadius: 8 },
                label: { fontWeight: 500 },
              }}
            />
          </Stack>
        </ScrollArea>
        <Box mt="auto" pt="md">
          <Text size="xs" c="dimmed" ta="center">
            Hospital San Andrés E.S.E.
          </Text>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
