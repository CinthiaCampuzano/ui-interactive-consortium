// /home/gustavo/Develop/ui-interactive-consortium/src/administrator/AdminConsortiumFees/AdminConsortiumFeesManagement.jsx
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Alert,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Grid,
    Snackbar,
    Switch,
    TablePagination,
    TextField
} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Button from "@mui/material/Button";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import ReplayIcon from '@mui/icons-material/Replay';
import {AdminManageContext} from "../AdminManageContext.jsx";
import {useNavigate} from "react-router-dom";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EditIcon from "@mui/icons-material/Edit"; // Añadido EditIcon
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import {format as formatDateFns} from 'date-fns';
import axios from "axios";

// Columnas existentes
const columns = [
    { id: 'displayPeriodDate', label: 'Periodo', minWidth: 100, align: 'center' },
    { id: 'displayGenerationDate', label: 'F. Generación', minWidth: 120, align: 'center' },
    { id: 'displayDueDate', label: 'F. Vencimiento', minWidth: 120, align: 'center' },
    { id: 'rawFeePeriodStatus', label: 'Estado', minWidth: 150, align: 'center', format: 'statusChip' }, // Usaremos raw para lógica, display para chip
    { id: 'totalAmount', label: 'Monto Total', minWidth: 120, align: 'right', format: 'currency' },
    { id: 'sendByEmail', label: 'Enviar Email', minWidth: 100, align: 'center', format: 'booleanIcon' },
    // { id: 'notes', label: 'Notas', minWidth: 200 },
];

// Estado inicial para el formulario de edición
const initialEditFormData = {
    generationDate: '', // YYYY-MM-DD
    dueDate: '',        // YYYY-MM-DD
    sendByEmail: false,
    emailText: '',
};

// Mapeo de estados para los Chips (puedes moverlo a una constante global si se usa en más sitios)
const EConsortiumFeePeriodStatusDisplay = {
    DRAFT: 'Borrador',
    PENDING: 'Pendiente',
    GENERATED: 'Generado',
    SENT: 'Enviado',
    CLOSED: 'Cerrado',
    ERROR: 'Error',
    // Añade aquí otros estados que vengan del backend y su visualización
    PENDING_GENERATION: "Pendiente Generación", // Del feePeriodStatusMapping del contexto
    PARTIALLY_PAID: "Parcialmente Pagado",
    PAID: "Pagado",
    OVERDUE: "Vencido",
};


