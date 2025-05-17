import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add.js";
import {
    Alert, Backdrop,
    Box, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControlLabel,
    Grid, Radio,
    RadioGroup,
    Snackbar,
    TextField
} from "@mui/material";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import {SuperAdminManageConsortiumContext} from "./SuperAdminManageConsortiumContext.jsx";
import {jwtDecode} from "jwt-decode";
import MapComponent from "../../component/MapComponent.jsx";


function SuperAdminCreateConsortium() {
    const {allAdministrator, getAllConsortium, getAllAdministrator} = useContext(SuperAdminManageConsortiumContext)
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('')
    const [errors, setErrors] = useState({
        address: false,
        province: false,
    })
    const ERROR_TYPES = {
        REQUIRED: 'REQUIRED',
        INVALID_FORMAT: 'INVALID_FORMAT',
        POSITIVE_NUMBER: 'POSITIVE_NUMBER',
        FU_CAPACITY_EXCEEDED: 'FU_CAPACITY_EXCEEDED',
        // ...otros tipos de error que puedas necesitar
    };

    const [consortiumInfo, setConsortiumInfo] = useState({
        name: '',
        administrator: { administratorId: '' },
        consortiumType: '',
        functionalUnits: 0,
        floors: 0,
        apartmentsPerFloor: 0,
        province: '',
        city: '',
        address: ''
    });
    const [consortiumCreated, setConsortiumCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [provinces, setProvinces] = useState('')
    const [cities, setCities] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormWellComplete, setIsFormWellComplete] = useState(false);
    const [loading, setLoading] = useState(false);

    const MAP_URL = "https://apis.datos.gob.ar/georef/api"

    const fetchProvinces = async () => {
        const response = await fetch(
            `${MAP_URL}/provincias?&max=100`
        );
        const data = await response.json();

        let fetchedProvinces = data?.provincias
            .map(provincia => ({
                provinceId: provincia.nombre,
                provinceName: provincia.nombre
            }))
            .sort((a, b) => a.provinceName.localeCompare(b.provinceName));
        setProvinces(fetchedProvinces);
    };

    useEffect(() => {
        fetchProvinces();
    }, [])


    const validateFields = () => {
        const newErrors = {};
        const {
            name,
            administrator, // Asumo que este es un objeto como { administratorId: '' }
            consortiumType,
            functionalUnits,
            floors,
            apartmentsPerFloor,
            province,
            city,
            address
        } = consortiumInfo;


        const addressRegex = /^[A-Za-z\s]+\s\d+$/;
        const provinceRegex = /^[A-Za-zÀ-ÿ\s]+$/;
        const getTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

        if (getTrimmedString(name) === '') {
            newErrors.name = ERROR_TYPES.REQUIRED;
        }

        const currentConsortiumType = getTrimmedString(consortiumType);
        if (currentConsortiumType === '') {
            newErrors.consortiumType = ERROR_TYPES.REQUIRED;
        }

        const numFunctionalUnits = Number(functionalUnits);
        if (isNaN(numFunctionalUnits) || numFunctionalUnits <= 0) {
            newErrors.functionalUnits = ERROR_TYPES.POSITIVE_NUMBER;
        }

        const trimmedProvince = getTrimmedString(province);
        if (trimmedProvince === '') {
            newErrors.province = ERROR_TYPES.REQUIRED;
        } else if (!provinceRegex.test(trimmedProvince)) {
            newErrors.province = ERROR_TYPES.INVALID_FORMAT;
        }

        if (getTrimmedString(city) === '') {
            newErrors.city = ERROR_TYPES.REQUIRED;
        }

        const trimmedAddress = getTrimmedString(address);
        if (trimmedAddress === '') {
            newErrors.address = ERROR_TYPES.REQUIRED;
        } else if (!addressRegex.test(trimmedAddress)) {
            newErrors.address = ERROR_TYPES.INVALID_FORMAT;
        }

        if (currentConsortiumType === 'BUILDING') {
            const numFloors = Number(floors);
            if (isNaN(numFloors) || numFloors <= 0) {
                newErrors.floors = ERROR_TYPES.POSITIVE_NUMBER;
            }

            const numApartmentsPerFloor = Number(apartmentsPerFloor);
            if (isNaN(numApartmentsPerFloor) || numApartmentsPerFloor <= 0) {
                newErrors.apartmentsPerFloor = ERROR_TYPES.POSITIVE_NUMBER;
            }

            if (!newErrors.floors && !newErrors.apartmentsPerFloor && !newErrors.functionalUnits) {
                if ((Number(floors) * Number(apartmentsPerFloor)) > numFunctionalUnits) {
                    newErrors.functionalUnits = ERROR_TYPES.FU_CAPACITY_EXCEEDED;
                }
            }
        } else if (currentConsortiumType === 'NEIGHBORHOOD') {
        }

        setErrors(newErrors);
        return newErrors;
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
            address: false,
            province: false
        })
        setConsortiumInfo({})
    }

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    useEffect(() => {
        if (open) {
            getAllAdministrator()
        }

    }, [open]);

    const handleChange = (event) => {
        const {name, value} = event.target;

        if (name === "administratorId") {
            setConsortiumInfo(prevState => ({
                ...prevState,
                administrator: {
                    ...prevState.administrator,
                    administratorId: value
                }
            }));
        } else {
            const numericFields = ["functionalUnits", "floors", "apartmentsPerFloor"];
            const parsedValue = numericFields.includes(name) ? parseInt(value, 10) || 0 : value;

            setConsortiumInfo(prevState => ({
                ...prevState,
                [name]: parsedValue
            }));
        }
    };

    const handleProvinceChange = (event) => {
        const {name, value} = event.target;

        setConsortiumInfo(prevState => ({
            ...prevState,
            province: value
        }));
    }

    const handleCityChange = (event) => {
        const {name, value} = event.target;

        setConsortiumInfo(prevState => ({
            ...prevState,
            city: value
        }));
    }

    useEffect(() => {
        if (consortiumInfo.province) {
            getAllCities(consortiumInfo.province)
        }
    }, [consortiumInfo.province, isSubmitting]);


    const getAllCities = async (provinceId) => {
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // No continúa si no hay token
        }

        try {
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para acceder a esta página.");
                return; // No continúa si no es SuperAdmin
            }
            const res = await axios.get(`${MAP_URL}/departamentos?provincia=${provinceId}&max=200`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCities(
                res.data.departamentos
                    .map(city => ({
                        cityId: city.nombre,
                        cityName: city.nombre
                    }))
                    .sort((a, b) => a.cityName.localeCompare(b.cityName))
            );
        } catch (error) {
            console.error("Error al obtener las ciudades:", error);
            alert("Ocurrió un error al obtener las ciudades. Intenta nuevamente.");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No estás autorizado. Por favor, inicia sesión.");
                setIsSubmitting(false);
                setLoading(false)
                return;
            }

            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                setIsSubmitting(false);
                setLoading(false);
                return;
            }

            const validationErrors = validateFields();
            const formIsValid = Object.keys(validationErrors).length === 0;

            if (formIsValid) {
                console.log('Formulario válido, procediendo con el envío a la API.');
                let url = `${import.meta.env.VITE_API_BASE_URL}/consortiums`;

                try {
                    await axios.post(url, consortiumInfo, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setText('Se realizó la carga correctamente');
                    setConsortiumCreated(true);
                    handleClose();
                } catch (exception) {
                    setConsortiumCreated(false);
                    switch (exception.response?.status) {
                        case 404:
                            setText('No se encontró el administrador ingresado');
                            break;
                        default:
                            setText('No se realizó la carga, error de datos!');
                    }
                } finally {
                    handleOpenAlert();
                    getAllConsortium();
                }
            } else {
                setConsortiumCreated(false);
                console.warn('Formulario inválido. Errores detectados:', validationErrors);

                if (validationErrors.functionalUnits === ERROR_TYPES.FU_CAPACITY_EXCEEDED) {
                    setText("Error: La multiplicación de pisos por departamentos no puede superar el total de unidades funcionales.");
                } else {

                    setText('Por favor, corrige los errores indicados en el formulario.');
                }
                handleOpenAlert();
            }
        } catch (error) {
            setConsortiumCreated(false);
            console.error("Error durante la preparación del envío o validación del token:", error);
            setText(`Ocurrió un error: ${error.message || "Por favor, inténtalo nuevamente."}`);
            handleOpenAlert();
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    const areFieldsComplete = () => {
        const {
            name,
            administrator,
            consortiumType,
            functionalUnits,
            floors,
            apartmentsPerFloor,
            province,
            city,
            address
        } = consortiumInfo;


        if (!name || !administrator?.administratorId || !consortiumType || !functionalUnits || !province || !city || !address) {
            return false;
        }


        if (consortiumType === "BUILDING" && (!floors || !apartmentsPerFloor)) {
            return false;
        }

        return true;
    };

    useEffect(() => {
        setIsFormWellComplete(areFieldsComplete());
    }, [consortiumInfo]);

    return (
        <>
            <Button
                variant="contained"
                startIcon={<AddIcon/>}
                onClick={handleClickOpen}
                sx={{
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
                maxWidth={'md'}
                fullWidth={true}
            >
                <DialogTitle sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>Nuevo Consorcio</DialogTitle>
                <DialogContent sx={{backgroundColor: '#F9F9F9'}}>
                    <Paper elevation={3} sx={{padding: 4, backgroundColor: '#F2F2F2', marginTop: '10px'}}>
                        <Box component="form" onSubmit={handleSubmit} sx={{mt: 2}}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Nombre"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="name"
                                        value={consortiumInfo.name || ""}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 50 }}
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
                                                color: '#028484',
                                            },
                                        }}
                                        fullWidth
                                    >
                                        {allAdministrator.map(administrator => (
                                            <MenuItem key={administrator.administratorId}
                                                      value={administrator.administratorId}>
                                                {administrator.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box>
                                        <RadioGroup
                                            row
                                            name="consortiumType"
                                            value={consortiumInfo.consortiumType}
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel
                                                value="BUILDING"
                                                control={<Radio
                                                    sx={{color: '#028484', '&.Mui-checked': {color: '#028484'}}}/>}
                                                label="Edificio"
                                            />
                                            <FormControlLabel
                                                value="NEIGHBORHOOD"
                                                control={<Radio
                                                    sx={{color: '#028484', '&.Mui-checked': {color: '#028484'}}}/>}
                                                label="Barrio Privado"
                                            />
                                        </RadioGroup>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Total de Unidades Funcionales"
                                        variant="outlined"
                                        size="small"
                                        type="number"
                                        name="functionalUnits"
                                        value={consortiumInfo.functionalUnits}
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
                                                color: '#028484',
                                            },
                                        }}
                                        fullWidth
                                    />
                                </Grid>

                                {consortiumInfo.consortiumType === "BUILDING" && (
                                    <>

                                        <Grid item xs={12} sm={6}>

                                            <TextField
                                                label="Cantidad de pisos"
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                                name="floors"
                                                value={consortiumInfo.floors}
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
                                                        color: '#028484',
                                                    },
                                                }}
                                                fullWidth
                                            />

                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Cantidad de departamentos por piso"
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                                name="apartmentsPerFloor"
                                                value={consortiumInfo.apartmentsPerFloor}
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
                                                        color: '#028484',
                                                    },
                                                }}
                                                fullWidth
                                            />
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Seleccione una Provincia"
                                        variant="outlined"
                                        size="small"
                                        name="province"
                                        value={consortiumInfo?.province || ''}
                                        onChange={handleProvinceChange}
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
                                                color: '#028484',
                                            },
                                        }}
                                        fullWidth
                                    >

                                        {provinces ? provinces.map(province => (
                                            <MenuItem key={province.provinceId} value={province.provinceId}>
                                                {province.provinceName}
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
                                        disabled={!consortiumInfo.province}
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
                                                color: '#028484',
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
                                        id="outlined-basic"
                                        label="Dirección"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="address"
                                        value={consortiumInfo.address || ""}
                                        disabled={!consortiumInfo.city}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 50 }}
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
                                                color: errors.address ? 'red' : '#028484',
                                            },
                                        }}
                                        error={errors.address}
                                        helperText={errors.address ? 'EL formato de la dirección es: Nombre de la calle + número' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {true ?
                                        <MapComponent
                                            provincia={consortiumInfo.province}
                                            departamento={consortiumInfo.city}
                                            direccion={consortiumInfo.address}
                                        />
                                        : <></>
                                    }
                                </Grid>

                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{backgroundColor: '#F9F9F9'}}>
                    <Button onClick={handleClose} variant="contained"
                            sx={{
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
                    <Button type="submit" onClick={handleSubmit} disabled={!isFormWellComplete || loading} variant="contained"
                            sx={{
                                backgroundColor: '#028484',
                                '&:hover': {
                                    backgroundColor: '#026F6B',
                                },
                                borderRadius: '25px',
                                padding: '8px 20px',
                                transition: 'background-color 0.3s ease',
                            }}>
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
                <Alert onClose={handleCloseAlert} severity={consortiumCreated ? "success" : "error"}
                       sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </>
    )

}

export default SuperAdminCreateConsortium