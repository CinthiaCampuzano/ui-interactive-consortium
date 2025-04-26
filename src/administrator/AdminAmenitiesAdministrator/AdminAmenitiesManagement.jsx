import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Alert, Card, CardActions, CardContent, CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Grid, Snackbar,
    TablePagination,
    TextField
} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import axios from "axios";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import {AdminManageContext} from "../AdminManageContext.jsx";
import DeleteIcon from "@mui/icons-material/Delete.js";
import EditIcon from "@mui/icons-material/Edit";
import AdminCreateAmenity from "./AdminCreateAmenity.jsx";
import {jwtDecode} from "jwt-decode";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {Create} from "@mui/icons-material";

const columns = [
    { id: 'name', label: 'Espacio Común', minWidth: 100 },
    { id: 'maxBookings', label: 'Reservas Máximas', minWidth: 100 }
]

function AdminAmenitiesManagement(){
    const {consortiumIdState, getAConsortiumByIdConsortium, consortiumName, allAmenities,
        setAllAmenities, getAllAmenitiesByIdConsortium } = useContext(AdminManageContext)
    const [amenityName, setAmenityName] = useState('');
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const [idAmenityUpdate, setIdAmenityUpdate] = useState(null)
    const [openEdit, setOpenEdit] = useState(false)
    const [editName, setEditName] = useState('')
    const [editMaxBooking, setEditMaxBooking] = useState('')
    const [editCostOfUse, setEditCostOfUse] = useState('')
    const [idAmenityCreated, setIdAmenityCreated] = useState(null)
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [amenityUpdate, setAmenityUpdate] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [amenitytInfo, setAmenitytInfo] = useState({})
    const [uploadedImages, setUploadedImages] = useState({}); // Estado para manejar las imágenes subidas


    const handleClickOpenEdit = (idAmenityToEdit, amenityNameEdit, amenityMaxBookingEdit, amenityCostOfUseEdit) => {
        setIdAmenityUpdate(idAmenityToEdit)
        setEditName(amenityNameEdit)
        setEditMaxBooking(amenityMaxBookingEdit)
        setEditCostOfUse(amenityCostOfUseEdit)
        setOpenEdit(true)
    }

    const handleCloseEdit = () => {
        setOpenEdit(false)
        setIdAmenityUpdate(null)
        setAmenitytInfo({})
    }

    const handleClickOpen = (idAmenityToDelete) => {
        setIdAmenityCreated(idAmenityToDelete)
        setOpen(true)
    };
    const handleClose = () => {
        setOpen(false)
        setIdAmenityCreated(null)
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

    useEffect( () => {
        if (openEdit){
            setAmenitytInfo({
                amenityId: idAmenityUpdate,
                name: editName || "",
                maxBookings: editMaxBooking || "",
                costOfUse: editCostOfUse || "",
                consortium: {
                    consortiumId: consortiumIdState
                }
            })
        }

    }, [idAmenityUpdate, editName, editMaxBooking, editCostOfUse]);

    useEffect(() => {
        if (allAmenities.length > 0) {
            setAmenityPhotos();
        }
    }, [allAmenities]);

    const setAmenityPhotos = async () => {
        const token = localStorage.getItem('token'); // Get the stored token
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Stop execution if no token
        }

        const imagePromises = allAmenities.map(async (amenity) => {
            console.log('path amenity id ' + amenity.amenityId + ' path '+ amenity.imagePath)
            if (amenity.imagePath !== null) {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/Amenities/${amenity.amenityId}/download`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Include the token in the headers
                    },
                    responseType: 'blob' // Ensure the response is a Blob
                });
                const imageBlob = res.data;
                const imageUrl = URL.createObjectURL(imageBlob);
                return { amenityId: amenity.amenityId, imageUrl };
            }
            return null;
        });

        // Wait for all the promises to resolve
        const images = await Promise.all(imagePromises);

        // Update the state with the downloaded images
        images.forEach(image => {
            if (image) {
                setUploadedImages((prev) => ({ ...prev, [image.amenityId]: image.imageUrl }));
            }
        });
    };

    const handleChange = (event) => {
        const name = event.target.name
        const value = event.target.value
        setAmenitytInfo(values => ({...values, [name]: value}))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtén el token almacenado
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            alert("No tienes permisos para realizar esta acción.");
            return; // Detener la ejecución si no es ROLE_ADMIN
        }

        // Si la validación es exitosa, proceder con la solicitud
        const url = `${import.meta.env.VITE_API_BASE_URL}/Amenities`;

        try {
            await axios.put(url, amenitytInfo, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                },
            });
            setText('Se realizó la actualización correctamente');
            setAmenityUpdate(true);
            handleCloseEdit();
        } catch (exception) {
            setAmenityUpdate(false);

            switch (exception.response?.status) {
                case 404:
                    setText('No se realizó la actualización porque el espacio común o consorcio no existe');
                    break;
                case 409:
                    setText('Ya existe un espacio común con ese nombre en este consorcio');
                    break;
                default:
                    setText('No se realizó la actualización debido a un error de datos');
            }
        } finally {
            handleOpenAlert();
            getAllAmenitiesByIdConsortium();
        }
    };

    useEffect(() => {
        if (amenityName === '' ){
            getAllAmenitiesByIdConsortium()
        }
    }, [amenityName, consortiumIdState]);

    useEffect(() => {
        getAConsortiumByIdConsortium();
    }, [consortiumIdState]);



    const deleteAmenity = async (idAmenityToDelete) =>{
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detenemos la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            alert("No tienes permisos para realizar esta acción.");
            return; // Detenemos la ejecución si no tiene el rol ROLE_ADMIN
        }

        // Continúa con la eliminación si el usuario tiene permisos
        try {
            console.log(idAmenityToDelete);
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/Amenities/${idAmenityToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluimos el token en los encabezados
                },
            });

            // Actualiza el estado local tras eliminar
            setAllAmenities(allAmenities.filter((amenity) => amenity.amenityId !== idAmenityToDelete));
        } catch (error) {
            console.error("Error al eliminar el amenity:", error);
            if (error.response?.status === 403) {
                alert("No tienes permiso para realizar esta acción.");
            } else {
                alert("Ocurrió un error al intentar eliminar el amenity.");
            }
        }
    }

    const handleImageUpload = async (event, amenityId) => {
        const file = event.target.files[0];
        if (file) {
            const token = localStorage.getItem('token'); // Get the stored token
            if (!token) {
                alert("No estás autorizado. Por favor, inicia sesión.");
                return; // Stop execution if no token
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/Amenities/${amenityId}/upload`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Create a URL for the uploaded image file
                const imageUrl = URL.createObjectURL(file);
                setUploadedImages((prev) => ({ ...prev, [amenityId]: imageUrl }));

            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Ocurrió un error al intentar subir la imagen.");
            }
        }
    };

    return(
        <div>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                }}
            >
                {/* Sidebar */}
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
                            Espacios Comunes de {consortiumName}
                        </Typography>

                        {/* Botón Crear Espacio */}
                        <Box mt={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <AdminCreateAmenity />
                        </Box>

                        {/* Tarjetas - Agregamos mt={5} para dar más espacio entre el botón y las tarjetas */}
                        <Grid container spacing={3} justifyContent="center" mt={5}>
                            {allAmenities.map((amenity) => (
                                <Grid item xs={12} sm={6} md={4} key={amenity.amenityId}>
                                    <Card
                                        sx={{
                                            maxWidth: 400,
                                            mx: 'auto',
                                            textAlign: 'center',
                                            backgroundColor: 'transparent',
                                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: '0px 16px 32px rgba(184, 218, 227, 0.8)',
                                            },
                                        }}
                                    >
                                        {/* Mostrar la imagen cargada, si existe */}
                                        {uploadedImages[amenity.amenityId] ? (
                                            <CardMedia
                                                component="img"
                                                height="220"
                                                image={uploadedImages[amenity.amenityId]} // Imagen cargada
                                                alt={amenity.name}
                                            />
                                        ) : (
                                            <CardMedia
                                                component="img"
                                                height="220"
                                                image={amenity.image || '/images/poolPlaceholder.jpeg'} // Imagen predeterminada
                                                alt={amenity.name}
                                            />
                                        )}
                                        <CardContent>
                                            <Typography gutterBottom variant="h6" component="div" sx={{
                                                color: '#002776', // Azul oscuro
                                                fontWeight: 'bold',
                                            }}>
                                                {amenity.name}
                                            </Typography>
                                            <Typography variant="body2"
                                                        color="text.secondary"
                                                        sx={{ color: '#B2675E' }}>
                                                Máximas Reservas: {amenity.maxBookings}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center' }}>
                                            <IconButton component="label">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(event) => handleImageUpload(event, amenity.amenityId)}
                                                />
                                                <PhotoCameraIcon sx={{ color: '#002776' }} /> {/* Icono para "Cambiar foto" */}
                                            </IconButton>
                                            <IconButton
                                                aria-label="edit"
                                                onClick={() =>
                                                    handleClickOpenEdit(
                                                        amenity.amenityId,
                                                        amenity.name,
                                                        amenity.maxBookings,
                                                        amenity.costOfUse
                                                    )
                                                }
                                            >
                                                <EditIcon sx={{ color: '#002776' }} />
                                            </IconButton>
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() => handleClickOpen(amenity.amenityId)}
                                            >
                                                <DeleteIcon sx={{ color: '#002776' }} />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
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
                <DialogTitle id="alert-dialog-title"  sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>
                    {"Desea eliminar este Espacio Comun ?"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <DialogContentText id="alert-dialog-description">
                        Si acepta se eliminara el espacio comun deseado.
                    </DialogContentText>
                </DialogContent>
                <DialogActions  sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
                    <Button onClick={handleClose} variant="contained"  sx={{
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
                        deleteAmenity(idAmenityCreated)
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
                <DialogTitle  sx={{
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
                                        label="Espacio Común"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="name"
                                        value={amenitytInfo.name !== undefined ? amenitytInfo.name : editName || ''}
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Cantidad máxima de Reservas"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="maxBookings"
                                        value={amenitytInfo.maxBookings !== undefined ? amenitytInfo.maxBookings : editMaxBooking || ''}
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="outlined-basic"
                                        label="Costo por uso"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="costOfUse"
                                        value={amenitytInfo.costOfUse !== undefined ? amenitytInfo.costOfUse : editCostOfUse || ''}
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
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#F9F9F9', padding: '10px 20px' }}>
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
                    <Button type="submit" color="primary" onClick={handleSubmit} variant="contained"  sx={{
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
                <Alert onClose={handleCloseAlert} severity={amenityUpdate ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </div>
    )
}
export default AdminAmenitiesManagement