import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import axios from 'axios';
import SuperAdminSidebar from "../../SuperAdminSidebar.jsx";
import { JOB_DEFINITIONS } from "./jobDefinitions.js";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';

function SuperAdminProcess() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleOpenDialog = (job) => {
        setSelectedJob(job);
        // Inicializa los valores del formulario para el job seleccionado
        const initialValues = job.parameters.reduce((acc, param) => {
            if (param.type === 'date' || param.type === 'period') {
                acc[param.name] = null;
            } else {
                acc[param.name] = '';
            }
            return acc;
        }, {});
        setFormValues(initialValues);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedJob(null);
        setFormValues({});
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, newValue) => {
        setFormValues(prev => ({ ...prev, [name]: newValue }));
    };

    const handleExecuteJob = async () => {
        if (!selectedJob) return;

        // Validación de campos requeridos
        for (const param of selectedJob.parameters) {
            if (param.required && !formValues[param.name]) {
                setSnackbar({ open: true, message: `El parámetro "${param.label}" es obligatorio.`, severity: 'warning' });
                return;
            }
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const parameters = {};

            // Parseo de parámetros según su tipo
            for (const param of selectedJob.parameters) {
                const value = formValues[param.name];
                if (value) { // Solo procesar si hay un valor
                    switch (param.type) {
                        case 'int':
                        case 'long':
                            parameters[param.name] = Number(value);
                            break;
                        case 'string[]':
                            parameters[param.name] = value.split(',').map(item => item.trim());
                            break;
                        case 'long[]':
                            parameters[param.name] = value.split(',').map(item => Number(item.trim()));
                            break;
                        case 'date': {
                            const year = value.getFullYear();
                            const month = (value.getMonth() + 1).toString().padStart(2, '0');
                            const day = value.getDate().toString().padStart(2, '0');
                            parameters[param.name] = `${year}-${month}-${day}`;
                            break;
                        }
                        case 'period': {
                            const year = value.getFullYear();
                            const month = (value.getMonth() + 1).toString().padStart(2, '0');
                            parameters[param.name] = `${year}-${month}-01`;
                            break;
                        }
                        default:
                            parameters[param.name] = value;
                    }
                }
            }

            const payload = {
                jobName: selectedJob.jobName,
                params: parameters,
            };

            // Endpoint para ejecutar procesos batch
            await axios.post(`${API_BASE_URL}/batchjob/start`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSnackbar({ open: true, message: `Proceso "${selectedJob.name}" iniciado correctamente.`, severity: 'success' });
            handleCloseDialog();
        } catch (error) {
            console.error("Error executing job:", error);
            const errorMessage = error.response?.data?.message || 'Error al iniciar el proceso.';
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
                    Ejecución de Procesos Batch
                </Typography>

                <Grid container spacing={3}>
                    {JOB_DEFINITIONS.map((job) => (
                        <Grid item xs={12} sm={6} md={4} key={job.id}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e0e0e0' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                        {job.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {job.description}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<PlayCircleOutlineIcon />}
                                        onClick={() => handleOpenDialog(job)}
                                        sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}
                                    >
                                        Ejecutar
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Dialog para Parámetros */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#002776', color: 'white' }}>
                    Ejecutar: {selectedJob?.name}
                </DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        {selectedJob?.parameters.map((param, index) => {
                            const isFirst = index === 0;
                            if (param.type === 'date' || param.type === 'period') {
                                return (
                                    <DatePicker
                                        key={param.name}
                                        label={param.label}
                                        value={formValues[param.name] || null}
                                        onChange={(newValue) => handleDateChange(param.name, newValue)}
                                        views={param.type === 'period' ? ['year', 'month'] : ['year', 'month', 'day']}
                                        sx={{ width: '100%', mt: 1, mb: 0.5 }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: param.required,
                                                helperText: param.helperText,
                                                autoFocus: isFirst,
                                            },
                                        }}
                                    />
                                );
                            }
                            return (
                                <TextField
                                    key={param.name}
                                    autoFocus={isFirst}
                                    margin="dense"
                                    name={param.name}
                                    label={param.label}
                                    type={param.type.includes('int') || param.type.includes('long') ? 'number' : 'text'}
                                    fullWidth
                                    variant="outlined"
                                    required={param.required}
                                    value={formValues[param.name] || ''}
                                    onChange={handleInputChange}
                                    helperText={param.helperText}
                                />
                            );
                        })}
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleCloseDialog} color="inherit" variant="outlined">Cancelar</Button>
                    <Button
                        onClick={handleExecuteJob}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Proceso'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default SuperAdminProcess;
