import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Grid, Snackbar,
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
import DeleteIcon from "@mui/icons-material/Delete.js";
import {useNavigate} from "react-router-dom";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {CircularProgress} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from "@mui/icons-material/Settings";


const columns = [
    { id: 'period', label: 'Periodo', minWidth: 100 },
    { id: 'fileName', label: 'Nombre del archivo', minWidth: 100 },
    { id: 'uploadDate', label: 'Fecha de Publicación', minWidth: 100 }
]

function AdminMaintenanceFeesManagement(){
    const {consortiumIdState, getAConsortiumByIdConsortium, consortiumName, allMaintenanceFees ,
        setAllMaintenanceFees, getAllMaintenanceFeesByIdConsortium, setPeriod } = useContext(AdminManageContext)
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const [idMaintenanceFeeToDelete, setIdMaintenanceFeeToDelete] = useState(null)
    const [open, setOpen] = useState(false)
    const [openAlert, setOpenAlert] = useState(false)
    const [file, setFile] = useState(null);
    const [maintenanceFee, setMaintenanceFee] = useState(null); // Para almacenar el DTO de la expensa
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();

    const handleManageClick = (period) => {
        setPeriod(period)
        // Redirige a la pantalla deseada con el período como parámetro
        navigate(`/admin/management/expensas/pago`);
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickOpen = (idMaintenanceFeeToDelete) => {
        setIdMaintenanceFeeToDelete(idMaintenanceFeeToDelete)
        setOpen(true)
    };
    const handleClose = () => {
        setOpen(false)
        setIdMaintenanceFeeToDelete(null)
    };

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleCloseAlert = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        getAConsortiumByIdConsortium();
    }, [consortiumIdState]);

    useEffect(() => {
        getAllMaintenanceFeesByIdConsortium();
    }, [consortiumIdState]);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const uploadMaintenanceFee = async () => {
        if (!file) {
            setSnackbarMessage('Por favor, selecciona un archivo.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("consortiumId", consortiumIdState); // Usamos el `consortiumIdState` que ya tienes
        console.log([...formData.entries()]);
        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/maintenanceFee/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setLoading(false);
            setSnackbarMessage('Expensa cargada correctamente.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            getAllMaintenanceFeesByIdConsortium();

        } catch (error) {
            setLoading(false);
            setSnackbarMessage('Error al cargar la expensa.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };


    const deleteMaintenanceFee = async (idMaintenanceFeeToDelete) =>{
        console.log(idMaintenanceFeeToDelete)
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/maintenanceFee?maintenanceFeeId=${idMaintenanceFeeToDelete}`)
        setAllMaintenanceFees(allMaintenanceFees.filter(maintenanceFee => maintenanceFee.maintenanceFeeId !== idMaintenanceFeeToDelete))
    }

    const downloadMaintenanceFee = async (maintenanceFeeId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/maintenanceFee/${maintenanceFeeId}/download`,
                {
                    responseType: 'blob', // Indica que esperas un archivo binario
                }
            );

            // Extrae el encabezado Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            console.log('Content-Disposition:', contentDisposition);

            // Extrae el nombre del archivo con una expresión regular
            const fileNameMatch = contentDisposition?.match(/filename="?(.+)"?/);
            const fileName = fileNameMatch ? fileNameMatch[1] : 'archivo.pdf';

            console.log('Nombre del archivo extraído:', fileName);

            // Crear un objeto Blob y un enlace temporal para descargar el archivo
            const fileURL = window.URL.createObjectURL(
                new Blob([response.data], { type: 'application/pdf' })
            );

            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', fileName); // Asigna el nombre extraído
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            alert('Hubo un error al descargar el archivo.');
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
                    Expensas de {consortiumName}
                </Typography>
            </Box>
            <Paper
                elevation={2}
                sx={{
                    padding: 2,
                    margin: 'auto',
                    marginTop: '20px',
                    width: { xs: '90%', sm: '80%', md: '40%', lg: '30%' },
                }}
            >
                <Box mt={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        Seleccionar archivo
                        <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                            accept="application/pdf" // Ajusta los tipos de archivo permitidos
                        />
                    </Button>
                    {file && (
                        <Typography variant="body2" sx={{ color: 'green', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon sx={{ marginRight: 1 }} /> Archivo seleccionado: {file.name}
                        </Typography>
                    )}
                    {/* Botón para cargar la expensa */}
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#002776',
                            '&:hover': { backgroundColor: '#001B5E' },
                            marginBottom: '20px',
                        }}
                        onClick={uploadMaintenanceFee}
                        disabled={loading || !file}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Cargar Expensas'}
                    </Button>

                    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
                        <Alert onClose={handleCloseAlert} severity={snackbarSeverity} sx={{ width: '100%' }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Box>
            </Paper>
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
                                        <TableCell align="center" style={{ minWidth: 100, backgroundColor: '#F5F5DC', fontWeight: 'bold', padding: '8px' }}>
                                            Descargar
                                        </TableCell>
                                        <TableCell align="center" style={{ minWidth: 100, backgroundColor: '#F5F5DC', fontWeight: 'bold', padding: '8px' }}>

                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allMaintenanceFees
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((maintenanceFee) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={maintenanceFee.maintenanceFeeId} sx={{ height: 'auto' }}>
                                                    {columns.map((column) => {
                                                        const value = maintenanceFee[column.id];
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
                                                            onClick={() => downloadMaintenanceFee(maintenanceFee.maintenanceFeeId)}
                                                            sx={{ padding: '4px' }}
                                                        >
                                                            <CloudDownloadIcon fontSize="small" sx={{ color: '#002776' }} />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell align="center" style={{ padding: '8px', minWidth: 100 }}>
                                                        {/* Botón para Gestionar */}
                                                        <IconButton
                                                            aria-label="manage"
                                                            onClick={() => handleManageClick(maintenanceFee.period)}
                                                            sx={{ padding: '4px', marginRight: '4px' }} // Espaciado entre los botones
                                                        >
                                                            <SettingsIcon fontSize="small" />
                                                        </IconButton>
                                                        {/* Botón para Eliminar */}
                                                        <IconButton
                                                            aria-label="delete"
                                                            onClick={() => handleClickOpen(maintenanceFee.maintenanceFeeId)}
                                                            sx={{ padding: '4px' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
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
                            count={allMaintenanceFees.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página"
                        />
                    </Paper>
                </Box>
            </Paper>
            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose();
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#E5E5E5',  color: '#002776', textAlign: 'center' }}>
                    {"Desea eliminar esta publicación?"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#E5E5E5' }}>
                    <DialogContentText id="alert-dialog-description">
                        Si acepta se eliminara la publicación deseada.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#E5E5E5' }}>
                    <Button onClick={handleClose} variant="contained" sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}>Rechazar</Button>
                    <Button variant="contained" sx={{ backgroundColor: '#228B22', '&:hover': { backgroundColor: '#3D9970' } }} onClick={() => {
                        deleteMaintenanceFee(idMaintenanceFeeToDelete)
                        handleClose()
                    }
                    }>
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}
export default AdminMaintenanceFeesManagement