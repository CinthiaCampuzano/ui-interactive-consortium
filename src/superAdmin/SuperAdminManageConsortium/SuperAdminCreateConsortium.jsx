import {useContext, useEffect, useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add.js";
import {Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Snackbar, TextField} from "@mui/material";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import {SuperAdminManageConsortiumContext} from "./SuperAdminManageConsortiumContext.jsx";
import {jwtDecode} from "jwt-decode";


function SuperAdminCreateConsortium(){
    const { allAdministrator, getAllConsortium, getAllAdministrator} = useContext(SuperAdminManageConsortiumContext)
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('')
    const [errors, setErrors] = useState({
        address: false,
        province: false
    })

    const [consortiumInfo, setConsortiumInfo] = useState({})
    const [consortiumCreated, setConsortiumCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [states, setStates] = useState('')
    const [cities, setCities] = useState('')

    const validateFields = () => {
        const addressRegex = /^[A-Za-z\s]+\s\d+$/;
        const provinceRegex = /^[A-Za-zÀ-ÿ\s]+$/

        setErrors({
            address: !addressRegex.test(consortiumInfo.address),
            province: !provinceRegex.test(consortiumInfo.province)
        })

        return (
            addressRegex.test(consortiumInfo.address)&&
            provinceRegex.test(consortiumInfo.province)
        )
    }
    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleClose = () => {
        setOpen(false)
        setErrors({
            address: false,
            province: false
        })
        setConsortiumInfo({})
    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    useEffect(() => {
        if (open){
            getAllAdministrator()
        }

    }, [open]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "administratorId") {
            setConsortiumInfo(prevState => ({
                ...prevState,
                administrator: {
                    ...prevState.administrator,
                    administratorId: value
                }
            }));
        } else {
            setConsortiumInfo(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    }

    const handleStateChange = (event) => {
        const { name, value } = event.target;

        setConsortiumInfo(prevState => ({
            ...prevState,
            state: value
        }));
    }

    const handleCityChange = (event) => {
        const { name, value } = event.target;

        setConsortiumInfo(prevState => ({
            ...prevState,
            city: value
        }));
    }

    useEffect(() => {
        getAllStates()
    }, []);

    useEffect(() => {
        if (consortiumInfo.state) {
            getAllCities(consortiumInfo.state)
        }
    }, [consortiumInfo.state]);

    const getAllStates = async () => {
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // No continúa si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de SuperAdmin
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para acceder a esta página.");
                return; // No continúa si no es SuperAdmin
            }

            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums/states`, {
                headers: {
                    Authorization: `Bearer ${token}` // Se incluye el token en el encabezado de la solicitud
                }
            });

            const states = res.data || [];
            setStates(
                states.map(state => ({
                    stateId: state.id,
                    stateName: state.displayName
                }))
            );
        } catch (error) {
            console.error("Error al obtener las provincias:", error);
            alert("Ocurrió un error al obtener las provincias. Intenta nuevamente.");
        }
    };

    const getAllCities = async (stateId) => {
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // No continúa si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de SuperAdmin
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para acceder a esta página.");
                return; // No continúa si no es SuperAdmin
            }

            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums/states/${stateId}/cities`, {
                headers: {
                    Authorization: `Bearer ${token}` // Se incluye el token en el encabezado de la solicitud
                }
            });

            const cities = res.data;
            setCities(
                cities.map(city => ({
                    cityId: city.id,
                    cityName: city.displayName
                }))
            );
        } catch (error) {
            console.error("Error al obtener las ciudades:", error);
            alert("Ocurrió un error al obtener las ciudades. Intenta nuevamente.");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtén el token almacenado en el localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detiene la ejecución si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de SuperAdmin (ROLE_ROOT)
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detiene la ejecución si no es SuperAdmin
            }

            // Valida los campos del formulario
            if (validateFields()) {
                console.log(consortiumInfo);
                let url = `${import.meta.env.VITE_API_BASE_URL}/consortiums`;

                try {
                    let request = consortiumInfo;
                    request.city = {id: consortiumInfo.city};
                    request.province = {id: consortiumInfo.state};

                    // Realiza la solicitud POST para crear el consorcio, pasando el token en los headers
                    await axios.post(url, request, {
                        headers: {
                            Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                        }
                    });

                    setText('Se realizó la carga correctamente');
                    setConsortiumCreated(true);
                    handleClose();
                } catch (exception) {
                    setConsortiumCreated(false);
                    // Maneja los errores según el código de estado de la respuesta
                    switch (exception.response?.status) {
                        case 404:
                            setText('No se encontró el administrador ingresado');
                            break;
                        default:
                            setText('No se realizó la carga, error de datos!');
                    }
                } finally {
                    handleOpenAlert();
                    getAllConsortium(); // Llama la función para obtener todos los consorcios
                }
            }
        } catch (error) {
            console.error("Error en la validación del token o la solicitud:", error);
            alert("Ocurrió un error al intentar realizar la acción. Por favor, inténtalo nuevamente.");
        }
    };

    return (
        <>
            <Button
                variant="contained"
                startIcon={<AddIcon />} // Icono de añadir
                onClick={handleClickOpen}
                sx={{
                    backgroundColor: '#B2675E', // Color personalizado
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: '30px', // Bordes redondeados
                    padding: '10px 20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra para profundidad
                    transition: 'all 0.3s ease', // Transición suave
                    '&:hover': {
                        backgroundColor: '#A15D50', // Cambio de color al pasar el cursor
                        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)', // Sombra más prominente
                    },
                    '&:active': {
                        backgroundColor: '#8A4A3D', // Cambio de color cuando se presiona
                    },
                }}
            >
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
                }}>Nuevo Edificio</DialogTitle>
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
                                        value={consortiumInfo.name || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Dirección"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="address"
                                        value={consortiumInfo.address || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.address ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.address ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.address ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: errors.address ? 'red' : '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        error={errors.address}
                                        helperText={errors.address ? 'EL formato de la dirección es: Nombre de la calle + número' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Seleccione una Provincia"
                                        variant="outlined"
                                        size="small"
                                        name="state"
                                        value={consortiumInfo?.state || ''}
                                        onChange={handleStateChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        fullWidth
                                    >

                                        {states ? states.map(state => (
                                            <MenuItem key={state.stateId} value={state.stateId}>
                                                {state.stateName}
                                            </MenuItem>
                                        )) : (
                                            <MenuItem disabled>No hay provincias disponibles</MenuItem>
                                        )}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Seleccione una Ciudad"
                                        variant="outlined"
                                        size="small"
                                        name="city"
                                        value={consortiumInfo?.city || ''}
                                        onChange={handleCityChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        fullWidth
                                    >
                                        {cities ? cities.map(city => (
                                            <MenuItem key={city.cityId} value={city.cityId}>
                                                {city.cityName}
                                            </MenuItem>
                                        )) : (
                                            <MenuItem disabled>No hay provincias disponibles</MenuItem>
                                        )}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Seleccione un Administrador"
                                        variant="outlined"
                                        size="small"
                                        name="administratorId"
                                        value={consortiumInfo.administrator?.administratorId || ''}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        fullWidth
                                    >
                                        {allAdministrator.map(administrator => (
                                            <MenuItem key={administrator.administratorId} value={administrator.administratorId}>
                                                {administrator.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9' }}>
                    <Button onClick={handleClose} variant="contained" sx={{
                        backgroundColor: '#B2675E',
                        '&:hover': {
                            backgroundColor: '#8E5346',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }}>
                        Cancelar
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={!validateFields} variant="contained"
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
            </Dialog>
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={consortiumCreated ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </>
    )

}
export default SuperAdminCreateConsortium