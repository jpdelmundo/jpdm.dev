import { createTheme } from '@mui/material/styles';
import type { } from '@mui/x-data-grid/themeAugmentation';
import type { } from '@mui/x-date-pickers/themeAugmentation';

export const theme = createTheme({
    cssVariables: true,
    breakpoints: {
        values: {
            xs: 0,
            sm: 680,
            md: 1024,
            lg: 1200,
            xl: 1536,
        },
    },
    palette: {
        primary: {
            main: '#1b54a5ff'
        },
        background: {
            default: '#f3f3f3'
        },
        divider: '#dddddd'
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
        borderRadius: 10
    },
    components: { //no MuiBox under createTheme components (for MuiBox classes add it here)
        MuiCssBaseline: {
            styleOverrides: () => ({
                ':root': {
                    //'--shadow-paper': '0 4px 1px -2px #00000022'
                    '--shadow-paper': '0 2px 2px -1px #00000022',
                    '--border': 'solid 1px #00000020'
                },
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
                    borderRadius: '20px',
                },
                '.inline-flex-box': {
                    display: 'inline-flex',
                    gap: '8px',
                    alignItems: 'center'
                }
            })
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: () => ({
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
            },
            styleOverrides: {
                root: () => ({
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff'
                    },
                    '& .MuiInputBase-multiline': {
                        boxSizing: 'border-box',
                        lineHeight: '20px',
                        padding: '8px 12px',
                        // marginTop: '10px',
                        // marginBottom: '10px',
                        '& .MuiInputBase-inputMultiline': {
                            padding: 0
                        }
                    }
                })
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
                root: () => ({
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
                        //boxShadow: 'var(--shadow-paper)',
                        position: 'relative',
                        background: 'none',
                        backgroundColor: '#ffffffcc',
                        borderRadius: '20px',
                        marginBottom: '25px',
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
                            whiteSpace: 'pre-wrap',
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
                                borderRadius: '20px',
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
                                borderRadius: '20px',
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
                                borderRadius: '20px',
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
                        borderRadius: '20px',
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
                            borderRadius: '20px',
                            overflow: 'hidden'
                        },
                    }
                })
            }
        },
        MuiDialog: {
            styleOverrides: {
                root: () => ({
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
                }),
                paper: {
                    boxShadow: '0 1px 2px #00000021, 0 4px 8px #00000010',
                    width: '100%',
                    margin: 0
                }
            }
        },
        MuiContainer: {
            styleOverrides: {
                root: () => ({
                    '&.header-container': {
                        top: 0,
                        padding: '10px',
                        backgroundColor: '#f3f3f391',
                        backdropFilter: 'saturate(180%) blur(20px)',
                        //boxShadow: '0 1px 10px -8px #00000055',
                        maxWidth: 'unset !important',
                        display: 'block',
                        position: 'fixed',
                        // [theme.breakpoints.up('md')]: {
                        //     //boxShadow: 'none',
                        //     backgroundColor: '#f3f3f391',
                        //     backdropFilter: 'saturate(180%) blur(20px)'
                        // }
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
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    '& .MuiSelect-select': {
                        lineHeight: '28px',
                        height: '36px'
                    }
                }
            }
        },
        MuiPickersOutlinedInput: {
            styleOverrides: {
                root: () => ({
                    backgroundColor: '#ffffff',
                    '& .MuiPickersOutlinedInput-notchedOutline': {
                        //boxShadow: '0 1px 2px 0px rgba(0,0,0,.1)',
                        borderColor: '#e5e5e5',
                        //backgroundColor: '#ffffff'
                    },
                    '&:hover .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: '#e5e5e5'
                    },
                    '&.Mui-error:hover .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.error.main,
                    },
                    '&.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline': {
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
                    '&.Mui-focused.Mui-error .MuiPickersOutlinedInput-notchedOutline': {
                        borderWidth: '1px',
                        borderColor: theme.palette.error.main
                    },
                }),
                sectionsContainer: {
                    '& .MuiPickersSectionList-section': {
                        lineHeight: '28px'
                    },
                    boxSizing: 'border-box',
                    height: '36px',
                    lineHeight: '20px',
                    padding: '4px 0'
                }
            }
        },
        MuiPickersTextField: {
            defaultProps: {
                FormHelperTextProps: {
                    sx: {
                        display: 'block',
                        color: 'error.main',
                        fontSize: '12px',
                        transition: 'opacity 300ms ease'
                    }

                }
            }
        },
        MuiDataGrid: {
            // defaultProps: {
            //     rowHeight: 40,
            //     columnHeaderHeight: 42
            // },
            styleOverrides: {
                root: {
                    fontSize: '15px',
                    '& .MuiDataGrid-row': {
                        minHeight: '52px !important'
                    },
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        '& .content': {
                            margin: '8px 0',
                            '& .double-break': {
                                display: 'block',
                                height: '5px'
                            }
                        },
                        '&.MuiDataGrid-cell.MuiDataGrid-cell--editing': {
                            boxShadow: 'none',
                            padding: '1px 10px',
                            // '&:focus, &:focus-within': {
                            //     outline: 'none',
                            //     outlineOffset: '0'
                            // }
                        }
                    }
                },
            }
        }
    }
});