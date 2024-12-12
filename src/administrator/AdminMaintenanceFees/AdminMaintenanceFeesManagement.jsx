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
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";


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

    const textFieldStyles = {
        '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
                borderColor: '#002776',
            },
        },
        '& label.Mui-focused': { color: '#002776' },
        minWidth: { xs: '100%', sm: 'auto' },
    };

    const buttonStyles = {
        backgroundColor: '#002776',
        '&:hover': { backgroundColor: '#001B5E' },
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
                            borderRadius: '10px',
                            border: '1px solid #002776',
                        }}
                    >
                        <Box mt={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{
                                    backgroundColor: '#B2675E',
                                    color: '#FFFFFF',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    borderRadius: '30px',
                                    padding: '10px 20px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { backgroundColor: '#A15D50' },
                                    '&:active': { backgroundColor: '#8A4A3D' },
                                }}
                            >
                                <CloudUploadIcon sx={{ marginRight: 1 }} />
                                Seleccionar archivo
                                <input type="file" hidden onChange={handleFileChange} accept="application/pdf" />
                            </Button>
                            {file && (
                                <Typography variant="body2" sx={{ color: 'green', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                    <CheckCircleIcon sx={{ marginRight: 1 }} /> Archivo seleccionado: {file.name}
                                </Typography>
                            )}
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

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '40px', // Aumenta la separación entre el Paper y la tabla
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: '900px',
                            }}
                        >
                            <TableContainer
                                sx={{
                                    maxHeight: 600,
                                    overflowX: 'auto',
                                    borderRadius: '10px',
                                    border: '1px solid #002776',
                                }}
                            >
                                <Table
                                    stickyHeader
                                    sx={{
                                        borderCollapse: 'separate',
                                        borderSpacing: '0',
                                    }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column, index) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align}
                                                    sx={{
                                                        ...tableHeadCellStyles,
                                                        ...(index === 0 && { borderTopLeftRadius: '10px' }),
                                                    }}
                                                >
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    ...tableHeadCellStyles,
                                                    borderTopRightRadius: '0px',
                                                }}
                                            >
                                                Descargar
                                            </TableCell>
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    ...tableHeadCellStyles,
                                                    borderTopRightRadius: '10px',
                                                }}
                                            ></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allMaintenanceFees
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((maintenanceFee) => (
                                                <TableRow
                                                    hover
                                                    key={maintenanceFee.maintenanceFeeId}
                                                    sx={{
                                                        backgroundColor: '#FFFFFF',
                                                        '&:hover': { backgroundColor: '#F6EFE5' },
                                                    }}
                                                >
                                                    {columns.map((column) => {
                                                        const value = maintenanceFee[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align} sx={{ ...tableCellStyles }}>
                                                                {value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell align="center" sx={tableCellStyles}>
                                                        <IconButton
                                                            aria-label="download-file"
                                                            onClick={() => downloadMaintenanceFee(maintenanceFee.maintenanceFeeId)}
                                                            sx={{ padding: '4px' }}
                                                        >
                                                            <CloudDownloadIcon fontSize="small" sx={{ color: '#002776' }} />
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ padding: '8px', minWidth: 100 }}>
                                                        <IconButton
                                                            aria-label="manage"
                                                            onClick={() => handleManageClick(maintenanceFee.period)}
                                                            sx={{ padding: '4px', marginRight: '4px' }}
                                                        >
                                                            <SettingsIcon fontSize="small" sx={{ color: '#002776' }} />
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="delete"
                                                            onClick={() => handleClickOpen(maintenanceFee.maintenanceFeeId)}
                                                            sx={{ color: '#B2675E' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
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
                        </Box>
                    </Box>
            </Box>
            </Box>
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