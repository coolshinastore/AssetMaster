import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#f8f9fc',
    },
    primary: {
      main: '#3B82F6',
      dark: '#1f5bd1',
      light: '#eef4ff',
    },
    secondary: {
      main: '#1A1F3C',
    },
    warning: {
      main: '#f5a623',
    },
    error: {
      main: '#f2547d',
    },
    success: {
      main: '#1aa06a',
    },
    text: {
      primary: '#1A1F3C',
      secondary: '#5b6280',
      disabled: '#9aa0b6',
    },
    divider: '#e5e8f0',
  },

  typography: {
    fontFamily: '"Inter", "DM Sans", system-ui, sans-serif',
    h1: {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.035em',
    },
    h2: {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.03em',
    },
    h3: {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 8,
  },

  spacing: 4,

  breakpoints: {
    values: {
      xs: 0,
      sm: 560,
      md: 860,
      lg: 1080,
      xl: 1440,
    },
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          border: '1px solid #e5e8f0',
          borderRadius: 16,
          transition: 'transform .18s ease, box-shadow .18s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e5e8f0',
          boxShadow: 'none',
          color: '#1A1F3C',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
  },
})

export default theme
