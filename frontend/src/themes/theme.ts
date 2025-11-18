import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 680,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    palette: {
        background: {
            default: '#f3f3f3'
        }
    },
    typography: {
        fontSize: 15,
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
                    fontSize: '15px',
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
                    fontSize: 15,
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
                size: 15,
                sx: {
                    color: '#ffffff'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    '&.post-form': {
                        boxShadow: 'none',
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                        },
                        '& .Mui-focused': {
                            transition: 'none',
                            boxShadow: 'none'
                        },
                        '& .MuiInputBase-input': {
                            padding: '4px 0'
                        },
                        '& .MuiInputBase-root': {
                            padding: 0
                        },
                        '& .MuiInputBase-root.Mui-error': {
                            boxShadow: 'none'
                        },
                        '& .helper-text-container': {
                            marginTop: 0
                        },
                        '& .helper-text': {
                            fontSize: '15px',
                            marginTop: 0,
                            marginLeft: '12px'
                        }
                    }
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                root: {
                    '& .MuiDialog-paper': {
                        maxWidth: '500px',
                        boxShadow: '0 1px 2px #cccccc, 0 4px 8px #dddddd',
                    }
                }
            }
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff60',
                }
            }
        }
    }
});