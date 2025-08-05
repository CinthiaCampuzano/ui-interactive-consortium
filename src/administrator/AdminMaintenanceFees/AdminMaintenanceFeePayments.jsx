import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TablePagination,
    TextField
} from "@mui/material";
import React, {useCallback, useContext, useEffect, useState} from "react";
import Button from "@mui/material/Button";
// import Paper from "@mui/material/Paper"; // No se usa directamente
import axios from "axios";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import {AdminManageContext} from "../AdminManageContext.jsx";
// import {useNavigate} from "react-router-dom"; // No se usa directamente
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from "@mui/icons-material/Edit";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import {useSnackbar} from 'notistack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import { format } from 'date-fns';


const columns = [
    { id: 'departmentCode', label: 'Departamento', minWidth: 100, align: 'center' },
    { id: 'issueDate', label: 'Fecha Emisión', minWidth: 120, align: 'center' },
    { id: 'dueDate', label: 'Fecha Vencimiento', minWidth: 120, align: 'center' },
    { id: 'totalAmount', label: 'Monto Expensa', minWidth: 130, align: 'center' },
    { id: 'dueAmount', label: 'Monto Adeudado', minWidth: 130, align: 'center' },
    { id: 'paidAmount', label: 'Monto Pagado', minWidth: 120, align: 'center' },
    { id: 'paymentStatus', label: 'Estado de Pago', minWidth: 120, align: 'center' },
    { id: 'paymentDate', label: 'Última Fecha de Pago', minWidth: 120, align: 'center' } // Será derivado
];

