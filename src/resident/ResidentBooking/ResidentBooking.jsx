import React, {useContext, useEffect, useState} from 'react';
import {
    Container,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
    Box,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    Snackbar,
    DialogContentText,
    Backdrop, CircularProgress, Chip
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {ResidentManageContext} from "../ResidentManageContext.jsx";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import ResidentSidebar from "../ResidentSidebar.jsx";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import DeleteIcon from '@mui/icons-material/Delete'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const shifts = [
    { id: 'MORNING', name: 'Mañana'},
    { id: 'NIGHT',   name: 'Noche'}
];

const shiftMapping = {
    'MORNING': 'Mañana',
    'NIGHT': 'Noche'
};

const bookingStatusMapping = {
    PENDING: { label: 'PENDIENTE', color: 'warning' },
    USER_CANCELLED: { label: 'CANCELADA POR USUARIO', color: 'error' },
    AUTOMATIC_CANCELLED: { label: 'CANCELACION AUTOMATICA', color: 'default' },
    ADMIN_CANCELLED: { label: 'CANCELADA POR ADMINISTRADOR', color: 'error' },
    DONE: { label: 'CONCRETADA', color: 'success' }
};


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
    const [department, setDepartment] = useState('');
    const [departments, setDepartments] = useState([]);
    const [residentDepartmentIds, setResidentDepartmentIds] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Estado para controlar si el diálogo de eliminación está abierto
    const [bookingIdToDelete, setBookingIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState({});
    const [selectedAmenity, setSelectedAmenity] = useState(null);

    const sliderSettings = {
        dots: true,
        infinite: amenities.length > 3,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1100, // When to switch to 2 slides
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: amenities.length > 2,
                    dots: true
                }
            },
            {
                breakpoint: 700, // When to switch to 1 slide
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: amenities.length > 1,
                }
            }
        ]
    };

    const handleChangeDate = (event) => setDate(event.target.value);
    const handleChangeShift = (event) => setShift(event.target.value);

    const handleOpenDialog = (amenity) => {
        setSelectedAmenity(amenity);
        setSpace(amenity.amenityId);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAmenity(null);
        setDate('');
        setShift('');
        setDepartment('');
    };

    const [reservationsState, setReservationsState] = useState([]);

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const handleChangeDepartment = (event) => {
        setDepartment(event.target.value); // Sigue guardando el ID
    };

    const handleOpenDeleteDialog = (bookingId) => {
        setBookingIdToDelete(bookingId); // Guarda el ID de la reserva que se va a eliminar
        setOpenDeleteDialog(true); // Abre el diálogo
    };

    const handleCloseDeleteDialog = () => {
        setBookingIdToDelete(null); // Limpia el ID al cerrar
        setOpenDeleteDialog(false); // Cierra el diálogo
    };

    const setAmenityPhotos = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        const imagePromises = amenities.map(async (amenity) => {
            if (amenity.imagePath) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/Amenities/${amenity.amenityId}/download`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        responseType: 'blob'
                    });
                    const imageBlob = res.data;
                    const imageUrl = URL.createObjectURL(imageBlob);
                    return { amenityId: amenity.amenityId, imageUrl };
                } catch (error) {
                    console.error(`Error fetching image for amenity ${amenity.amenityId}:`, error);
                    return null;
                }
            }
            return null;
        });

        const images = await Promise.all(imagePromises);
        const newImages = Object.fromEntries(images.filter(Boolean).map(img => [img.amenityId, img.imageUrl]));
        setUploadedImages(newImages);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Asegúrate que 'residentDepartmentIds' sea el nombre correcto del claim en tu token
                setResidentDepartmentIds(decodedToken.residentDepartmentIds || []);
            } catch (error) {
                console.error("Error al decodificar el token para IDs de departamento:", error);
                setResidentDepartmentIds([]); // En caso de error, establece un array vacío
            }
        }
    }, []);

    const fetchAndSetResidentDepartments = async (currentConsortiumId) => {
        // Si no hay ID de consorcio o el residente no tiene IDs de departamento, no hacer nada o limpiar.
        if (!currentConsortiumId || residentDepartmentIds.length === 0) {
            setDepartments([]); // Limpia la lista de departamentos si no hay información necesaria
            if (residentDepartmentIds.length === 0 && currentConsortiumId) {
                console.warn("El residente no tiene departamentos asignados en el token o aún no se han cargado.");
            }
            return;
        }

        try {
            const apiToken = localStorage.getItem('token');
            if (!apiToken) {
                setText("No autorizado para obtener departamentos.");
                setBookingMade(false);
                handleOpenAlert();
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/departments`,
                {
                    params: {
                        consortiumId: currentConsortiumId
                    },
                    headers: { Authorization: `Bearer ${apiToken}` },
                }
            );

            const allConsortiumDepts = response.data.content;

            const filteredDepartments = allConsortiumDepts
                .filter(dept => residentDepartmentIds.includes(dept.departmentId))
                .map(dept => ({ departmentId: dept.departmentId, code: dept.code }));

            setDepartments(filteredDepartments);

            // Opcional: Si quieres preseleccionar el primer departamento de la lista
            // if (filteredDepartments.length > 0 && !department) {
            //    setDepartment(filteredDepartments[0].departmentId);
            // }

        } catch (error) {
            console.error("Error al obtener los detalles de los departamentos del residente:", error);
            setDepartments([]); // Limpiar en caso de error
            setText(error.response?.data?.message || 'Error al cargar los departamentos.');
            setBookingMade(false); // Asumiendo que bookingMade controla el tipo de alerta
            handleOpenAlert();
        }
    };

    const getAllReservation = async () => {
        try {

            if (!consortiumIdState) {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                setText("No estás autorizado. Por favor, inicia sesión.");
                setBookingMade(false);
                handleOpenAlert();
                return;
            }

            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/consortium/${consortiumIdState}/ForResident`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );

            const reservations = res.data.content;

            setReservationsState(
                reservations.map((reservation) => {
                    return {
                        bookingId: reservation.bookingId,
                        space: reservation.amenity.name,
                        code: reservation.department.code,
                        reserveDay: reservation.createdAt.replace(/T/, ' ').substring(0, 16),
                        shift: shiftMapping[reservation.shift],
                        reserveDate: reservation.startDate,
                        status: reservation.bookingStatus,
                        bookingCost: reservation.bookingCost,
                    };
                })
            );
        } catch (error) {
            console.error("Error al obtener las reservas:", error);
            setText(error.response?.data?.message || "Hubo un problema al obtener las reservas.");
            setBookingMade(false);
            handleOpenAlert();
        }

    }

    useEffect(() => {
        if (consortiumIdState) {
            getAllAmenitiesByIdConsortium(consortiumIdState);
            getAllReservation(consortiumIdState);
            fetchAndSetResidentDepartments(consortiumIdState);
        }
    }, [consortiumIdState, residentDepartmentIds]);

    useEffect(() => {
        if (amenities.length > 0) {
            setAmenityPhotos();
        }
    }, [amenities]);

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

            // Mapear y establecer las amenities
            const amenities = res.data.content;
            setAmenities(
                amenities.map((amenity) => {
                    return {
                        amenityId: amenity.amenityId,
                        name: amenity.name,
                        maxBookings: amenity.maxBookings,
                        imagePath: amenity.imagePath,
                        costOfUse: amenity.costOfUse,
                        active: amenity.active,
                    };
                })
            );
        } catch (error) {
            console.error("Error al obtener amenities:", error);
            alert("Hubo un problema al obtener los amenities.");
        }
    };


    const handleSubmit = async () => {

        try {
            setLoading(true); // Inicia la carga ANTES de cualquier otra cosa

            if (!consortiumIdState) {
                // setLoading(false); // No es necesario aquí si el diálogo no se cierra
                setText("Error: No se pudo identificar el consorcio."); // Mensaje más claro
                setBookingMade(false);
                handleOpenAlert();
                return; // Salir si no hay consortiumIdState
            }

            const token = localStorage.getItem('token');
            if (!token) {
                // setLoading(false);
                setText("No estás autorizado. Por favor, inicia sesión.");
                setBookingMade(false);
                handleOpenAlert();
                return;
            }

            // const decodedToken = jwtDecode(token); // No es necesario si no usas su contenido

            const request = {
                startDate: date,
                shift: shift,
                amenity: {amenityId: space},
                department: { departmentId: department }
            }

            console.log(request)

            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings`,
                request,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setText('Espacio reservado exitosamente');
            setBookingMade(true);
            getAllReservation(); // Refrescar la lista
            // Limpiar el formulario después de una reserva exitosa
            setSpace('');
            setDate('');
            setShift('');
            setDepartment('');


        } catch (error) {
            console.error("Error al crear la reserva:", error); // Añadir log del error
            setText(error.response?.data?.message || error.response?.data || 'Error al crear la reserva.'); // Mejorar mensaje de error
            setBookingMade(false);
        } finally {
            setLoading(false); // Detiene la carga
            setOpenDialog(false); // Cierra el diálogo de reserva DESPUÉS de que todo termine
            handleOpenAlert(); // Muestra la alerta (éxito o error)
        }
    };

    const canDeleteBooking = (reserveDateStr) => {
        if (!reserveDateStr) return false;

        const [year, month, day] = reserveDateStr.split('-').map(Number);
        const reservationDate = new Date(year, month - 1, day)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizamos la hora actual a medianoche
        const timeDifferenceInMilliseconds = reservationDate - today;

        const timeDifferenceInDays = timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24);

        return timeDifferenceInDays > 1;
    };

    const handleDeleteBooking = async () => {
        const idToDelete = bookingIdToDelete;
        // No cerramos el diálogo aquí todavía
        // handleCloseDeleteDialog();

        if (!idToDelete) {
            console.error("No hay ID de reserva para eliminar.");
            setText("Error: No se seleccionó ninguna reserva para eliminar.");
            setBookingMade(false);
            handleOpenAlert();
            // setLoading(false); // No es necesario si el diálogo no se cierra
            return;
        }

        setLoading(true); // Inicia la carga

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setText("No estás autorizado. Por favor, inicia sesión.");
                setBookingMade(false);
                handleOpenAlert();
                // setLoading(false);
                return;
            }

            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/${idToDelete}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setText('Reserva eliminada correctamente.');
            setBookingMade(true);
            // handleOpenAlert(); // La alerta se mostrará en el finally
            getAllReservation();

        } catch (error) {
            console.error("Error al eliminar la reserva:", error);
            setText(error.response?.data?.message || 'Error al eliminar la reserva.');
            setBookingMade(false);
            // handleOpenAlert(); // La alerta se mostrará en el finally
        } finally {
            setLoading(false); // Detiene la carga
            handleCloseDeleteDialog(); // Cierra el diálogo de eliminación DESPUÉS de que todo termine
            handleOpenAlert(); // Muestra la alerta (éxito o error)
        }
    };

    const columns = [
        { id: 'space', label: 'Espacio Común', align: 'center' },
        { id: 'code', label: 'Departamento', align: 'center' },
        { id: 'reserveDay', label: 'Fecha de Solicitud', align: 'center' },
        { id: 'shift', label: 'Turno', align: 'center' },
        { id: 'reserveDate', label: 'Fecha de Reserva', align: 'center' },
        { id: 'bookingCost', label: 'Costo de Uso', align: 'center' },
        { id: 'status', label: 'Estado', align: 'center' },
        { id: 'actions', label: 'Acciones', align: 'center' }
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
                    minHeight: '100vh',
                }}
            >
                <ResidentSidebar/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        padding: {xs: '16px', sm: '24px'},
                        marginLeft: {xs: 0, sm: '240px'},
                        transition: 'margin-left 0.3s ease',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center', // Este Box centrará a sus hijos
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

                        {/* Amenity Cards */}
                        <Box sx={{ width: '100%', maxWidth: '1100px', mb: 5, px: {xs: 0, sm: '40px'} }}>
                            <Slider {...sliderSettings}>
                                {amenities.map((amenity) => (
                                    <Box key={amenity.amenityId} sx={{ p: 1.5 }}>
                                        <Card
                                            sx={{
                                                height: '100%', // Ensure all cards have the same height
                                                display: 'flex',
                                                flexDirection: 'column',
                                                textAlign: 'center',
                                                backgroundColor: 'transparent',
                                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                                ...(amenity.active ? {
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        boxShadow: '0px 16px 32px rgba(184, 218, 227, 0.8)',
                                                    },
                                                } : {
                                                    cursor: 'not-allowed'
                                                }),
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="220"
                                                image={uploadedImages[amenity.amenityId] || '/images/poolPlaceholder.jpeg'}
                                                alt={amenity.name}
                                                sx={{
                                                    opacity: amenity.active ? 1 : 0.5,
                                                    filter: amenity.active ? 'none' : 'grayscale(80%)',
                                                }}
                                            />
                                            <CardContent sx={{ flexGrow: 1 }}> {/* Content grows to fill space */}
                                                <Typography gutterBottom variant="h6" component="div" sx={{ color: '#002776', fontWeight: 'bold' }}>
                                                    {amenity.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ color: '#002776' }}>
                                                    Costo de Uso: $ {amenity.costOfUse}
                                                </Typography>
                                            </CardContent>
                                            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(amenity)}
                                                    disabled={!amenity.active}
                                                    sx={{
                                                        backgroundColor: amenity.active ? '#003366' : 'grey.400',
                                                        '&:hover': {
                                                            backgroundColor: amenity.active ? '#002776' : 'grey.400'
                                                        },
                                                    }}
                                                >
                                                    {amenity.active ? 'Reservar' : 'No Habilitado'}
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Box>
                                ))}
                            </Slider>
                        </Box>


                        <Box sx={{
                            width: '100%',
                            maxWidth: '1100px',
                            marginBottom: '40px'
                        }}>
                            <TableContainer sx={{
                                maxHeight: 600,
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
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reservationsState.map((row, index) => {
                                            const isDeletable = canDeleteBooking(row.reserveDate) && row.status === 'PENDING';
                                            const statusInfo = bookingStatusMapping[row.status] || { label: row.status, color: 'default' };

                                            return (
                                                <TableRow hover key={row.bookingId || index} sx={{
                                                    backgroundColor: '#FFFFFF',
                                                    '&:hover': { backgroundColor: '#F6EFE5' },
                                                }}>
                                                    {columns.map((column) => {
                                                        const value = row[column.id];

                                                        if (column.id === 'actions') {
                                                            return (
                                                                <TableCell key={column.id} align={column.align} sx={{ ...tableCellStyles, textAlign: 'center' }}>
                                                                    <IconButton
                                                                        aria-label="delete"
                                                                        onClick={() => handleOpenDeleteDialog(row.bookingId)}
                                                                        disabled={!isDeletable}
                                                                        sx={{ color: '#B2675E' }}
                                                                        size="small"
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            );
                                                        }
                                                        if (column.id === 'status') {
                                                            return (
                                                                <TableCell key={column.id} align={column.align} sx={{ ...tableCellStyles, textAlign: 'center' }}>
                                                                    <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                                                                </TableCell>
                                                            );
                                                        }
                                                        if (column.id === 'bookingCost') {
                                                            return (
                                                                <TableCell key={column.id} align={column.align} sx={{ ...tableCellStyles, textAlign: 'center' }}>
                                                                    {`$ ${value}`}
                                                                </TableCell>
                                                            );
                                                        }
                                                        // Default rendering for other columns
                                                        return (
                                                            <TableCell key={column.id} align={column.align} sx={{ ...tableCellStyles, textAlign: 'center' }}>
                                                                {value !== undefined && value !== null ? value : 'N/A'}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                    </Box>
                </Box>
            </Box>

            {/* Booking Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #B2675E', // Color de borde relacionado con eliminar
                    fontWeight: 'bold',
                }}>
                    Reservar: {selectedAmenity?.name}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ pt: 2 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Fecha"
                                type="date"
                                value={date}
                                onChange={handleChangeDate}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarTodayIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
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
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Departamento</InputLabel>
                                <Select value={department}
                                        onChange={handleChangeDepartment}
                                        label="Departamento"
                                        disabled={departments.length === 0}
                                >
                                    {departments.map((dept) => (
                                        <MenuItem key={dept.departmentId} value={dept.departmentId}>
                                            {dept.code}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={loading} color="secondary">Cancelar</Button>
                    <Button onClick={handleSubmit}  disabled={loading || !date || !shift || !department} color="primary">Confirmar Reserva</Button>
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
            <Dialog
                open={openDeleteDialog}
                onClose={(event, reason) => {
                    if (reason && reason !== 'backdropClick') {
                        handleCloseDeleteDialog();
                    } else if (reason === 'backdropClick') {
                        handleCloseDeleteDialog();
                    }
                }}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle
                    id="delete-dialog-title" // Cambiado el ID para que sea único
                    sx={{
                        backgroundColor: '#E5E5E5',
                        color: '#002776',
                        textAlign: 'center',
                        padding: '20px 30px',
                        borderBottom: '2px solid #B2675E', // Color de borde relacionado con eliminar
                        fontWeight: 'bold',
                    }}
                >
                    {"Confirmar Eliminación de Reserva"} {/* Texto adaptado */}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9', padding: '20px 30px' }}> {/* Ajustado padding */}
                    <DialogContentText id="delete-dialog-description"> {/* Cambiado el ID */}
                        ¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button
                        onClick={handleCloseDeleteDialog} // Llama al manejador para cerrar el diálogo de eliminación
                        variant="contained"
                        sx={{
                            backgroundColor: '#B2675E', // Estilo de botón "Cancelar"
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
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#028484',
                            '&:hover': {
                                backgroundColor: '#026F6B',
                            },
                            borderRadius: '25px',
                            padding: '8px 20px',
                            transition: 'background-color 0.3s ease',
                        }}
                        onClick={handleDeleteBooking}
                        disabled={loading}
                    >
                        Aceptar
                    </Button>
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
