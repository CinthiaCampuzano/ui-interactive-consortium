import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import SuperAdminSidebar from "../../SuperAdminSidebar.jsx";

// Estilos reutilizables
const tableHeadCellStyles = {
    backgroundColor: '#002776',
    color: '#FFFFFF',
    fontWeight: 'bold',
};

function SuperAdminSettings() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentSetting, setCurrentSetting] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Carga inicial de los parámetros
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setSnackbar({ open: true, message: 'No estás autorizado.', severity: 'error' });
                return;
            }
            // Endpoint para traer todos los parámetros
            const response = await axios.get(`${API_BASE_URL}/system-parameters`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(response.data || []);
        } catch (error) {
            console.error("Error fetching settings:", error);
            setSnackbar({ open: true, message: 'Error al cargar la configuración.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (setting) => {
        setCurrentSetting({ ...setting }); // Copia para edición segura
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setCurrentSetting(null);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentSetting(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!currentSetting || !currentSetting.key) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { key, value } = currentSetting;

            // Endpoint para actualizar un parámetro específico por su clave
            await axios.put(`${API_BASE_URL}/system-parameters/${key}`, { value }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSnackbar({ open: true, message: 'Parámetro actualizado correctamente.', severity: 'success' });
            handleCloseDialog();
            await fetchSettings(); // Recargar la lista para ver el cambio
        } catch (error) {
            console.error("Error updating setting:", error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el parámetro.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <SuperAdminSidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: { xs: '16px', sm: '24px' },
                    marginLeft: { xs: 0, sm: '240px' },
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#003366', mb: 3 }}>
                    Parametros del Sistema
                </Typography>

                {loading && settings.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : !loading && settings.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', mt: 2, backgroundColor: '#f0f0f0' }}>
                        <SettingsIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                            No se encontraron parámetros de configuración.
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: '10px', border: '1px solid #002776' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeadCellStyles}>Parámetro</TableCell>
                                    <TableCell sx={tableHeadCellStyles}>Descripción</TableCell>
                                    <TableCell sx={tableHeadCellStyles}>Valor</TableCell>
                                    <TableCell sx={tableHeadCellStyles} align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {settings.map((setting) => (
                                    <TableRow hover key={setting.key}>
                                        <TableCell sx={{ fontWeight: 'medium' }}>{setting.key}</TableCell>
                                        <TableCell>{setting.description}</TableCell>
                                        <TableCell>{setting.value}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Editar Parámetro">
                                                <IconButton onClick={() => handleOpenDialog(setting)} color="primary">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* Dialog para Editar */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#002776', color: 'white' }}>
                    Editar Parámetro
                </DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    {currentSetting && (
                        <Box component="form" noValidate autoComplete="off">
                            <TextField
                                disabled
                                margin="dense"
                                label="Parámetro (Clave)"
                                fullWidth
                                variant="outlined"
                                value={currentSetting.key}
                            />
                            <TextField
                                disabled
                                margin="dense"
                                label="Descripción"
                                fullWidth
                                multiline
                                rows={2}
                                variant="outlined"
                                value={currentSetting.description}
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                name="value"
                                label="Valor"
                                fullWidth
                                variant="outlined"
                                value={currentSetting.value}
                                onChange={handleInputChange}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleCloseDialog} color="inherit" variant="outlined">Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default SuperAdminSettings;