function AdminMaintenanceFeesPayments(){
    const {
        consortiumIdState,
        getAConsortiumByIdConsortium,
        consortiumName,
        period,
        periodStatus,
        getAllMaintenanceFeesByIdConsortium,
        departmentFeeQueryData,
        fetchDepartmentFeeQueryData,
        statusMapping, allConsortiumFeePeriods , setAllConsortiumFeePeriods, setDepartmentFeeQueryData
    } = useContext(AdminManageContext);

    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);

    const [file, setFile] = useState(null);
    const [editingFeePayment, setEditingFeePayment] = useState(null);
    const [loading, setLoading] = useState(false); // Loading para acciones locales (guardar pago, etc.)
    const [tableLoading, setTableLoading] = useState(false); // Loading específico para la carga de la tabla
    const [editOpen, setEditOpen] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [totalAmount, setTotalAmount] = useState('');
    const [fileName, setFileName] = useState('');
    const { enqueueSnackbar } = useSnackbar();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const fetchResumeData = useCallback(async () => {
        if (consortiumIdState && period) {
            try {
                const periodArray = period.split('/');
                const periodFormatted = `${periodArray[1]}-${periodArray[0]}-01`;
                const token = localStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/department-fees/resume`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        consortiumId: consortiumIdState,
                        period: periodFormatted,
                    }
                });
                setResumeData(response.data);
            } catch (error) {
                console.error('Error fetching resume data:', error);
                enqueueSnackbar('Error al cargar el resumen de expensas.', { variant: 'error' });
                setResumeData(null);
            }
        }
    }, [consortiumIdState, period, enqueueSnackbar]);

    useEffect(() => {
        if (consortiumIdState) {
            getAConsortiumByIdConsortium();
            // fetchDepartmentFeeQueryData();
            console.log(departmentFeeQueryData)
        }
    }, [consortiumIdState, getAllMaintenanceFeesByIdConsortium]);

    // Efecto para obtener los datos de la tabla usando la función del contexto
    useEffect(() => {
        const loadData = async () => {
            if (consortiumIdState && period) { // Asegurarse que period también esté definido
                setTableLoading(true);
                await fetchDepartmentFeeQueryData(page, rowsPerPage);
                setTableLoading(false);
            } else {
                // Si no hay consorcio o período, podrías limpiar los datos si lo deseas
                // setDepartmentFeeQueryData({ content: [], totalElements: 0 }); // Esto se haría en el contexto
            }
        };
        loadData();
    }, [consortiumIdState, period, page, rowsPerPage]);

    useEffect(() => {
        fetchResumeData();
    }, [fetchResumeData]);

    const handleEditClick = (departmentFee) => {
        setEditingFeePayment(departmentFee);
        setTotalAmount('');
        setFileName('');
        setFile(null);
        setEditOpen(true);
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFileName(selectedFile.name);
            setFile(selectedFile);
        }
    };

    const handleInputChange = (event) => {
        setTotalAmount(event.target.value);
    };

    const handleSaveChanges = async () => {
        if (!editingFeePayment || !totalAmount || !file) {
            enqueueSnackbar('Por favor, complete el monto y seleccione un archivo.', { variant: 'warning' });
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            const paymentCreationDto = {
                departmentFee: {departmentFeeId: editingFeePayment.departmentFeeId},
                departmentCode: editingFeePayment.departmentCode,
                period: typeof period === 'string' ? period : period.toISOString().split('T')[0],
                amount: totalAmount,
            };

            const jsonBlob = new Blob([JSON.stringify(paymentCreationDto)], { type: 'application/json' });
            formData.append('paymentDto', jsonBlob, 'paymentDto.json');
            formData.append('file', file);

            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payments`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            enqueueSnackbar('Pago registrado exitosamente', { variant: 'success' });
            // Refrescar la tabla llamando a la función del contexto
            await fetchDepartmentFeeQueryData(page, rowsPerPage);
            await fetchResumeData();
        } catch (error) {
            console.error('Error al guardar el pago:', error);
            enqueueSnackbar(error.response?.data?.message || 'Error al guardar el pago.', { variant: 'error' });
        } finally {
            setLoading(false);
            setEditOpen(false);
        }
    };

    const handleDownload = async (departmentFee) => {
        if (!departmentFee.payments || departmentFee.payments.length === 0) {
            enqueueSnackbar('No hay pagos registrados para descargar comprobante.', { variant: 'info' });
            return;
        }
        const paymentToDownload = departmentFee.payments[departmentFee.payments.length -1];
        const paymentId = paymentToDownload.id; // ASUMIENDO que PaymentDto tiene 'id'

        if (!paymentId) {
            enqueueSnackbar('No se pudo identificar el pago para la descarga.', { variant: 'error' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            enqueueSnackbar("No estás autorizado.", { variant: 'error' });
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/${paymentId}/download`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'No se pudo descargar el archivo');
            }
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let downloadFileName = 'comprobante.pdf';
            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches[1]) downloadFileName = matches[1];
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', downloadFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            enqueueSnackbar(error.message || 'Error al descargar el archivo', { variant: 'error' });
            console.error('Error de descarga:', error);
        }
    };

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

    return(
        <div>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <AdminGallerySidebar/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        padding: { xs: '16px', sm: '24px' },
                        marginLeft: { xs: 0, sm: '240px' },
                        transition: 'margin-left 0.3s ease',
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: '#003366', fontSize: { xs: '1.5rem', md: '2rem' }, marginBottom: '20px' }}>
                            Gestión de Expensas de {consortiumName}
                        </Typography>

                        {/* Cards de Resumen */}
                        <Box sx={{ width: '100%', maxWidth: '1100px', mb: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ backgroundColor: '#FFF0F0', borderLeft: '5px solid #FF6B6B' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: 16, color: '#B22222', fontWeight: 'bold' }} gutterBottom>
                                                PENDIENTES
                                            </Typography>
                                            <Typography variant="h4" component="div" sx={{ color: '#B22222', fontWeight: 'bold' }}>
                                                {resumeData?.pendingQuantity || 0}
                                            </Typography>
                                            <Typography sx={{ mb: 1.5, color: '#B22222', fontSize: '0.9rem' }}>
                                                Monto: ${Number(resumeData?.pendingAmount || 0).toFixed(2)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ backgroundColor: '#F0FFF0', borderLeft: '5px solid #32CD32' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: 16, color: '#228B22', fontWeight: 'bold' }} gutterBottom>
                                                PAGADAS
                                            </Typography>
                                            <Typography variant="h4" component="div" sx={{ color: '#228B22', fontWeight: 'bold' }}>
                                                {resumeData?.paidQuantity || 0}
                                            </Typography>
                                            <Typography sx={{ mb: 1.5, color: '#228B22', fontSize: '0.9rem' }}>
                                                Monto: ${Number(resumeData?.paidAmount || 0).toFixed(2)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Card sx={{ backgroundColor: '#F0F8FF', borderLeft: '5px solid #1E90FF' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: 16, color: '#003366', fontWeight: 'bold' }} gutterBottom>
                                                TOTAL EXPENSAS
                                            </Typography>
                                            <Typography variant="h4" component="div" sx={{ color: '#003366', fontWeight: 'bold' }}>
                                                {resumeData?.totalQuantity || 0}
                                            </Typography>
                                            <Typography sx={{ mb: 1.5, color: '#003366', fontSize: '0.9rem' }}>
                                                Monto Total: ${Number(resumeData?.totalAmount || 0).toFixed(2)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Tabla Principal */}
                        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto', borderRadius: '10px', border: '1px solid #002776' }}>
                                <Table stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                                    <TableHead>
                                        <TableRow sx={{ height: '24px' }}>
                                            {columns.map((column , index) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align}
                                                    style={{ minWidth: column.minWidth }}
                                                    sx={{
                                                        ...tableHeadCellStyles,
                                                        ...(index === 0 && { borderTopLeftRadius: '10px' })
                                                    }}
                                                >
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                            <TableCell align="center" sx={{ ...tableHeadCellStyles, borderTopRightRadius: '10px' }}>
                                                Acciones
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableLoading ? ( // <--- Usar tableLoading para la tabla
                                            <TableRow>
                                                <TableCell colSpan={columns.length + 2} align="center">
                                                    Cargando datos de expensas...
                                                </TableCell>
                                            </TableRow>
                                        ) : departmentFeeQueryData.content.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={columns.length + 2} align="center">
                                                    No hay datos disponibles para el período seleccionado.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            departmentFeeQueryData.content
                                                .map((deptFee) => {
                                                    let paymentDateDisplay = 'N/A';
                                                    if (deptFee.paymentStatus === 'PAID' && deptFee.payments && deptFee.payments.length > 0) {
                                                        const latestPayment = deptFee.payments.reduce((latest, current) => {
                                                            // Asegúrate que los campos de fecha existan antes de crear el objeto Date
                                                            const latestDateValue = latest.date || latest.paymentDate;
                                                            const currentDateValue = current.date || current.paymentDate;
                                                            if (!latestDateValue || !currentDateValue) return latest; // o current, según prefieras

                                                            const latestDate = new Date(latestDateValue);
                                                            const currentDate = new Date(currentDateValue);
                                                            return currentDate > latestDate ? current : latest;
                                                        }, deptFee.payments[0]);
                                                        const dateToFormat = latestPayment.date || latestPayment.paymentDate;
                                                        if (dateToFormat) {
                                                            paymentDateDisplay = new Date(dateToFormat).toLocaleDateString();
                                                        }
                                                    }

                                                    return (
                                                        <TableRow hover key={deptFee.departmentCode} sx={{
                                                            backgroundColor: '#FFFFFF',
                                                            '&:hover': { backgroundColor: '#F6EFE5' },
                                                        }}>
                                                            {columns.map((column) => {
                                                                let value;
                                                                switch (column.id) {
                                                                    case 'departmentCode': value = deptFee.departmentCode; break;
                                                                    case 'issueDate': value = deptFee.issueDate; break;
                                                                    case 'dueDate': value = deptFee.dueDate; break;
                                                                    case 'totalAmount': value = deptFee.totalAmount; break;
                                                                    case 'dueAmount': value = deptFee.dueAmount; break;
                                                                    case 'paidAmount': value = deptFee.paidAmount; break;
                                                                    case 'paymentStatus': value = deptFee.paymentStatus; break;
                                                                    case 'paymentDate': value = deptFee.lastPaidDate; break;
                                                                    default: value = 'N/A';
                                                                }

                                                                let cellContent = value !== undefined && value !== null ? value : 'N/A';

                                                                if (['totalAmount', 'dueAmount', 'paidAmount'].includes(column.id)) {
                                                                    cellContent = typeof value === 'number' ? `$${Number(value).toFixed(2)}` : (String(value) || 'N/A');
                                                                } else if (column.id === 'paymentStatus') {
                                                                    cellContent = (
                                                                        <Chip
                                                                            label={statusMapping[value] || String(value)} // Usar statusMapping del contexto
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: value === 'PAID' ? '#B0F2C2'
                                                                                    : value === 'PENDING' ? '#FFDDAA'
                                                                                        : value === 'PARTIALLY_PAID' ? '#ADD8E6'
                                                                                            : value === 'OVERDUE' ? '#FFBABA'
                                                                                                : '#BCE7FD',
                                                                                color: '#002776', fontWeight: 'bold',
                                                                            }}
                                                                        />
                                                                    );
                                                                } else if (['issueDate', 'dueDate', 'paymentDate'].includes(column.id) && value && value !== 'N/A') {
                                                                    const dateValue = String(value).includes('T') ? value : `${value}T00:00:00`;
                                                                    cellContent = format(new Date(dateValue), 'dd/MM/yyyy');
                                                                }
                                                                return (
                                                                    <TableCell key={column.id} align={column.align} sx={{ ...tableCellStyles }}>
                                                                        {cellContent}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                            <TableCell align="center" sx={tableCellStyles}>
                                                                {/*<IconButton*/}
                                                                {/*    disabled={!deptFee.payments || deptFee.payments.length === 0}*/}
                                                                {/*    aria-label="download-receipt"*/}
                                                                {/*    onClick={() => handleDownload(deptFee)}*/}
                                                                {/*    sx={{ padding: '4px' }}*/}
                                                                {/*>*/}
                                                                {/*    <CloudDownloadIcon fontSize="small" sx={{color: (!deptFee.payments || deptFee.payments.length === 0) ? '#B0B0B0' : '#002776' }} />*/}
                                                                {/*</IconButton>*/}
                                                                <IconButton
                                                                    disabled={deptFee.paymentStatus === "PAID" || periodStatus === "CLOSED"}
                                                                    aria-label="add-payment"
                                                                    onClick={() => handleEditClick(deptFee)}
                                                                    title="Regsitrar Pago"
                                                                    sx={{ padding: '4px' }}
                                                                >
                                                                    <LocalAtmIcon fontSize="small" sx={{ color: deptFee.paymentStatus === "PAID" || periodStatus === "CLOSED" ? '#B0B0B0' : '#002776' }} />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[10, 20, 50]}
                                component="div"
                                count={departmentFeeQueryData.totalElements} // <--- Usar totalElements del contexto
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Filas por página"
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Dialogo para Registrar Pago */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Registrar Pago para Departamento: {editingFeePayment?.departmentCode}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        Expensa del período: {period ? (typeof period === 'string' ? period : new Date(period).toLocaleDateString()) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Monto Total de Expensa: ${Number(editingFeePayment?.totalAmount || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Monto Adeudado Actual: ${Number(editingFeePayment?.dueAmount || 0).toFixed(2)}
                    </Typography>
                    <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <TextField
                            label="Monto a Pagar"
                            variant="outlined"
                            type="number"
                            value={totalAmount}
                            onChange={handleInputChange}
                            sx={{ marginBottom: '20px', width: '100%' }}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                            }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{ mb: 1, borderColor: '#002776', color: '#002776', '&:hover': { borderColor: '#001B5E', backgroundColor: 'rgba(0, 39, 118, 0.04)'} }}
                        >
                            <CloudUploadIcon sx={{ marginRight: 1 }} />
                            Subir Recibo
                            <input type="file" hidden onChange={handleFileChange} accept="application/pdf,image/*" />
                        </Button>
                        {fileName && (
                            <Typography variant="body2" sx={{ color: 'green', mt: 1, display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon sx={{ marginRight: 1 }} /> {fileName}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button onClick={() => setEditOpen(false)} variant="outlined" >Cancelar</Button>
                    <Button onClick={handleSaveChanges} variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Pago'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
export default AdminMaintenanceFeesPayments;
