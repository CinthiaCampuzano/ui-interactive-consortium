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
import axios from "axios";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import {useNavigate} from "react-router-dom";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {jwtDecode} from "jwt-decode";
import { useSnackbar } from 'notistack';
import {AccessTime, Assessment, Assignment, AttachMoney, Person} from "@mui/icons-material";
import {ResidentManageContext} from "../ResidentManageContext.jsx";


const columns = [
    { id: 'period', label: 'Periodo', minWidth: 100 },
    { id: 'code', label: 'Departamento', minWidth: 100 },
    { id: 'maintenanceFee', label: 'Expensas', minWidth: 100 },
    { id: 'status', label: 'Estado de Pago', minWidth: 100 },
    { id: 'paymentDate', label: 'Fecha de Pago', minWidth: 100 }
]

function ResidentMaintenanceFeePayments(){
    const {consortiumIdState, getAConsortiumByIdConsortium, consortiumName, getAllMaintenanceFeesPaymentByIdConsortiumAndPerson,
        allMaintenanceFeesPaymentPerson , setAllMaintenanceFeesPaymentPerson } = useContext(ResidentManageContext)
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
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
        getAllMaintenanceFeesPaymentByIdConsortiumAndPerson();
    }, [consortiumIdState]);



    const handleDownload = async (id) => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detenemos la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isResident = decodedToken?.role?.includes('ROLE_RESIDENT');
        if (!isResident) {
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
                {/*<AdminGallerySidebar/>*/}
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
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allMaintenanceFeesPaymentPerson
                                            .sort((a, b) => new Date(b.period) - new Date(a.period)) // Ordenar por período descendente
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((maintenanceFeePayment) => {
                                                return (
                                                    <TableRow
                                                        hover
                                                        key={maintenanceFeePayment.maintenanceFeePaymentId}
                                                        sx={{
                                                            backgroundColor: '#FFFFFF',
                                                            '&:hover': { backgroundColor: '#F6EFE5' },
                                                        }}
                                                    >
                                                        {columns.map((column) => {
                                                            const value = maintenanceFeePayment[column.id];
                                                            return (
                                                                <TableCell
                                                                    key={column.id}
                                                                    align="center"
                                                                    sx={{ ...tableCellStyles, textAlign: 'center' }}
                                                                >
                                                                    {column.id === 'maintenanceFee' ? (
                                                                        <Box display="flex" justifyContent="center" alignItems="center">
                                                                            {/* Valor de Expensas */}
                                                                            <Typography sx={{ marginRight: '8px' }}>
                                                                                {value}
                                                                            </Typography>
                                                                            {/* Botón con validación del estado y fecha de pago */}
                                                                            <IconButton
                                                                                aria-label="download-file"
                                                                                onClick={() =>
                                                                                    downloadMaintenanceFee(
                                                                                        maintenanceFeePayment.maintenanceFeeId
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    maintenanceFeePayment.status === 'PENDING' }
                                                                                sx={{ padding: '4px' }}
                                                                            >
                                                                                <CloudDownloadIcon
                                                                                    fontSize="small"
                                                                                    sx={{ color: '#002776' }}
                                                                                />
                                                                            </IconButton>
                                                                        </Box>
                                                                    ) : column.id === 'status' ? (
                                                                        <Chip
                                                                            label={value}
                                                                            sx={{
                                                                                backgroundColor:
                                                                                    value === 'Pagado' ? '#B0F2C2' : '#BCE7FD',
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
                                                        <TableCell align="center" sx={{ ...tableCellStyles, textAlign: 'center' }}>
                                                            <IconButton
                                                                aria-label="download-file"
                                                                onClick={() =>
                                                                    handleDownload(maintenanceFeePayment.maintenanceFeePaymentId)
                                                                }
                                                                disabled={
                                                                    maintenanceFeePayment.status === 'PENDING' ||
                                                                    !maintenanceFeePayment.paymentDate
                                                                }
                                                                sx={{
                                                                    padding: '4px',
                                                                    '&.Mui-disabled': {
                                                                        color: '#B0B0B0', // Color gris para el botón deshabilitado
                                                                    },
                                                                }}
                                                            >
                                                                <CloudDownloadIcon
                                                                    fontSize="small"
                                                                    sx={{
                                                                        color:
                                                                            maintenanceFeePayment.status === 'PENDING' ||
                                                                            !maintenanceFeePayment.paymentDate
                                                                                ? '#B0B0B0' // Gris para el ícono si está deshabilitado
                                                                                : '#002776', // Azul si está habilitado
                                                                    }}
                                                                />
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
                                count={allMaintenanceFeesPaymentPerson.length}
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
        </div>
    )
}
export default ResidentMaintenanceFeePayments