import {useContext, useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add.js";
import {Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Snackbar, TextField} from "@mui/material";
import Paper from "@mui/material/Paper";
import {AdminManageContext} from "../AdminManageContext.jsx";
import {jwtDecode} from "jwt-decode";

function AdminCreateAmenity(){
    const {getAllPostsByIdConsortium, allPosts, setAllPosts, consortiumIdState} = useContext(AdminManageContext)
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('')
    const [postInfo, setPostInfo] = useState({})
    const [postCreated, setPostCreated] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)


    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleOpenAlert = () => {
        setOpenAlert(true);
    }

    const handleClose = () => {
        setOpen(false)
        setPostInfo({})

    }

    const handleCloseAlert= (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setPostInfo((prevValues) => ({
            ...prevValues,
            [name]: value,
            consortium: {
                consortiumId: consortiumIdState
            }
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtén el token del almacenamiento local
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

        const postUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;

        try {
            // Realiza la solicitud con el token en los encabezados
            await axios.post(postUrl, postInfo, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                },
            });

            setText('Se realizó la carga correctamente');
            setPostCreated(true);
            handleClose();

        } catch (exception) {
            setPostCreated(false);

            switch (exception.response?.status) {
                case 409:
                    setText('No se realizó la carga porque ya existe un espacio común con ese nombre en este consorcio');
                    break;
                case 404:
                    setText('No se realizó la carga porque el consorcio no fue encontrado');
                    break;
                default:
                    setText('No se realizó la carga debido a un error de datos');
            }
        } finally {
            handleOpenAlert();
            getAllPostsByIdConsortium();
        }
    };


    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickOpen}  sx={{
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
            }}>
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
                <DialogTitle  sx={{
                    backgroundColor: '#E5E5E5',
                    color: '#002776',
                    textAlign: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #028484',
                    fontWeight: 'bold',
                }}>Nueva Publicación</DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#F2F2F2', marginTop: '10px' }}>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2}}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} >
                                    <TextField
                                        id="outlined-basic"
                                        label="Título"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="title"
                                        value={postInfo.title || ""}
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
                                <Grid item xs={12} >
                                    <TextField
                                        id="outlined-basic"
                                        label="Contenido"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="content"
                                        multiline
                                        rows={5}
                                        value={postInfo.content || ""}
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
                    <Button onClick={handleClose} variant="contained"  sx={{
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
                    <Button type="submit" onClick={handleSubmit} variant="contained"  sx={{
                        backgroundColor: '#028484',
                        '&:hover': {
                            backgroundColor: '#026F6B',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }} >
                        Guardar
                    </Button>

                </DialogActions>
            </Dialog>
            <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={postCreated ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </>
    )
}

export default AdminCreateAmenity