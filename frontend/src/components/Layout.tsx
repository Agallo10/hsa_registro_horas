import {
  AppShell,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from '@mantine/core';
import { NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Text fw={700}>Registro de Horas</Text>
          </Group>
          <Group gap="sm">
            <Text size="sm" c="dimmed">
              {user?.nombre}
            </Text>
            <Button variant="subtle" size="xs" onClick={handleLogout}>
              Salir
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <ScrollArea>
          <NavLink
            component={RouterNavLink}
            to="/"
            label="Calendario"
            end
          />
          {isAdmin && (
            <>
              <NavLink
                component={RouterNavLink}
                to="/reporte"
                label="Reporte mensual"
              />
              <NavLink
                component={RouterNavLink}
                to="/usuarios"
                label="Usuarios"
              />
            </>
          )}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
