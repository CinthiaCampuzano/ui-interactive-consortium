import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add.js";
import {
    Alert,
    Autocomplete, Avatar, Backdrop,
    Box, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid, InputAdornment,
    Snackbar,
    TextField
} from "@mui/material";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import {AdminManageContext} from "../AdminManageContext.jsx";
import {jwtDecode} from "jwt-decode";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AdminCreatePerson from "../AdminUserAdministrator/AdminCreatePerson.jsx";
import Typography from "@mui/material/Typography";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'


function AdminCreateDepartment(){
    const {consortiumIdState, allPersons, getAllDepartmentsByConsortium,
        getAllPersons, setOpenDniDialog, newPersonDpto,
        setPersonCreationType, newResidentDpto, totalDepartments, aConsortiumByIdConsortium} = useContext(AdminManageContext)
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('')
    const [departmentInfo, setDepartmentInfo] = useState({
        consortium: {
            consortiumId: consortiumIdState
        }
    })
    const [departmentCreated, setDepartmentCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [departmentNew, setDepartmentNew] = useState(true);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [selectedResident, setSelectedResident] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleClose = () => {
        setOpen(false);
        setDepartmentInfo({
            consortium: {
                consortiumId: consortiumIdState // Asegúrate de mantener consortiumId al resetear
            }
        });
        setSelectedPerson(null)
        setSelectedResident(null)

    };

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    useEffect(() => {
        if (open){
            getAllPersons()
        }

    }, [open]);

    const handleChange = (event) => {
        const name = event.target.name; // Obtiene el nombre del campo
        const value = event.target.value; // Obtiene el nuevo valor del campo
        setDepartmentInfo((values) => {
            // Crea una copia del objeto actual
            const updatedValues = { ...values };

            // Maneja los cambios en campos anidados
            switch (name) {
                case 'departmentId':
                    updatedValues.departmentId = value; // Actualiza departmentId directamente
                    break;
                case 'code':
                    updatedValues.code = value; // Actualiza code directamente
                    break;
                case 'consortiumId':
                    updatedValues.consortium = {
                        ...updatedValues.consortium,
                        consortiumId: consortiumIdState // Actualiza el consortiumId dentro del objeto consortium
                    };
                    break;
                case 'propietaryId':
                    updatedValues.propietary = {
                        ...updatedValues.propietary,
                        personId: value // Actualiza el propietaryId dentro del objeto propietary
                    };
                    break;
                case 'residentId':
                    updatedValues.resident = {
                        ...updatedValues.resident,
                        personId: value // Actualiza el residentId dentro del objeto resident
                    };
                    break;
                default:
                    break;
            }
            return updatedValues; // Retorna el objeto actualizado
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtén el token almacenado
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener la ejecución si no hay token
        }

        try {
            setLoading(true)
            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener la ejecución si no es ROLE_ADMIN
            }

            // Si el usuario tiene el rol adecuado, realiza la solicitud
            const url = `${import.meta.env.VITE_API_BASE_URL}/departments`;
            departmentInfo.consortium.consortiumId = consortiumIdState;

            await axios.post(url, departmentInfo, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            setText('Se realizó la carga correctamente');
            setDepartmentCreated(true);
            handleClose();

        } catch (exception) {
            setText(exception.response.data)
            setDepartmentCreated(false);
        } finally {
            setLoading(false)
            handleOpenAlert();
            getAllDepartmentsByConsortium(consortiumIdState);
            
        }
    };

    const handleOpenDniDialog = () => {
        setOpenDniDialog(true);
    }

    const handlePersonChange = (_, newValue) => {
        if (typeof newValue === "string") {
            // Si el usuario escribe algo que no existe, permitir creación
            setSelectedPerson({ fullName: newValue, personId: null });
        } else if (newValue && newValue.personId) {
            // Si elige una persona existente, guardar su ID en departmentInfo
            setSelectedPerson(newValue);
            setDepartmentInfo((prev) => ({
                ...prev,
                propietary: { personId: newValue.personId },
            }));
        } else {
            setSelectedPerson(null);
            setDepartmentInfo((prev) => ({
                ...prev,
                propietary: { personId: "" },
            }));
        }
    };

    useEffect(() => {
        if (newPersonDpto) {
            handlePersonCreated(newPersonDpto);
        }
    }, [newPersonDpto]);

    const handlePersonCreated = (newPerson) => {
        console.log(newPerson)
        // Asignar la nueva persona creada al input
        setSelectedPerson(newPerson);
        setDepartmentInfo((prev) => ({
            ...prev,
            propietary: { personId: newPerson.personId },
        }));
    };

    useEffect(() => {
        if (newResidentDpto) {
            handleResidentCreated(newResidentDpto);
        }
    }, [newResidentDpto]);

    const handleResidentCreated = (newResident) => {
        // Asignar la nueva persona creada al input de residente
        setSelectedResident(newResident);
        setDepartmentInfo((prev) => ({
            ...prev,
            resident: { personId: newResident.personId },
        }));
    };

    const handleResidentChange = (_, newValue) => {
        if (typeof newValue === "string") {
            // Si el usuario escribe algo que no existe, permitir creación
            setSelectedResident({ fullName: newValue, personId: null });

        } else if (newValue && newValue.personId) {
            // Si elige una persona existente, guardar su ID en departmentInfo
            setSelectedResident(newValue);
            setDepartmentInfo((prev) => ({
                ...prev,
                resident: { personId: newValue.personId },
            }));
        } else {
            setSelectedResident(null);
            setDepartmentInfo((prev) => ({
                ...prev,
                resident: { personId: "" },
            }));
        }
    };



    return (
        <>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
                disabled={aConsortiumByIdConsortium.functionalUnits === totalDepartments}
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
                fullWidth
                maxWidth="sm" // Fija el ancho del diálogo, puedes ajustar a "sm", "md", "lg" según necesidad
                sx={{
                    "& .MuiDialog-paper": {
                        minHeight: "100px",  // Altura mínima para evitar cambios
                        maxHeight: "400px",  // Evita que crezca demasiado
                    }
                }}
            >
                <DialogTitle sx={{ backgroundColor: '#E5E5E5', color: '#002776', textAlign: 'center' }}>
                    Nuevo Departamento
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#E5E5E5' }}>
                    <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#EDEDED', marginTop: '10px' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Identificación"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="code"
                                        value={departmentInfo.code || ""}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": { borderColor: '#028484' },
                                                "&:hover fieldset": { borderColor: '#028484' },
                                                "&.Mui-focused fieldset": { borderColor: '#028484' },
                                            },
                                            "& label.Mui-focused": { color: '#028484' },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs>
                                            <Autocomplete
                                                freeSolo
                                                options={allPersons}
                                                getOptionLabel={(option) => (typeof option === 'string' ? option : option.fullName || "")}
                                                value={selectedPerson}
                                                onChange={handlePersonChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Propietario"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                "& fieldset": { borderColor: '#028484' },
                                                                "&:hover fieldset": { borderColor: '#028484' },
                                                                "&.Mui-focused fieldset": { borderColor: '#028484' },
                                                            },
                                                            "& label.Mui-focused": { color: '#028484' },
                                                        }}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <PersonOutlineOutlinedIcon sx={{ color: '#028484' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        fullWidth
                                                    />
                                                )}
                                                renderOption={(props, option) => (
                                                    <Box
                                                        component="li"
                                                        sx={{
                                                            padding: '10px 16px', // Espaciado interno más generoso para cada opción
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: '#00277614', // Un hover sutil con el color primario
                                                            },
                                                        }}
                                                        {...props}
                                                        key={option.id || option.fullName}
                                                    >
                                                        <Typography variant="body1">
                                                            {option.fullName}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                componentsProps={{
                                                    paper: {
                                                        sx: {
                                                            borderRadius: '12px', // Bordes más pronunciados para el panel
                                                            marginTop: '8px', // Espacio entre el input y el panel
                                                            boxShadow: '0px 6px 24px rgba(0, 39, 118, 0.1)', // Sombra con color base, más suave
                                                            border: '1px solid #00277630', // Borde sutil
                                                            maxHeight: '250px', // Altura máxima antes de hacer scroll
                                                        },
                                                    },
                                                }}
                                                // Opcional: Personalizar el mensaje cuando no hay opciones
                                                noOptionsText="No se encontraron propietarios"
                                            />
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                color="primary"
                                                onClick={() =>{
                                                    handleOpenDniDialog()
                                                    setPersonCreationType("owner")}}
                                                sx={{ color: "#002776" }}
                                            >
                                                <PersonAddIcon fontSize="medium" />
                                            </IconButton>
                                            <AdminCreatePerson/>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12} sm={8}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs>
                                            <Autocomplete
                                                freeSolo
                                                options={allPersons}
                                                getOptionLabel={(option) => option.fullName || ""}
                                                value={selectedResident}
                                                onChange={handleResidentChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Residente"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                "& fieldset": { borderColor: '#028484' },
                                                                "&:hover fieldset": { borderColor: '#028484' },
                                                                "&.Mui-focused fieldset": { borderColor: '#028484' },
                                                            },
                                                            "& label.Mui-focused": { color: '#028484' },
                                                        }}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <PersonOutlineOutlinedIcon sx={{ color: '#028484' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        fullWidth
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                color="primary"
                                                onClick={() =>{
                                                    handleOpenDniDialog()
                                                    setPersonCreationType("resident")}}
                                                sx={{ color: "#002776" }}
                                            >
                                                <PersonAddIcon fontSize="medium" />
                                            </IconButton>
                                            <AdminCreatePerson/>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#E5E5E5' }}>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        sx={{
                            backgroundColor: '#B2675E',
                            '&:hover': { backgroundColor: '#9C5A4D' },
                        }}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled = {!departmentInfo.code || loading}
                        type="submit"
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            backgroundColor: '#028484',
                            '&:hover': { backgroundColor: '#026F6F' },
                        }}
                    >
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
                <Alert onClose={handleCloseAlert} severity={departmentCreated ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </>
    )

}
export default AdminCreateDepartment