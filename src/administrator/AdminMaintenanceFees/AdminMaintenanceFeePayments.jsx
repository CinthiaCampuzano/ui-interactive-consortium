import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Alert,
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
    return(
        <div>
            <Box
                sx={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    paddingX: { xs: '10px', sm: '20px', md: '40px' }
                }}
            >
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        color: '#003366',
                        fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }
                    }}
                >
                    Pago de Expensas de {consortiumName}
                </Typography>
            </Box>

            <Paper
                elevation={2}
                sx={{
                    padding: 2,
                    margin: 'auto',
                    marginTop: '20px',
                    width: { xs: '95%', sm: '85%', md: '70%', lg: '60%' },
                }}
            >
                <Box display="flex" justifyContent="center" mt={3}>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow sx={{ height: '24px' }}>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth || 150, backgroundColor: '#F5F5DC', color:'#002776',  fontWeight: 'bold', padding: '8px'  }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                        <TableCell align="center" style={{ minWidth: 100, backgroundColor: '#F5F5DC',color:'#002776', fontWeight: 'bold', padding: '8px' }}>
                                            Comprobante de pago
                                        </TableCell>
                                        <TableCell align="center" style={{ minWidth: 100, backgroundColor: '#F5F5DC', fontWeight: 'bold', padding: '8px' }}>

                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allMaintenanceFeesPayment
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((maintenanceFeePayment) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={maintenanceFeePayment.maintenanceFeePaymentId} sx={{ height: 'auto' }}>
                                                    {columns.map((column) => {
                                                        const value = maintenanceFeePayment[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align} style={{
                                                                padding: '8px', // Un padding mayor para dar más espacio
                                                                minWidth: column.minWidth || 150, // Ancho mínimo para el contenido
                                                                maxWidth: 300, // Ancho máximo para limitar el tamaño
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis', // Agrega puntos suspensivos para contenido largo
                                                                whiteSpace: 'nowrap', // Evita que el texto se divida en varias líneas
                                                            }}>
                                                                {value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell align="center" style={{ padding: '8px', minWidth: 100 }}>
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
                                                            sx={{ padding: '4px' }}
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
                    </Paper>
                </Box>
            </Paper>
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Pago de Expensa</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Selector de estado */}
                        {/*<FormControl fullWidth sx={{ mb: 2 }}>*/}
                        {/*    <InputLabel>Estado</InputLabel>*/}
                        {/*    <Select value={selectedStatus} onChange={handleStatusChange}>*/}
                        {/*        {Object.entries(statusMapping).map(([key, value]) => (*/}
                        {/*            <MenuItem key={key} value={key}>*/}
                        {/*                {value}*/}
                        {/*            </MenuItem>*/}
                        {/*        ))}*/}
                        {/*    </Select>*/}
                        {/*</FormControl>*/}

                        {/* Botón para seleccionar archivo */}
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