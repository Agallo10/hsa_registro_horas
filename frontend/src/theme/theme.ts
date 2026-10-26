import { createTheme, type MantineColorsTuple } from '@mantine/core';

/**
 * Paleta institucional del Hospital San Andrés E.S.E.
 * (tomada de frontend/public/paleta_hs.jpeg)
 */
export const palette = {
  greenDark: '#038C25',
  green: '#1BA62F',
  lime: '#AFD918',
  yellow: '#F2E205',
  bg: '#F2F2F2',
} as const;

const hsaGreen: MantineColorsTuple = [
  '#e8f6ec',
  '#d0ecd8',
  '#a6d9b6',
  '#79c592',
  '#4db170',
  '#219d4f',
  '#038C25',
  '#037321',
  '#025a1a',
  '#014212',
];

const hsaLime: MantineColorsTuple = [
  '#f6fbe3',
  '#ecf6c2',
  '#ddee94',
  '#cce564',
  '#bcdd39',
  '#AFD918',
  '#9cc014',
  '#88a611',
  '#738c0d',
  '#5e720a',
];

const hsaYellow: MantineColorsTuple = [
  '#fefce3',
  '#fdf8bb',
  '#fbf28c',
  '#f8ec5e',
  '#f5e830',
  '#F2E205',
  '#dacb04',
  '#c1b303',
  '#a89c02',
  '#8f8502',
];

export const theme = createTheme({
  primaryColor: 'hsaGreen',
  primaryShade: { light: 6, dark: 5 },
  colors: {
    hsaGreen,
    hsaLime,
    hsaYellow,
  },
  defaultRadius: 'md',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '700',
  },
  components: {
    Card: {
      defaultProps: { withBorder: true, radius: 'lg', shadow: 'sm' },
    },
    Paper: {
      defaultProps: { radius: 'lg' },
    },
    Button: {
      defaultProps: { radius: 'md' },
    },
    Badge: {
      defaultProps: { radius: 'sm' },
    },
  },
});
