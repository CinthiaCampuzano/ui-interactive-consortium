import React, {useContext, useState} from 'react';
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
    Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardContent,
} from '@mui/material';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import ReviewIcon from '@mui/icons-material/RateReview';
import ResolvedIcon from '@mui/icons-material/CheckCircle';
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import {AdminManageContext} from "../AdminManageContext.jsx";
import Button from "@mui/material/Button";
import {AccessTime, Assessment, Assignment, Person} from "@mui/icons-material";

const AdminClaimManagement = () => {
    const {consortiumName} = useContext(AdminManageContext)
    const [reclamos, setReclamos] = useState([
        {
            id: 1,
            titulo: 'Problema en la luz',
            descripcion: 'La luz del pasillo no funciona.',
            estado: 'Pendiente',
            nombre: 'Juan Pérez',
            fecha: '2024-12-11',
        },
        {
            id: 2,
            titulo: 'Fuga de agua',
            descripcion: 'Hay una fuga en el baño común.',
            estado: 'En Revisión',
            nombre: 'María López',
            fecha: '2024-12-10',
        },
        {
            id: 3,
            titulo: 'Puerta rota',
            descripcion: 'La puerta de entrada está rota.',
            estado: 'Resuelto',
            nombre: 'Carlos García',
            fecha: '2024-12-09',
        },
    ]);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [newEstado, setNewEstado] = useState('');
    const handleEdit = (id) => {
        const reclamo = reclamos.find((r) => r.id === id);
        setSelectedClaim(reclamo);
        setNewEstado(reclamo.estado);
    };

    const handleSave = () => {
        setReclamos((prevReclamos) =>
            prevReclamos.map((r) =>
                r.id === selectedClaim.id ? { ...r, estado: newEstado } : r
            )
        );
        setSelectedClaim(null);
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return '#BCE7FD';
            case 'En Revisión':
                return '#FFD9C0';
            case 'Resuelto':
                return '#B0F2C2';
            default:
                return '#FFFFFF';
        }
    };

    return (
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
                        Reclamos del Consorcio {consortiumName} {/* Aquí mostramos el nombre del consorcio */}
                    </Typography>

                    <Box sx={{ width: '100%', maxWidth: '900px',  marginLeft: { xs: '40px', sm: '80px' } }}>
            {/* Tabla de resumen */}
                        <Box sx={{ flexGrow: 1, p: 3 }}>
                            <Grid container spacing={3}>
                                {/* Active Users Card */}
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                                319
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Person color="primary" />
                                                <Typography color="text.secondary" variant="body2">
                                                    Activos
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
                                                5
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
                                                0
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Assignment color="primary" />
                                                <Typography color="text.secondary" variant="body2">
                                                    En revisión
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
                                                2
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Assessment color="primary" />
                                                <Typography color="text.secondary" variant="body2">
                                                    Resueltos
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
                                                326
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Typography color="text.secondary" variant="body2">
                                                    Total
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>

            {/* Tabla de detalles */}
            <TableContainer
                sx={{
                    maxWidth: '900px',
                    borderRadius: '10px',
                    border: '1px solid #002776',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ backgroundColor: '#C8DFE2', color: '#002776' }}>Título</TableCell>
                            <TableCell sx={{ backgroundColor: '#C8DFE2', color: '#002776' }}>Descripción</TableCell>
                            <TableCell sx={{ backgroundColor: '#C8DFE2', color: '#002776' }}>Estado</TableCell>
                            <TableCell sx={{ backgroundColor: '#C8DFE2', color: '#002776' }}>Nombre</TableCell>
                            <TableCell sx={{ backgroundColor: '#C8DFE2', color: '#002776' }}>Fecha</TableCell>
                            <TableCell sx={{ backgroundColor: '#C8DFE2', color: '#002776' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reclamos.map((reclamo) => (
                            <TableRow
                                key={reclamo.id}
                                sx={{
                                    backgroundColor: '#FFFFFF',
                                    '&:hover': { backgroundColor: '#E3F2FD' },
                                }}
                            >
                                <TableCell>{reclamo.titulo}</TableCell>
                                <TableCell>{reclamo.descripcion}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={reclamo.estado}
                                        sx={{
                                            backgroundColor: getEstadoColor(reclamo.estado),
                                            color: '#002776',
                                            borderRadius: '16px',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{reclamo.nombre}</TableCell>
                                <TableCell>{reclamo.fecha}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(reclamo.id)}>
                                        <EditIcon sx={{ color: '#002776' }} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
                        {/* Diálogo para editar estado */}
                        {selectedClaim && (
                            <Dialog open={Boolean(selectedClaim)} onClose={() => setSelectedClaim(null)}>
                                <DialogTitle>Editar Estado</DialogTitle>
                                <DialogContent>
                                    <Select
                                        value={newEstado}
                                        onChange={(e) => setNewEstado(e.target.value)}
                                        fullWidth
                                        sx={{ marginTop: 2 }}
                                    >
                                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                                        <MenuItem value="En Revisión">En Revisión</MenuItem>
                                        <MenuItem value="Resuelto">Resuelto</MenuItem>
                                    </Select>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setSelectedClaim(null)} color="secondary">
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSave} color="primary">
                                        Guardar
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        )}
        </Box>
    </Box>
    </Box>
    </Box>
    );
};
export default AdminClaimManagement;