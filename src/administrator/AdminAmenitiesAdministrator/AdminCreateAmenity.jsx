import {useContext, useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add.js";
import {Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Snackbar, TextField} from "@mui/material";
import Paper from "@mui/material/Paper";
import {AdminManageContext} from "../AdminManageContext.jsx";
import {jwtDecode} from "jwt-decode";

function AdminCreateAmenity(){
    const {getAllAmenitiesByIdConsortium, consortiumIdState} = useContext(AdminManageContext)
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('')
    const [amenityInfo, setAmenityInfo] = useState({})
    const [amenityCreated, setAmenityCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)


    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleClose = () => {
        setOpen(false)
        setAmenityInfo({})

    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setAmenityInfo((prevValues) => ({
            ...prevValues,
            [name]: value,
            consortium: {
                consortiumId: consortiumIdState
            }
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtén el token almacenado
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            alert("No tienes permisos para realizar esta acción.");
            return; // Detener la ejecución si no es ROLE_ADMIN
        }

        // Si la validación es exitosa, proceder con la solicitud
        const amenityUrl = `${import.meta.env.VITE_API_BASE_URL}/Amenities`;

        try {
            await axios.post(amenityUrl, amenityInfo, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                },
            });
            setText('Se realizó la carga correctamente');
            setAmenityCreated(true);
            handleClose();
        } catch (exception) {
            setAmenityCreated(false);

            switch (exception.response?.status) {
                case 409:
                    setText('No se realizó la carga porque ya existe un espacio común con ese nombre en este consorcio');
                    break;
                case 404:
                    setText('No se realizó la carga porque el consorcio no fue encontrado');
                    break;
                default:
                    setText('No se realizó la carga debido a un error de datos');
            }
        } finally {
            handleOpenAlert();
            getAllAmenitiesByIdConsortium();
        }
    };


    return (
        <>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
                sx={{
                    backgroundColor: '#B2675E', // Color personalizado
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: '30px', // Bordes redondeados
                    padding: '12px 24px', // Espacio interno reducido
                    fontSize: '1.1rem', // Tamaño de fuente ligeramente más pequeño
                    minWidth: '180px', // Tamaño mínimo ajustado
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra moderada
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
                <DialogTitle sx={{ backgroundColor: '#E5E5E5',  color: '#002776', textAlign: 'center' }}>Nuevo Espacio Común</DialogTitle>
                <DialogContent sx={{ backgroundColor: '#E5E5E5' }}>
                    <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#EDEDED',  marginTop: '10px' }}>
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
                                        value={amenityInfo.name || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#002776',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#002776', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Reservas Máximas"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="maxBookings"
                                        value={amenityInfo.maxBookings || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#002776',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#002776', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#E5E5E5' }}>
                    <Button onClick={handleClose} variant="contained" sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}>
                        Cancelar
                    </Button>
                    <Button type="submit" onClick={handleSubmit} variant="contained" sx={{ backgroundColor: '#228B22', '&:hover': { backgroundColor: '#228B22' } }} >
                        Guardar
                    </Button>

                </DialogActions>
            </Dialog>
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={amenityCreated ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </>
    )
}

export default AdminCreateAmenity