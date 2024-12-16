import {
    Alert,
    Box, Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Grid, Snackbar,
    TablePagination,
    TextField
} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete.js";
import axios from "axios";
import Button from "@mui/material/Button";
import SuperAdminCreateAdministrator from "./SuperAdminCreateAdministrator.jsx";
import EditIcon from "@mui/icons-material/Edit";
import {SuperAdminManagesAdministratorContext} from "./SuperAdminManagesAdministratorContext.jsx";
import Typography from "@mui/material/Typography";
import {jwtDecode} from "jwt-decode";
import SuperAdminSidebar from "../../SuperAdminSidebar.jsx";
import SearchIcon from "@mui/icons-material/Search.js";


const columns = [
    { id: 'name', label: 'Nombre', minWidth: 100 },
    { id: 'lastName', label: 'Apellido', minWidth: 100 },
    { id: 'mail', label: 'Correo Electrónico', minWidth: 100 },
    { id: 'dni', label: 'Dni', minWidth: 100 }
];


function SuperAdminManagesAdministrator(){
    const {allAdministrator, setAllAdministrator, getAllAdministrator} = useContext(SuperAdminManagesAdministratorContext)
    const [administratorName, setAdministratorName] = useState('')
    const [administratorLastName, setAdministratorLastName] = useState('')
    const [administratorMail, setAdministratorMail] = useState('')
    const [administratorDni, setAdministratorDni] = useState('')
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(10)
    const [open, setOpen] = useState(false)
    const [openAlert, setOpenAlert] = useState(false)
    const [idAdministratorCreated, setIdAdministratorCreated] = useState(null)
    const [idAdministratorUpdate, setIdAdministratorUpdate] = useState(null)
    const [openEdit, setOpenEdit] = useState(false)
    const [editAdministratorName, setEditAdministratorName] = useState('')
    const [editAdministratorLastName, setEditAdministratorLastName] = useState('')
    const [editAdministratorMail, setEditAdministratorMail] = useState('')
    const [editAdministratorDni, setEditAdministratorDni] = useState('')
    const [adminInfo, setAdminInfo] = useState({})
    const [text, setText] = useState('')
    const [adminUpdate, setAdminUpdate] = useState(true);
    const [errors, setErrors] = useState({
        name: false,
        lastName: false,
        mail: false,
        dni: false
    })
    const validateFields = () => {
        const nameRegex = /^[A-Za-z]+$/
        const mailRegex = /.+@.+\..+/
        const dniRegex = /^[0-9]+$/

        setErrors({
            name: !nameRegex.test(adminInfo.name),
            lastName: !nameRegex.test(adminInfo.lastName),
            mail: !mailRegex.test(adminInfo.mail),
            dni: !dniRegex.test(adminInfo.dni)
        })

        return (
            nameRegex.test(adminInfo.name) &&
            nameRegex.test(adminInfo.lastName) &&
            mailRegex.test(adminInfo.mail) &&
            dniRegex.test(adminInfo.dni)
        )
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickOpen = (idAdministratorToDelete) => {
        setIdAdministratorCreated(idAdministratorToDelete)
        setOpen(true)
        console.log(idAdministratorCreated)
    };

    const handleClickOpenEdit = (idAdministratorToEdit, administratorNameEdit, administratorLastNameEdit, administratorMailEdit, administratorDniEdit) => {
        setIdAdministratorUpdate(idAdministratorToEdit)
        setEditAdministratorName(administratorNameEdit)
        setEditAdministratorLastName(administratorLastNameEdit)
        setEditAdministratorMail(administratorMailEdit)
        setEditAdministratorDni(administratorDniEdit)
        setOpenEdit(true);
    }

    const handleClose = () => {
        setOpen(false)
        setIdAdministratorCreated(null)
    };

    const handleCloseEdit = () => {
        setOpenEdit(false)
        setIdAdministratorUpdate(null)
        setErrors({
            name: false,
            lastName: false,
            mail: false,
            dni: false
        })
        setAdminInfo({
            name: '',
            lastName: '',
            mail: '',
            dni: '',
        })
    }
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
        if (openEdit){
            setAdminInfo({
                administratorId: idAdministratorUpdate,
                name: editAdministratorName || "",
                lastName: editAdministratorLastName || "",
                mail: editAdministratorMail || "",
                dni: editAdministratorDni || "",
            });
        }

    }, [idAdministratorUpdate, editAdministratorName, editAdministratorLastName, editAdministratorMail, editAdministratorDni]);
    const handleChange = (event) => {
        const name = event.target.name
        const value = event.target.value
        setAdminInfo(values => ({...values, [name]: value}))
    }

    useEffect(() => {
        if (administratorName === '' && administratorLastName === '' && administratorMail === '' && administratorDni === '') {
            getAllAdministrator()
        }
    }, [administratorName, administratorLastName, administratorMail, administratorDni]);

    const getAllAdministratorByFilter = async () => {
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

            const handleEmptyValues = (value) => {
                return value === '' ? null : value;
            };

            const name = handleEmptyValues(administratorName);
            const lastName = handleEmptyValues(administratorLastName);
            const mail = handleEmptyValues(administratorMail);
            const dni = handleEmptyValues(administratorDni);

            let params = {};
            if (name !== null) params.name = name;
            if (lastName !== null) params.lastName = lastName;
            if (mail !== null) params.mail = mail;
            if (dni !== null) params.dni = dni;

            if (Object.keys(params).length === 0) {
                getAllAdministrator(); // Si no hay filtros, llama a la función general
            } else {
                const queryParams = new URLSearchParams(params).toString();
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/administrators/filtersBy?${queryParams}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                        }
                    }
                );

                const administrators = res.data.content;
                setAllAdministrator(administrators.map(administrator => {
                    return {
                        administratorId: administrator.administratorId,
                        name: administrator.name,
                        lastName: administrator.lastName,
                        mail: administrator.mail,
                        dni: administrator.dni
                    };
                }));
            }
        } catch (error) {
            console.error("Error al validar el token o realizar la solicitud:", error);
            alert("Ocurrió un error al intentar realizar la acción. Por favor, inténtalo nuevamente.");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtiene el token almacenado en el localStorage
        const token = localStorage.getItem('token');

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

            // Si el token es válido y tiene el rol adecuado, continúa con el proceso
            if (validateFields()) {
                console.log(adminInfo);
                let url = `${import.meta.env.VITE_API_BASE_URL}/administrators`;

                try {
                    // Realiza la actualización
                    await axios.put(url, adminInfo, {
                        headers: {
                            Authorization: `Bearer ${token}` // Incluye el token en los encabezados de la solicitud
                        }
                    });
                    setText('Se realizó la actualización correctamente');
                    setAdminUpdate(true);
                    handleCloseEdit();

                } catch (exception) {
                    setAdminUpdate(false);
                    switch (exception.response.status) {
                        case 409:
                            setText('No se realizó la actualización porque hay un Administrador con ese mail o DNI');
                            break;
                        default:
                            setText('No se realizó la actualización, error de datos!!');
                    }
                } finally {
                    handleOpenAlert();
                    getAllAdministrator(); // Obtén nuevamente la lista de administradores después de la actualización
                }
            }
        } catch (error) {
            console.error("Error al validar el token o realizar la solicitud:", error);
            alert("Ocurrió un error al intentar realizar la acción. Por favor, inténtalo nuevamente.");
        }
    };

    const deleteAdministrator = async (idAdministratorToDelete) =>{
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
                alert("No tienes permisos para realizar esta acción.");
                return; // No continúa si no es SuperAdmin
            }

            // Si el token es válido y tiene el rol adecuado, continúa con el proceso de eliminación
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/administrators/${idAdministratorToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados de la solicitud
                }
            });

            setAllAdministrator(allAdministrator.filter(administrator => administrator.administratorId !== idAdministratorToDelete));
            alert('Administrador eliminado correctamente.');

        } catch (error) {
            console.error("Error al eliminar el administrador:", error);
            alert("Ocurrió un error al intentar eliminar el administrador. Por favor, inténtelo nuevamente.");
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
                    Administradores
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
                        type="text"
                        value={administratorName}
                        onChange={(e) => setAdministratorName(e.target.value)}
                        sx={{
                            ...textFieldStyles,
                            flex: 1, // Esto asegura que los inputs se distribuyan uniformemente en el espacio disponible
                        }}
                    />

                    <TextField
                        label="Apellido"
                        variant="outlined"
                        size="small"
                        type="text"
                        value={administratorLastName}
                        onChange={(e) => setAdministratorLastName(e.target.value)}
                        sx={{
                            ...textFieldStyles,
                            flex: 1,
                        }}
                    />

                    <TextField
                        label="Email"
                        variant="outlined"
                        size="small"
                        type="text"
                        value={administratorMail}
                        onChange={(e) => setAdministratorMail(e.target.value)}
                        sx={{
                            ...textFieldStyles,
                            flex: 1,
                        }}
                    />

                    <TextField
                        label="DNI"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={administratorDni}
                        onChange={(e) => setAdministratorDni(e.target.value)}
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
                        onClick={getAllAdministratorByFilter}
                        startIcon={<SearchIcon />}
                    >
                        Buscar
                    </Button>
                    <SuperAdminCreateAdministrator />
                </Box>

            {/* Tabla responsive */}
                <Box sx={{ width: '100%', maxWidth: '900px',  marginLeft: { xs: '40px', sm: '80px' } }}>
                        <TableContainer sx={{
                            maxHeight: 600,
                            overflowX: 'auto',
                            borderRadius: '10px', // Redondea solo las esquinas del contenedor
                            border: '1px solid #002776',
                        }}>
                            <Table stickyHeader sx={{
                                borderCollapse: 'separate',
                                borderSpacing: '0', // Evita que las celdas se superpongan
                            }}>
                                <TableHead>
                                    <TableRow sx={{ height: '24px' }}>
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
                                        <TableCell align="center"  sx={{
                                            ...tableHeadCellStyles,
                                            borderTopRightRadius: '10px', // Redondeo solo en la celda "Acciones"
                                        }}>

                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allAdministrator
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((administrator) => {
                                            return (
                                                <TableRow hover key={administrator.name}  sx={{
                                                    backgroundColor: '#FFFFFF',
                                                    '&:hover': { backgroundColor: '#F6EFE5' },
                                                }}>
                                                    {columns.map((column) => {
                                                        const value = administrator[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align}  sx={{ ...tableCellStyles }}>
                                                                {value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell align="center" sx={tableCellStyles}>
                                                        <IconButton aria-label="edit" onClick={() =>
                                                            handleClickOpenEdit(
                                                                administrator.administratorId,
                                                                administrator.name,
                                                                administrator.lastName,
                                                                administrator.mail,
                                                                administrator.dni)
                                                        } sx={{ color: '#002776' }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton aria-label="delete" onClick={() => handleClickOpen(administrator.administratorId)} sx={{ color: '#B2675E' }}>
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
                            count={allAdministrator.length}
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
                <DialogTitle id="alert-dialog-title" sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>
                    {"Desea eliminar este Administrador ?"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <DialogContentText id="alert-dialog-description">
                        Si acepta se eliminara el administrador deseado.
                    </DialogContentText>
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
                    }}>Cancelar</Button>
                    <Button variant="contained" sx={{
                        backgroundColor: '#028484',
                        '&:hover': {
                            backgroundColor: '#026F6B',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }} onClick={() => {
                        deleteAdministrator(idAdministratorCreated)
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
                }}>Actualizar Información</DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#F2F2F2', marginTop: '10px' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2}}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Nombre"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="name"
                                        value={adminInfo.name !== undefined ? adminInfo.name : editAdministratorName || ''}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.name ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.name ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.name ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        error={errors.name}
                                        helperText={errors.name ? 'Solo letras permitidas' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Apellido"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="lastName"
                                        value={adminInfo.lastName !== undefined ? adminInfo.lastName : editAdministratorLastName || ''}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.lastName ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.lastName ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.lastName ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: errors.address ? 'red' : '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        error={errors.lastName}
                                        helperText={errors.lastName ? 'Solo letras permitidas' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Correo Electrónico"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="mail"
                                        value={adminInfo.mail !== undefined ? adminInfo.mail : editAdministratorMail || ''}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.mail ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.mail ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.mail ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: errors.province ? 'red' : '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        error={errors.mail}
                                        helperText={errors.mail ? 'Correo inválido' : ''}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Dni"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="dni"
                                        value={adminInfo.dni}
                                        // onChange={handleChange}
                                        InputProps={{
                                            readOnly: true,  // Esto hace que el campo sea solo de lectura
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: errors.dni ? 'red' : '#028484',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: errors.dni ? 'red' : '#028484',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: errors.dni ? 'red' : '#028484',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#028484', // Cambia el color del label al enfocarse
                                            },
                                        }}
                                        // error={errors.dni}
                                        // helperText={errors.dni ? 'Solo números permitidos' : ''}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button onClick={handleCloseEdit} variant="contained"  sx={{
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
                    <Button type="submit" color="primary" onClick={handleSubmit} disabled={!validateFields} variant="contained"
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
                <Alert onClose={handleCloseAlert} severity={adminUpdate ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </div>
    )
}




export default SuperAdminManagesAdministrator