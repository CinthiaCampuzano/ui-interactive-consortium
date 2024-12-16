import React, {useContext, useEffect, useState} from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Select,
    MenuItem,
    Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardContent, TablePagination, TextField,
} from '@mui/material';

import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import {AdminManageContext} from "../AdminManageContext.jsx";

import {AccessTime, Assessment, Assignment, AttachMoney, CheckCircle, Pending, Person} from "@mui/icons-material";
import {useSnackbar} from "notistack";
import Button from "@mui/material/Button";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance.js";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import BarChartIcon from '@mui/icons-material/BarChart';

const columns = [
    { id: 'subject', label: 'Título', minWidth: 100 },
    { id: 'issue', label: 'Descripción', minWidth: 100 },
    { id: 'user', label: 'Nombre', minWidth: 100 },
    { id: 'status', label: 'Estado del Reclamo', minWidth: 100 },
    { id: 'createdDate', label: 'Fecha del Reclamo', minWidth: 100 }
]
const AdminClaimManagement = () => {
    const {
        consortiumName,
        getAllClaimByConsortium,
        allClaims,
        setAllClaims,
        getAConsortiumByIdConsortium,
        consortiumIdState,
        statusMapping
    } = useContext(AdminManageContext)
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const {enqueueSnackbar} = useSnackbar();
    const [open, setOpen] = useState(false);
    const [cards, setCards] = useState();
    const [currentClaim, setCurrentClaim] = useState(null);
    const [formData, setFormData] = useState({status: '', comment: ''});
    const [processingHandleMoveToUnderReview, setProcessingHandleMoveToUnderReview] = useState(false);
    const [claimInfo, setClaimInfo] = useState({
        issueReportId: null,
        consortium: {
            consortiumId: null
        },
        response: ''
    })
    const [status, setStatus] = useState("");
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
        getAllClaimByConsortium();
    }, [consortiumIdState]);

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
    const statusColors = {
        'Pendiente': '#BCE7FD',
        'En Revisión': '#d79569',
        'Resuelto': '#B0F2C2',
    };

    useEffect(() => {
        getIssueCards(consortiumIdState)
    }, [consortiumIdState, allClaims]);

    const getIssueCards = async (idConsortium) => {
        if (!consortiumIdState) {
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener la ejecución si no hay token
        }

        try {
            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener la ejecución si no es ROLE_ADMIN
            }

            // Realizar la solicitud GET para obtener los departamentos
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/issueReport/consortium/${consortiumIdState}/cards`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            // Acceder a los datos de los departamentos y actualizar el estado
            const cards = res.data;
            setCards({
                issueReportId: cards.issueReportId,
                pending: cards.pending,
                underReview: cards.underReview,
                resolved: cards.resolved,
                total: cards.total
            });

        } catch (error) {
            console.error("Error al obtener las tarjetas:", error);
            alert("Hubo un problema al obtener los tarjetas. Por favor, intenta nuevamente.");
        }
    };

    const handleMoveToUnderReview = async (claim) => {
        setProcessingHandleMoveToUnderReview(true)

        if (!consortiumIdState) {
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener la ejecución si no hay token
        }

        try {
            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener la ejecución si no es ROLE_ADMIN
            }

            // Realizar la solicitud GET para obtener los departamentos
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/issueReport/${claim.issueReportId}/review`, null, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            getAllClaimByConsortium()
        } catch (error) {
            console.error("Error al obtener las tarjetas:", error);
            alert("Hubo un problema al obtener los tarjetas. Por favor, intenta nuevamente.");
        } finally {
            setProcessingHandleMoveToUnderReview(false)
        }
    };


    const handleOpenDialog = (claim) => {
        setCurrentClaim(claim);
        setClaimInfo({
            issueReportId: claim.issueReportId,
            consortium: {
                consortiumId: consortiumIdState
            },
            response: ''})
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setCurrentClaim(null);
        setClaimInfo({issueReportId: null,
            consortium: {
                consortiumId: null
            },
            response: ''});
    };

    const handleChangeStatus = (event) => {
        setStatus(event.target.value); // Actualizar solo el status
    };

    const handleChangeResponse = (event) => {
        setClaimInfo((prev) => ({
            ...prev,
            response: event.target.value, // Actualizar solo el comentario
        }));
    };

    const handleSave = async () => {
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
            // Lógica para estado "Resuelto"
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/issueReport/resolve`,
                claimInfo,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            handleCloseDialog();
            getAllClaimByConsortium()

        } catch (error) {
            console.error("Error al manejar la solicitud:", error);
            alert("Ocurrió un error al actualizar el reclamo.");
        }
    };

    return (
        <div>
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh', // Ensures that the container takes the full height of the screen
            }}
        >
            <AdminGallerySidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1, // Allows this component to take up the remaining space
                    padding: { xs: '16px', sm: '24px' },
                    marginLeft: { xs: 0, sm: '240px' },
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
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            marginBottom: '20px',
                        }}
                    >
                        Reclamos del Consorcio {consortiumName}
                    </Typography>
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: '1100px',
                            marginLeft: { xs: '40px', sm: '80px' },
                        }}
                    >
                        {/* Tabla de resumen */}
                        <Box sx={{ flexGrow: 1, p: 3 }}>
                            <Grid container spacing={3}>
                                {/* PENDING Card */}
                                <Grid item xs={3}>
                                    <Card
                                        sx={{
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                                            transition:
                                                'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow:
                                                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AccessTimeIcon sx={{ color: 'info.main' }} />
                                                    <Typography
                                                        variant="subtitle1"
                                                        color="info.main"
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        PENDIENTES
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    CANTIDAD
                                                </Typography>
                                                <Typography variant="h4" component="div">
                                                    {cards ? cards.pending : 0}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* En Revisión Card */}
                                <Grid item xs={3}>
                                    <Card
                                        sx={{
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                                            transition:
                                                'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow:
                                                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AnnouncementIcon color="warning" />
                                                    <Typography
                                                        variant="subtitle1"
                                                        color="warning.main"
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        EN REVISIÓN
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    CANTIDAD
                                                </Typography>
                                                <Typography variant="h4" component="div">
                                                    {cards?.underReview ? cards.underReview : 0}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* PAGADAS Card */}
                                <Grid item xs={3}>
                                    <Card
                                        sx={{
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                                            transition:
                                                'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow:
                                                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CheckCircle color="success" />
                                                    <Typography
                                                        variant="subtitle1"
                                                        color="success.main"
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        RESUELTOS
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    CANTIDAD
                                                </Typography>
                                                <Typography variant="h4" component="div">
                                                    { cards?.resolved ? cards.resolved : 0 }
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* TOTAL Card */}
                                <Grid item xs={3}>
                                    <Card
                                        sx={{
                                            boxShadow:
                                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                                            transition:
                                                'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow:
                                                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <BarChartIcon color="primary" />
                                                    <Typography
                                                        variant="subtitle1"
                                                        color="primary"
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        TOTAL
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    CANTIDAD
                                                </Typography>
                                                <Typography variant="h4" component="div">
                                                    {cards?.total ? cards.total : 0}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>

                    {/* Table */}
                    <Box sx={{ width: '100%', maxWidth: '900px', marginBottom: '40px' }}>
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
                                                borderTopRightRadius: '10px',
                                            }}
                                        >
                                            Editar
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allClaims
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((claim) => {
                                            return (
                                                <TableRow
                                                    hover
                                                    key={claim.issueReportId}
                                                    sx={{
                                                        backgroundColor: '#FFFFFF',
                                                        '&:hover': { backgroundColor: '#F6EFE5' },
                                                    }}
                                                >
                                                    {columns.map((column) => {
                                                        const value = claim[column.id];
                                                        return (
                                                            <TableCell
                                                                key={column.id}
                                                                align="center"
                                                                sx={{ ...tableCellStyles, textAlign: 'center' }}
                                                            >
                                                                {column.id === 'status' ? (
                                                                    // Show Chip based on the status color
                                                                    <Chip
                                                                        label={statusMapping[claim.status] || claim.status}
                                                                        sx={{
                                                                            backgroundColor: statusColors[claim.status] || '#FFFFFF',
                                                                            color: '#000000',
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    value
                                                                )}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell align="center" sx={tableCellStyles}>
                                                        {claim.status === 'Pendiente' && (
                                                            <IconButton
                                                                disabled={ processingHandleMoveToUnderReview }
                                                                aria-label="edit"
                                                                onClick={() => handleMoveToUnderReview(claim)}
                                                                sx={{ color: '#002776' }}
                                                            >
                                                                <AnnouncementIcon fontSize="small"  />
                                                            </IconButton>
                                                        )}
                                                        {claim.status === 'En Revisión' && (
                                                            <IconButton
                                                                aria-label="edit"
                                                                onClick={() => handleOpenDialog(claim)}
                                                                sx={{ color: '#002776' }}
                                                            >
                                                                <CheckCircle fontSize="small" />
                                                            </IconButton>
                                                        )}
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
                            count={allClaims.length}
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
            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>Editar Estado del Reclamo</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Comentario"
                        name="response"
                        value={claimInfo.response}
                        onChange={handleChangeResponse}
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminClaimManagement;