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
        primary: {
            main: '#006effff'
        },
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
    components: { //no MuiBox under createTheme components (for MuiBox classes add it here)
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    '&.modal-dialog-open': {
                        overflow: 'hidden',
                        '& body': {
                            overflowY: 'scroll'
                        }
                    },
                    paddingBottom: '50px'
                },
                main: {
                    '&.MuiContainer-root': {
                        paddingLeft: 10,
                        paddingRight: 10
                    }
                },
                '.grecaptcha-badge': {
                    display: 'none'
                },
                '.bordered-box': {
                    border: 'solid 1px #cccccc',
                    borderRadius: '16px',
                },
                '.inline-flex-box': {
                    display: 'inline-flex',
                    gap: '8px',
                    alignItems: 'center'
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
            styleOverrides: {
                containedPrimary: {
                    backgroundColor: '#1b54a5ff',
                    '&:hover': {
                        backgroundColor: '#2e70ffff'
                    }
                },
                root: ({ theme }) => ({
                    fontSize: 15,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none', },
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
            styleOverrides: {
                root: {
                    color: '#88888888'
                }
            },
            defaultProps: {
                size: 15,
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: () => ({
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
                        boxShadow: '0 4px 1px -2px #00000022',
                        position: 'relative',
                        background: 'none',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            //backdropFilter: 'saturate(1.8) blur(20px)',
                            backgroundColor: '#ffffffcc',

                            // backgroundColor: '#ffffff',
                            zIndex: -1,
                            borderRadius: '16px',
                            overflow: 'hidden'
                        },
                        borderRadius: '16px',
                        margin: '25px 0',
                        '& .header': {
                            marginBottom: '10px',
                            gap: '10px',
                            alignItems: 'center',
                            '& .MuiAvatar-root': {
                                width: '40px',
                                height: '40px'
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
                            marginTop: '10px',
                            marginBottom: '10px',
                            [theme.breakpoints.down('sm')]: {
                                fontSize: '14px',
                            },
                            [theme.breakpoints.up('sm')]: {
                                fontSize: '16px',
                            },
                            [theme.breakpoints.up('md')]: {
                                fontSize: '18px',
                            },
                        },
                        '& .date': {
                            fontSize: '11px',
                            color: '#888888',
                            lineHeight: 1.2
                        },
                        '& .user-date-box': {
                            maxWidth: '92%'
                        },
                        padding: '25px',
                        [theme.breakpoints.down('sm')]: {
                            padding: '15px',
                        },
                        '& .controls': {
                            color: '#595959',
                            justifyContent: 'end',
                            marginTop: '10px'
                        },
                        '& .share-button-container, .stats-button-container, .likes-button-container, .comments-button-container': {
                            display: 'flex',
                            flexBasis: '70px',
                            justifyContent: 'start',
                            alignItems: 'center',
                            '& .icon-stats': {
                                padding: '2px 8px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                '&:hover': {
                                    color: 'initial',
                                    // transition: '.2s',
                                    //transform: 'translateY(-10%)'
                                    backgroundColor: '#e8e8e888'
                                }
                            }
                        },
                        '& .share-button-container': {
                            flexBasis: 0
                        },
                        '& .new-comment, .edit-comment': {
                            '& .MuiInputBase-root': {
                                fontSize: '14px',
                                borderRadius: '16px',
                                paddingRight: 0,
                                marginTop: '10px',
                                backgroundColor: '#ffffff',
                                border: 'solid 1px #dddddd',
                                '&.Mui-focused': {
                                    transition: 'none',
                                    boxShadow: 'none',
                                },
                                '&.MuiInputBase-multiline': {
                                    padding: 0,
                                    '& .MuiInputBase-input': {
                                        padding: '8px 12px'
                                    }
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: '#555555',
                                    opacity: 1
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                }
                            }
                        },
                        '& .edit-comment': {
                            '& .MuiFormControl-root': { marginTop: 0 },
                            '& .MuiInputBase-root': { marginTop: 0, marginBottom: '6px', }
                        },
                        '& .comments': {
                            display: 'block',
                            '& .list': {
                                '& .show-more': {
                                    '&:hover': {
                                        backgroundColor: '#ffffff',
                                    },
                                    fontSize: '12px',
                                    margin: '0 auto',
                                    backgroundColor: '#f8f8f8',
                                    border: 'solid 1px #dddddd',
                                    color: theme.palette.getContrastText('#f8f8f8')
                                }
                            }
                        },
                        '& .comment': {
                            marginBottom: '5px',
                            '&.first': {
                                marginTop: '25px'
                            },
                            '& .content': {
                                margin: 0,
                                fontSize: '14px',
                                //whiteSpace: 'pre-line',
                                lineHeight: '20px',
                                '& .double-break': {
                                    display: 'block',
                                    height: '5px'
                                }
                            },
                            '& .detail': {
                                justifySelf: 'flex-start',
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                padding: '6px 12px',
                                //maxWidth: '85%',
                                '& .user': {
                                    fontSize: '12px'
                                },
                                maxWidth: '80%',
                                border: 'solid 1px #dddddd'
                            },
                            '& .date': {
                                padding: '6px 12px'
                            },
                            '& .comment-options': {
                                display: 'none'
                            },
                            '&:hover .comment-options': {
                                display: 'flex',
                                '& .edit': {
                                    padding: '0px 4px',
                                    fontSize: '12px',
                                    minWidth: 'unset',
                                    backgroundColor: '#eeeeeeff',
                                    color: theme.palette.getContrastText('#eeeeeeff'),
                                    '&:hover': { backgroundColor: '#ffffffff' }
                                },
                                '& .delete': {
                                    padding: '0',
                                    margin: 'auto 0',
                                    color: 'white',
                                    backgroundColor: '#8d2800ff',
                                    borderRadius: '50%',
                                    '&:hover': { backgroundColor: '#b32f00' }
                                }
                            }
                        }
                    },
                    '&.page': {
                        padding: '25px',
                        borderRadius: '16px',
                        position: 'relative',
                        background: 'none',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            //backdropFilter: 'saturate(1.8) blur(20px)',
                            backgroundColor: '#ffffffcc',

                            // backgroundColor: '#ffffff',
                            zIndex: -1,
                            borderRadius: '16px',
                            overflow: 'hidden'
                        },
                    }
                })
            }
        },
        MuiDialog: {
            styleOverrides: {
                root: () => ({
                    '& .MuiDialog-paper': {
                        boxShadow: '0 1px 2px #00000021, 0 4px 8px #00000010',
                    },
                    '& .MuiModal-backdrop': {
                        backgroundColor: '#f3f3f3dd'
                    },
                    '&.create-post-dialog': {
                        '& .MuiDialog-paper': {
                            maxWidth: '500px'
                        }
                    },
                    '&.post-image-dialog': {
                        '& .MuiDialog-paper': {
                            // [theme.breakpoints.up('sm')]: {
                            //     maxWidth: '100vw',
                            // },
                            maxWidth: '100%',
                            width: '100%',
                            background: 'none',
                            maxHeight: '100vh',
                            boxShadow: 'none',
                            borderRadius: 0,
                            margin: 0,
                            '& img': {
                                objectFit: 'contain',
                                width: '100%',
                                maxHeight: '90vh',
                            }
                        },
                        '& .MuiModal-backdrop': {
                            backgroundColor: '#000000',
                            //backdropFilter: 'saturate(1.8) blur(20px)'
                        },
                    }
                })
            }
        },
        MuiContainer: {
            styleOverrides: {
                root: ({ theme }) => ({
                    '&.header-container': {
                        padding: '10px',
                        backgroundColor: '#f3f3f3',
                        //boxShadow: '0 1px 10px -8px #00000055',
                        maxWidth: 'unset !important',
                        display: 'block',
                        position: 'fixed',
                        [theme.breakpoints.up('md')]: {
                            //boxShadow: 'none',
                            backgroundColor: 'transparent',
                            backdropFilter: 'saturate(1.8) blur(20px)'
                        }
                    }
                })
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
        },
        MuiPopover: {
            styleOverrides: {
                root: {
                    '&.context-menu': {
                        '& .MuiPaper-root': {
                            boxShadow: '0 3px 6px #00000022',
                        },
                        '& .MuiMenuItem-root': {
                            minHeight: '16px'
                        },
                    }
                }
            }
        }
    }
});