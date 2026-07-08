import { createTheme, type PaletteMode, type ThemeOptions } from '@mui/material/styles';
import { palette } from './palette';

const typography: ThemeOptions['typography'] = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'sans-serif',
  ].join(','),
  h1: { fontWeight: 600 },
  h2: { fontWeight: 600 },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 500, textTransform: 'none' },
};

export function buildTheme(mode: PaletteMode) {
  return createTheme({
    palette: { mode, ...palette[mode] },
    typography,
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${palette[mode].divider}`,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: { head: { fontWeight: 600 } },
      },
    },
  });
}
