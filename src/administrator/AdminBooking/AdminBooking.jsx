import {
    Box, 
    Typography, 
    Chip, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    Backdrop,
    CircularProgress,
    Pagination,
    Stack,
    Grid,
    Paper,
    InputAdornment
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import React, {useContext, useEffect, useState} from "react";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import {AdminManageContext} from "../AdminManageContext.jsx";

const AdminBooking = () => {
    const shiftMapping = {
        'MORNING': 'Mañana',
        'NIGHT': 'Noche'
    };

    const bookingStatusMapping = {
        PENDING: { label: 'PENDIENTE', color: 'warning' },
        USER_CANCELLED: { label: 'CANCELADA POR USUARIO', color: 'error' },
        ADMIN_CANCELLED: { label: 'CANCELADA POR ADMINISTRADOR', color: 'error' },
        DONE: { label: 'CONCRETADA', color: 'success' }
    };

    // Allowed status options for admin to change
    const allowedStatusOptions = [
        // { value: 'PENDING', label: 'PENDIENTE' },
        // { value: 'USER_CANCELLED', label: 'CANCELADA POR USUARIO' },
        { value: 'ADMIN_CANCELLED', label: 'CANCELADA POR ADMINISTRADOR' },
        { value: 'DONE', label: 'CONCRETADA' }
    ];

    const [reservationsState, setReservationsState] = useState([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [editedStatus, setEditedStatus] = useState('');
    const [editedDate, setEditedDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertText, setAlertText] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    
    // Pagination states
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // Filter states
    const [filterAmenity, setFilterAmenity] = useState('');
    const [filterShift, setFilterShift] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [amenities, setAmenities] = useState([]);
    
    const { consortiumIdState } = useContext(AdminManageContext)


    const handleOpenAlert = (message, severity = 'success') => {
        setAlertText(message);
        setAlertSeverity(severity);
        setOpenAlert(true);
    };

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const handleOpenEditDialog = (booking) => {
        setSelectedBooking(booking);
        setEditedStatus(booking.status);
        setEditedDate(booking.reserveDate);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedBooking(null);
        setEditedStatus('');
        setEditedDate('');
    };
    
    const handlePageChange = (event, newPage) => {
        setPage(newPage - 1); // MUI Pagination starts at 1, but our API starts at 0
    };
    
    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
    };
    
    const handleClearFilters = () => {
        setFilterAmenity('');
        setFilterShift('');
        setFilterDate('');
        setFilterDepartment('');
        setFilterStatus('');
    };
    
    const getAllAmenities = async () => {
        try {
            if (!consortiumIdState) {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                handleOpenAlert("No estás autorizado. Por favor, inicia sesión.", "error");
                return;
            }

            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/Amenities?idConsortium=${consortiumIdState}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Map and set amenities
            const amenitiesData = res.data.content;
            setAmenities(
                amenitiesData.map((amenity) => ({
                    amenityId: amenity.amenityId,
                    name: amenity.name,
                }))
            );
        } catch (error) {
            console.error("Error al obtener espacios comunes:", error);
            handleOpenAlert(error.response?.data?.message || "Hubo un problema al obtener los espacios comunes.", "error");
        }
    };

    const getAllReservation = async () => {
        try {
            if (!consortiumIdState) {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                handleOpenAlert("No estás autorizado. Por favor, inicia sesión.", "error");
                return;
            }

            setLoading(true);

            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);

            // Si el usuario tiene el rol adecuado, realiza la solicitud
            const params = {
                page: page,
                size: size
            };
            
            // Add filter parameters if they exist
            if (filterAmenity) params.amenityId = filterAmenity;
            if (filterShift) params.shift = filterShift;
            if (filterDate) params.date = filterDate;
            if (filterDepartment) params.departmentCode = filterDepartment;
            if (filterStatus) params.status = filterStatus;
            
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/consortium/${consortiumIdState}/ForAdmin`,
                {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Extract pagination metadata
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
            
            // Mapear y establecer las reservas
            const reservations = res.data.content;
            setReservationsState(
                reservations.map((reservation) => {
                    return {
                        bookingId: reservation.bookingId,
                        space: reservation.amenity.name,
                        reserveDay: reservation.createdAt.replace(/T/, ' ').substring(0, 16),
                        shift: shiftMapping[reservation.shift] || reservation.shift,
                        reserveDate: reservation.startDate,
                        resident: reservation.resident.name + ' ' + reservation.resident.lastName,
                        status: reservation.bookingStatus,
                        bookingCost: reservation.bookingCost,
                        department: reservation.department.code,
                        originalData: reservation
                    };
                })
            );
        } catch (error) {
            console.error("Error al obtener reservas:", error);
            handleOpenAlert(error.response?.data?.message || "Hubo un problema al obtener las reservas.", "error");
        } finally {
            setLoading(false);
        }
    }


    const handleUpdateBooking = async () => {
        if (!selectedBooking) {
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('token');
            if (!token) {
                handleOpenAlert("No estás autorizado. Por favor, inicia sesión.", "error");
                return;
            }

            // Prepare the update request using the original data
            const updateData = {
                ...selectedBooking.originalData,
                bookingStatus: editedStatus,
                startDate: editedDate
            };

            // Send the update request
            const res = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/Bookings/${selectedBooking.bookingId}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            handleOpenAlert("Reserva actualizada correctamente", "success");
            getAllReservation();
            handleCloseEditDialog();

        } catch (error) {
            console.error("Error al actualizar la reserva:", error);
            handleOpenAlert(error.response?.data?.message || "Hubo un problema al actualizar la reserva.", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (consortiumIdState) {
            getAllReservation();
            getAllAmenities();
        }
    }, [consortiumIdState, page, size]);
    
    useEffect(() => {
        if (consortiumIdState) {
            setPage(0);
            getAllReservation();
        }
    }, [filterAmenity, filterShift, filterDate, filterDepartment, filterStatus, consortiumIdState]);

    const columns = [
        { id: 'space', label: 'Espacio Común', align: 'center' },
        { id: 'department', label: 'Departamento', align: 'center' },
        { id: 'reserveDay', label: 'Fecha de Solicitud', align: 'center' },
        { id: 'shift', label: 'Turno', align: 'center' },
        { id: 'reserveDate', label: 'Fecha de Reserva', align: 'center' },
        { id: 'bookingCost', label: 'Costo de Uso', align: 'center' },
        { id: 'status', label: 'Estado', align: 'center' },
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
                        
                        {/* Filters */}
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
                                {/* Amenity filter */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Espacio Común</InputLabel>
                                        <Select
                                            value={filterAmenity}
                                            onChange={handleFilterChange(setFilterAmenity)}
                                            label="Espacio Común"
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            {amenities.map((amenity) => (
                                                <MenuItem key={amenity.amenityId} value={amenity.amenityId}>
                                                    {amenity.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                {/* Shift filter */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Turno</InputLabel>
                                        <Select
                                            value={filterShift}
                                            onChange={handleFilterChange(setFilterShift)}
                                            label="Turno"
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="MORNING">Mañana</MenuItem>
                                            <MenuItem value="NIGHT">Noche</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                {/* Status filter */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            value={filterStatus}
                                            onChange={handleFilterChange(setFilterStatus)}
                                            label="Estado"
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            {allowedStatusOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                {/* Date filter */}
                                <Grid item xs={12} sm={6} md={3}>
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
                                
                                {/* Department code filter */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        label="Código de Departamento"
                                        value={filterDepartment}
                                        onChange={handleFilterChange(setFilterDepartment)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
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

                            <Box sx={{ marginTop: '20px', width: '100%', maxWidth: '1100px', marginBottom: '40px' }}>
                                {/* Tabla de reservas */}
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
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        ...tableHeadCellStyles,
                                                        borderTopRightRadius: '10px', // Redondeo solo en la celda "Acciones"
                                                    }}
                                                >
                                                    Acciones
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reservationsState.map((row, index) => {
                                                const statusInfo = bookingStatusMapping[row.status] || { label: row.status, color: 'default' };
                                                
                                                return (
                                                    <TableRow hover key={row.bookingId || index} sx={{
                                                        backgroundColor: '#FFFFFF',
                                                        '&:hover': { backgroundColor: '#F6EFE5' },
                                                    }}>
                                                        {columns.map((column) => {
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
                                                                        {row[column.id] ? `$ ${row[column.id]}` : 'N/A'}
                                                                    </TableCell>
                                                                );
                                                            }
                                                            return (
                                                                <TableCell key={column.id} align={column.align} sx={{ ...tableCellStyles, textAlign: 'center' }}>
                                                                    {row[column.id] !== undefined && row[column.id] !== null ? row[column.id] : 'N/A'}
                                                                </TableCell>
                                                            );
                                                        })}
                                                        <TableCell
                                                            align="center"
                                                            sx={tableCellStyles}
                                                        >
                                                            <IconButton 
                                                                aria-label="edit" 
                                                                onClick={() => handleOpenEditDialog(row)} 
                                                                sx={{ color: '#028484' }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
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

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>
                    Editar Reserva
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    {selectedBooking && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#002776' }}>
                                Espacio: {selectedBooking.space}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#002776' }}>
                                Residente: {selectedBooking.resident}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#002776' }}>
                                Departamento: {selectedBooking.department}
                            </Typography>
                            
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={editedStatus}
                                    onChange={(e) => setEditedStatus(e.target.value)}
                                    label="Estado"
                                >
                                    {allowedStatusOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <TextField
                                label="Fecha de Reserva"
                                type="date"
                                value={editedDate}
                                onChange={(e) => setEditedDate(e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Button 
                        onClick={handleCloseEditDialog} 
                        variant="contained"
                        sx={{
                            backgroundColor: '#B2675E',
                            '&:hover': { backgroundColor: '#8E5346' },
                            borderRadius: '25px',
                            padding: '8px 20px',
                        }}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleUpdateBooking} 
                        variant="contained"
                        sx={{
                            backgroundColor: '#028484',
                            '&:hover': { backgroundColor: '#026F6B' },
                            borderRadius: '25px',
                            padding: '8px 20px',
                        }}
                        disabled={loading || !editedStatus || !editedDate}
                    >
                        Guardar Cambios
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

            {/* Snackbar for notifications */}
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertText}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default AdminBooking;
