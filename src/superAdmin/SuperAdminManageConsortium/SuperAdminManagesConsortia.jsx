import {
    Alert,
    Box,
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
    // const [allAdministrator , setAllAdministrator] = useState([])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const validateFields = () => {
        const addressRegex = /^[A-Za-z\s]+\s\d+$/;

        setErrors({
            address: !addressRegex.test(consortiumInfo.address),
        })

        return (
            addressRegex.test(consortiumInfo.address)
        )
    }

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
            // Decodifica el token y verifica si tiene el rol de SuperAdmin
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
        handleCloseEdit();
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

        // Verifica si el usuario tiene permisos
        const token = localStorage.getItem('token'); // Obtiene el token almacenado
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detiene la ejecución si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de SuperAdmin
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detiene la ejecución si no es SuperAdmin
            }

            // Continúa con la lógica si el usuario está autorizado
            if (validateFields()) {
                let url = `${import.meta.env.VITE_API_BASE_URL}/consortiums`;

                try {
                    await axios.put(url, consortiumInfo, {
                        headers: {
                            Authorization: `Bearer ${token}` // Incluye el token en la solicitud
                        }
                    });

                    setText('Se realizó la carga correctamente');
                    setConsortiumCreated(true);
                    handleCloseEdit();
                } catch (exception) {
                    setConsortiumCreated(false);
                    switch (exception.response?.status) {
                        case 404:
                            setText('No se encontró el administrador ingresado');
                            break;
                        default:
                            setText('No se realizó la carga, error de datos!!');
                    }
                } finally {
                    handleOpenAlert();
                    getAllConsortium();
                }
            }
        } catch (error) {
            console.error("Error al validar el usuario o procesar la solicitud:", error);
            alert("Ocurrió un error. Por favor, inténtalo nuevamente.");
        }
    };

    const getAllConsortiumByFilter = async () => {
        const token = localStorage.getItem('token'); // Obtiene el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detiene la ejecución si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de SuperAdmin
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detiene la ejecución si no es SuperAdmin
            }

            // Lógica principal de la función
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
                            Authorization: `Bearer ${token}` // Incluye el token en la solicitud
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
                            city: consortium.city.displayName,
                            province: consortium.province.displayName,
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
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detiene la ejecución si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de SuperAdmin
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detiene la ejecución si no es SuperAdmin
            }

            // Continúa con la eliminación si el usuario está autorizado
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/consortiums/${idConsortiumToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}` // Incluye el token en la solicitud
                    }
                }
            );

            // Actualiza la lista de consorcios después de eliminar
            setAllConsortia(allConsortia.filter(consortium => consortium.consortiumId !== idConsortiumToDelete));

            alert("Consorcio eliminado correctamente.");
        } catch (error) {
            console.error("Error al eliminar el consorcio:", error);
            alert("Ocurrió un error al intentar eliminar el consorcio. Por favor, inténtalo nuevamente.");
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
                    minHeight: '100vh', // Asegura que el contenedor ocupe toda la altura de la pantalla
                }}
            >
                <SuperAdminSidebar/>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1, // Permite que este componente ocupe el espacio restante
                        padding: {xs: '16px', sm: '24px'}, // Espaciado variable según el tamaño de la pantalla
                        marginLeft: {xs: 0, sm: '240px'}, // Evita que el contenido se superponga al SuperAdminSidebar
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
                                fontSize: {xs: '1.5rem', md: '2rem'},
                                marginBottom: '20px',
                            }}
                        >
                            Consorcios
                        </Typography>

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
                                label="Nombre"
                                variant="outlined"
                                size="small"
                                value={consortiumName}
                                onChange={(e) => setConsortiumName(e.target.value)}
                                sx={{
                                    ...textFieldStyles,
                                    flex: 1, // Esto asegura que los inputs se distribuyan uniformemente en el espacio disponible
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
                                onClick={getAllConsortiumByFilter}
                                startIcon={<SearchIcon/>} // Icono dentro del botón
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
                                            {columns.map((column, index) => (
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
                                            {/* Solo redondear la celda "Acciones" */}
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
                                                            sx={{...tableCellStyles}} // Las celdas no tienen borderRadius
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
                        Si acepta se eliminara el consorcio deseado.
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
                    }}>Rechazar</Button>
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
                        handleClose()
                    }
                    }>
                        Aceptar
                    </Button>
                </DialogActions>
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
                                                color: '#028484', // Cambia el color del label al enfocarse
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
                                            value={consortiumInfo.consortiumType !== undefined ? consortiumInfo.consortiumType : editConsortiumType || ''}
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel
                                                value="BUILDING"
                                                control={<Radio
                                                    sx={{color: '#028484', '&.Mui-checked': {color: '#028484'}}}/>}
                                                label="Edificio"
                                            />
                                            <FormControlLabel
                                                value="NEIGHBORHOOD"
                                                control={<Radio
                                                    sx={{color: '#028484', '&.Mui-checked': {color: '#028484'}}}/>}
                                                label="Barrio Privado"
                                            />
                                        </RadioGroup>
                                    </Box>
                                </Grid>

                                {/* Input: Total de Unidades Funcionales */}
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

                                {/* Inputs condicionales: Cantidad de pisos y departamentos por piso */}
                                {consortiumInfo.consortiumType === "BUILDING" && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Cantidad de pisos"
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                                name="floors"
                                                value={consortiumInfo.floors}
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
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Cantidad de departamentos por piso"
                                                variant="outlined"
                                                size="small"
                                                type="number"
                                                name="apartmentsPerFloor"
                                                value={consortiumInfo.apartmentsPerFloor}
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
                                    </>
                                )}
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
                                                color: '#028484', // Cambia el color del label al enfocarse
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
                                                color: '#028484', // Cambia el color del label al enfocarse
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
                                                color: errors.address ? 'red' : '#002776', // Cambia el color del label al enfocarse
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
                    }}>
                        Cancelar
                    </Button>
                    <Button type="submit" color="primary" onClick={handleSubmit} disabled={!validateFields}
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