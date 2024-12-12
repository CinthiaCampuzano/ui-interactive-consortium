import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Alert, Card, CardContent, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, Snackbar,
    TablePagination,
    TextField
} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import axios from "axios";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import {AdminManageContext} from "../AdminManageContext.jsx";
import {useNavigate} from "react-router-dom";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from "@mui/icons-material/Edit";
import {jwtDecode} from "jwt-decode";
import { useSnackbar } from 'notistack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import {AccessTime, Assessment, Assignment, AttachMoney, Person} from "@mui/icons-material";


const columns = [
    { id: 'period', label: 'Periodo', minWidth: 100 },
    { id: 'code', label: 'Departamento', minWidth: 100 },
    { id: 'status', label: 'Estado de Pago', minWidth: 100 },
    { id: 'paymentDate', label: 'Fecha de Pago', minWidth: 100 }
]

function AdminMaintenanceFeesManagement(){
    const {consortiumIdState, getAConsortiumByIdConsortium, consortiumName, getAllMaintenanceFeesPaymentByIdConsortium, period ,
        setPeriod, allMaintenanceFeesPayment , setAllMaintenanceFeesPayment, } = useContext(AdminManageContext)
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const [file, setFile] = useState(null);
    const [maintenanceFee, setMaintenanceFee] = useState(null); // Para almacenar el DTO de la expensa
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const statusMapping = {
        PENDING: "Pendiente",
        PAID: "Pagado"
    };
    const [fileName, setFileName] = useState(''); // Estado para el archivo
    const { enqueueSnackbar } = useSnackbar();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    useEffect(() => {
        getAConsortiumByIdConsortium();
    }, [consortiumIdState]);


    useEffect(() => {
        getAllMaintenanceFeesPaymentByIdConsortium();
    }, [consortiumIdState]);

    const handleEditClick = (maintenanceFee) => {
        setMaintenanceFee(maintenanceFee); // Carga el objeto seleccionado
        // setSelectedStatus(maintenanceFee.status); // Estado actual
        setEditOpen(true); // Abre el diálogo
    };

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFileName(selectedFile.name);  // Guardar el nombre del archivo
            setFile(selectedFile); // Guardar el archivo completo
        }
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Construir el JSON que se enviará en maintenanceFeePaymentDto
            const maintenanceFeePaymentDto = {
                maintenanceFeePaymentId: maintenanceFee.maintenanceFeePaymentId, // ID del pago seleccionado
                maintenanceFee: {
                    maintenanceFeeId: maintenanceFee.maintenanceFeeId, // ID de la expensa seleccionada
                    consortium: {
                        consortiumId: consortiumIdState, // ID del consorcio seleccionado
                    },
                },
                // status: selectedStatus, // Estado seleccionado (e.g., "PENDING")
            };

            // Agregar el JSON como string en maintenanceFeePaymentDto
            const jsonBlob = new Blob([JSON.stringify(maintenanceFeePaymentDto)], { type: 'application/json' });

            // Agregar el Blob al FormData
            formData.append('maintenanceFeePaymentDto', jsonBlob, 'maintenanceFeePaymentDto.json');


            // Agregar el archivo si se seleccionó
            if (file) {
                formData.append('file', file);
                console.log('Archivo añadido:', file);
            }

            // Mostrar el contenido de FormData en consola para ver qué se está enviando
            console.log('FormData contenido:');
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }

            // Llama a tu función para enviar la solicitud (con Axios)
            await updateMaintenanceFee(formData);

            // Actualiza la lista de expensas
            await getAllMaintenanceFeesPaymentByIdConsortium();

            // Mostrar mensaje de éxito
            setSnackbarMessage('Actualización exitosa');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setOpenEditDialog(false);
        } catch (error) {
            console.error('Error al actualizar:', error);
            setSnackbarMessage('Error al actualizar. Por favor, inténtalo nuevamente.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
            setEditOpen(false);
        }
    };

    const updateMaintenanceFee = async (formData) => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detenemos la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            alert("No tienes permisos para realizar esta acción.");
            return; // Detenemos la ejecución si no tiene el rol ROLE_ADMIN
        }

        try {
            // Realiza la solicitud a la API
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/maintenanceFeePayment`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,

                },
            });
            return response.data;
        } catch (error) {
            // Manejo de errores
            console.error('Error en la solicitud:', error);
            alert(error.message || "Ha ocurrido un error. Por favor, inténtalo nuevamente.");
            throw error; // Re-lanzar el error para manejarlo en niveles superiores
        }
    };
    const handleDownload = async (id) => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detenemos la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            alert("No tienes permisos para realizar esta acción.");
            return; // Detenemos la ejecución si no tiene el rol ROLE_ADMIN
        }

        try {
            // Hacer la solicitud fetch al backend para descargar el archivo
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/maintenanceFeePayment/${id}/download`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('No se pudo descargar el archivo');
            }

            // Convertir la respuesta en un Blob (archivo binario)
            const blob = await response.blob();

            // Obtener el encabezado 'Content-Disposition' y extraer el nombre del archivo
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = 'default.pdf';  // Valor por defecto en caso de que no haya nombre en el encabezado

            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches[1]) {
                    fileName = matches[1];  // Extrae el nombre del archivo
                }
            }

            // Crear una URL de objeto para el archivo
            const url = window.URL.createObjectURL(blob);

            // Crear un enlace para descargar el archivo
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Asigna el nombre del archivo
            document.body.appendChild(link);
            link.click();

            // Limpiar el DOM y la URL del objeto después de la descarga
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            // Manejo de errores
            enqueueSnackbar('Error al descargar el archivo', { variant: 'error' });
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
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh', // Asegura que el contenedor ocupe toda la altura de la pantalla
                }}
            >
                <AdminGallerySidebar/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1, // Permite que este componente ocupe el espacio restante
                        padding: { xs: '16px', sm: '24px' }, // Espaciado variable según el tamaño de la pantalla
                        marginLeft: { xs: 0, sm: '240px' }, // Evita que el contenido se superponga al SuperAdminSidebar
                        transition: 'margin-left 0.3s ease', // Suaviza la transición al cambiar de tamaño

                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        {/* Título */}
                        <Typography
                            variant="h6"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                color: '#003366',
                                fontSize: { xs: '1.5rem', md: '2rem' },
                                marginBottom: '20px',
                            }}
                >
                    Pago de Expensas de {consortiumName}
                </Typography>

                    <Box sx={{ width: '100%', maxWidth: '1100px',  marginLeft: { xs: '40px', sm: '80px' } }}>
                        {/* Tabla de resumen */}
                        <Box sx={{ flexGrow: 1, p: 3 }}>
                            <Grid container spacing={3}>
                                {/* Active Users Card */}
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                                4
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Person color="primary" />
                                                <Typography color="text.secondary" variant="body2">
                                                    Departamentos
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Minutes Card */}
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                                3
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <AccessTime color="primary" />
                                                <Typography color="text.secondary" variant="body2">
                                                    Pendientes
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Pending Card */}
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                                1
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Assignment color="primary" />
                                                <Typography color="text.secondary" variant="body2">
                                                    Pagados
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Reports Card */}
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                                $150.000
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <AttachMoney color="primary" />
                                                <Typography color="text.secondary" variant="body2">
                                                    Monto
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Total Card */}
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                                $1.652.236
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <AttachMoney color="primary" />
                                                <Typography color="text.secondary" variant="body2">
                                                    Total
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%', maxWidth: '900px',  marginLeft: { xs: '40px', sm: '80px' } }}>
                        <TableContainer  sx={{
                            maxHeight: 600,
                            overflowX: 'auto',
                            borderRadius: '10px', // Redondea solo las esquinas del contenedor
                            border: '1px solid #002776',
                        }}
                        >
                            <Table
                                stickyHeader
                                sx={{
                                    borderCollapse: 'separate',
                                    borderSpacing: '0', // Evita que las celdas se superpongan
                                }}
                            >
                                <TableHead>
                                    <TableRow sx={{ height: '24px' }}>
                                        {columns.map((column , index) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                sx={{
                                                    ...tableHeadCellStyles,
                                                    ...(index === 0 && {
                                                        borderTopLeftRadius: '10px', // Redondeo solo en la esquina superior izquierda
                                                    })
                                                }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                        <TableCell align="center" sx={{
                                            ...tableHeadCellStyles,
                                            borderTopRightRadius: '0px',
                                        }}>
                                            Comprobante de pago
                                        </TableCell>
                                        <TableCell align="center" sx={{
                                            ...tableHeadCellStyles,
                                            borderTopRightRadius: '10px',
                                        }}>

                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allMaintenanceFeesPayment
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((maintenanceFeePayment) => {
                                            return (
                                                <TableRow hover key={maintenanceFeePayment.maintenanceFeePaymentId} sx={{
                                                    backgroundColor: '#FFFFFF',
                                                    '&:hover': { backgroundColor: '#F6EFE5' },
                                                }}>
                                                    {columns.map((column) => {
                                                        const value = maintenanceFeePayment[column.id];
                                                        return (
                                                            <TableCell
                                                                key={column.id}
                                                                align={column.align}
                                                                sx={{ ...tableCellStyles }}
                                                            >
                                                                {column.id === 'status' ? (
                                                                    <Chip
                                                                        label={value}
                                                                        sx={{
                                                                            backgroundColor: value === 'Pagado' ? '#B0F2C2' : '#BCE7FD',
                                                                            color: '#002776',
                                                                            fontWeight: 'bold',
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    value
                                                                )}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell align="center"  sx={tableCellStyles}>
                                                        <IconButton
                                                            aria-label="download-file"
                                                            onClick={() => handleDownload(maintenanceFeePayment.maintenanceFeePaymentId)}
                                                            sx={{ padding: '4px' }}
                                                        >
                                                            <CloudDownloadIcon fontSize="small" sx={{ color: '#002776' }} />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell align="center" style={{ padding: '8px', minWidth: 100 }}>

                                                        <IconButton
                                                            aria-label="edit"
                                                            onClick={() => handleEditClick(maintenanceFeePayment)}
                                                            sx={{ padding: '4px', marginRight: '4px' }}
                                                        >
                                                            <EditIcon fontSize="small" sx={{ color: '#002776' }} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 20, 50]}
                            component="div"
                            count={allMaintenanceFeesPayment.length}
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
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Pago de Expensa</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{
                                backgroundColor: '#002776',
                                color: '#fff',
                                '&:hover': { backgroundColor: '#001B5E' },
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px 20px',
                                marginBottom: '20px',
                            }}
                        >
                            <CloudUploadIcon sx={{ marginRight: 1 }} />
                            Subir Archivo
                            <input
                                type="file"
                                hidden
                                onChange={handleFileChange}
                                accept="application/pdf" // Ajusta los tipos de archivo permitidos
                            />
                        </Button>

                        {/* Si el archivo fue seleccionado, mostrar el nombre y un ícono de éxito */}
                        {fileName && (
                            <Typography variant="body2" sx={{ color: 'green', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon sx={{ marginRight: 1 }} /> Archivo seleccionado: {fileName}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}variant="contained" sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveChanges}
                        variant="contained" sx={{ backgroundColor: '#228B22', '&:hover': { backgroundColor: '#228B22' } }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}
export default AdminMaintenanceFeesManagement