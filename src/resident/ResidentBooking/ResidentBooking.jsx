import React, {useContext, useEffect, useState} from 'react';
import {
    Container, Typography, Grid, TextField, MenuItem, Button, Box, Card, CardContent, FormControl, InputLabel, Select,
    InputAdornment, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Alert, Snackbar
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {ResidentManageContext} from "../ResidentManageContext.jsx";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import ResidentSidebar from "../ResidentSidebar.jsx";

// const spaces = ['Piscina', 'Gimnasio', 'Sala de Reuniones', 'Cancha de Tenis'];
const shifts = [
    { id: 'MORNING', name: 'Mañana'},
    { id: 'NIGHT',   name: 'Noche'}
];

const ReserveSpace = () => {

    const { consortiumIdState } = useContext(ResidentManageContext)

    const [space, setSpace] = useState('');
    const [date, setDate] = useState('');
    const [shift, setShift] = useState('');
    const [amenities, setAmenities] = useState([]);
    const [text, setText] = useState('')
    const [openAlert, setOpenAlert] = useState(false)
    const [bookingMade, setBookingMade] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const handleChangeSpace = (event) => setSpace(event.target.value);
    const handleChangeDate = (event) => setDate(event.target.value);

    const handleChangeShift = (event) => setShift(event.target.value);
    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    useEffect(() => {
        getAllAmenitiesByIdConsortium(consortiumIdState)
    }, [consortiumIdState]);

    const getAllAmenitiesByIdConsortium = async () => {
        try {

            if (!consortiumIdState) {
                return;
            }

            // Obtén el token almacenado
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No estás autorizado. Por favor, inicia sesión.");
                return; // Detener la ejecución si no hay token
            }

            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);

            // Si el usuario tiene el rol adecuado, realiza la solicitud
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/Amenities?idConsortium=${consortiumIdState}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );
            console.log(res.data);

            // Mapear y establecer las amenities
            const amenities = res.data.content;
            setAmenities(
                amenities.map((amenity) => {
                    return {
                        amenityId: amenity.amenityId,
                        name: amenity.name,
                        maxBookings: amenity.maxBookings,
                        imagePath: amenity.imagePath,
                    };
                })
            );
        } catch (error) {
            console.error("Error al obtener amenities:", error);
            alert("Hubo un problema al obtener los amenities.");
        }
    };


    const handleSubmit = async () => {
        // Aquí se puede agregar la lógica para enviar los datos de la reserva
        console.log('Reserva realizada:', { space, date, shift });
        setOpenDialog(false);  // Cerrar el diálogo de confirmación
        try {

            if (!consortiumIdState) {
                return;
            }

            // Obtén el token almacenado
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No estás autorizado. Por favor, inicia sesión.");
                return; // Detener la ejecución si no hay token
            }

            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            // const residentId = decodedToken.;

            const request = {
                startDate: date,
                shift: shift,
                amenity: {amenityId: space}
            }

            console.log(request)

            // Si el usuario tiene el rol adecuado, realiza la solicitud
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings`,
                request,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );

            setText('Espacio reservado exitosamente');
            setBookingMade(true);

            // Mapear y establecer las amenities
            // const amenities = res.data.content;
            // setAmenities(
            //     amenities.map((amenity) => {
            //         return {
            //             amenityId: amenity.amenityId,
            //             name: amenity.name,
            //             maxBookings: amenity.maxBookings,
            //             imagePath: amenity.imagePath,
            //         };
            //     })
            // );
        } catch (error) {
            setText('Error al reservar espacio');
            setBookingMade(false);
        } finally {
            handleOpenAlert()
        }
    };

    return (
        <div>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh', // Ensures that the container takes the full height of the screen
                }}
            >
                <ResidentSidebar/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1, // Allows this component to take up the remaining space
                        padding: {xs: '16px', sm: '24px'},
                        marginLeft: {xs: 0, sm: '240px'},
                        transition: 'margin-left 0.3s ease',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        {/* Title */}
                        <Typography
                            variant="h6"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                color: '#003366',
                                fontSize: {xs: '1.5rem', md: '2rem'},
                                marginBottom: '20px',
                            }}
                        >
                            Reserva tu Espacio Común
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: '600px',
                                // marginLeft: {xs: '40px', sm: '80px'},
                            }}
                        >
                            <Card sx={{boxShadow: 3, padding: 2}}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        {/* Selección de espacio */}
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel>Espacio Común</InputLabel>
                                                <Select value={space} onChange={handleChangeSpace}
                                                        label="Espacio Común">
                                                    {amenities.map((amenity) => (
                                                        <MenuItem key={amenity.amenityId} value={amenity.amenityId}>
                                                            {amenity.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Selección de fecha */}
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Fecha"
                                                type="date"
                                                value={date}
                                                onChange={handleChangeDate}
                                                fullWidth
                                                InputLabelProps={{shrink: true}}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <CalendarTodayIcon/>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        {/* Selección de turno */}
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel>Turno</InputLabel>
                                                <Select value={shift} onChange={handleChangeShift} label="Turno">
                                                    {shifts.map((option) => (
                                                        <MenuItem key={option.id} value={option.id}>
                                                            {option.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Botón para reservar */}
                                        <Grid item xs={12} textAlign="center">
                                            <Button
                                                disabled={!space || !date || !shift}
                                                variant="contained"
                                                color="primary"
                                                onClick={handleOpenDialog}
                                                sx={{
                                                    padding: '10px 20px',
                                                    fontSize: '16px',
                                                    backgroundColor: '#003366'
                                                }}
                                            >
                                                Reservar Espacio
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </Box>
            </Box>
            {/* Diálogo de confirmación */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirmar Reserva</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Estás de realizar la reserva día <strong>{date}</strong>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
                    <Button onClick={handleSubmit} color="primary">Confirmar</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={bookingMade ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ReserveSpace;