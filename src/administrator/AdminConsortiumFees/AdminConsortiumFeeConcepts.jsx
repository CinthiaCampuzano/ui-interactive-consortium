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
    DialogContentText,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Grid,
    CircularProgress,
    Snackbar,
    Alert, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from "@mui/icons-material/Settings"; // Reutilizando
import axios from 'axios';
import { AdminManageContext } from "../AdminManageContext.jsx";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx"; // Asumiendo que quieres el mismo sidebar

const EConsortiumFeeConceptType = {
    ORDINARY: 'Ordinario',
    EXTRAORDINARY: 'Extraordinario',
    // RESERVE_FUND: 'FONDO_DE_RESERVA',
};

const EConsortiumFeeType = {
    EARNING: 'Ingreso ordinario',
    EXTRAORDINARY_EARNING: 'Ingreso extraordinario',
    COST: 'Gasto ordinario',
    EXTRAORDINARY_COST: 'Gasto extraordinario',
    AMENITY_COST: 'Costo por uso de amenities/espacios comunes'
};

const EDistributionType = {
    EQUAL_SPLIT: 'Division equitativa', // DEFAULT
    // BY_COEFFICIENT: 'Por coeficiente UF',
    PER_UNIT_FIXED: 'Monto fijo',
    // MANUAL: 'El monto se especifica manualmente por UF para este concepto (requiere más lógica)',
    // AMENITY_USAGE: 'El monto se basa en el uso registrado (e.g., sumatoria de CommonSpaceBooking.costAtTimeOfBooking para la UF)'
  };

const initialConceptState = {
    name: '',
    description: '',
    defaultAmount: '',
    conceptType: Object.keys(EConsortiumFeeConceptType)[0] || '', // Valor por defecto
    feeType: Object.keys(EConsortiumFeeType)[0] || '',       // Valor por defecto
    distributionType: Object.keys(EDistributionType)[0] || '',       // Valor por defecto
    active: true,
};

