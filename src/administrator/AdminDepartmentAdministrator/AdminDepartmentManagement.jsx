import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, {useContext, useEffect, useState} from "react";
import {AdminManageContext} from "../AdminManageContext.jsx";
import axios from "axios";
import {
    Alert, alpha, Autocomplete, Backdrop, Card, CardContent, Chip, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, FormControlLabel, Grid, Snackbar, Switch,
    TablePagination, useTheme,
    TextField, InputAdornment
} from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit.js";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminCreateDepartment from "./AdminCreateDepartment.jsx";
import {jwtDecode} from "jwt-decode";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import SearchIcon from "@mui/icons-material/Search.js";
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import {deepPurple, green, pink, yellow} from "@mui/material/colors";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonAddIcon from "@mui/icons-material/PersonAdd.js";
import AdminCreatePerson from "../AdminUserAdministrator/AdminCreatePerson.jsx";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined.js";

const columns = [
    { id: 'code', label: 'Identificación', minWidth: 100 },
    { id: 'fullNameP', label: 'Propietario', minWidth: 100 },
    { id: 'fullNameR', label: 'Residente', minWidth: 100 }
];

function AdminDepartmentManagement(){
    const {consortiumIdState, allPersons,allDepartments, setAllDepartments, getAllDepartmentsByConsortium,
        getAllPersons, getAConsortiumByIdConsortium, consortiumName,
        departmentStats, totalDepartments, setTotalDepartments,
        setOpenDniDialog, newPersonDpto,
        setNewPersonDpto,  personCreationType, setPersonCreationType,
        newResidentDpto, setNewResidentDpto, aConsortiumByIdConsortium } = useContext(AdminManageContext)

    const [departmentCode, setDepartmentCode] = useState('')
    const [proprietor, setProprietor] = useState('')
    const [resident, setResident] = useState('')
    const [personDni, setPersonDni] = useState('')
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(5)
    const [idDepartmentUpdate, setIdDepartmentUpdate] = useState(null)
    const [openEdit, setOpenEdit] = useState(false)
    const [editCode, setEditCode] = useState('')
    const [editPropietaryId, setEditPropietaryId] = useState('')
    const [editResidentId, setEditResidentId] = useState('')
    const [editActive, setEditActive] = useState(false)
    const [idPersonCreated, setIdPersonCreated] = useState(null)
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [departmentUpdate, setDepartmentUpdate] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [departmentInfo, setDepartmentInfo] = useState({
        departmentId: null,
        code: "",
        consortium: {
            consortiumId: null
        },
        propietary: {
            personId: null,
        },
        resident:{
            personId: null
        },
        active : null
    })
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [selectedResident, setSelectedResident] = useState(null);
    const [loading, setLoading] = useState(false);
    const theme = useTheme()
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickOpenEdit = async (
        idDepartmentToEdit,
        departmentCodeEdit,
        departmentPropietaryIdEdit,
        departmentResidentIdEdit,
        departmentActive
    ) => {
        await getAllPersons();

        setIdDepartmentUpdate(idDepartmentToEdit);
        setEditCode(departmentCodeEdit);
        setEditPropietaryId(departmentPropietaryIdEdit);
        setEditResidentId(departmentResidentIdEdit);
        setEditActive(departmentActive);

        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false)
        setIdDepartmentUpdate(null)
        setDepartmentInfo({
            departmentId: null,
            code: "",
            consortium: {
                consortiumId: null
            },
            propietary: {
                personId: null,
            },
            resident:{
                personId: null
            }
        })
    }

    useEffect(() => {
        setTotalDepartments(allDepartments.length);
    }, [allDepartments]);

    const handleClickOpen = (idPersonToDelete) => {
        setIdPersonCreated(idPersonToDelete)
        setOpen(true)
    };
    const handleClose = () => {
        setOpen(false)
        setIdPersonCreated(null)
    };

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    useEffect(() => {
        if (departmentCode === '' && proprietor === '' && resident === '') {
            getAllDepartmentsByConsortium(consortiumIdState)
        }
    }, [departmentCode, proprietor, resident, consortiumIdState])

    useEffect(() => {
        if (openEdit){
            setDepartmentInfo({
                departmentId: idDepartmentUpdate,
                code: editCode || "",
                consortium: {
                    consortiumId: consortiumIdState
                },
                propietary: editPropietaryId ? { personId: editPropietaryId } : null,
                resident: editResidentId ? { personId: editResidentId } : null,
                active: editActive
            });
        }

    }, [openEdit, idDepartmentUpdate, editCode, editPropietaryId, editResidentId, editActive, consortiumIdState]);


    useEffect(() => {
        getAConsortiumByIdConsortium();
    }, [consortiumIdState]);


    const handleChange = (event) => {
        const name = event.target.name; // Obtiene el nombre del campo
        const value = name === 'active' ? event.target.checked : event.target.value;

        setDepartmentInfo((values) => {
            // Crea una copia del objeto actual
            const updatedValues = { ...values };

            // Maneja los cambios en campos anidados
            switch (name) {
                case 'departmentId':
                    updatedValues.departmentId = value; // Actualiza departmentId directamente
                    break;
                case 'code':
                    updatedValues.code = value; // Actualiza code directamente
                    break;
                case 'consortiumId':
                    updatedValues.consortium = {
                        ...updatedValues.consortium,
                        consortiumId: value // Actualiza el consortiumId dentro del objeto consortium
                    };
                    break;
                case 'propietaryId':
                    updatedValues.propietary = {
                        ...updatedValues.propietary,
                        personId: value // Actualiza el propietaryId dentro del objeto propietary
                    };
                    break;
                case 'residentId':
                    updatedValues.resident = {
                        ...updatedValues.resident,
                        personId: value // Actualiza el residentId dentro del objeto resident
                    };
                    break;
                case 'active':
                    updatedValues.active = value;
                    break;
                default:
                    break;
            }
            return updatedValues; // Retorna el objeto actualizado
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtén el token almacenado
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener la ejecución si no hay token
        }

        try {
            setLoading(true)
            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener la ejecución si no es ROLE_ADMIN
            }

            // Si el usuario tiene el rol adecuado, realiza la solicitud PUT
            const url = `${import.meta.env.VITE_API_BASE_URL}/departments`;

            await axios.put(url, departmentInfo, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            setText('Se realizó la actualización correctamente');
            setDepartmentUpdate(true);
            handleCloseEdit();

        } catch (exception) {
            setDepartmentUpdate(false);

            // Manejo de errores más detallado
            if (exception.response) {

                switch (exception.response.status) {
                    case 404:
                        if (exception.response.data.message.includes('No existe ese departamento')) {
                            setText('No se pudo encontrar el departamento que intenta actualizar.');
                        } else if (exception.response.data.message.includes('Consorcio no encontrado')) {
                            setText('El consorcio especificado no se encontró.');
                        } else if (exception.response.data.message.includes('Propietario no encontrado')) {
                            setText('El propietario especificado no se encontró.');
                        } else if (exception.response.data.message.includes('Residente no encontrado')) {
                            setText('El residente especificado no se encontró.');
                        } else {
                            setText('El departamento no existe o los datos proporcionados son incorrectos.');
                        }
                        break;
                    case 409:
                        setText('Ya existe un departamento en ese piso con ese identificador.');
                        break;
                    default:
                        setText(exception.response?.data?.message || exception.response?.data || 'No se realizó la carga, error de datos!!');
                }
            }
        } finally {
            setLoading(false)
            handleOpenAlert();
            getAllDepartmentsByConsortium(consortiumIdState);
        }
    };

    const getAllDepartmentsByFilter = async () => {
        const handleEmptyValues = (value) => {
            return value === '' ? null : value;
        };

        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener ejecución si no hay token
        }

        try {
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener ejecución si no es ROLE_ADMIN
            }

            const code = handleEmptyValues(departmentCode);
            const proprietorName = handleEmptyValues(proprietor);
            const residentName = handleEmptyValues(resident);

            let params = {};
            params.idConsortium = consortiumIdState;
            if (code !== null) params.code = code;
            if (proprietorName !== null) params.ownerNameOrLastName = proprietorName;
            if (residentName !== null) params.residentNameOrLastName = residentName;

            if (Object.keys(params).length === 0) {
                getAllDepartmentsByConsortium(consortiumIdState);
            } else {
                const queryParams = new URLSearchParams(params).toString();
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/departments/filterBy?${queryParams}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const departments = res.data.content;
                setAllDepartments(departments.map(department => {
                    return {
                        departmentId: department.departmentId,
                        code: department.code,
                        personIdP: department.propietary?.personId ? department.propietary.personId : null,
                        fullNameP: department.propietary?.personId
                            ? `${department.propietary.name} ${department.propietary.lastName}`
                            : "NO ASIGNADO",
                        personIdR:department.resident?.personId ? department.resident.personId : null,
                        fullNameR: department.resident?.personId
                            ? `${department.resident.name} ${department.resident.lastName}`
                            : "NO ASIGNADO",
                        active: department.active
                    };
                }));
            }
        } catch (error) {
            console.error("Error al verificar el rol o realizar la solicitud", error);
        }
    };


    const deleteDepartment = async (idDepartmentToDelete) =>{
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener ejecución si no hay token
        }

        try {

            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');


            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener ejecución si no es ROLE_ADMIN
            }

            console.log(idDepartmentToDelete);
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/departments/${idDepartmentToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAllDepartments(allDepartments.filter(department => department.departmentId !== idDepartmentToDelete));
        } catch (error) {
            console.error("Error al eliminar el departamento", error);
            alert("Ocurrió un error al intentar eliminar el departamento.");
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

    const handleOpenDniDialog = () => {
        setOpenDniDialog(true);
    }

    const handlePersonChange = (_, newValue) => {
        if (typeof newValue === "string") {
            // Si el usuario escribe algo que no existe, permitir creación
            setSelectedPerson({ fullName: newValue, personId: null });
        } else if (newValue?.personId) {
            // Si elige una persona existente, guardar su ID en departmentInfo
            setSelectedPerson(newValue);
            setDepartmentInfo((prev) => ({
                ...prev,
                propietary: { personId: newValue.personId },
            }));
        } else {
            // Si elige "Ningún propietario" (null), establecer propietario en null
            setSelectedPerson(null);
            setDepartmentInfo((prev) => ({
                ...prev,
                propietary: null, // Dejarlo como null en lugar de { personId: "" }
            }));
        }
    };

    useEffect(() => {
        if (newPersonDpto) {
            handlePersonCreated(newPersonDpto);
        }
    }, [newPersonDpto]);

    const handlePersonCreated = (newPerson) => {
        setSelectedPerson(newPerson);
        setDepartmentInfo((prev) => ({
            ...prev,
            propietary: { personId: newPerson.personId },
        }));
    };

    useEffect(() => {
        if (newResidentDpto) {
            handleResidentCreated(newResidentDpto);
        }
    }, [newResidentDpto]);

    const handleResidentCreated = (newResident) => {
        setSelectedResident(newResident);
        setDepartmentInfo((prev) => ({
            ...prev,
            resident: { personId: newResident.personId },
        }));
    };

    const handleResidentChange = (_, newValue) => {
        if (typeof newValue === "string") {
            // Si el usuario escribe algo que no existe, permitir creación
            setSelectedResident({ fullName: newValue, personId: null });
        } else if (newValue?.personId) {
            // Si elige una persona existente, guardar su ID en departmentInfo
            setSelectedResident(newValue);
            setDepartmentInfo((prev) => ({
                ...prev,
                resident: { personId: newValue.personId },
            }));
        } else {
            // Si elige "Ningún residente" (null), establecer residente en null
            setSelectedResident(null);
            setDepartmentInfo((prev) => ({
                ...prev,
                resident: null, // Ahora es null en vez de { personId: "" }
            }));
        }
    };

    return (
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
                    Departamentos del Consorcio {consortiumName} {/* Aquí mostramos el nombre del consorcio */}
                </Typography>

                        <Grid item xs={2.26}>
                            <Card
                                sx={{
                                    height: 135,
                                    maxHeight: 150,
                                    minWidth: 250,
                                    borderRadius: 3, // Bordes redondeados
                                    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
                                    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)",
                                    },
                                    backgroundColor: "white",
                                    textAlign: "center",
                                    p: 0,

                                }}
                            >
                                <CardContent>
                                    {/* Ícono y Título */}
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 1 }}>
                                        <ApartmentIcon  sx={{ fontSize: 30, color: "#003366" }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#003366" }}>
                                            Unidades Funcionales
                                        </Typography>
                                    </Box>

                                    {/* Valores con Descripción */}
                                    <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                                        {/* Creadas */}
                                        <Box sx={{ textAlign: "center" }}>
                                            <Typography variant="h5" >
                                                {totalDepartments}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Creadas
                                            </Typography>
                                        </Box>

                                        {/* Separador */}
                                        <Typography variant="h6" >
                                            /
                                        </Typography>

                                        {/* Permitidas */}
                                        <Box sx={{ textAlign: "center" }}>
                                            <Typography variant="h5">
                                                {aConsortiumByIdConsortium.functionalUnits}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Permitidas
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: '1100px',
                                marginLeft: { xs: '40px', sm: '80px' },
                            }}
                        >
                            {/* Tabla de resumen */}
                            <Box sx={{ flexGrow: 1, p: 3 }}>
                                <Grid container spacing={2}>
                                    {/* PENDING Card */}
                                    <Grid item xs={3}>
                                        <Card
                                            sx={{
                                                maxHeight: 115,
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
                                                        <ApartmentIcon   sx={{ color: 'info.main' }} />
                                                        <Typography
                                                            variant="subtitle1"
                                                            color="info.main"
                                                            sx={{ fontWeight: 'bold' }}
                                                        >
                                                            OCUPADOS
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        CANTIDAD
                                                    </Typography>
                                                    <Typography variant="h5" component="div">
                                                        {departmentStats.occupied}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* En Revisión Card */}
                                    <Grid item xs={3}>
                                        <Card
                                            sx={{
                                                maxHeight: 115,
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
                                                        <MeetingRoomIcon sx={{ color: 'warning.main' }} />
                                                        <Typography
                                                            variant="subtitle1"
                                                            color="warning.main"
                                                            sx={{ fontWeight: 'bold' }}
                                                        >
                                                            LIBRES
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        CANTIDAD
                                                    </Typography>
                                                    <Typography variant="h5" component="div">
                                                        {departmentStats.free}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* PAGADAS Card */}
                                    <Grid item xs={3}>
                                        <Card
                                            sx={{
                                                maxHeight: 115,
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
                                                        <HomeWorkIcon  sx={{ color: green[700] }} />
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{ fontWeight: 'bold', color: green[700] }}
                                                        >
                                                            SIN PROPIETARIOS
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        CANTIDAD
                                                    </Typography>
                                                    <Typography variant="h5" component="div">
                                                        {departmentStats.onlyResident}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={3}>
                                        <Card
                                            sx={{
                                                maxHeight: 115,
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
                                                        <HomeWorkIcon sx={{ color: deepPurple[500] }} />
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{ fontWeight: 'bold', color: deepPurple[500]  }}
                                                        >
                                                            SIN RESIDENTES
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        CANTIDAD
                                                    </Typography>
                                                    <Typography variant="h5" component="div">
                                                        {departmentStats.onlyOwner}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                </Grid>
                            </Box>
                        </Box>

                        {/* Filtros */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '16px',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                width: '100%',
                                maxWidth: '800px',
                            }}
                        >

                            <TextField
                                label="Identificación"
                                variant="outlined"
                                size="small"
                                value={departmentCode}
                                onChange={(e) => setDepartmentCode(e.target.value)}
                                sx={{
                                    ...textFieldStyles,
                                    flex: 1, // Esto asegura que los inputs se distribuyan uniformemente en el espacio disponible
                                }}
                            />

                            <TextField
                                label="Propietario"
                                variant="outlined"
                                size="small"
                                value={proprietor}
                                onChange={(e) => setProprietor(e.target.value)}
                                sx={{
                                    ...textFieldStyles,
                                    flex: 1,
                                }}
                            />

                            <TextField
                                label="Residente"
                                variant="outlined"
                                size="small"
                                value={resident}
                                onChange={(e) => setResident(e.target.value)}
                                sx={{
                                    ...textFieldStyles,
                                    flex: 1,
                                }}
                            />
                        </Box>

                {/* Botones */}
                <Box
                    sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                }}
                >
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#B2675E', // Color personalizado
                            color: '#FFFFFF',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: '30px', // Bordes redondeados
                            padding: '10px 20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra para efecto de profundidad
                            transition: 'all 0.3s ease', // Transición suave
                            '&:hover': {
                                backgroundColor: '#A15D50', // Cambio de color al pasar el cursor
                                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)', // Sombra más prominente
                            },
                            '&:active': {
                                backgroundColor: '#8A4A3D', // Cambio de color cuando se presiona
                            },
                        }}
                        onClick={getAllDepartmentsByFilter}
                        startIcon={<SearchIcon />} // Icono dentro del botón
                    >
                        Buscar
                    </Button>
                    <AdminCreateDepartment/>
                </Box>
                        {/* Tabla */}
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
                                    <TableRow>
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
                                        <TableCell
                                            align="center"
                                            sx={{
                                                ...tableHeadCellStyles,
                                            }}
                                        >
                                            Estado
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                ...tableHeadCellStyles,
                                                borderTopRightRadius: '10px', // Redondeo solo en la celda "Acciones"
                                            }}
                                        >
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allDepartments
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((department) => {
                                            return (
                                                <TableRow hover
                                                          key={department.departmentId}
                                                          sx={{
                                                              backgroundColor: '#FFFFFF',
                                                              '&:hover': { backgroundColor: '#F6EFE5' },
                                                          }}
                                                >
                                                    {columns.map((column) => {
                                                        const value = department[column.id];
                                                        const isNotAssigned = value === "NO ASIGNADO"
                                                        return (
                                                            <TableCell
                                                                key={column.id}
                                                                align={column.align}
                                                                sx={{ ...tableCellStyles,
                                                                    fontWeight: isNotAssigned ? "bold" : "normal"}}
                                                            >
                                                                {value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell align="center" sx={tableCellStyles}>
                                                        <Chip
                                                            label={department.active ? 'Habilitado' : 'Inhabilitado'}
                                                            color={department.active ? 'success' : 'default'}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                bgcolor: department.active ? '#c8f7c5' : '#f0f0f0',
                                                                color: department.active ? '#028484' : '#999',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center" sx={tableCellStyles}>
                                                        <IconButton
                                                            aria-label="edit"
                                                            onClick={() =>
                                                            handleClickOpenEdit(
                                                                department.departmentId,
                                                                department.code,
                                                                department.personIdP,
                                                                department.personIdR,
                                                                department.active)}
                                                            sx={{ color: '#002776' }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="delete"
                                                            onClick={() => handleClickOpen(department.departmentId)}
                                                            sx={{ color: '#B2675E' }}
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
                            rowsPerPageOptions={[5]}
                            component="div"
                            count={allDepartments.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página"
                            sx={{ backgroundColor: '#FFFFFF', color: '#002776', fontWeight: 'bold' }}
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
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                        backgroundColor: '#E5E5E5',
                        color: '#002776',
                        textAlign: 'center',
                        padding: '20px 30px',
                        borderBottom: '2px solid #028484',
                        fontWeight: 'bold',
                    }}
                >
                    {"Desea eliminar este Departamento?"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <DialogContentText id="alert-dialog-description">
                        Si acepta, se eliminará el usuario deseado.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        sx={{
                            backgroundColor: '#B2675E',
                            '&:hover': {
                                backgroundColor: '#8E5346',
                            },
                            borderRadius: '25px',
                            padding: '8px 20px',
                            transition: 'background-color 0.3s ease',
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#028484',
                            '&:hover': {
                                backgroundColor: '#026F6B',
                            },
                            borderRadius: '25px',
                            padding: '8px 20px',
                            transition: 'background-color 0.3s ease',
                        }}
                        onClick={() => {
                            deleteDepartment(idPersonCreated);
                            handleClose();
                        }}
                    >
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Dialogo de edición */}
            <Dialog
                open={openEdit}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleCloseEdit();
                    }
                }}
                fullWidth
                maxWidth="sm" // Fija el ancho del diálogo, puedes ajustar a "sm", "md", "lg" según necesidad
                sx={{
                    "& .MuiDialog-paper": {
                        minHeight: "100px",  // Altura mínima para evitar cambios
                        maxHeight: "400px",  // Evita que crezca demasiado
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: '#E5E5E5',
                        color: '#002776',
                        textAlign: 'center',
                        padding: '20px 30px',
                        borderBottom: '2px solid #028484',
                        fontWeight: 'bold',
                    }}
                >
                    Actualizar Información
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#F2F2F2', marginTop: '10px' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Identificación"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="code"
                                        value={departmentInfo.code || ''}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
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
                                                color: '#028484',
                                            },
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs>
                                            <Autocomplete
                                                freeSolo
                                                options={[{ personId: null, fullName: "NO ASIGNADO" }, ...allPersons]}
                                                getOptionLabel={(option) => option.fullName || ""}
                                                value={allPersons.find((person) => person.personId === departmentInfo.propietary?.personId) || { personId: null, fullName: "NO ASIGNADO" }}
                                                onChange={(event, newValue) => {
                                                    handlePersonChange(event, newValue?.personId ? newValue : null);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Propietario"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                "& fieldset": { borderColor: '#028484' },
                                                                "&:hover fieldset": { borderColor: '#028484' },
                                                                "&.Mui-focused fieldset": { borderColor: '#028484' },
                                                            },
                                                            "& label.Mui-focused": { color: '#028484' },
                                                        }}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <PersonOutlineOutlinedIcon sx={{ color: '#028484' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        fullWidth
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                color="primary"
                                                onClick={() =>{
                                                    handleOpenDniDialog()
                                                    setPersonCreationType("owner")}}
                                                sx={{ color: "#002776" }}
                                            >
                                                <PersonAddIcon fontSize="medium" />
                                            </IconButton>
                                            <AdminCreatePerson/>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12} sm={8}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs>
                                            <Autocomplete
                                                freeSolo
                                                options={[{ personId: null, fullName: "NO ASIGNADO" }, ...allPersons]} // Agrega opción null
                                                getOptionLabel={(option) => option.fullName || ""}
                                                value={allPersons.find((person) => person.personId === departmentInfo.resident?.personId) || { personId: null, fullName: "NO ASIGNADO" }}
                                                onChange={(event, newValue) => {
                                                handleResidentChange(event, newValue?.personId ? newValue : null); // Si es null, actualiza residente a null
                                            }}
                                                renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Residente"
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            "& fieldset": { borderColor: '#028484' },
                                                            "&:hover fieldset": { borderColor: '#028484' },
                                                            "&.Mui-focused fieldset": { borderColor: '#028484' },
                                                        },
                                                        "& label.Mui-focused": { color: '#028484' },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PersonOutlineOutlinedIcon sx={{ color: '#028484' }} />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    fullWidth
                                                />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                color="primary"
                                                onClick={() =>{
                                                    handleOpenDniDialog()
                                                    setPersonCreationType("resident")}}
                                                sx={{ color: "#002776" }}
                                            >
                                                <PersonAddIcon fontSize="medium" />
                                            </IconButton>
                                            <AdminCreatePerson/>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sm={4} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    minHeight: '40px',
                                    paddingLeft: 1,
                                }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: '#F2F2F2',
                                            borderRadius: '12px',
                                            paddingX: 2, // horizontal padding
                                            height: '40px', // igual o similar a la altura del botón
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    name= "active"
                                                    checked={departmentInfo.active}
                                                    onChange={handleChange}
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: '#028484',
                                                            '& + .MuiSwitch-track': {
                                                                backgroundColor: '#028484',
                                                                opacity: 0.5,
                                                            },
                                                        },
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography
                                                    variant="body2" // O "subtitle2" si quieres un poco más de énfasis
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#002776',
                                                        marginRight: 1,
                                                    }}
                                                >
                                                    HABILITAR
                                                </Typography>
                                            }
                                            labelPlacement="start" // El texto "HABILITAR" estará a la izquierda del switch
                                            sx={{
                                                margin: 0,
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button
                        onClick={handleCloseEdit}
                        variant="contained"
                        sx={{
                            backgroundColor: '#B2675E',
                            '&:hover': {
                                backgroundColor: '#8E5346',
                            },
                            borderRadius: '25px',
                            padding: '8px 20px',
                            transition: 'background-color 0.3s ease',
                        }}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            backgroundColor: '#028484',
                            '&:hover': {
                                backgroundColor: '#026F6B',
                            },
                            borderRadius: '25px',
                            padding: '8px 20px',
                            transition: 'background-color 0.3s ease',
                        }}
                        disabled={loading}
                    >
                        Guardar

                    </Button>
                </DialogActions>
                {loading && (
                    <Backdrop
                        open={true}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                    >
                        <CircularProgress color="primary" />
                    </Backdrop>
                )}
            </Dialog>
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={departmentUpdate ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default AdminDepartmentManagement
