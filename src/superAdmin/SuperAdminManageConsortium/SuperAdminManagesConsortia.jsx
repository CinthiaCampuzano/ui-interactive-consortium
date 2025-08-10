import {
    Alert, Backdrop,
    Box, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, FormControlLabel, Grid, Radio, RadioGroup, Snackbar,
    TablePagination,
    TextField
} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from "@mui/material/IconButton";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Button from "@mui/material/Button";
import SuperAdminCreateConsortium from "./SuperAdminCreateConsortium.jsx";
import MenuItem from "@mui/material/MenuItem";
import {SuperAdminManageConsortiumContext} from "./SuperAdminManageConsortiumContext.jsx";
import Typography from "@mui/material/Typography";
import {jwtDecode} from "jwt-decode";
import SearchIcon from '@mui/icons-material/Search';
import SuperAdminSidebar from "../../SuperAdminSidebar.jsx";
import MapComponent from "../../component/MapComponent.jsx";

const MAP_URL = "https://apis.datos.gob.ar/georef/api"

const columns = [
    { id: 'name', label: 'Edificio', minWidth: 100 },
    { id: 'province', label: 'Provincia', minWidth: 100 },
    { id: 'city', label: 'Ciudad', minWidth: 100 },
    { id: 'fullName', label: 'Administrador', minWidth: 100}
];