function AdminConsortiumFeeConcepts() {
    const { consortiumIdState, consortiumName } = useContext(AdminManageContext);
    const [concepts, setConcepts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentConcept, setCurrentConcept] = useState(initialConceptState);
    const [isEditing, setIsEditing] = useState(false);
    const [editingConceptId, setEditingConceptId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
    const [conceptToDelete, setConceptToDelete] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (consortiumIdState) {
            fetchConcepts();
        }
    }, [consortiumIdState]);

    const fetchConcepts = async () => {
        setTableLoading(true);
        try {
            const token = localStorage.getItem('token'); // Get the stored token
            if (!token) {
                alert("No estás autorizado. Por favor, inicia sesión.");
                return; // Stop execution if no token
            }

            const response = await axios.get(`${API_BASE_URL}/consortiumFeeConcepts/query`, {
                params: {
                    consortiumId: consortiumIdState,
                },
                headers: {
                    Authorization: `Bearer ${token}` // Include the token in the headers
                }
            });
            setConcepts(response.data.content || []);
        } catch (error) {
            console.error("Error fetching concepts:", error);
            setSnackbar({ open: true, message: 'Error al cargar los conceptos.', severity: 'error' });
            setConcepts([]); // Limpia en caso de error
        } finally {
            setTableLoading(false);
        }
    };

    const handleOpenDialog = (concept = null) => {
        if (concept) {
            setIsEditing(true);
            setEditingConceptId(concept.consortiumFeeConceptId);
            setCurrentConcept({
                name: concept.name || '',
                description: concept.description || '',
                defaultAmount: concept.defaultAmount !== null ? String(concept.defaultAmount) : '',
                conceptType: concept.conceptType || Object.keys(EConsortiumFeeConceptType)[0],
                feeType: concept.feeType || Object.keys(EConsortiumFeeType)[0],
                distributionType: concept.distributionType || Object.keys(EDistributionType)[0],
                active: concept.active !== undefined ? concept.active : true,
            });
        } else {
            setIsEditing(false);
            setCurrentConcept(initialConceptState);
            setEditingConceptId(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentConcept(initialConceptState);
        setIsEditing(false);
        setEditingConceptId(null);
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setCurrentConcept(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Función auxiliar para obtener las propiedades del Chip para Tipo de Tasa
    const getDistributionTypeChipProps = (distributionType) => {
        switch (distributionType) {
            case 'EQUAL_SPLIT':
            case 'PER_UNIT_FIXED':
            case 'BY_COEFFICIENT':
                return {
                    label: EDistributionType[distributionType] || distributionType,
                    color: 'success', // Verdoso para ingresos
                };
            case 'MANUAL':
                return {
                    label: EDistributionType[distributionType] || distributionType,
                    color: 'error', // Rojizo para gastos
                };
            default:
                return {
                    label: EDistributionType[distributionType] || distributionType,
                    color: 'default',
                };
        }
    };

    // Función auxiliar para obtener las propiedades del Chip para Tipo de Tasa
    const getFeeTypeChipProps = (feeType) => {
        switch (feeType) {
            case 'EARNING':
            case 'EXTRAORDINARY_EARNING':
                return {
                    label: EConsortiumFeeType[feeType] || feeType,
                    color: 'success', // Verdoso para ingresos
                };
            case 'COST':
            case 'EXTRAORDINARY_COST':
            case 'AMENITY_COST':
                return {
                    label: EConsortiumFeeType[feeType] || feeType,
                    color: 'error', // Rojizo para gastos
                };
            default:
                return {
                    label: EConsortiumFeeType[feeType] || feeType,
                    color: 'default',
                };
        }
    };

// Función auxiliar para obtener las propiedades del Chip para Tipo de Concepto
    const getConceptTypeChipProps = (conceptType) => {
        switch (conceptType) {
            case 'ORDINARY':
                return {
                    label: EConsortiumFeeConceptType[conceptType] || conceptType,
                    color: 'primary', // Azul para ordinaria
                };
            case 'EXTRAORDINARY':
                return {
                    label: EConsortiumFeeConceptType[conceptType] || conceptType,
                    color: 'warning', // Naranja/amarillo para extraordinaria
                };
            case 'RESERVE_FUND':
                return {
                    label: EConsortiumFeeConceptType[conceptType] || conceptType,
                    color: 'secondary', // Púrpura o un color distintivo para fondo de reserva
                };
            default:
                return {
                    label: EConsortiumFeeConceptType[conceptType] || conceptType,
                    color: 'default',
                };
        }
    };


    // Función para formatear moneda (puedes ponerla fuera del componente si la reutilizas)
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || amount === '') {
            return '-'; // O podrías retornar '$0.00' o lo que prefieras para nulos/vacíos
        }
        const number = parseFloat(amount);
        if (isNaN(number)) {
            return '-'; // Si no es un número válido después de intentar convertir
        }
        return new Intl.NumberFormat('es-AR', { // 'es-AR' para Argentina, ajusta según tu necesidad
            style: 'currency',
            currency: 'ARS', // Código de moneda para Peso Argentino, ajusta si es otra
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    const handleSaveConcept = async () => {
        const token = localStorage.getItem('token'); // Get the stored token
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Stop execution if no token
        }

        let headers = {
            headers: {
                Authorization: `Bearer ${token}` // Include the token in the headers
            }
        }

        if (!currentConcept.name.trim()) {
            setSnackbar({ open: true, message: 'El nombre del concepto es obligatorio.', severity: 'warning' });
            return;
        }
        if (currentConcept.defaultAmount !== '' && isNaN(parseFloat(currentConcept.defaultAmount))) {
            setSnackbar({ open: true, message: 'El monto por defecto debe ser un número válido.', severity: 'warning' });
            return;
        }


        setLoading(true);
        let payload = {
            ...currentConcept,
            consortium: {consortiumId: consortiumIdState}, // Incluir el id del consorcio
            defaultAmount: currentConcept.defaultAmount !== '' ? parseFloat(currentConcept.defaultAmount) : null, // Enviar como número o null
        };

        try {
            if (isEditing && editingConceptId) {
                await axios.put(`${API_BASE_URL}/consortiumFeeConcepts/${editingConceptId}`, payload, headers);
                setSnackbar({ open: true, message: 'Concepto actualizado correctamente.', severity: 'success' });
            } else {
                // Para crear, el payload ya incluye consortiumId

                await axios.post(`${API_BASE_URL}/consortiumFeeConcepts`, payload, headers);
                setSnackbar({ open: true, message: 'Concepto creado correctamente.', severity: 'success' });
            }
            fetchConcepts(); // Recargar la lista
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving concept:", error);
            const errorMessage = error.response?.data?.message || 'Error al guardar el concepto.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (concept) => {
        const token = localStorage.getItem('token'); // Get the stored token
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Stop execution if no token
        }

        let headers = {
            headers: {
                Authorization: `Bearer ${token}` // Include the token in the headers
            }
        }

        setLoading(true); // Podrías tener un loading específico para la fila
        const updatedConcept = { ...concept, active: !concept.active };
        try {
            // Asumo que el PUT actualiza todo el objeto, incluyendo 'active'
            await axios.put(`${API_BASE_URL}/consortiumFeeConcepts/${concept.consortiumFeeConceptId}`, {
                ...updatedConcept, // Envía el concepto completo con el estado active cambiado
                consortiumId: consortiumIdState, // Asegúrate de enviar el ID del consorcio si tu backend lo requiere para actualizar
            }, headers);
            setSnackbar({ open: true, message: `Concepto ${updatedConcept.active ? 'activado' : 'desactivado'}.`, severity: 'success' });
            fetchConcepts();
        } catch (error) {
            console.error("Error toggling concept active state:", error);
            setSnackbar({ open: true, message: 'Error al cambiar el estado del concepto.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteClick = (concept) => {
        setConceptToDelete(concept);
        setOpenConfirmDeleteDialog(true);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setOpenConfirmDeleteDialog(false);
        setConceptToDelete(null);
    };

    const handleDeleteConcept = async () => {
        if (!conceptToDelete) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setSnackbar({ open: true, message: 'No estás autorizado. Por favor, inicia sesión.', severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/consortiumFeeConcepts/${conceptToDelete.consortiumFeeConceptId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSnackbar({ open: true, message: 'Concepto eliminado correctamente.', severity: 'success' });
            fetchConcepts();
        } catch (error) {
            console.error("Error deleting concept:", error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el concepto.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setLoading(false);
            handleCloseConfirmDeleteDialog();
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const tableHeadCellStyles = {
        backgroundColor: '#002776',
        color: '#FFFFFF',
        fontWeight: 'bold',
    };

    // Estilos para las celdas con contenido que podría ser largo
    const longTextCellStyle = {
        maxWidth: '200px', // Define el ancho máximo que desees para la columna
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', // Importante para que ellipsis funcione en una sola línea
    };

    const descriptionCellStyle = { // Puedes tener un ancho diferente para la descripción
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    };


    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AdminGallerySidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: { xs: '16px', sm: '24px' },
                    marginLeft: { xs: 0, sm: '240px' }, // Ajusta según el ancho de tu sidebar
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#003366', mb: 3 }}>
                    Configuración de Conceptos de Expensas
                    {consortiumName && ` para ${consortiumName}`}
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ mb: 3, backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}
                >
                    Nuevo Concepto
                </Button>

                {tableLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : concepts.length === 0 && !tableLoading ? (
                     <Paper sx={{ p: 3, textAlign: 'center', mt: 2, backgroundColor: '#f0f0f0' }}>
                        <SettingsIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                            No hay conceptos definidos para este consorcio.
                        </Typography>
                        <Typography color="text.secondary">
                            Comienza creando un nuevo concepto.
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: '10px', border: '1px solid #002776' }}>
                        <Table stickyHeader>
                            <TableHead>
                                {/* ... (TableRow y TableCells del encabezado sin cambios) ... */}
                                <TableRow>
                                    <TableCell sx={{...tableHeadCellStyles, width: '200px' }}>Nombre</TableCell>
                                    <TableCell sx={{...tableHeadCellStyles, width: '200px' }}>Descripción</TableCell>
                                    <TableCell sx={{...tableHeadCellStyles, width: '200px' }} align="right">Monto Def.</TableCell>
                                    <TableCell sx={{...tableHeadCellStyles, width: '200px' }}>Tipo Concepto</TableCell>
                                    <TableCell sx={{...tableHeadCellStyles, width: '200px' }}>Tipo Tasa</TableCell>
                                    <TableCell sx={{...tableHeadCellStyles, width: '200px' }} align="center">Activo</TableCell>
                                    <TableCell sx={{...tableHeadCellStyles, width: '200px' }} align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {concepts.map((concept) => {
                                    const distributionTypeChipProps = getDistributionTypeChipProps(concept.distributionType);
                                    const conceptTypeChipProps = getConceptTypeChipProps(concept.conceptType);

                                    return (
                                        <TableRow hover key={concept.consortiumFeeConceptId}>
                                            <TableCell sx={longTextCellStyle}>{concept.name}</TableCell>
                                            <TableCell sx={descriptionCellStyle}>{concept.description}</TableCell>
                                            <TableCell align="right"> {/* Alineación a la derecha para montos */}
                                                {/* MODIFICACIÓN AQUÍ */}
                                                {formatCurrency(concept.defaultAmount)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={conceptTypeChipProps.label}
                                                    color={conceptTypeChipProps.color}
                                                    size="small" // Para que no sea muy grande en la tabla
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={distributionTypeChipProps.label}
                                                    color={distributionTypeChipProps.color}
                                                    size="small" // Para que no sea muy grande en la tabla
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Switch
                                                    checked={concept.active}
                                                    onChange={() => handleToggleActive(concept)}
                                                    color="primary"
                                                    disabled={loading}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton 
                                                    onClick={() => handleOpenDialog(concept)} 
                                                    color="primary" 
                                                    disabled={loading}
                                                    title="Editar"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    onClick={() => handleDeleteClick(concept)} 
                                                    color="error" 
                                                    disabled={loading || concept.defaultConcept}
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

                {/* Dialog para Crear/Editar Concepto */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth
                    PaperProps={{ component: 'form', onSubmit: (e) => { e.preventDefault(); handleSaveConcept(); } }}
                >
                    <DialogTitle sx={{ backgroundColor: '#002776', color: 'white' }}>
                        {isEditing ? 'Editar Concepto' : 'Nuevo Concepto'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: '20px !important' }}> {/* Añade padding top si el título es muy pegado */}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    autoFocus
                                    required
                                    margin="dense"
                                    name="name"
                                    label="Nombre del Concepto"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={currentConcept.name}
                                    onChange={handleInputChange}
                                    inputProps={{ maxLength: 100 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    margin="dense"
                                    name="description"
                                    label="Descripción"
                                    type="text"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    value={currentConcept.description}
                                    onChange={handleInputChange}
                                    inputProps={{ maxLength: 255 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="dense"
                                    name="defaultAmount"
                                    label="Monto por Defecto (opcional)"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={currentConcept.defaultAmount}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                                    }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={currentConcept.active}
                                            onChange={handleInputChange}
                                            name="active"
                                            color="primary"
                                        />
                                    }
                                    label="Activo"
                                    sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', height: '100%' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="dense" variant="outlined">
                                    <InputLabel id="concept-type-label">Tipo de Concepto</InputLabel>
                                    <Select
                                        labelId="concept-type-label"
                                        name="conceptType"
                                        value={currentConcept.conceptType}
                                        onChange={handleInputChange}
                                        label="Tipo de Concepto"
                                    >
                                        {Object.entries(EConsortiumFeeConceptType).map(([key, value]) => (
                                            <MenuItem key={key} value={key}>{value}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="dense" variant="outlined">
                                    <InputLabel id="distribution-type-label">Tipo de Distribución</InputLabel>
                                    <Select
                                        labelId="distribution-type-label"
                                        name="distributionType"
                                        value={currentConcept.distributionType}
                                        onChange={handleInputChange}
                                        label="Tipo de Distribución"
                                    >
                                        {Object.entries(EDistributionType).map(([key, value]) => (
                                            <MenuItem key={key} value={key}>{value}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/*<Grid item xs={12} sm={6}>*/}
                            {/*    <FormControl fullWidth margin="dense" variant="outlined">*/}
                            {/*        <InputLabel id="fee-type-label">Tipo de Tasa</InputLabel>*/}
                            {/*        <Select*/}
                            {/*            labelId="fee-type-label"*/}
                            {/*            name="feeType"*/}
                            {/*            value={currentConcept.feeType}*/}
                            {/*            onChange={handleInputChange}*/}
                            {/*            label="Tipo de Tasa"*/}
                            {/*        >*/}
                            {/*            {Object.entries(EConsortiumFeeType).map(([key, value]) => (*/}
                            {/*                <MenuItem key={key} value={key}>{value}</MenuItem>*/}
                            {/*            ))}*/}
                            {/*        </Select>*/}
                            {/*    </FormControl>*/}
                            {/*</Grid>*/}
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px' }}>
                        <Button onClick={handleCloseDialog} color="inherit" variant="outlined">Cancelar</Button>
                        <Button
                            type="submit" // Para que funcione con el form del PaperProps
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ backgroundColor: '#002776', '&:hover': { backgroundColor: '#001B5E' } }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Guardar Cambios' : 'Crear Concepto')}
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
                            ¿Está seguro de que desea eliminar este concepto? Esta acción no se puede deshacer.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDeleteDialog} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeleteConcept} color="error" autoFocus>
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

export default AdminConsortiumFeeConcepts;
