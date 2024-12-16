import React, { useState } from 'react';
import {
    Container, Typography, Grid, TextField, MenuItem, Button, Box, Card, CardContent, FormControl, InputLabel, Select,
    InputAdornment, IconButton, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ResidentSidebar from "../ResidentSidebar.jsx";

const spaces = ['Piscina', 'Gimnasio', 'Sala de Reuniones', 'Cancha de Tenis'];
const shifts = ['Mañana', 'Tarde'];

const ReserveSpace = () => {
    const [space, setSpace] = useState('');
    const [date, setDate] = useState('');
    const [shift, setShift] = useState('');
    const [openDialog, setOpenDialog] = useState(false);

    const handleChangeSpace = (event) => setSpace(event.target.value);
    const handleChangeDate = (event) => setDate(event.target.value);
    const handleChangeShift = (event) => setShift(event.target.value);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleSubmit = () => {
        // Aquí se puede agregar la lógica para enviar los datos de la reserva
        console.log('Reserva realizada:', { space, date, shift });
        setOpenDialog(false);  // Cerrar el diálogo de confirmación
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
                                maxWidth: '1100px',
                                marginLeft: {xs: '40px', sm: '80px'},
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
                                                    {spaces.map((option) => (
                                                        <MenuItem key={option} value={option}>
                                                            {option}
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
                                                        <MenuItem key={option} value={option}>
                                                            {option}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Botón para reservar */}
                                        <Grid item xs={12} textAlign="center">
                                            <Button
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
                        Estás a punto de reservar el espacio <strong>{space}</strong> para el
                        día <strong>{date}</strong> en el turno <strong>{shift}</strong>.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Cancelar</Button>
                    <Button onClick={handleSubmit} color="primary">Confirmar</Button>
                </DialogActions>
            </Dialog>
</div>
 );
 };

export default ReserveSpace;