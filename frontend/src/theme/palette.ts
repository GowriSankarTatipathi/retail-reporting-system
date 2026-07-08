/**
 * Enterprise color palette: desaturated navy/slate primary, muted neutrals,
 * restrained semantic colors. Deliberately avoids saturated/"flashy" hues -
 * this should read like an internal business tool (Stripe Dashboard,
 * Salesforce Lightning, AWS Console), not a consumer product.
 */
export const palette = {
  light: {
    primary: { main: '#1E3A5F', light: '#3A5A80', dark: '#122840', contrastText: '#FFFFFF' },
    secondary: { main: '#546E7A', light: '#78909C', dark: '#37474F', contrastText: '#FFFFFF' },
    background: { default: '#F5F6F8', paper: '#FFFFFF' },
    text: { primary: '#1A1D21', secondary: '#5F6B7A' },
    divider: '#E1E4E8',
    success: { main: '#2E7D32' },
    warning: { main: '#B26A00' },
    error: { main: '#C62828' },
    info: { main: '#0277BD' },
  },
  dark: {
    primary: { main: '#5C82AA', light: '#82A6CC', dark: '#3A5A80', contrastText: '#0B1420' },
    secondary: { main: '#90A4AE', light: '#B0BEC5', dark: '#607D8B', contrastText: '#0B1420' },
    background: { default: '#12161C', paper: '#1A1F27' },
    text: { primary: '#E8EAED', secondary: '#9AA5B1' },
    divider: '#2B313B',
    success: { main: '#66BB6A' },
    warning: { main: '#FFA726' },
    error: { main: '#EF5350' },
    info: { main: '#4FC3F7' },
  },
} as const;
