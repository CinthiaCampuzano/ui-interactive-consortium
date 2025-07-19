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
    Backdrop, 
    CircularProgress, 
    Chip,
    Pagination,
    Stack,
    Paper
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
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
    const [openCancelDialog, setOpenCancelDialog] = useState(false); // Estado para controlar si el diálogo de cancelación está abierto
    const [bookingIdToCancel, setBookingIdToCancel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState({});
    const [selectedAmenity, setSelectedAmenity] = useState(null);
    const [availableBookings, setAvailableBookings] = useState([]);

    // Pagination states
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filter states
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('PENDING'); // Pre-selected to PENDING

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

    const departmentOptions = React.useMemo(() => {
        if (!selectedAmenity || departments.length === 0) {
            return [];
        }

        return departments.map(dept => {
            const bookingInfo = availableBookings.find(
                b => b.departmentId === dept.departmentId && b.amenityId === selectedAmenity.amenityId
            );

            if (!bookingInfo) {
                return {
                    ...dept,
                    disabled: true,
                    label: `${dept.code} (No disponible)`
                };
            }

            const remaining = bookingInfo.amenityMaxBooking - bookingInfo.amenityBooking;
            const isDisabled = remaining <= 0;

            return {
                ...dept,
                disabled: isDisabled,
                label: isDisabled
                    ? `${dept.code} (LÍMITE ALCANZADO)`
                    : `${dept.code} (Disponibles: ${remaining})`
            };
        }).sort((a, b) => a.code.localeCompare(b.code));
    }, [selectedAmenity, departments, availableBookings]);

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

    const handlePageChange = (event, newPage) => {
        setPage(newPage - 1); // MUI Pagination starts at 1, but our API starts at 0
    };

    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
    };

    const handleClearFilters = () => {
        setFilterDate('');
        setFilterStatus('PENDING'); // Reset to default PENDING
    };

    const handleOpenCancelDialog = (bookingId) => {
        setBookingIdToCancel(bookingId);
        setOpenCancelDialog(true);
    };

    const handleCloseCancelDialog = () => {
        setBookingIdToCancel(null);
        setOpenCancelDialog(false);
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

            const responseBookingsAvailable = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/consortium/${currentConsortiumId}/available-bookings`,
                {
                    headers: { Authorization: `Bearer ${apiToken}` },
                }
            );
            setAvailableBookings(responseBookingsAvailable.data);
            setDepartments(filteredDepartments);

            if (filteredDepartments.length === 0 && !department) {
                setDepartment(filteredDepartments[0].departmentId);
            }

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

            setLoading(true);

            // Prepare query parameters
            const params = {
                page: page,
                size: size
            };

            // Add filter parameters if they exist
            if (filterDate) params.date = filterDate;
            if (filterStatus) params.status = filterStatus;

            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/consortium/${consortiumIdState}/ForResident`,
                {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );

            // Extract pagination metadata
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);

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
                        // Store the original object for editing
                        originalData: reservation
                    };
                })
            );
        } catch (error) {
            console.error("Error al obtener las reservas:", error);
            setText(error.response?.data?.message || "Hubo un problema al obtener las reservas.");
            setBookingMade(false);
            handleOpenAlert();
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (consortiumIdState) {
            getAllAmenitiesByIdConsortium(consortiumIdState);
            getAllReservation();
            fetchAndSetResidentDepartments(consortiumIdState);
        }
    }, [consortiumIdState, residentDepartmentIds]);

    // Refresh when pagination or filters change
    useEffect(() => {
        if (consortiumIdState) {
            getAllReservation();
        }
    }, [page, size, filterDate, filterStatus]);

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
            fetchAndSetResidentDepartments(consortiumIdState); // Actualizar límites
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

    const handleCancelBooking = async () => {
        const idToCancel = bookingIdToCancel;

        if (!idToCancel) {
            console.error("No hay ID de reserva para cancelar.");
            setText("Error: No se seleccionó ninguna reserva para cancelar.");
            setBookingMade(false);
            handleOpenAlert();
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setText("No estás autorizado. Por favor, inicia sesión.");
                setBookingMade(false);
                handleOpenAlert();
                return;
            }

            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/${idToCancel}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setText('Reserva cancelada correctamente.');
            setBookingMade(true);
            getAllReservation();
            fetchAndSetResidentDepartments(consortiumIdState);

        } catch (error) {
            console.error("Error al cancelar la reserva:", error);
            setText(error.response?.data?.message || 'Error al cancelar la reserva.');
            setBookingMade(false);
        } finally {
            setLoading(false);
            handleCloseCancelDialog();
            handleOpenAlert();
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

                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                mb: 3,
                                width: '100%',
                                maxWidth: '1100px',
                                backgroundColor: '#f8f9fa'
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#002776'
                                }}
                            >
                                <FilterListIcon sx={{ mr: 1 }} />
                                Filtros
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Date filter */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Fecha de Reserva"
                                        type="date"
                                        value={filterDate}
                                        onChange={handleFilterChange(setFilterDate)}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarTodayIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                {/* Status filter */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            value={filterStatus}
                                            onChange={handleFilterChange(setFilterStatus)}
                                            label="Estado"
                                        >
                                            {Object.entries(bookingStatusMapping).map(([value, { label }]) => (
                                                <MenuItem key={value} value={value}>
                                                    {label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<ClearIcon />}
                                    onClick={handleClearFilters}
                                    sx={{
                                        borderColor: '#002776',
                                        color: '#002776',
                                        '&:hover': {
                                            borderColor: '#001a4d',
                                            backgroundColor: 'rgba(0, 39, 118, 0.04)'
                                        }
                                    }}
                                >
                                    Limpiar Filtros
                                </Button>
                            </Box>
                        </Paper>

                        <Box sx={{
                            width: '100%',
                            maxWidth: '1100px',
                            marginBottom: '40px'
                        }}>
                            <TableContainer sx={{
                                maxHeight: 600,
                                overflowX: 'auto',
                                overflowY: 'auto',
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
                                            const isCancelable = canDeleteBooking(row.reserveDate) && row.status === 'PENDING';
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
                                                                        aria-label="cancel"
                                                                        onClick={() => handleOpenCancelDialog(row.bookingId)}
                                                                        disabled={!isCancelable}
                                                                        sx={{ color: '#B2675E' }}
                                                                        size="small"
                                                                    >
                                                                        <CancelIcon fontSize="small" />
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
                            
                            {/* Pagination controls */}
                            <Stack 
                                spacing={2} 
                                sx={{ 
                                    mt: 2, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Pagination 
                                    count={totalPages} 
                                    page={page + 1} 
                                    onChange={handlePageChange} 
                                    color="primary" 
                                    showFirstButton 
                                    showLastButton
                                />
                                <Typography variant="caption" sx={{ color: '#002776' }}>
                                    Total de reservas: {totalElements}
                                </Typography>
                            </Stack>
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
                                    {departmentOptions.map((dept) => (
                                        <MenuItem key={dept.departmentId} value={dept.departmentId} disabled={dept.disabled}>
                                            {dept.label}
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
                open={openCancelDialog}
                onClose={handleCloseCancelDialog}
                aria-labelledby="cancel-dialog-title"
                aria-describedby="cancel-dialog-description"
            >
                <DialogTitle
                    id="cancel-dialog-title"
                    sx={{
                        backgroundColor: '#E5E5E5',
                        color: '#002776',
                        textAlign: 'center',
                        padding: '20px 30px',
                        borderBottom: '2px solid #B2675E',
                        fontWeight: 'bold',
                    }}
                >
                    {"Confirmar Cancelación de Reserva"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9', padding: '20px 30px' }}>
                    <DialogContentText id="cancel-dialog-description">
                        ¿Está seguro de que desea cancelar esta reserva? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button
                        onClick={handleCloseCancelDialog}
                        variant="contained"
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
                        onClick={handleCancelBooking}
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
