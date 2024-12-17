import {Box, Typography} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import React, {useContext, useEffect, useState} from "react";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import {AdminManageContext} from "../AdminManageContext.jsx";

const AdminBooking = () => {
    const reservations = [
        {
            space: 'Piscina',
            reserveDay: '2024-12-20',
            shift: 'Mañana',
            reserveDate: '2024-12-10',
            available: 3,
            resident: 'Juan Pérez', // Nuevo campo
        },
        {
            space: 'Gimnasio',
            reserveDay: '2024-12-21',
            shift: 'Tarde',
            reserveDate: '2024-12-11',
            available: 5,
            resident: 'Ana López', // Nuevo campo
        },
        {
            space: 'Salón de fiestas',
            reserveDay: '2024-12-22',
            shift: 'Noche',
            reserveDate: '2024-12-12',
            available: 2,
            resident: 'Carlos Gómez', // Nuevo campo
        },
    ];

    const shiftMapping = {
        'MORNING': 'Mañana',
        'NIGHT': 'Noche'
    };

    const [reservationsState, setReservationsState] = useState([]);
    const { consortiumIdState } = useContext(AdminManageContext)


    const getAllReservation = async () => {
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
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/consortium/${consortiumIdState}/ForAdmin`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );

            // Mapear y establecer las amenities
            const reservations = res.data.content;
            setReservationsState(
                reservations.map((reservation) => {
                    return {
                        bookingId: reservation.bookingId,
                        space: reservation.amenity.name,
                        reserveDay: reservation.createdAt.replace(/T/, ' ').substring(0, 16),
                        shift: shiftMapping[reservation.shift],
                        reserveDate: reservation.startDate,
                        resident: reservation.resident.name + ' ' + reservation.resident.lastName,
                    };
                })
            );
        } catch (error) {
            console.error("Error al obtener amenities:", error);
            alert("Hubo un problema al obtener los amenities.");
        }

    }

    const handleDeleteReservation = async (bookingId) => {
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
            const res = await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/${bookingId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );

            getAllReservation()

        } catch (error) {
            console.error("Error al obtener amenities:", error);
            alert("Hubo un problema al obtener los amenities.");
        }

    }

    useEffect(() => {
        getAllReservation(consortiumIdState)
    }, [consortiumIdState]);

    const columns = [
        { id: 'space', label: 'Espacio Común', align: 'center' },
        { id: 'reserveDay', label: 'Día de Reserva', align: 'center' },
        { id: 'shift', label: 'Turno', align: 'center' },
        { id: 'reserveDate', label: 'Fecha de Reserva', align: 'center' },
        // { id: 'available', label: 'Cantidad Disponible', align: 'center' },
        { id: 'resident', label: 'Residente', align: 'center' }, // Nueva columna
    ];

    const tableHeadCellStyles = {
        backgroundColor: '#002776',
        color: '#FFFFFF',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    };

    const tableCellStyles = {
        color: '#002776',
        padding: '8px',
    };

    return (
        <div>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh', // Ensures that the container takes the full height of the screen
                }}
            >
                <AdminGallerySidebar/>
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
                            Reservas de Espacios Comunes
                        </Typography>

                            <Box sx={{ marginTop: '20px', width: '100%', maxWidth: '900px', marginBottom: '40px' }}>
                                {/* Tabla de reservas */}
                                <TableContainer sx={{
                                    maxHeight: 600,
                                    overflowX: 'auto',
                                    borderRadius: '10px',
                                    border: '1px solid #002776',
                                }} >
                                    <Table stickyHeader
                                           sx={{
                                               borderCollapse: 'separate',
                                               borderSpacing: '0',
                                           }}>
                                        <TableHead >
                                            <TableRow sx={{ height: '24px' }}>
                                                {columns.map((column, index) => (
                                                    <TableCell
                                                        key={column.id}
                                                        align={column.align}
                                                        sx={{
                                                            ...tableHeadCellStyles,
                                                            ...(index === 0 && {
                                                                borderTopLeftRadius: '10px',
                                                            }),
                                                        }}
                                                    >
                                                        {column.label}
                                                    </TableCell>
                                                ))}
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        ...tableHeadCellStyles,
                                                        borderTopRightRadius: '10px', // Redondeo solo en la celda "Acciones"
                                                    }}
                                                >
                                                    Eliminar
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reservationsState.map((row, index) => (
                                                <TableRow hover key={index} sx={{
                                                    backgroundColor: '#FFFFFF',
                                                    '&:hover': { backgroundColor: '#F6EFE5' },
                                                }}>
                                                    {columns.map((column) => (
                                                        <TableCell key={column.id} align={column.align} sx={{ ...tableCellStyles, textAlign: 'center' }}>
                                                            {row[column.id]}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell
                                                        align="center"
                                                        sx={tableCellStyles}
                                                    >
                                                        <IconButton aria-label="delete" onClick={() => handleDeleteReservation(row.bookingId)} sx={{ color: '#B2675E' }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </div>
    );
};

export default AdminBooking;
