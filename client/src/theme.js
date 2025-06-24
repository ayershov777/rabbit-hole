import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1a1a2e',
            contrastText: '#fafafa'
        },
        secondary: {
            main: '#0066ff',
            contrastText: '#fafafa'
        },
        background: {
            default: '#fafafa',
            paper: '#fafafa'
        },
        text: {
            primary: '#1a1a2e',
            secondary: '#4a4a6a'
        }
    },
    typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeightRegular: 500,
        fontWeightMedium: 600,
        fontWeightBold: 700
    },
    shape: {
        borderRadius: 8
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600
                }
            }
        }
    }
});
