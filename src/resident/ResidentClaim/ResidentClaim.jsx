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
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    TablePagination,
    TextField,
    Snackbar, Alert, DialogContentText,
} from '@mui/material';

import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import {AccessTime, Assessment, Assignment, AttachMoney, CheckCircle, Pending, Person} from "@mui/icons-material";
import {useSnackbar} from "notistack";
import Button from "@mui/material/Button";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance.js";
import {ResidentManageContext} from "../ResidentManageContext.jsx";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime.js";
import AnnouncementIcon from "@mui/icons-material/Announcement.js";
import BarChartIcon from "@mui/icons-material/BarChart.js";
import ResidentSidebar from "../ResidentSidebar.jsx";




const columns = [
    { id: 'subject', label: 'Título', minWidth: 100 },
    { id: 'issue', label: 'Descripción', minWidth: 100 },
    { id: 'status', label: 'Estado del Reclamo', minWidth: 100 },
    { id: 'createdDate', label: 'Fecha del Reclamo', minWidth: 100 },
    {id: 'response', label: 'Respuesta', minWidth: 100 },
    {id: 'responseDate', label: 'Fecha de la Solución', minWidth: 100 },
]
const ResidentClaim = () => {
    const {consortiumName, getAllClaimByConsortiumAndPerson, allClaims , setAllClaims, getAConsortiumByIdConsortium, consortiumIdState, statusMappingClaim  } = useContext(ResidentManageContext)
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const { enqueueSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false)
    const [idClaimToDelete, setIdClaimToDelete] = useState(null)
    const [currentClaim, setCurrentClaim] = useState(null);
    const [formData, setFormData] = useState({ status: '', comment: '' });
    const [cards, setCards] = useState();
    const [claimInfo, setClaimInfo] = useState({
        subject: '',
        issue: '',
        person:{
            personId: null},
        consortium: {
            consortiumId: null
        }
    })
    const [text, setText] = useState('')
    const [postCreated, setPostCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)

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


            // Realizar la solicitud GET para obtener los departamentos
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/issueReport/consortium/${consortiumIdState}/cards/person`, {
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


    const handleClickOpen = () => {

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No se encontró el token.");
            return; // Detenemos la ejecución si no hay token
        }
        const decodedToken = jwtDecode(token); // Decodifica el token
        const userId = decodedToken.userId; // Extrae el userId del token
        setClaimInfo({
            subject: '',
            issue: '',
            person:{
                personId: userId},
            consortium: {
                consortiumId: consortiumIdState
            }
        });
        setOpen(true);
    }

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleClose = () => {
        setOpen(false)
        setClaimInfo({})
    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setClaimInfo((prevValues) => ({
            ...prevValues,
            [name]: value, // Actualiza solo el campo que está siendo editado (subject o issue)
            consortium: prevValues.consortium, // Preserva el objeto 'consortium'
            person: prevValues.person, // Preserva el valor de 'personId'
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtén el token del almacenamiento local
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detenemos la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isResident = decodedToken?.role?.includes('ROLE_RESIDENT') || decodedToken?.role?.includes('ROLE_PROPIETARY');
        if (!isResident) {
            alert("No tienes permisos para realizar esta acción.");
            return; // Detenemos la ejecución si no tiene el rol ROLE_ADMIN
        }

        console.log(JSON.stringify(claimInfo));
        const Url = `${import.meta.env.VITE_API_BASE_URL}/issueReport`;

        try {
            // Realiza la solicitud con el token en los encabezados
            await axios.post(Url, claimInfo, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    'Content-Type': 'application/json'
                },
            });

            setText('Se realizó la carga correctamente');
            setPostCreated(true);
            handleClose();

        } catch (exception) {
            setPostCreated(false);

            // switch (exception.response?.status) {
            //     case 409:
            //         setText('No se realizó la carga porque ya existe un espacio común con ese nombre en este consorcio');
            //         break;
            //     case 404:
            //         setText('No se realizó la carga porque el consorcio no fue encontrado');
            //         break;
            //     default:
            //         setText('No se realizó la carga debido a un error de datos');
            // }

            setText(exception.response?.data)
        } finally {
            handleOpenAlert();
            getAllClaimByConsortiumAndPerson();
        }
    };
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
        getAllClaimByConsortiumAndPerson();
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

    const handleClickOpenDelete = (idToDelete) => {
        setIdClaimToDelete(idToDelete)
        setOpenDelete(true)
    };
    const handleCloseDelete = () => {
        setOpenDelete(false)
        setIdClaimToDelete(null)
    };

    const deleteClaim = async (idClaimToDelete) =>{
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detenemos la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isResident = decodedToken?.role?.includes('ROLE_RESIDENT') || decodedToken?.role?.includes('ROLE_PROPIETARY');
        if (!isResident) {
            alert("No tienes permisos para realizar esta acción.");
            return; // Detenemos la ejecución si no tiene el rol ROLE_ADMIN
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/issueReport/${idClaimToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
                },
            });
            // Filtrar el post eliminado de la lista
            setAllClaims(allClaims.filter(post => post.postId !== idClaimToDelete));
            getAllClaimByConsortiumAndPerson();
            setPostCreated(true);
            setText('Se elimino correctamente el reclamo');
            handleOpenAlert();
        } catch (error) {
            setPostCreated(false);
            setText('Solo se puede eliminar reclamos en estado "Pendiente" ');
            console.error('Error al eliminar el post:', error);
        }

    }
    return (
        <div>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh', // Ensures that the container takes the full height of the screen
                }}
            >
                <ResidentSidebar/>
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

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleClickOpen}
                            sx={{
                                backgroundColor: '#B2675E', // Color personalizado
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                borderRadius: '30px', // Bordes redondeados
                                padding: '12px 24px', // Espacio interno reducido
                                fontSize: '1.1rem', // Tamaño de fuente ligeramente más pequeño
                                minWidth: '180px', // Tamaño mínimo ajustado
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra moderada
                                transition: 'all 0.3s ease', // Transición suave
                                '&:hover': {
                                    backgroundColor: '#A15D50', // Cambio de color al pasar el cursor
                                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)', // Sombra más prominente
                                },
                                '&:active': {
                                    backgroundColor: '#8A4A3D', // Cambio de color cuando se presiona
                                },
                            }}
                        >
                            Nuevo
                        </Button>

                        <Box sx={{ marginTop: '20px', width: '100%', maxWidth: '900px', marginBottom: '40px' }}>
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
                                                Eliminar
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
                                                                            label={statusMappingClaim[claim.status] || claim.status}
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
                                                            <IconButton aria-label="delete" onClick={() => handleClickOpenDelete(claim.issueReportId)} sx={{ color: '#B2675E' }} disabled = {claim.status !== 'Pendiente'} >
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
                                rowsPerPageOptions={[5]}
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
            <Dialog
                open={openDelete}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleCloseDelete();
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>
                    {"Desea eliminar este reclamo?"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <DialogContentText id="alert-dialog-description">
                        Si acepta se eliminara el reclamo deseado.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button onClick={handleCloseDelete} variant="contained"  sx={{
                        backgroundColor: '#B2675E',
                        '&:hover': {
                            backgroundColor: '#8E5346',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }}>Cancelar</Button>
                    <Button variant="contained"  sx={{
                        backgroundColor: '#028484',
                        '&:hover': {
                            backgroundColor: '#026F6B',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }} onClick={() => {
                        deleteClaim(idClaimToDelete)
                        handleCloseDelete()
                    }
                    }>
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose();
                    }
                }}
            >
                <DialogTitle  sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>Nuevo Reclamo</DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#F2F2F2', marginTop: '10px' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2}}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} >
                                    <TextField
                                        id="outlined-basic"
                                        label="Título"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="subject"
                                        value={claimInfo.subject || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} >
                                    <TextField
                                        id="outlined-basic"
                                        label="Contenido"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="issue"
                                        multiline
                                        rows={4}
                                        value={claimInfo.issue || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button onClick={handleClose} variant="contained"  sx={{
                        backgroundColor: '#B2675E',
                        '&:hover': {
                            backgroundColor: '#8E5346',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }}>
                        Cancelar
                    </Button>
                    <Button type="submit" onClick={handleSubmit} variant="contained"  sx={{
                        backgroundColor: '#028484',
                        '&:hover': {
                            backgroundColor: '#026F6B',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }} >
                        Guardar
                    </Button>

                </DialogActions>
            </Dialog>
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={postCreated ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ResidentClaim;