import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import {
    Alert, Backdrop,
    Box, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid, Snackbar,
    TextField
} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Paper from "@mui/material/Paper";
import axios from "axios";
import {SuperAdminManagesAdministratorContext} from "./SuperAdminManagesAdministratorContext.jsx";
import {jwtDecode} from "jwt-decode";

function SuperAdminCreateAdministrator(){
    const {getAllAdministrator} = useContext(SuperAdminManagesAdministratorContext)
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('')
    const [errors, setErrors] = useState({
        name: false,
        lastName: false,
        mail: false,
        dni: false
    })
    const [adminInfo, setAdminInfo] = useState({})
    const [adminCreated, setAdminCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [isFormWellComplete, setIsFormWellComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const validateFields = () => {
        const nameRegex = /^[A-Za-z]+$/
        const mailRegex = /.+@.+\..+/
        const dniRegex = /^[0-9]+$/

        setErrors({
            name: !nameRegex.test(adminInfo.name),
            lastName: !nameRegex.test(adminInfo.lastName),
            mail: !mailRegex.test(adminInfo.mail),
            dni: !dniRegex.test(adminInfo.dni)
        })

        return (
            nameRegex.test(adminInfo.name) &&
            nameRegex.test(adminInfo.lastName) &&
            mailRegex.test(adminInfo.mail) &&
            dniRegex.test(adminInfo.dni)
        )
    }
    const areFieldsComplete = () => {
        const {
            name,
            lastName,
            mail,
            dni
        } = adminInfo;

        if (!name || !lastName || !mail || !dni ) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        setIsFormWellComplete(areFieldsComplete());
    }, [adminInfo]);

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleClose = () => {
        setOpen(false)
        setErrors({
            name: false,
            lastName: false,
            mail: false,
            dni: false
        })
        setAdminInfo({})

    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const handleChange = (event) => {
        const name = event.target.name
        const value = event.target.value
        setAdminInfo(values => ({...values, [name]: value}))}

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            setLoading(false)
            return; // Detiene la ejecución si no hay token
        }

        try {
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                setLoading(false);
                return;
            }

            if (validateFields()) {
                console.log(adminInfo);
                let url = `${import.meta.env.VITE_API_BASE_URL}/administrators`;

                try {
                    await axios.post(url, adminInfo, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    setText('Se realizo la carga correctamente');
                    setAdminCreated(true);
                    handleClose();
                } catch (exception) {
                    setAdminCreated(false);
                    switch (exception.response?.status) {
                        case 409:
                            setText(exception.response.data);
                            break;
                        default:
                            setText('No se realizo la carga, error de datos!!');
                    }
                } finally {
                    handleOpenAlert();
                    getAllAdministrator();
                }
            }
        } catch (error) {
            console.error("Error en la validación del token o la solicitud:", error);
            alert("Ocurrió un error al intentar realizar la acción. Por favor, inténtalo nuevamente.");
        }finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickOpen} sx={{
                backgroundColor: '#B2675E',
                color: '#FFFFFF',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '30px',
                padding: '10px 20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: '#A15D50',
                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)',
                },
                '&:active': {
                    backgroundColor: '#8A4A3D',
                },
            }}>
                Nuevo
            </Button>

            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose();
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>Nuevo Administrador</DialogTitle>

                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#F2F2F2', marginTop: '10px' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2}}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Nombre"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="name"
                                        value={adminInfo.name || ""}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 50 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.name ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.name ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.name ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484',
                                            },
                                        }}
                                        error={errors.name}
                                        helperText={errors.name ? 'Solo letras permitidas' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Apellido"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="lastName"
                                        value={adminInfo.lastName || ""}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 50 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.lastName ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.lastName ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.lastName ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#002776',
                                            },
                                        }}
                                        error={errors.lastName}
                                        helperText={errors.lastName ? 'Solo letras permitidas' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Correo Electrónico"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="mail"
                                        value={adminInfo.mail || ""}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 50 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.mail ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.mail ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.mail ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484',
                                            },
                                        }}
                                        error={errors.mail}
                                        helperText={errors.mail ? 'Correo inválido' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Dni"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="dni"
                                        value={adminInfo.dni || ""}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 8 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.dni ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.dni ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.dni ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', 
                                            },
                                        }}
                                        error={errors.dni}
                                        helperText={errors.dni ? 'Solo números permitidos' : ''}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button onClick={handleClose} variant="contained" sx={{
                        backgroundColor: '#B2675E',
                        '&:hover': {
                            backgroundColor: '#8E5346',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }}
                            disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={!validateFields || !isFormWellComplete || loading } variant="contained"
                            sx={{
                                backgroundColor: '#028484',
                                '&:hover': {
                                    backgroundColor: '#026F6B',
                                },
                                borderRadius: '25px',
                                padding: '8px 20px',
                                transition: 'background-color 0.3s ease',
                            }} >
                        Guardar
                    </Button>

                </DialogActions>
                {loading && (
                    <Backdrop
                        open={true}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                    >
                        <CircularProgress color="primary" />
                    </Backdrop>
                )}
            </Dialog>
    <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={adminCreated ? "success" : "error"} sx={{width: '100%'}}>
            {text}
        </Alert>
    </Snackbar>
        </>
    )
}
export default SuperAdminCreateAdministrator