function AdminConsortiumFeesManagement(){
    const {
        consortiumIdState,
        getAConsortiumByIdConsortium,
        consortiumName,
        allConsortiumFeePeriods,
        getAllConsortiumFeePeriodsByIdConsortium,
        updateConsortiumFeePeriod, // Añadido
        deleteConsortiumFeePeriod,
        downloadConsortiumFeePeriod,
        setPeriod
    } = useContext(AdminManageContext);

    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const [totalRows, setTotalRows] = useState(0);

    const [idConsortiumFeePeriodToDelete, setIdConsortiumFeePeriodToDelete] = useState(null);
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

    // Estado para el diálogo de edición
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [currentEditingFeePeriod, setCurrentEditingFeePeriod] = useState(null);
    const [editFormData, setEditFormData] = useState(initialEditFormData);
    const [loadingEdit, setLoadingEdit] = useState(false);


    const [loadingTable, setLoadingTable] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = formatDateFns(new Date(), 'yyyy-MM-dd');

    // Helper para convertir "dd/MM/yyyy" a "yyyy-MM-dd" para input date
    const convertDateToInputFormat = (dateStr_ddMMyyyy) => {
        if (!dateStr_ddMMyyyy) return '';
        const parts = dateStr_ddMMyyyy.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        // Si ya está en YYYY-MM-DD (por si el dato original no está formateado)
        const isoParts = dateStr_ddMMyyyy.split('-');
        if (isoParts.length === 3 && isoParts[0].length === 4) {
            return dateStr_ddMMyyyy;
        }
        return '';
    };

    const handleRegenerateClick = async (consortiumFeePeriodId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setSnackbarMessage('No estás autorizado. Por favor, inicia sesión.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        setLoadingTable(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/consortiumFeePeriods/regenerate/${consortiumFeePeriodId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSnackbarMessage('Los datos para la expensa han sido restablecidos. Por favor, reingrese los valores necesarios para ejecutar el proceso.');
            setSnackbarSeverity('info');
            fetchFeePeriods(page, rowsPerPage); // Recargar datos
        } catch (error) {
            console.error("Error al regenerar la expensa:", error);
            const errorMessage = error.response?.data?.message || 'Error al intentar regenerar la expensa.';
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
        } finally {
            setSnackbarOpen(true);
            setLoadingTable(false);
        }
    };

    const handleManageClick = (periodDateString) => {
        setPeriod(periodDateString);
        localStorage.setItem('period', periodDateString);
        navigate(`/admin/management/expensas/pago`);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = +event.target.value;
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const handleClickOpenConfirmDeleteDialog = (id) => {
        setIdConsortiumFeePeriodToDelete(id);
        setOpenConfirmDeleteDialog(true);
    };
    const handleCloseConfirmDeleteDialog = () => {
        setOpenConfirmDeleteDialog(false);
        setIdConsortiumFeePeriodToDelete(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        if (consortiumIdState) {
            getAConsortiumByIdConsortium(); // Obtener nombre del consorcio
            fetchFeePeriods(page, rowsPerPage);
        }
    }, [consortiumIdState, page, rowsPerPage]);

    const fetchFeePeriods = async (currentPage, currentRowsPerPage) => {
        if (!consortiumIdState) return;
        setLoadingTable(true);
        const result = await getAllConsortiumFeePeriodsByIdConsortium(currentPage, currentRowsPerPage);
        if (result && result.totalElements !== undefined) {
            setTotalRows(result.totalElements);
            // allConsortiumFeePeriods se actualiza en el contexto
        } else {
            setTotalRows(0);
        }
        setLoadingTable(false);
    };

    // --- Funciones para el diálogo de Edición ---
    const handleConsortiumFeeEdit = (feePeriod) => {
        setCurrentEditingFeePeriod(feePeriod);
        const generationDate = convertDateToInputFormat(feePeriod.displayGenerationDate || feePeriod.generationDate);
        const dueDate = convertDateToInputFormat(feePeriod.displayDueDate || feePeriod.dueDate);

        setEditFormData({
            generationDate: generationDate || today, // Si no hay fecha, usar hoy
            dueDate: dueDate || generationDate || today, // Si no hay fecha, usar la de generación o hoy
            sendByEmail: feePeriod.sendByEmail || false,
            emailText: feePeriod.notes || '',
        });
        setOpenEditDialog(true);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
        setCurrentEditingFeePeriod(null);
        setEditFormData(initialEditFormData);
    };

    const handleEditInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setEditFormData(prev => {
            const newState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            };
            // Si cambia la fecha de generación, y la fecha de vencimiento es anterior, ajustarla
            if (name === 'generationDate' && newState.dueDate && newState.dueDate < value) {
                newState.dueDate = value;
            }
            return newState;
        });
    };

    const handleEditDialogSave = async () => {
        if (!currentEditingFeePeriod || !editFormData.generationDate || !editFormData.dueDate) {
            setSnackbarMessage('Las fechas de generación y vencimiento son obligatorias.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        setLoadingEdit(true);
        const result = await updateConsortiumFeePeriod(currentEditingFeePeriod.consortiumFeePeriodId, {
            generationDate: editFormData.generationDate, // YYYY-MM-DD
            dueDate: editFormData.dueDate,               // YYYY-MM-DD
            emailText: editFormData.emailText,
            sendByEmail: editFormData.sendByEmail, // El backend debe manejar esto
        });
        setLoadingEdit(false);

        setSnackbarMessage(result.message);
        setSnackbarSeverity(result.success ? 'success' : 'error');
        setSnackbarOpen(true);

        if (result.success) {
            handleEditDialogClose();
            fetchFeePeriods(page, rowsPerPage); // Recargar la tabla
        }
    };
    // --- Fin Funciones para el diálogo de Edición ---


    const handleDelete = async () => {
        // ... (código existente de handleDelete)
        if (idConsortiumFeePeriodToDelete) {
            const success = await deleteConsortiumFeePeriod(idConsortiumFeePeriodToDelete);
            if (success) {
                setSnackbarMessage('Periodo de expensa eliminado correctamente.');
                setSnackbarSeverity('success');
                fetchFeePeriods(page, rowsPerPage);
            }
            setSnackbarOpen(true);
            handleCloseConfirmDeleteDialog();
        }
    };

    const handleDownload = async (consortiumFeePeriodId, periodDate) => {
        // ... (código existente de handleDownload)
        const formattedPeriod = periodDate ? periodDate.replace('/', '-') : "periodo";
        const fileName = `Expensa-${formattedPeriod}.pdf`;
        await downloadConsortiumFeePeriod(consortiumFeePeriodId, fileName);
    };

    const formatCurrency = (amount) => {
        // ... (código existente de formatCurrency)
        if (amount === null || amount === undefined || amount === '') {
            return '-';
        }
        const number = parseFloat(amount);
        if (isNaN(number)) {
            return '-';
        }
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    const getPeriodStatusChipProps = (rawPeriodStatus) => {
        // Usar el rawPeriodStatus para determinar el color y la etiqueta
        const statusKey = Object.keys(EConsortiumFeePeriodStatusDisplay).find(key =>
            EConsortiumFeePeriodStatusDisplay[key] === rawPeriodStatus || key === rawPeriodStatus
        ) || rawPeriodStatus;


        switch (statusKey) {
            case 'DRAFT':
            case 'PENDING':
            case 'PENDING_GENERATION':
                return { label: EConsortiumFeePeriodStatusDisplay[statusKey] || rawPeriodStatus, color: 'info' };
            case 'GENERATED':
                return { label: EConsortiumFeePeriodStatusDisplay[statusKey] || rawPeriodStatus, color: 'success' };
            case 'SENT':
                return { label: EConsortiumFeePeriodStatusDisplay[statusKey] || rawPeriodStatus, color: 'success' };
            case 'CLOSED':
            case 'PAID':
                return { label: EConsortiumFeePeriodStatusDisplay[statusKey] || rawPeriodStatus, color: 'default' , style: {backgroundColor: '#d3d3d3', color: 'black'}};
            case 'ERROR':
                return { label: EConsortiumFeePeriodStatusDisplay[statusKey] || rawPeriodStatus, color: 'error' };
            case 'OVERDUE':
                return { label: EConsortiumFeePeriodStatusDisplay[statusKey] || rawPeriodStatus, color: 'warning' };
            default:
                return { label: rawPeriodStatus, color: 'default' };
        }
    };


    const tableHeadCellStyles = {
        backgroundColor: '#002776', // Color de fondo del encabezado
        color: '#FFFFFF',           // Color del texto del encabezado
        fontWeight: 'bold',
        textTransform: 'uppercase',
    };

    const tableCellStyles = {
        color: '#002776',
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
    };

    const tableRowHoverStyles = {
        backgroundColor: '#FFFFFF',
        '&:hover': { backgroundColor: '#f5f5f5' },
    };

    // Estados que permiten edición
    const editableStatuses = ['DRAFT', 'PENDING', 'PENDING_GENERATION']; // Ajusta según los valores reales del backend

    return(
        <div>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <AdminGallerySidebar/>
                <Box component="main" sx={{ flexGrow: 1, padding: {xs: '16px', sm: '24px'}, marginLeft: {xs: 0, sm: '240px'}, transition: 'margin-left 0.3s ease' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#003366' }}>
                            Gestión de Periodos de Expensas de {consortiumName}
                        </Typography>
                    </Box>

                    <Box sx={{ width: '100%', maxWidth: '1100px', margin: '0 auto 32px auto' }}>
                        {/* ... (Sección de Configuración de Conceptos) ... */}
                        <Card
                            sx={{
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                                },
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    justifyContent: { sm: 'space-between' }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 }, flexGrow: 1 }}>
                                        <SettingsIcon sx={{ fontSize: {xs: '2rem', sm: '2.5rem'}, mr: 2, color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                                Configurar Conceptos de Expensas
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Define y ajusta los conceptos utilizados en el cálculo de las expensas.
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<SettingsIcon />}
                                        onClick={() => navigate('/admin/management/configuracion-expensas')}
                                        sx={{
                                            mt: { xs: 2, sm: 0 },
                                            ml: { sm: 2 },
                                            width: { xs: '100%', sm: 'auto' },
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Configurar
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box sx={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
                        <TableContainer component={Card} sx={{ maxHeight: 600, overflowX: 'auto', borderRadius: '8px', boxShadow: 3 }}>
                            {loadingTable ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell key={column.id} align={column.align || 'left'} sx={{ ...tableHeadCellStyles, minWidth: column.minWidth }}>
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                            <TableCell align="center" sx={tableHeadCellStyles}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(rowsPerPage > 0
                                                ? allConsortiumFeePeriods.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                : allConsortiumFeePeriods
                                        ).map((feePeriod) => {
                                            // Usar rawFeePeriodStatus para la lógica del chip y habilitación del botón
                                            const statusChipProps = getPeriodStatusChipProps(feePeriod.rawFeePeriodStatus);
                                            const isEditable = editableStatuses.includes(feePeriod.rawFeePeriodStatus);

                                            return (
                                                <TableRow hover key={feePeriod.consortiumFeePeriodId} sx={tableRowHoverStyles}>
                                                    {columns.map((column) => {
                                                        const value = feePeriod[column.id];
                                                        const displayValue = (value === null || value === undefined || value === '') ? 'N/A' : value;

                                                        if (column.format === 'currency') {
                                                            return <TableCell key={column.id} align={column.align || 'left'} sx={tableCellStyles}>{formatCurrency(value)}</TableCell>;
                                                        }
                                                        if (column.format === 'statusChip') {
                                                            return (
                                                                <TableCell key={column.id} align={column.align || 'left'} sx={tableCellStyles}>
                                                                    <Chip label={statusChipProps.label} color={statusChipProps.color} style={statusChipProps.style} size="small" />
                                                                </TableCell>
                                                            );
                                                        }
                                                        // NUEVA CONDICIÓN PARA EL ÍCONO BOOLEANO
                                                        if (column.format === 'booleanIcon') {
                                                            return (
                                                                <TableCell key={column.id} align={column.align || 'left'} sx={tableCellStyles}>
                                                                    {value ? <CheckCircleOutlineIcon sx={{ color: 'green' }} /> : <HighlightOffIcon sx={{ color: 'red' }} />}
                                                                </TableCell>
                                                            );
                                                        }
                                                        return <TableCell key={column.id} align={column.align || 'left'} sx={tableCellStyles}>{displayValue}</TableCell>;
                                                    })}
                                                    <TableCell align="center" sx={{ ...tableCellStyles, whiteSpace: 'nowrap' }}>
                                                        <IconButton
                                                            aria-label="edit-fee-period"
                                                            onClick={() => handleConsortiumFeeEdit(feePeriod)}
                                                            disabled={!isEditable} // Habilitar/deshabilitar botón
                                                            sx={{padding: '4px', color: isEditable ? '#1976d2' : 'grey' }} // Cambiar color si está deshabilitado
                                                            title="Editar Periodo"
                                                        >
                                                            <EditIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="download-file"
                                                            onClick={() => handleDownload(feePeriod.consortiumFeePeriodId, feePeriod.displayPeriodDate)}
                                                            disabled={isEditable}
                                                            sx={{padding: '4px', color: '#007bff'}}
                                                            title="Descargar PDF"
                                                        >
                                                            <CloudDownloadIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="regenerate"
                                                            onClick={() => handleRegenerateClick(feePeriod.consortiumFeePeriodId)}
                                                            disabled={isEditable}
                                                            sx={{padding: '4px', color: '#28a745', mx: 0.5}}
                                                            title="Regenerar Expensa"
                                                        >
                                                            <ReplayIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="manage"
                                                            onClick={() => handleManageClick(feePeriod.displayPeriodDate)}
                                                            disabled={isEditable}
                                                            sx={{padding: '4px', color: '#28a745', mx: 0.5}}
                                                            title="Gestionar Pagos"
                                                        >
                                                            <SettingsIcon fontSize="small"/>
                                                        </IconButton>
                                                        {/*<IconButton*/}
                                                        {/*    aria-label="delete"*/}
                                                        {/*    onClick={() => handleClickOpenConfirmDeleteDialog(feePeriod.consortiumFeePeriodId)}*/}
                                                        {/*    disabled={isEditable}*/}
                                                        {/*    sx={{color: '#dc3545'}}*/}
                                                        {/*    title="Eliminar Periodo"*/}
                                                        {/*>*/}
                                                        {/*    <DeleteIcon fontSize="small"/>*/}
                                                        {/*</IconButton>*/}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {allConsortiumFeePeriods.length === 0 && !loadingTable && (
                                            <TableRow>
                                                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                                                    No hay periodos de expensas para mostrar.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 20, 50]}
                            component="div"
                            count={totalRows}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                            sx={{ mt: 2, borderTop: '1px solid #e0e0e0', backgroundColor: 'background.paper' }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Diálogo de Confirmación de Eliminación */}
            {/* ... (código existente del diálogo de eliminación) ... */}
            <Dialog
                open={openConfirmDeleteDialog}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleCloseConfirmDeleteDialog();
                    }
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#f8f9fa', color: '#343a40' }}>
                    {"Confirmar Eliminación"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#f8f9fa' }}>
                    <DialogContentText id="alert-dialog-description">
                        ¿Está seguro de que desea eliminar este periodo de expensa? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#f8f9fa', padding: '12px 24px' }}>
                    <Button onClick={handleCloseConfirmDeleteDialog} variant="outlined" color="primary">
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDelete}
                        color="error"
                        sx={{ backgroundColor: '#dc3545', '&:hover': { backgroundColor: '#c82333' }}}
                        autoFocus
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Diálogo para Editar Periodo de Expensa */}
            <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#002776', color: 'white' }}>Editar Periodo de Expensa</DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="generationDate"
                                label="Fecha de Generación"
                                type="date"
                                value={editFormData.generationDate}
                                onChange={handleEditInputChange}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: today }}
                                fullWidth
                                variant="outlined"
                                margin="dense"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="dueDate"
                                label="Fecha de Vencimiento"
                                type="date"
                                value={editFormData.dueDate}
                                onChange={handleEditInputChange}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: editFormData.generationDate || today }}
                                fullWidth
                                variant="outlined"
                                margin="dense"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editFormData.sendByEmail}
                                        onChange={handleEditInputChange}
                                        name="sendByEmail"
                                        color="primary"
                                    />
                                }
                                label="Enviar Expensas por Correo"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="emailText"
                                label="Texto del Correo"
                                value={editFormData.emailText}
                                onChange={handleEditInputChange}
                                multiline
                                rows={4}
                                fullWidth
                                variant="outlined"
                                margin="dense"
                                disabled={!editFormData.sendByEmail}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleEditDialogClose} color="inherit" variant="outlined">Cancelar</Button>
                    <Button
                        onClick={handleEditDialogSave}
                        variant="contained"
                        color="primary"
                        disabled={loadingEdit}
                        sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}
                    >
                        {loadingEdit ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}
export default AdminConsortiumFeesManagement;
