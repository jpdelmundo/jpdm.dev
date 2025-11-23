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
        //fontSize: 15,
        fontFamily: 'Geist, Helvetica, Arial, sans-serif',
        body1: {
            fontSize: '15px'
        },
        body2: {
            fontSize: 12
        }
    },
    shape: {
        borderRadius: 8
    },
    components: {
        // MuiCssBaseline: {
        //     styleOverrides: {
        //         html: {
        //             fontSize: '15px',
        //         }
        //     }
        // },
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
            // defaultProps: {
            //     disableRipple: true
            // },
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
                            fontSize: '14px',
                            margin: 0
                        }
                    },
                    '&.post': {
                        borderRadius: '16px',
                        padding: '25px',
                        margin: '25px 0',
                        '& .header': {
                            marginBottom: '25px',
                            gap: '10px',
                            '& .MuiAvatar-root': {
                                width: '32px',
                                height: '32px'
                            }
                        },
                        '& .user': {
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.2
                        },
                        '& .title': {
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            wordBreak: 'break-word',
                            wordWrap: 'break-word',
                            lineHeight: 1
                        },
                        '& .content': {
                            marginTop: '25px'
                        },
                        '& .date': {
                            fontSize: '12px',
                            color: '#888888',
                            lineHeight: 1.2
                        },
                        '& .user-date-box': {
                            maxWidth: '92%'
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
                    },
                    '& .MuiModal-backdrop': {
                        backgroundColor: '#ffffffaa'
                    }
                }
            }
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    '&.header-container': {
                        padding: '10px',
                        backdropFilter: 'saturate(1.8) blur(20px)',
                        maxWidth: 'unset !important',
                        display: 'block',
                        position: 'fixed',
                        //borderBottom: 'solid 1px #e3e3e3'
                    }
                }
            }
        },
        // MuiIconButton: {
        //     defaultProps: {
        //         disableRipple: true
        //     }
        // },
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
                disableTouchRipple: true
            }
        }
    }
});