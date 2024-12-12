import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Alert,
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
import AdminCreatePost from "./AdminCreatePost.jsx";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";
import SearchIcon from "@mui/icons-material/Search.js";
import AnnouncementIcon from "@mui/icons-material/Announcement";


const columns = [
    { id: 'title', label: 'Título', minWidth: 100 },
    { id: 'content', label: 'Contenido', minWidth: 100 },
    { id: 'creationPostDate', label: 'Fecha', minWidth: 100 }
]

function AdminPostManagement(){
    const {consortiumIdState, getAConsortiumByIdConsortium, consortiumName, getAllPostsByIdConsortium, allPosts,
        setAllPosts } = useContext(AdminManageContext)
    const [postTitle, setPostTitle] = useState('');
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const [idPostUpdate, setIdPostUpdate] = useState(null)
    const [openEdit, setOpenEdit] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')
    const [idPostCreated, setIdPostCreated] = useState(null)
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [postUpdate, setPostUpdate] = useState(true);
    const [openAlert, setOpenAlert] = useState(false)
    const [postInfo, setPostInfo] = useState({})
    const navigate = useNavigate()

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickOpenEdit = (idPostToEdit, postTitleEdit, postContentEdit) => {
        setIdPostUpdate(idPostToEdit)
        setEditTitle(postTitleEdit)
        setEditContent(postContentEdit)
        setOpenEdit(true)
    }

    const handleCloseEdit = () => {
        setOpenEdit(false)
        setIdPostUpdate(null)
        setPostInfo({})
    }

    const handleClickOpen = (idPostToDelete) => {
        setIdPostCreated(idPostToDelete)
        setOpen(true)
    };
    const handleClose = () => {
        setOpen(false)
        setIdPostCreated(null)
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
        if (openEdit){
            setPostInfo({
                postId: idPostUpdate,
                title: editTitle || "",
                content: editContent || "",
                consortium: {
                    consortiumId: consortiumIdState
                }
            })
        }

    }, [idPostUpdate, editTitle, editContent]);

    const handleChange = (event) => {
        const name = event.target.name
        const value = event.target.value
        setPostInfo(values => ({...values, [name]: value}))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Obtener el token de localStorage o de donde lo almacenes
        const token = localStorage.getItem('token');
        if (!token) {
            setText('No estás autorizado. Por favor, inicia sesión.');
            return; // Detiene la ejecución si no hay token
        }

        // Decodificar el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

        if (!isAdmin) {
            alert("No tienes permisos para realizar esta acción.");
            return; // Detenemos la ejecución si no tiene el rol ROLE_ADMIN
        }


        const url = `${import.meta.env.VITE_API_BASE_URL}/posts`;

        try {
            await axios.put(url, postInfo, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                },
            })

            setText('Se realizó la actualización correctamente');
            setPostUpdate(true);
            handleCloseEdit();

        } catch (exception) {
            setPostUpdate(false);
            switch (exception.response.status) {
                case 404:
                    setText('No se realizó la actualización porque la publicación no existe');
                    break;
                default:
                    setText('No se realizó la actualización debido a un error de datos');
            }
        } finally {
            handleOpenAlert();
            getAllPostsByIdConsortium();
        }
    };

    useEffect(() => {
        if (postTitle === '' ){
            getAllPostsByIdConsortium()
        }
    }, [postTitle]);

    useEffect(() => {
        getAConsortiumByIdConsortium();
    }, [consortiumIdState]);

    const getAllPostsByFilter = async () => {

        const token = localStorage.getItem('token');
        if (!token) {
            setText('No estás autorizado. Por favor, inicia sesión.');
            return; // Detener la ejecución si no hay token
        }

        let decodedToken;
        try {
            decodedToken = jwtDecode(token);
        } catch (error) {
            setText('Token inválido');
            return; // Detener la ejecución si el token es inválido
        }

        // Verificar si el rol del usuario incluye "ROLE_ADMIN"
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            setText('No tienes permisos para realizar esta acción.');
            return; // Detener la ejecución si el rol no es "ROLE_ADMIN"
        }

        const handleEmptyValues = (value) => {
            return value === '' ? null : value;
        };

        const title = handleEmptyValues(postTitle);
        let params = { idConsortium: consortiumIdState };

        if (title !== null) params.title = title;

        if (Object.keys(params).length === 1 && params.idConsortium) {
            getAllPostsByIdConsortium();
        } else {
            const queryParams = new URLSearchParams(params).toString();
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts/byTitle?${queryParams}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
                    },
                });
                const posts = res.data.content;
                setAllPosts(posts.map(post => {
                    return {
                        postId: post.postId,
                        title: post.title,
                        content: post.content,
                        creationPostDate: post.creationPostDate,
                    };
                }));
            } catch (error) {
                setText('Error al obtener los posts');
                console.error('Error al cargar los posts:', error);
            }
        }
    };

    const deletePost = async (idPostToDelete) =>{
        // Obtener el token desde el almacenamiento local o donde lo tengas guardado
        const token = localStorage.getItem('token');
        if (!token) {
            setText('No estás autorizado. Por favor, inicia sesión.');
            return; // Detener la ejecución si no hay token
        }

        let decodedToken;
        try {
            decodedToken = jwtDecode(token);
        } catch (error) {
            setText('Token inválido');
            return; // Detener la ejecución si el token es inválido
        }

        // Verificar si el rol del usuario incluye "ROLE_ADMIN"
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            setText('No tienes permisos para realizar esta acción.');
            return; // Detener la ejecución si el rol no es "ROLE_ADMIN"
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${idPostToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
                },
            });
            // Filtrar el post eliminado de la lista
            setAllPosts(allPosts.filter(post => post.postId !== idPostToDelete));
        } catch (error) {
            setText('Error al eliminar la publicación');
            console.error('Error al eliminar el post:', error);
        }
    }

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

    return(
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
                            Tablón de Anuncios de {consortiumName}
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
                        label="Título"
                        variant="outlined"
                        size="small"
                        value={postTitle}
                        onChange={(e) => {
                            setPostTitle(e.target.value);
                        }}
                        sx={{
                            ...textFieldStyles,
                            flex: 1, // Esto asegura que los inputs se distribuyan uniformemente en el espacio disponible
                        }}
                    />
                </Box>
                        {/* Botones */}
                <Box sx={{
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
                        onClick={getAllPostsByFilter}
                        startIcon={<SearchIcon />}
                    >
                        Buscar
                    </Button>
                    <AdminCreatePost/>
                </Box>
                        {/* Tabla */}
                <Box sx={{ width: '100%', maxWidth: '900px',  marginLeft: { xs: '40px', sm: '80px' } }}>
                        <TableContainer sx={{
                            maxHeight: 600,
                            overflowX: 'auto',
                            borderRadius: '10px', // Redondea solo las esquinas del contenedor
                            border: '1px solid #002776',
                        }}
                        >
                            <Table stickyHeader
                                   sx={{
                                        borderCollapse: 'separate',
                                        borderSpacing: '0', // Evita que las celdas se superpongan
                                   }}
                            >
                                <TableHead>
                                    <TableRow >
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
                                    {allPosts
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((post) => {
                                            return (
                                                <TableRow
                                                          hover
                                                          key={post.postId}
                                                          sx={{
                                                              backgroundColor: '#FFFFFF',
                                                              '&:hover': { backgroundColor: '#F6EFE5' },
                                                          }}
                                                >
                                                    {columns.map((column) => {
                                                        let value = post[column.id];
                                                        // Truncar contenido si es la columna "content"
                                                        if (column.id === 'content' && typeof value === 'string') {
                                                            const words = value.split(' ');
                                                            value = words.length > 10 ? words.slice(0, 10).join(' ') + '...' : value;
                                                        }
                                                        return (
                                                            <TableCell
                                                                key={column.id}
                                                                align={column.align}
                                                                sx={{ ...tableCellStyles }} // Las celdas no tienen borderRadius
                                                            >
                                                                {value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell
                                                               align="center"
                                                               sx={tableCellStyles}
                                                    >
                                                        <IconButton aria-label="edit" onClick={() =>
                                                            handleClickOpenEdit(
                                                                post.postId,
                                                                post.title,
                                                                post.content)
                                                        }
                                                                 sx={{ color: '#002776' }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton aria-label="delete" onClick={() => handleClickOpen(post.postId)} sx={{ color: '#B2675E' }}>
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
                            count={allPosts.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página"
                            sx={{ backgroundColor: '#FFFFFF', color: '#002776', fontWeight: 'bold' }}
                        />
                </Box>
                <Box display="flex" justifyContent="center" mt={3}>
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px', // Espacio entre ícono y texto
                            '&:hover': {
                                backgroundColor: '#A15D50', // Cambio de color al pasar el cursor
                                boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)', // Sombra más prominente
                            },
                            '&:active': {
                                backgroundColor: '#8A4A3D', // Cambio de color cuando se presiona
                            },
                        }}
                        onClick={() => navigate(`/admin/management/tablon_de_anuncios`)}
                    >
                        <AnnouncementIcon sx={{ fontSize: '20px' }} /> {/* Tamaño ajustado del ícono */}
                        Tablón de Anuncios
                    </Button>
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
                    {"Desea eliminar esta publicación?"}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#F9F9F9' }}>
                    <DialogContentText id="alert-dialog-description">
                        Si acepta se eliminara la publicación deseada.
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
                    <Button variant="contained"  sx={{
                        backgroundColor: '#028484',
                        '&:hover': {
                            backgroundColor: '#026F6B',
                        },
                        borderRadius: '25px',
                        padding: '8px 20px',
                        transition: 'background-color 0.3s ease',
                    }} onClick={() => {
                        deletePost(idPostCreated)
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
                                <Grid item xs={12} >
                                    <TextField
                                        id="outlined-basic"
                                        label="Título"
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        name="title"
                                        value={postInfo.title !== undefined ? postInfo.title : editTitle || ''}
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
                                        rows={5} // Ajusta la cantidad de líneas visibles
                                        value={postInfo.content !== undefined ? postInfo.content : editContent || ''}
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
                <Alert onClose={handleCloseAlert} severity={postUpdate ? "success" : "error"} sx={{width: '100%'}}>
                    {text}
                </Alert>
            </Snackbar>
        </div>
    )
}
export default AdminPostManagement