import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        background: {
            default: '#f3f3f3'
        }
    },
    typography: {
        fontSize: 14,
        fontFamily: 'Geist, Helvetica, Arial, sans-serif',
        body2: {
            fontSize: 12
        }
    },
    shape: {
        borderRadius: 8
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    fontSize: '14px',
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '& .MuiOutlinedInput-notchedOutline': {
                        //boxShadow: '0 1px 2px 0px rgba(0,0,0,.1)',
                        borderColor: '#e5e5e5'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e5e5e5'
                    },
                    '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.error.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '1px',
                        borderColor: '#e5e5e5'
                    },
                    '&.Mui-focused': {
                        transition: 'box-shadow 0.25s ease',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.20)',
                    },
                    '&.Mui-focused.Mui-error': {
                        boxShadow: `0 0 0 3px ${theme.palette.error.main}40`
                    },
                    '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '1px',
                        borderColor: theme.palette.error.main
                    },
                }),
                input: {
                    boxSizing: 'border-box',
                    height: '36px',
                    lineHeight: '20px',
                    padding: '4px 12px'
                }
            }
        },
        MuiTextField: {
            defaultProps: {
                slotProps: {
                    formHelperText: {
                        sx: {
                            display: 'block',
                            color: 'error.main',
                            fontSize: '12px',
                            transition: 'opacity 300ms ease'
                        }
                    }
                },
            }
        },
        MuiButton: {
            defaultProps: {
                disableRipple: true
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    fontSize: 14,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                    '&:active': { boxShadow: 'none' },
                    '&:focus': { boxShadow: 'none' },
                    '&.Mui-disabled': {
                        color: '#ffffff',
                        backgroundColor: theme.palette.primary.main,
                        opacity: '.5'
                    }
                })
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                inputRoot: {
                    boxSizing: 'border-box',
                    height: '36px',
                    lineHeight: '20px',
                    padding: '4px 12px'
                }
            }
        },
        MuiCircularProgress: {
            defaultProps: {
                size: 14,
                sx: {
                    color: '#ffffff'
                }
            }
        }
    }
});