import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add.js";
import {
    Alert,
    Backdrop,
    Box, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Snackbar,
    TextField
} from "@mui/material";
import Paper from "@mui/material/Paper";
import {AdminManageContext} from "../AdminManageContext.jsx";
import {jwtDecode} from "jwt-decode";

function AdminCreatePerson(){
    let {getAllPersons, consortiumIdState, openDniDialog, setOpenDniDialog, newPersonDpto, setNewPersonDpto,
        personCreationType, newResidentDpto, setNewResidentDpto } = useContext(AdminManageContext)
    const [open, setOpen] = useState(false);
    // const [openDniDialog, setOpenDniDialog] = useState(false);
    const [dni, setDni] = useState('');
    const [text, setText] = useState('')
    const [errors, setErrors] = useState({
        name: false,
        lastName: false,
        mail: false,
        dni: false,
        phoneNumber: false
    })
    const [personInfo, setPersonInfo] = useState({})
    const [personCreated, setPersonCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [loading, setLoading] = useState(false);
    const [isFormWellComplete, setIsFormWellComplete] = useState(false);
    const validateFields = () => {
        const nameRegex = /^[A-Za-z]+$/
        const mailRegex = /.+@.+\..+/
        const dniRegex = /^[0-9]+$/

        setErrors({
            name: !nameRegex.test(personInfo.name),
            lastName: !nameRegex.test(personInfo.lastName),
            mail: !mailRegex.test(personInfo.mail),
            dni: !dniRegex.test(personInfo.dni),
            phoneNumber: !dniRegex.test(personInfo.dni)
        })

        return (
            nameRegex.test(personInfo.name) &&
            nameRegex.test(personInfo.lastName) &&
            mailRegex.test(personInfo.mail) &&
            dniRegex.test(personInfo.dni) &&
            dniRegex.test(personInfo.phoneNumber)
        )
    }
    const areFieldsComplete = () => {
        const {
            name,
            lastName,
            mail,
            dni,
            phoneNumber
        } = personInfo;

        if (!name || !lastName || !mail || !dni || !phoneNumber) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        setIsFormWellComplete(areFieldsComplete());
    }, [personInfo]);


    const handleCloseDniDialog = () => {
        setOpenDniDialog(false);
        setDni('');
        setErrors({ dni: false });
    };

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
            dni: false,
            phoneNumber: false

        })
        setPersonInfo({})

    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    // Maneja el cambio en el input de DNI
    const handleDniChange = (event) => {
        setDni(event.target.value);
    };

    const handleChange = (event) => {
        const name = event.target.name
        const value = event.target.value
        setPersonInfo(values => ({...values, [name]: value}))}

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            setLoading(false)
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                setLoading(false)
                return;
            }

            if (validateFields()) {
                const personUrl = `${import.meta.env.VITE_API_BASE_URL}/persons`;
                const consortiumPersonUrl = `${import.meta.env.VITE_API_BASE_URL}/consortiums/consortiumPerson`;

                try {
                    const personResponse = await axios.post(personUrl, personInfo, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                        },
                    });
                    const idPerson = personResponse.data.personId;

                    const consortiumPersonUrlWithParams = `${consortiumPersonUrl}?idConsortium=${consortiumIdState}&idPerson=${idPerson}`;
                    //TODO guardar la resp de esto para cargar en el modal
                    await axios.post(consortiumPersonUrlWithParams, {}, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                        },
                    });

                    if (personCreationType === 'owner') {
                        setNewPersonDpto({
                            personId: personResponse.data.personId,
                            fullName: `${personResponse.data.name} ${personResponse.data.lastName}`,
                        });
                    } else {
                        setNewResidentDpto({
                            personId: personResponse.data.personId,
                            fullName: `${personResponse.data.name} ${personResponse.data.lastName}`,
                        });
                    }

                    setText('Se realizó la carga correctamente');
                    setPersonCreated(true);
                    handleClose();
                    handleCloseDniDialog();
                } catch (exception) {
                    setPersonCreated(false);
                    setText(
                        exception.response?.status === 409
                            ? 'No se realizó la carga porque hay un usuario con ese mail o DNI'
                            : 'No se realizó la carga, error de datos!!'
                    );
                } finally {
                    handleOpenAlert();
                    getAllPersons();
                }
            }
        } catch (error) {
            console.error("Error en la validación del token o la solicitud:", error);
            alert("Ocurrió un error al intentar realizar la acción. Por favor, inténtalo nuevamente.");
        }finally {
            setLoading(false);
        }
    };

    const handleDniSubmit = async () => {
        const dniRegex = /^[0-9]+$/;

        // Validación del formato de DNI
        if (!dniRegex.test(dni)) {
            setErrors({ dni: true });
            return;
        }

        // Resetea el mensaje antes de empezar la verificación de DNI
        setText('');

        // Obtén el token y verifica el rol
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detiene la ejecución si no hay token
        }

        try {
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detiene la ejecución si no es ROLE_ADMIN
            }

            // Verificar si la persona existe en la tabla de personas
            try {
                const personResponse = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/persons/filterByDni?dni=${dni}`, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                        },
                    });
                const idPerson = personResponse.data.personId;

                // Verificar si la persona ya está asociada al consorcio
                try {
                    const consortiumCheckUrl = `${import.meta.env.VITE_API_BASE_URL}/consortiums/${consortiumIdState}/persons`;
                    const consortiumCheckResponse = await axios.get(consortiumCheckUrl, {
                        headers: {
                            Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                        },
                    });

                    const isAssociated = consortiumCheckResponse.data.some(person => person.personId === idPerson);

                    if (isAssociated) {
                        setText('El usuario ya existe en este consorcio.');
                    } else {
                        // Si no está asociado, entonces proceder a asociarlo
                        const consortiumPersonUrl = `${import.meta.env.VITE_API_BASE_URL}/consortiums/consortiumPerson?idConsortium=${consortiumIdState}&idPerson=${idPerson}`;
                        await axios.post(consortiumPersonUrl, {}, {
                            headers: {
                                Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                            },
                        });

                        setText('Listo, usuario cargado.');
                        setPersonCreated(true);
                        handleCloseDniDialog();
                    }
                    handleOpenAlert();
                } catch (consortiumCheckError) {
                    setText("Hubo un error al verificar la asociación de la persona con el consorcio.");
                }
            } catch (error) {
                // Si la persona no existe (404), abrir formulario
                if (error.response && error.response.status === 404) {
                    setText(''); // Vacía el mensaje antes de abrir el formulario
                    handleClickOpen();
                } else {
                    setText("Hubo un error al verificar el DNI.");
                    handleOpenAlert();
                }
            }
        } catch (error) {
            console.error("Error en la validación del token o la solicitud:", error);
            alert("Ocurrió un error al intentar realizar la acción. Por favor, inténtalo nuevamente.");
        } finally {
            getAllPersons();
        }
    };


    return (
        <>
            <Dialog open={openDniDialog} onClose={handleCloseDniDialog}>
                <DialogTitle
                    id="alert-dialog-title"
                   sx={{
                   backgroundColor: '#E5E5E5',
                   color: '#002776',
                   textAlign: 'center',
                   padding: '20px 30px',
                   borderBottom: '2px solid #028484',
                   fontWeight: 'bold',
                   }}>
                    Ingrese el DNI
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="DNI"
                        variant="outlined"
                        size="small"
                        type="text"
                        value={dni}
                        onChange={handleDniChange}
                        inputProps={{ maxLength: 8 }}
                        error={errors.dni}
                        helperText={errors.dni ? 'Solo números permitidos' : ''}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDniDialog} variant="contained"
                            sx={{
                                backgroundColor: '#B2675E',
                                '&:hover': {
                                    backgroundColor: '#8E5346',
                                },
                                borderRadius: '25px',
                                padding: '8px 20px',
                                transition: 'background-color 0.3s ease',
                            }}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleDniSubmit} variant="contained" sx={{
                        backgroundColor: '#028484',
                        '&:hover': {
                            backgroundColor: '#026F6B',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }}
                    >
                        Buscar
                    </Button>
                </DialogActions>
            </Dialog>

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
                }}
                >
                    Nuevo Usuario
                </DialogTitle>
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
                                        value={personInfo.name || ""}
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
                                                color: '#028484', // Cambia el color del label al enfocarse
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
                                        value={personInfo.lastName || ""}
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
                                                color: '#028484', // Cambia el color del label al enfocarse
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
                                        value={personInfo.mail || ""}
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
                                                color: '#028484', // Cambia el color del label al enfocarse
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
                                        value={personInfo.dni || ""}
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
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        error={errors.dni}
                                        helperText={errors.dni ? 'Solo números permitidos' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Número de Teléfono"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="phoneNumber"
                                        value={personInfo.phoneNumber || ""}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 10 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.phoneNumber ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.phoneNumber ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.phoneNumber ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        error={errors.phoneNumber}
                                        helperText={errors.phoneNumber ? 'Solo números permitidos' : ''}
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
                    <Button type="submit" onClick={handleSubmit} disabled={!validateFields || !isFormWellComplete || loading }
                            variant="contained"
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
                <Alert onClose={handleCloseAlert} severity={personCreated ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </>
    )
}

export default AdminCreatePerson