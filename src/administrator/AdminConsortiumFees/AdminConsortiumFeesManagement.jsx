// /home/gustavo/Develop/ui-interactive-consortium/src/administrator/AdminConsortiumFees/AdminConsortiumFeesManagement.jsx
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Alert, Card, CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Snackbar,
    TablePagination,
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
import {AdminManageContext} from "../AdminManageContext.jsx";
import DeleteIcon from "@mui/icons-material/Delete.js";
import {useNavigate} from "react-router-dom";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {CircularProgress} from '@mui/material';
import SettingsIcon from "@mui/icons-material/Settings";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";

const columns = [
    { id: 'periodDate', label: 'Periodo', minWidth: 100, align: 'center' },
    { id: 'generationDate', label: 'F. Generación', minWidth: 120, align: 'center' },
    { id: 'dueDate', label: 'F. Vencimiento', minWidth: 120, align: 'center' },
    { id: 'feePeriodStatus', label: 'Estado', minWidth: 150, align: 'center' },
    { id: 'totalAmount', label: 'Monto Total', minWidth: 120, align: 'right' },
    { id: 'notes', label: 'Notas', minWidth: 200 },
];

function AdminConsortiumFeesManagement(){
    const {
        consortiumIdState,
        getAConsortiumByIdConsortium,
        consortiumName,
        allConsortiumFeePeriods,
        getAllConsortiumFeePeriodsByIdConsortium,
        // uploadConsortiumFeePeriod, // No longer used in this component
        deleteConsortiumFeePeriod,
        downloadConsortiumFeePeriod,
        setPeriod
    } = useContext(AdminManageContext);

    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const [totalRows, setTotalRows] = useState(0);

    const [idConsortiumFeePeriodToDelete, setIdConsortiumFeePeriodToDelete] = useState(null);
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

    const [loadingTable, setLoadingTable] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

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
            getAConsortiumByIdConsortium();
            fetchFeePeriods(page, rowsPerPage);
        }
    }, [consortiumIdState, page, rowsPerPage]);

    const fetchFeePeriods = async (currentPage, currentRowsPerPage) => {
        if (!consortiumIdState) return;
        setLoadingTable(true);
        const result = await getAllConsortiumFeePeriodsByIdConsortium(currentPage, currentRowsPerPage);
        if (result) {
            setTotalRows(result.totalElements || 0);
        }
        setLoadingTable(false);
    };

    const EConsortiumFeePeriodStatus = {
        DRAFT: 'Borrador',
        PENDING_PREVIEW: 'Pendiente de Revision',
        GENERATED: 'Generado',
        SENT: 'Enviado',
        CLOSED: 'Cerrado',
        ERROR: 'Error',
    };

    // Función auxiliar para obtener las propiedades del Chip para EConsortiumFeePeriodStatus
    const getPeriodStatusChipProps = (periodStatus) => {
        switch (periodStatus) {
            case 'GENERATED':
                return {
                    label: EConsortiumFeePeriodStatus[periodStatus] || periodStatus,
                    color: 'primary', // Azul para ordinaria
                };
            case 'SENT':
                return {
                    label: EConsortiumFeePeriodStatus[periodStatus] || periodStatus,
                    color: 'primary', // Azul para ordinaria
                };
            case 'CLOSED':
                return {
                    label: EConsortiumFeePeriodStatus[periodStatus] || periodStatus,
                    color: 'warning', // Naranja/amarillo para extraordinaria
                };
            case 'ERROR':
                return {
                    label: EConsortiumFeePeriodStatus[periodStatus] || periodStatus,
                    color: 'secondary', // Púrpura o un color distintivo para fondo de reserva
                };
            default:
                return {
                    label: EConsortiumFeePeriodStatus[periodStatus] || periodStatus,
                    color: 'default',
                };
        }
    };

    // Upload handlers (removed)
    // const handleFileChange = (event) => { ... };
    // const handleUploadTotalAmountChange = (event) => { ... };
    // const handleUploadPeriodDateChange = (event) => { ... };
    // const handleUpload = async () => { ... };

    const handleDelete = async () => {
        if (idConsortiumFeePeriodToDelete) {
            const success = await deleteConsortiumFeePeriod(idConsortiumFeePeriodToDelete);
            if (success) {
                setSnackbarMessage('Periodo de expensa eliminado correctamente.');
                setSnackbarSeverity('success');
                fetchFeePeriods(page, rowsPerPage);
            }
            // Snackbar for error is likely handled in context or if deleteConsortiumFeePeriod returns more info
            setSnackbarOpen(true);
            handleCloseConfirmDeleteDialog();
        }
    };

    const handleDownload = async (consortiumFeePeriodId, periodDate) => {
        const formattedPeriod = periodDate ? periodDate.replace('/', '-') : "periodo";
        const fileName = `Expensa-${formattedPeriod}.pdf`;
        await downloadConsortiumFeePeriod(consortiumFeePeriodId, fileName);
    };

    const formatCurrency = (amount) => {
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

    // Styles for upload section (can be removed or kept if used elsewhere)
    // const textFieldStyles = { ... };
    // const buttonStyles = { ... };

    const tableHeadCellStyles = {
        backgroundColor: '#002776',
        color: '#FFFFFF',
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

    return(
        <div>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                }}
            >
                <AdminGallerySidebar/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        padding: {xs: '16px', sm: '24px'},
                        marginLeft: {xs: 0, sm: '240px'},
                        transition: 'margin-left 0.3s ease',
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                color: '#003366',
                            }}
                        >
                            Gestión de Periodos de Expensas de {consortiumName}
                        </Typography>
                    </Box>

                    {/* Sección de Configuración de Conceptos */}
                    <Box sx={{ width: '100%', maxWidth: '1100px', margin: '0 auto 32px auto' }}>
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

                    {/* Sección de Carga de Expensas - REMOVED */}

                    {/* Tabla de Expensas */}
                    <Box sx={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
                        <TableContainer
                            component={Card}
                            sx={{
                                maxHeight: 600,
                                overflowX: 'auto',
                                borderRadius: '8px',
                                boxShadow: 3,
                            }}
                        >
                            {loadingTable ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Table stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align || 'left'}
                                                    sx={{
                                                        ...tableHeadCellStyles,
                                                        minWidth: column.minWidth,
                                                    }}
                                                >
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
                                            const statusChipProps = getPeriodStatusChipProps(feePeriod.feePeriodStatus);

                                            return (
                                                <TableRow
                                                    hover
                                                    key={feePeriod.consortiumFeePeriodId}
                                                    sx={tableRowHoverStyles}
                                                >
                                                    {columns.map((column) => {
                                                        const value = feePeriod[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align || 'left'}
                                                                       sx={tableCellStyles}>
                                                                {column.id === 'totalAmount' ? formatCurrency(value) : value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell align="center"
                                                               sx={{...tableCellStyles, whiteSpace: 'nowrap'}}>
                                                        <IconButton
                                                            aria-label="download-file"
                                                            onClick={() => handleDownload(feePeriod.consortiumFeePeriodId, feePeriod.periodDate)}
                                                            sx={{padding: '4px', color: '#007bff'}}
                                                            title="Descargar PDF"
                                                        >
                                                            <CloudDownloadIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="manage"
                                                            onClick={() => handleManageClick(feePeriod.periodDate)}
                                                            sx={{padding: '4px', color: '#28a745', mx: 0.5}}
                                                            title="Gestionar Pagos"
                                                        >
                                                            <SettingsIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="delete"
                                                            onClick={() => handleClickOpenConfirmDeleteDialog(feePeriod.consortiumFeePeriodId)}
                                                            sx={{color: '#dc3545'}}
                                                            title="Eliminar Periodo"
                                                        >
                                                            <DeleteIcon fontSize="small"/>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )
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
