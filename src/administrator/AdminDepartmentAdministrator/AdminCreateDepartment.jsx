import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add.js";
import {Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Snackbar, TextField} from "@mui/material";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import {AdminManageContext} from "../AdminManageContext.jsx";
import {jwtDecode} from "jwt-decode";


function AdminCreateDepartment(){
    const {consortiumIdState, allPersons, setAllPersons,allDepartments, setAllDepartments, getAllDepartmentsByConsortium,
        getAllPersons} = useContext(AdminManageContext)
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('')
    const [departmentInfo, setDepartmentInfo] = useState({
        consortium: {
            consortiumId: consortiumIdState
        }
    })
    const [departmentCreated, setDepartmentCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [departmentNew, setDepartmentNew] = useState(true);

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleClose = () => {
        setOpen(false);
        setDepartmentInfo({
            consortium: {
                consortiumId: consortiumIdState // Asegúrate de mantener consortiumId al resetear
            }
        });
    };

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    useEffect(() => {
        if (open){
            getAllPersons()
        }

    }, [open]);

    const handleChange = (event) => {
        const name = event.target.name; // Obtiene el nombre del campo
        const value = event.target.value; // Obtiene el nuevo valor del campo
        console.log('Holaaaa')
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
                        consortiumId: consortiumIdState // Actualiza el consortiumId dentro del objeto consortium
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
            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener la ejecución si no es ROLE_ADMIN
            }

            // Si el usuario tiene el rol adecuado, realiza la solicitud
            const url = `${import.meta.env.VITE_API_BASE_URL}/departments`;
            departmentInfo.consortium.consortiumId = consortiumIdState;

            await axios.post(url, departmentInfo, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            setText('Se realizó la carga correctamente');
            setDepartmentCreated(true);
            handleClose();

        } catch (exception) {
            // Manejo de errores más detallado según las excepciones del backend
            if (exception.response) {
                switch (exception.response.status) {
                    case 404:
                        if (exception.response.data.message.includes('Consorcio no encontrado')) {
                            setText('El consorcio especificado no se encontró.');
                        } else if (exception.response.data.message.includes('Propietario no encontrado')) {
                            setText('El propietario especificado no se encontró.');
                        } else if (exception.response.data.message.includes('Residente no encontrado')) {
                            setText('El residente especificado no se encontró.');
                        }
                        break;
                    case 409:
                        if (exception.response.data.message.includes('Ya existe un departamento en ese piso con ese identificador')) {
                            setText('Ya existe un departamento en ese piso con ese identificador.');
                        } else {
                            setText('Conflicto al crear el departamento: datos duplicados.');
                        }
                        break;
                    default:
                        setText('No se realizó la carga, error de datos!!');
                }
                setDepartmentCreated(false);
            }
        } finally {
            handleOpenAlert();
            getAllDepartmentsByConsortium(consortiumIdState);
        }
    };
    return (
        <>
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
                    padding: '10px 20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra para profundidad
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

            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose();
                    }
                }}
            >
                <DialogTitle sx={{ backgroundColor: '#E5E5E5', color: '#002776', textAlign: 'center' }}>
                    Nuevo Departamento
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#E5E5E5' }}>
                    <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#EDEDED', marginTop: '10px' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Identificación"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="code"
                                        value={departmentInfo.code || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#002776',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#002776',
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        label="Seleccione un Propietario"
                                        variant="outlined"
                                        size="small"
                                        name="propietaryId"
                                        value={departmentInfo.propietary?.personId || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#002776',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#002776',
                                            },
                                        }}
                                        fullWidth
                                    >
                                        {allPersons.map(person => (
                                            <MenuItem key={person.personId} value={person.personId}>
                                                {person.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Seleccione un Residente"
                                        variant="outlined"
                                        size="small"
                                        name="residentId"
                                        value={departmentInfo.resident?.personId || ""}
                                        onChange={handleChange}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#002776',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#002776',
                                                },
                                            },
                                            '& label.Mui-focused': {
                                                color: '#002776',
                                            },
                                        }}
                                        fullWidth
                                    >
                                        {allPersons.map(person => (
                                            <MenuItem key={person.personId} value={person.personId}>
                                                {person.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#E5E5E5' }}>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        sx={{
                            backgroundColor: '#B2675E',
                            '&:hover': { backgroundColor: '#9C5A4D' },
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            backgroundColor: '#028484',
                            '&:hover': { backgroundColor: '#026F6F' },
                        }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={departmentCreated ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </>
    )

}
export default AdminCreateDepartment