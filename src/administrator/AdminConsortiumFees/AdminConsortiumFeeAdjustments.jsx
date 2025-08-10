import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Button,
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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    CircularProgress,
    Snackbar,
    Alert,
    Chip,
    DialogContentText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';
import { AdminManageContext } from "../AdminManageContext.jsx";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import { useParams, useNavigate } from 'react-router-dom';

// Enumeraciones para los tipos de ajustes y operaciones
const EAdjustmentType = {
    DEBT: 'Deuda',
    FINE: 'Multa',
    FINANCIAL_ADJUSTMENT: 'Ajuste Financiero',
    OTHER: 'Otro'
};

const EOperationType = {
    DEBIT: 'Débito',
    CREDIT: 'Crédito'
};

// Estado inicial para un nuevo ajuste
const initialAdjustmentState = {
    consortiumFeePeriodId: null,
    departmentId: null,
    departmentCode: '',
    description: '',
    adjustmentType: Object.keys(EAdjustmentType)[0],
    operationType: Object.keys(EOperationType)[0],
    amount: ''
};

function AdminConsortiumFeeAdjustments() {
    const { consortiumIdState, consortiumName } = useContext(AdminManageContext);
    const [adjustments, setAdjustments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentAdjustment, setCurrentAdjustment] = useState(initialAdjustmentState);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAdjustmentId, setEditingAdjustmentId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
    const [adjustmentToDelete, setAdjustmentToDelete] = useState(null);

    const { consortiumFeePeriodId } = useParams();
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (consortiumFeePeriodId) {
            fetchAdjustments();
            fetchDepartments();
        }
    }, [consortiumFeePeriodId]);

    const fetchAdjustments = async () => {
        setTableLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setSnackbar({ open: true, message: 'No estás autorizado. Por favor, inicia sesión.', severity: 'error' });
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/adjustments/consortium-fee-period/${consortiumFeePeriodId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAdjustments(response.data || []);
        } catch (error) {
            console.error("Error fetching adjustments:", error);
            setSnackbar({ open: true, message: 'Error al cargar los ajustes.', severity: 'error' });
            setAdjustments([]);
        } finally {
            setTableLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setSnackbar({ open: true, message: 'No estás autorizado. Por favor, inicia sesión.', severity: 'error' });
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/departments/consortium/${consortiumIdState}/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDepartments(response.data || []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setSnackbar({ open: true, message: 'Error al cargar los departamentos.', severity: 'error' });
            setDepartments([]);
        }
    };

    const handleOpenDialog = (adjustment = null) => {
        if (adjustment) {
            setIsEditing(true);
            setEditingAdjustmentId(adjustment.id);
            setCurrentAdjustment({
                consortiumFeePeriodId: adjustment.consortiumFeePeriodId,
                departmentId: adjustment.departmentId,
                departmentCode: adjustment.departmentCode,
                description: adjustment.description || '',
                adjustmentType: adjustment.adjustmentType || Object.keys(EAdjustmentType)[0],
                operationType: adjustment.operationType || Object.keys(EOperationType)[0],
                amount: adjustment.amount ? String(adjustment.amount) : ''
            });
        } else {
            setIsEditing(false);
            setCurrentAdjustment({
                ...initialAdjustmentState,
                consortiumFeePeriodId: parseInt(consortiumFeePeriodId)
            });
            setEditingAdjustmentId(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentAdjustment({
            ...initialAdjustmentState,
            consortiumFeePeriodId: parseInt(consortiumFeePeriodId)
        });
        setIsEditing(false);
        setEditingAdjustmentId(null);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentAdjustment(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveAdjustment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setSnackbar({ open: true, message: 'No estás autorizado. Por favor, inicia sesión.', severity: 'error' });
            return;
        }

        if (!currentAdjustment.description.trim()) {
            setSnackbar({ open: true, message: 'La descripción del ajuste es obligatoria.', severity: 'warning' });
            return;
        }
        if (!currentAdjustment.departmentId) {
            setSnackbar({ open: true, message: 'Debe seleccionar un departamento.', severity: 'warning' });
            return;
        }
        if (!currentAdjustment.amount || isNaN(parseFloat(currentAdjustment.amount)) || parseFloat(currentAdjustment.amount) <= 0) {
            setSnackbar({ open: true, message: 'El monto debe ser un número positivo.', severity: 'warning' });
            return;
        }

        setLoading(true);
        let payload = {
            ...currentAdjustment,
            amount: parseFloat(currentAdjustment.amount),
            consortiumFeePeriodId: parseInt(consortiumFeePeriodId)
        };

        try {
            if (isEditing && editingAdjustmentId) {
                await axios.put(`${API_BASE_URL}/adjustments/${editingAdjustmentId}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSnackbar({ open: true, message: 'Ajuste actualizado correctamente.', severity: 'success' });
            } else {
                await axios.post(`${API_BASE_URL}/adjustments`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSnackbar({ open: true, message: 'Ajuste creado correctamente.', severity: 'success' });
            }
            fetchAdjustments();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving adjustment:", error);
            const errorMessage = error.response?.data?.message || 'Error al guardar el ajuste.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (adjustment) => {
        setAdjustmentToDelete(adjustment);
        setOpenConfirmDeleteDialog(true);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setOpenConfirmDeleteDialog(false);
        setAdjustmentToDelete(null);
    };

    const handleDeleteAdjustment = async () => {
        if (!adjustmentToDelete) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setSnackbar({ open: true, message: 'No estás autorizado. Por favor, inicia sesión.', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/adjustments/${adjustmentToDelete.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSnackbar({ open: true, message: 'Ajuste eliminado correctamente.', severity: 'success' });
            fetchAdjustments();
        } catch (error) {
            console.error("Error deleting adjustment:", error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el ajuste.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setLoading(false);
            handleCloseConfirmDeleteDialog();
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Función para formatear moneda
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || amount === '') {
            return '-';
        }
        const number = parseFloat(amount);
        if (isNaN(number)) {
            return '-';
        }
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    // Función para obtener propiedades del Chip para Tipo de Ajuste
    const getAdjustmentTypeChipProps = (adjustmentType) => {
        switch (adjustmentType) {
            case 'DEBT':
                return {
                    label: EAdjustmentType[adjustmentType] || adjustmentType,
                    color: 'error',
                };
            case 'FINE':
                return {
                    label: EAdjustmentType[adjustmentType] || adjustmentType,
                    color: 'warning',
                };
            case 'FINANCIAL_ADJUSTMENT':
                return {
                    label: EAdjustmentType[adjustmentType] || adjustmentType,
                    color: 'info',
                };
            case 'OTHER':
                return {
                    label: EAdjustmentType[adjustmentType] || adjustmentType,
                    color: 'default',
                };
            default:
                return {
                    label: adjustmentType,
                    color: 'default',
                };
        }
    };

    // Función para obtener propiedades del Chip para Tipo de Operación
    const getOperationTypeChipProps = (operationType) => {
        switch (operationType) {
            case 'DEBIT':
                return {
                    label: EOperationType[operationType] || operationType,
                    color: 'error',
                };
            case 'CREDIT':
                return {
                    label: EOperationType[operationType] || operationType,
                    color: 'success',
                };
            default:
                return {
                    label: operationType,
                    color: 'default',
                };
        }
    };

    const tableHeadCellStyles = {
        backgroundColor: '#002776',
        color: '#FFFFFF',
        fontWeight: 'bold',
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AdminGallerySidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: { xs: '16px', sm: '24px' },
                    marginLeft: { xs: 0, sm: '240px' },
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#003366' }}>
                        Gestión de Ajustes
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/admin/management/expensas')}
                    >
                        Volver a Expensas
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ mb: 3, backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}
                >
                    Nuevo Ajuste
                </Button>

                {tableLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : adjustments.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', mt: 2, backgroundColor: '#f0f0f0' }}>
                        <PaymentIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                            No hay ajustes definidos para este período.
                        </Typography>
                        <Typography color="text.secondary">
                            Comienza creando un nuevo ajuste.
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: '10px', border: '1px solid #002776' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...tableHeadCellStyles }}>Departamento</TableCell>
                                    <TableCell sx={{ ...tableHeadCellStyles }}>Descripción</TableCell>
                                    <TableCell sx={{ ...tableHeadCellStyles }}>Tipo de Ajuste</TableCell>
                                    <TableCell sx={{ ...tableHeadCellStyles }}>Tipo de Operación</TableCell>
                                    <TableCell sx={{ ...tableHeadCellStyles }} align="right">Monto</TableCell>
                                    <TableCell sx={{ ...tableHeadCellStyles }} align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {adjustments.map((adjustment) => {
                                    const adjustmentTypeChipProps = getAdjustmentTypeChipProps(adjustment.adjustmentType);
                                    const operationTypeChipProps = getOperationTypeChipProps(adjustment.operationType);

                                    return (
                                        <TableRow hover key={adjustment.id}>
                                            <TableCell>{adjustment.departmentCode}</TableCell>
                                            <TableCell>{adjustment.description}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={adjustmentTypeChipProps.label}
                                                    color={adjustmentTypeChipProps.color}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={operationTypeChipProps.label}
                                                    color={operationTypeChipProps.color}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">{formatCurrency(adjustment.amount)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton 
                                                    onClick={() => handleOpenDialog(adjustment)} 
                                                    color="primary" 
                                                    disabled={loading}
                                                    title="Editar"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    onClick={() => handleDeleteClick(adjustment)} 
                                                    color="error" 
                                                    disabled={loading}
                                                    title="Eliminar"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Dialog para Crear/Editar Ajuste */}
                <Dialog 
                    open={openDialog} 
                    onClose={handleCloseDialog} 
                    maxWidth="sm" 
                    fullWidth
                    PaperProps={{ component: 'form', onSubmit: (e) => { e.preventDefault(); handleSaveAdjustment(); } }}
                >
                    <DialogTitle sx={{ backgroundColor: '#002776', color: 'white' }}>
                        {isEditing ? 'Editar Ajuste' : 'Nuevo Ajuste'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: '20px !important' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth margin="dense" variant="outlined">
                                    <InputLabel id="department-label">Departamento</InputLabel>
                                    <Select
                                        labelId="department-label"
                                        name="departmentId"
                                        value={currentAdjustment.departmentId || ''}
                                        onChange={handleInputChange}
                                        label="Departamento"
                                        required
                                    >
                                        {departments.map((department) => (
                                            <MenuItem key={department.departmentId} value={department.departmentId}>
                                                {department.code}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    margin="dense"
                                    name="description"
                                    label="Descripción"
                                    type="text"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                    value={currentAdjustment.description}
                                    onChange={handleInputChange}
                                    inputProps={{ maxLength: 255 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="dense" variant="outlined">
                                    <InputLabel id="adjustment-type-label">Tipo de Ajuste</InputLabel>
                                    <Select
                                        labelId="adjustment-type-label"
                                        name="adjustmentType"
                                        value={currentAdjustment.adjustmentType}
                                        onChange={handleInputChange}
                                        label="Tipo de Ajuste"
                                        required
                                    >
                                        {Object.entries(EAdjustmentType).map(([key, value]) => (
                                            <MenuItem key={key} value={key}>{value}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="dense" variant="outlined">
                                    <InputLabel id="operation-type-label">Tipo de Operación</InputLabel>
                                    <Select
                                        labelId="operation-type-label"
                                        name="operationType"
                                        value={currentAdjustment.operationType}
                                        onChange={handleInputChange}
                                        label="Tipo de Operación"
                                        required
                                    >
                                        {Object.entries(EOperationType).map(([key, value]) => (
                                            <MenuItem key={key} value={key}>{value}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    margin="dense"
                                    name="amount"
                                    label="Monto"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={currentAdjustment.amount}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                                    }}
                                    inputProps={{ min: "0.01", step: "0.01" }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <Button onClick={handleCloseDialog} color="inherit" variant="outlined">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Guardar Cambios' : 'Crear Ajuste')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog de confirmación para eliminar */}
                <Dialog
                    open={openConfirmDeleteDialog}
                    onClose={handleCloseConfirmDeleteDialog}
                >
                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            ¿Está seguro de que desea eliminar este ajuste? Esta acción no se puede deshacer.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDeleteDialog} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeleteAdjustment} color="error" autoFocus>
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>

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
        </Box>
    );
}

export default AdminConsortiumFeeAdjustments;