function SuperAdminManagesConsortia(){
    const {allConsortia, setAllConsortia, allAdministrator, getAllConsortium,
        getAllAdministrator} = useContext(SuperAdminManageConsortiumContext)
    let textFieldRef = React.createRef();
    const [consortiumName, setConsortiumName] = useState('');
    const [consortiumCity, setConsortiumCity] = useState('')
    const [consortiumProvince, setConsortiumProvince] = useState('')
    const [consortiumNameAdmin, setConsortiumNameAdmin] = useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [idConsortiumToDelete, setIdConsortiumToDelete] = useState(null);
    const [editConsortiumId, setEditConsortiumId] = useState(null)
    const [editConsortiumName, setEditConsortiumName ] = useState('')
    const [editConsortiumType, setEditConsortiumType ] = useState('')
    const [editFunctionalUnits, setEditFunctionalUnits ] = useState('')
    const [editFloors, setEditFloors ] = useState('')
    const [editApartmentsPerFloor, setEditApartmentsPerFloor ] = useState('')
    const [editConsortiumAddress, setEditConsortiumAddress] = useState('')
    const [editConsortiumCity, setEditConsortiumCity] = useState('')
    const [editConsortiumProvince, setEditConsortiumProvince ] = useState('')
    const [editConsortiumAdministratorId, setEditConsortiumAdministratorId] = useState(null)
    const [text, setText] = useState('')
    const [provinces, setProvinces] = useState('')
    const [cities, setCities] = useState('')
    const [loading, setLoading] = useState(false);
    const [isFormWellComplete, setIsFormWellComplete] = useState(false);
    const [errors, setErrors] = useState({
        address: false,
        province: false
    })
    const [consortiumInfo, setConsortiumInfo] = useState({
        consortiumId: null,
        name: "",
        consortiumType: '',
        functionalUnits: 0,
        floors: 0,
        apartmentsPerFloor: 0,
        address: "",
        city: "",
        province: '',
        administrator: {
            administratorId: null,
        }})
    const [consortiumCreated, setConsortiumCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)

    const ERROR_TYPES = {
        REQUIRED: 'REQUIRED',
        INVALID_FORMAT: 'INVALID_FORMAT',
        POSITIVE_NUMBER: 'POSITIVE_NUMBER',
        FU_CAPACITY_EXCEEDED: 'FU_CAPACITY_EXCEEDED',
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const validateFields = () => {
        const newErrors = {};
        const {
            name,
            consortiumType,
            functionalUnits,
            province,
            city,
            address
        } = consortiumInfo;

        const addressRegex = /^[A-Za-z\s]+\s\d+$/;
        const provinceRegex = /^[A-Za-zÀ-ÿ\s]+$/;
        const getTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');


        if (getTrimmedString(name) === '') {
            newErrors.name = ERROR_TYPES.REQUIRED;
        }

        const currentConsortiumType = getTrimmedString(consortiumType);
        if (currentConsortiumType === '') {
            newErrors.consortiumType = ERROR_TYPES.REQUIRED;
        }

        const numFunctionalUnits = Number(functionalUnits);
        if (isNaN(numFunctionalUnits) || numFunctionalUnits <= 0) {
            newErrors.functionalUnits = ERROR_TYPES.POSITIVE_NUMBER;
        }

        const trimmedProvince = getTrimmedString(province);
        if (trimmedProvince === '') {
            newErrors.province = ERROR_TYPES.REQUIRED;
        } else if (!provinceRegex.test(trimmedProvince)) {
            newErrors.province = ERROR_TYPES.INVALID_FORMAT;
        }

        if (getTrimmedString(city) === '') {
            newErrors.city = ERROR_TYPES.REQUIRED;
        }

        const trimmedAddress = getTrimmedString(address);
        if (trimmedAddress === '') {
            newErrors.address = ERROR_TYPES.REQUIRED;
        } else if (!addressRegex.test(trimmedAddress)) {
            newErrors.address = ERROR_TYPES.INVALID_FORMAT;
        }

        setErrors(newErrors);
        return newErrors;
    };

    const areFieldsComplete = () => {
        const {
            name,
            administrator,
            consortiumType,
            functionalUnits,
            province,
            city,
            address
        } = consortiumInfo;

        console.log(consortiumInfo.name)

        if (!name || !administrator?.administratorId || !consortiumType || !functionalUnits || !province || !city || !address) {
            return false;
        }

        return true;
    };

    useEffect(() => {
        setIsFormWellComplete(areFieldsComplete());
    }, [consortiumInfo]);

    const fetchProvinces = async () => {
        const response = await fetch(
            `${MAP_URL}/provincias?&max=100`
        );
        const data = await response.json();

        let fetchedProvinces = data?.provincias
            .map(provincia => ({
                provinceId: provincia.nombre,
                provinceName: provincia.nombre
            }))
            .sort((a, b) => a.provinceName.localeCompare(b.provinceName));
        setProvinces(fetchedProvinces);
    };

    useEffect(() => {
        fetchProvinces();
    }, [])

    useEffect(() => {
        if (consortiumInfo?.province) {
            getAllCities(consortiumInfo.province)
        }
    }, [consortiumInfo.province]);

    const getAllCities = async (provinceId) => {
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // No continúa si no hay token
        }

        try {
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para acceder a esta página.");
                return; // No continúa si no es SuperAdmin
            }

            const res = await axios.get(`${MAP_URL}/departamentos?provincia=${provinceId}&max=200`, {
                headers: {
                    Authorization: `Bearer ${token}` // Se incluye el token en el encabezado de la solicitud
                }
            });

            const cities = res.data;
            setCities(
                res.data.departamentos
                    .map(city => ({
                        cityId: city.nombre,
                        cityName: city.nombre
                    }))
                    .sort((a, b) => a.cityName.localeCompare(b.cityName))
            );
        } catch (error) {
            console.error("Error al obtener las ciudades:", error);
            alert("Ocurrió un error al obtener las ciudades. Intenta nuevamente.");
        }
    };

    const handleClickOpen = (idConsortiumToDelete) => {
        setIdConsortiumToDelete(idConsortiumToDelete)
        setOpen(true)
    };
    const handleClickOpenEdit = (idConsortiumToEdit, consortiumNameEdit, consortiumTypeEdit, functionalUnitsEdit, floorsEdit, apartmentsPerFloorEdit, consortiumAddressEdit, consortiumCityEdit, consortiumProvinceEdit, administratorIdEdit) => {
        setEditConsortiumId(idConsortiumToEdit)
        setEditConsortiumName(consortiumNameEdit)
        setEditConsortiumType(consortiumTypeEdit)
        setEditFunctionalUnits(functionalUnitsEdit)
        setEditFloors(floorsEdit)
        setEditApartmentsPerFloor(apartmentsPerFloorEdit)
        setEditConsortiumAddress(consortiumAddressEdit)
        setEditConsortiumCity(consortiumCityEdit)
        setEditConsortiumProvince(consortiumProvinceEdit)
        setEditConsortiumAdministratorId(administratorIdEdit)
        getAllAdministrator()
        setOpenEdit(true);
    }

    const handleClose = () => {
        setOpen(false)
        setIdConsortiumToDelete(null)
    };
    const handleCloseEdit = () => {

        setOpenEdit(false)
        setErrors({
            address: false,
            province: false
        })
        setConsortiumInfo({
            consortiumId: null,
            name: "",
            consortiumType: '',
            functionalUnits: 0,
            floors: 0,
            apartmentsPerFloor: 0,
            address: "",
            city: "",
            province: "",
            administrator: {
                administratorId: null,
            }
        })
    }

    const handleProvinceChange = (event) => {
        const {name, value} = event.target;

        setConsortiumInfo(prevState => ({
            ...prevState,
            province: value
        }));
    }

    const handleCityChange = (event) => {
        const { name, value } = event.target

        setConsortiumInfo(prevState => ({
            ...prevState,
            city: {id: value}
        }));
    }


    useEffect(() => {
        if (consortiumName === '' && consortiumCity === '' && consortiumProvince === '' && consortiumNameAdmin === '') {
            getAllConsortium()
        }
    }, [consortiumName, consortiumCity, consortiumProvince, consortiumNameAdmin]);


    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false)
    };

    useEffect(() => {
        if (openEdit) {
            const consortium = {
                consortiumId: editConsortiumId,
                name: editConsortiumName || "",
                consortiumType: editConsortiumType || "",
                functionalUnits: editFunctionalUnits || "",
                floors: editFloors || 0,
                apartmentsPerFloor: editApartmentsPerFloor || 0,
                address: editConsortiumAddress || "",
                city: editConsortiumCity || "",
                province: editConsortiumProvince || "",
                administrator: {
                    administratorId: editConsortiumAdministratorId || ""
                }
            };
            setConsortiumInfo(consortium);
        }
    }, [openEdit, editConsortiumId, editConsortiumName, editConsortiumType, editFunctionalUnits, editFloors, editApartmentsPerFloor, editConsortiumAddress, editConsortiumCity, editConsortiumProvince, editConsortiumAdministratorId]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "administratorId") {
            setConsortiumInfo(prevState => ({
                ...prevState,
                administrator: {
                    ...prevState.administrator,
                    administratorId: value
                }
            }));
        } else {
            setConsortiumInfo(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            setText("No estás autorizado. Por favor, inicia sesión.");
            handleOpenAlert();
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                setText("No tienes permisos para realizar esta acción.");
                handleOpenAlert();
                return;
            }

            const validationErrors = validateFields();
            const formIsValid = Object.keys(validationErrors).length === 0;

            if (formIsValid) {
                let url = `${import.meta.env.VITE_API_BASE_URL}/consortiums`;
                try {
                    setLoading(true);

                    await axios.put(url, consortiumInfo, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setText('Se realizó la modificación correctamente');
                    setConsortiumCreated(true);
                    handleCloseEdit();
                } catch (exception) {
                    setConsortiumCreated(false);
                    let errorText = 'No se realizó la modificación, error de datos!';
                    if (exception.response?.status === 404) {
                        errorText = 'No se encontró el consorcio a modificar o el administrador no es válido.';
                    }
                    setText(errorText);
                } finally {
                    handleOpenAlert();
                    getAllConsortium();
                }

            } else {
                setConsortiumCreated(false);
                console.warn('Formulario inválido. Errores detectados:', validationErrors);

                if (validationErrors.functionalUnits === ERROR_TYPES.FU_CAPACITY_EXCEEDED) {
                    setText("Error: La multiplicación de pisos por departamentos no puede superar el total de unidades funcionales.");
                } else {
                    setText('Por favor, corrige los errores indicados en el formulario.');
                }
                handleOpenAlert();
            }
        } catch (error) { // Captura errores de jwtDecode u otros síncronos
            setConsortiumCreated(false);
            console.error("Error durante la preparación del envío o validación del token:", error);
            setText(`Ocurrió un error: ${error.message || "Por favor, inténtalo nuevamente."}`);
            handleOpenAlert();
        } finally {
            setLoading(false);
        }
    };



    const getAllConsortiumByFilter = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return;
            }
            const handleEmptyValues = (value) => {
                return value === '' ? null : value;
            };

            const name = handleEmptyValues(consortiumName);
            const city = handleEmptyValues(consortiumCity);
            const province = handleEmptyValues(consortiumProvince);
            const adminName = handleEmptyValues(consortiumNameAdmin);

            let params = {};
            if (name !== null) params.name = name;
            if (city !== null) params.city = city;
            if (province !== null) params.province = province;
            if (adminName !== null) params.adminName = adminName;

            if (Object.keys(params).length === 0) {
                getAllConsortium();
            } else {
                const queryParams = new URLSearchParams(params).toString();
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/consortiums/filterBy?${queryParams}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const consortiums = res.data.content;

                setAllConsortia(
                    consortiums.map(consortium => {
                        const administrator = consortium.administrator || {};
                        return {
                            consortiumId: consortium.consortiumId,
                            name: consortium.name,
                            address: consortium.address,
                            city: consortium.city,
                            province: consortium.province,
                            functionalUnits: consortium.functionalUnits,
                            consortiumType: consortium.consortiumType,
                            administratorId: administrator.administratorId || '',
                            fullName: administrator.name && administrator.lastName
                                ? `${administrator.name} ${administrator.lastName}`
                                : ''
                        };
                    })
                );
            }
        } catch (error) {
            console.error("Error al validar el usuario o procesar la solicitud:", error);
            alert("Ocurrió un error. Por favor, inténtalo nuevamente.");
        }
    }

    const deleteConsortium = async (idConsortiumToDelete) =>{
        setLoading(true);
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            setText("No estás autorizado. Por favor, inicia sesión.");
            handleOpenAlert();
            setLoading(false);
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                setText("No tienes permisos para realizar esta acción.");
                handleOpenAlert();
                setLoading(false);
                return;
            }
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/consortiums/${idConsortiumToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Incluye el token en la solicitud
                    }
                }
            );

            setAllConsortia(allConsortia.filter(consortium => consortium.consortiumId !== idConsortiumToDelete));
            setConsortiumCreated(true);
            setText("Consorcio eliminado correctamente.");
            handleOpenAlert();
        } catch (error) {
            setConsortiumCreated(false);
            console.error("Error al eliminar el consorcio:", error);
            setText("Ocurrió un error al intentar eliminar el consorcio. Por favor, inténtalo nuevamente.");
            handleOpenAlert();
        } finally {
            setLoading(false);
            handleClose();
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

    return (
        <div>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                }}
            >
                <SuperAdminSidebar/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        padding: {xs: '16px', sm: '24px'},
                        marginLeft: {xs: 0, sm: '240px'},
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
                        <Typography
                            variant="h6"
                            component="h1"
                            sx={{
                                fontWeight: 'bold',
                                color: '#003366',
                                fontSize: {xs: '1.5rem', md: '2rem'},
                                marginBottom: '20px',
                            }}
                        >
                            Consorcios
                        </Typography>

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
                                label="Nombre"
                                variant="outlined"
                                size="small"
                                value={consortiumName}
                                onChange={(e) => setConsortiumName(e.target.value)}
                                sx={{
                                    ...textFieldStyles,
                                    flex: 1,
                                }}
                            />
                            <TextField
                                label="Provincia"
                                variant="outlined"
                                size="small"
                                value={consortiumProvince.id}
                                onChange={(e) => setConsortiumProvince(e.target.value)}
                                sx={{
                                    ...textFieldStyles,
                                    flex: 1,
                                }}
                            />
                            <TextField
                                label="Ciudad"
                                variant="outlined"
                                size="small"
                                value={consortiumCity.id}
                                onChange={(e) => setConsortiumCity(e.target.value)}
                                sx={{
                                    ...textFieldStyles,
                                    flex: 1,
                                }}
                            />
                            <TextField
                                label="Administrador"
                                variant="outlined"
                                size="small"
                                value={consortiumNameAdmin}
                                onChange={(e) => setConsortiumNameAdmin(e.target.value)}
                                sx={{
                                    ...textFieldStyles,
                                    flex: 1,
                                }}
                            />
                        </Box>
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
                                    backgroundColor: '#B2675E',
                                    color: '#FFFFFF',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    borderRadius: '30px',
                                    padding: '10px 20px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#A15D50',
                                        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)',
                                    },
                                    '&:active': {
                                        backgroundColor: '#8A4A3D',
                                    },
                                }}
                                onClick={getAllConsortiumByFilter}
                                startIcon={<SearchIcon/>}
                            >
                                Buscar
                            </Button>
                            <SuperAdminCreateConsortium/>
                        </Box>

                        {/* Tabla */}
                        <Box sx={{width: '100%', maxWidth: '900px', marginLeft: {xs: '40px', sm: '80px'}}}>
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
                                                        ...(index === 0 && {
                                                            borderTopLeftRadius: '10px',
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
                                                    borderTopRightRadius: '10px',
                                                }}
                                            >

                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allConsortia
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((consortium) => (
                                                <TableRow
                                                    hover
                                                    key={consortium.name}
                                                    sx={{
                                                        backgroundColor: '#FFFFFF',
                                                        '&:hover': {backgroundColor: '#F6EFE5'},
                                                    }}
                                                >
                                                    {columns.map((column) => (
                                                        <TableCell
                                                            key={column.id}
                                                            align={column.align}
                                                            sx={{...tableCellStyles}}
                                                        >
                                                            {consortium[column.id]}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell align="center" sx={tableCellStyles}>
                                                        <IconButton
                                                            aria-label="edit"
                                                            onClick={() =>
                                                                handleClickOpenEdit(
                                                                    consortium.consortiumId,
                                                                    consortium.name,
                                                                    consortium.consortiumType,
                                                                    consortium.functionalUnits,
                                                                    consortium.floors,
                                                                    consortium.apartmentsPerFloor,
                                                                    consortium.address,
                                                                    consortium.city,
                                                                    consortium.province,
                                                                    consortium.administratorId
                                                                )
                                                            }
                                                            sx={{color: '#002776'}}
                                                        >
                                                            <EditIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            aria-label="delete"
                                                            onClick={() => handleClickOpen(consortium.consortiumId)}
                                                            sx={{color: '#B2675E'}}
                                                        >
                                                            <DeleteIcon fontSize="small"/>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5]}
                                component="div"
                                count={allConsortia.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Filas por página"
                                sx={{backgroundColor: '#FFFFFF', color: '#002776', fontWeight: 'bold'}}
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
                <DialogTitle id="alert-dialog-title" sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>
                    {"Desea eliminar este Consorcio ?"}
                </DialogTitle>
                <DialogContent sx={{backgroundColor: '#F9F9F9'}}>
                    <DialogContentText id="alert-dialog-description">
                        Si acepta se eliminará el consorcio deseado.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{backgroundColor: '#F9F9F9', padding: '10px 20px'}}>
                    <Button onClick={handleClose} variant="contained" sx={{
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
                    <Button variant="contained" sx={{
                        backgroundColor: '#028484',
                        '&:hover': {
                            backgroundColor: '#026F6B',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }} onClick={() => {
                        deleteConsortium(idConsortiumToDelete)
                    }}
                            disabled={loading}
                    >
                        Aceptar
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
            <Dialog
                open={openEdit}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleCloseEdit();
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>Actualizar Consorcio</DialogTitle>
                <DialogContent sx={{backgroundColor: '#F9F9F9'}}>
                    <Paper elevation={3} sx={{padding: 4, backgroundColor: '#F2F2F2', marginTop: '10px'}}>
                        <Box component="form" onSubmit={handleSubmit} sx={{mt: 2}}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Nombre"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="name"
                                        value={consortiumInfo.name !== undefined ? consortiumInfo.name : editConsortiumName || ''}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 50 }}
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
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Seleccione un Administrador"
                                        variant="outlined"
                                        size="small"
                                        name="administratorId"
                                        value={consortiumInfo.administrator?.administratorId || ""}
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
                                                color: '#028484',
                                            },
                                        }}
                                        fullWidth
                                    >
                                        {allAdministrator?.map(administrator => (
                                            <MenuItem key={administrator.administratorId}
                                                      value={administrator.administratorId}>
                                                {administrator.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box>
                                        <RadioGroup
                                            row
                                            name="consortiumType"
                                            value={consortiumInfo.consortiumType || ''}
                                        >
                                            <FormControlLabel
                                                value="BUILDING"
                                                control={
                                                <Radio
                                                    disabled={true}
                                                    sx={{color: '#028484', '&.Mui-checked': {color: '#028484'}}}/>}
                                                label="Edificio"
                                            />
                                            <FormControlLabel
                                                value="NEIGHBORHOOD"
                                                control={
                                                <Radio
                                                    disabled={true}
                                                    sx={{color: '#028484', '&.Mui-checked': {color: '#028484'}}}/>}
                                                label="Barrio Privado"
                                            />
                                        </RadioGroup>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Total de Unidades Funcionales"
                                        variant="outlined"
                                        size="small"
                                        type="number"
                                        name="functionalUnits"
                                        value={consortiumInfo.functionalUnits}
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
                                                color: '#028484',
                                            },
                                        }}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Seleccione una Provincia"
                                        variant="outlined"
                                        size="small"
                                        name="state"
                                        value={consortiumInfo.province || ''}
                                        onChange={handleProvinceChange}
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
                                    >

                                        {provinces ? provinces.map(province => (
                                            <MenuItem key={province.provinceId} value={province.provinceId}>
                                                {province.provinceName}
                                            </MenuItem>
                                        )) : (
                                            <MenuItem disabled>No hay provincias disponibles</MenuItem>
                                        )}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Seleccione una Ciudad"
                                        variant="outlined"
                                        size="small"
                                        name="city"
                                        value={consortiumInfo?.city || ''}
                                        onChange={handleCityChange}
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
                                    >
                                        {cities ? cities.map(city => (
                                            <MenuItem key={city.cityId} value={city.cityId}>
                                                {city.cityName}
                                            </MenuItem>
                                        )) : (
                                            <MenuItem disabled>No hay provincias disponibles</MenuItem>
                                        )}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Dirección"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="address"
                                        value={consortiumInfo.address !== undefined ? consortiumInfo.address : editConsortiumAddress || ''}
                                        onChange={handleChange}
                                        inputProps={{ maxLength: 50 }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.address ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.address ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.address ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: errors.address ? 'red' : '#002776',
                                            },
                                        }}
                                        error={errors.address}
                                        helperText={errors.address ? 'EL formato de la dirección es: Nombre de la calle + número' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {true ?
                                        <MapComponent
                                            provincia={consortiumInfo.province}
                                            departamento={consortiumInfo.city}
                                            direccion={consortiumInfo.address}
                                        />
                                        : <></>
                                    }
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{backgroundColor: '#F9F9F9', padding: '10px 20px'}}>
                    <Button onClick={handleCloseEdit} variant="contained" sx={{
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
                    <Button type="submit" color="primary" onClick={handleSubmit} disabled={!isFormWellComplete || loading}
                            variant="contained"
                            sx={{
                                backgroundColor: '#028484',
                                '&:hover': {
                                    backgroundColor: '#026F6B',
                                },
                                borderRadius: '25px',
                                padding: '8px 20px',
                                transition: 'background-color 0.3s ease',
                            }}>
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
                <Alert onClose={handleCloseAlert} severity={consortiumCreated ? "success" : "error"}
                       sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </div>
    );
}
export default SuperAdminManagesConsortia
