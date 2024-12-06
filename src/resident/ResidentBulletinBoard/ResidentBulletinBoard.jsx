import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {Paper, Box, Typography, List, ListItem, ListItemText, Divider, Button} from '@mui/material';
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import {ArrowBack} from "@mui/icons-material";
import {ResidentManageContext} from "../ResidentManageContext.jsx";

const AdminBulletinBoard = () => {
    const {consortiumName, consortiumIdState} = useContext(ResidentManageContext)
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    // Función para cargar los posts
    useEffect(() => {
        const fetchPosts = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No estás autorizado. Por favor, inicia sesión.');
                setLoading(false);
                return; // Detiene la ejecución si no hay token
            }

            // Decodificar el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_RESIDENT');
            if (!isAdmin) {
                setError('No tienes permisos para ver los posts.');
                setLoading(false);
                return; // Detiene la ejecución si no tiene el rol ROLE_ADMIN
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts`, {
                    params: { idConsortium: consortiumIdState },
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
                    },
                });

                // Ordenar los posts por fecha de creación (más reciente primero)
                const sortedPosts = response.data.content.sort(
                    (a, b) => new Date(b.creationPostDate) - new Date(a.creationPostDate)
                );
                setPosts(sortedPosts);
            } catch (error) {
                setError('Error al cargar los posts.');
                console.error('Error al cargar los posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);  // El array vacío indica que solo se ejecutará una vez al cargar el componente.

    const handleGoBack = () => {
        navigate('/admin/management/publicaciones'); // Redirige a la página de publicaciones
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', padding: '20px' }}>
                <Button
                    variant="contained" // Cambia a un botón con fondo
                    color="primary"
                    onClick={handleGoBack}
                    sx={{
                        borderRadius: '20px', // Bordes redondeados
                        padding: '10px 20px', // Aumenta el tamaño del botón
                        textTransform: 'none', // Elimina la transformación del texto
                        backgroundColor: '#002776', // Azul Francia oscuro
                        '&:hover': {
                            backgroundColor: '#001B5E', // Cambia el color al pasar el ratón
                        },
                        boxShadow: 3, // Añade sombra
                    }}
                    startIcon={<ArrowBack />} // Añade el icono de flecha hacia atrás
                >
                    Atrás
                </Button>
            </Box>
            {/* Título fuera del recuadro y alineado correctamente */}
            <Box
                sx={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    paddingX: { xs: '10px', sm: '20px', md: '40px' }, // Ajusta el padding horizontal según el tamaño de la pantalla
                    marginTop: '20px', // Ajusta el margen superior para separarlo de otros componentes si es necesario
                }}
            >
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        color: '#002776', // El color del texto
                        fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }, // Ajusta el tamaño del texto
                    }}
                >
                    Tablón de Anuncios de {consortiumName}
                </Typography>
            </Box>

            {/* Contenedor de los posts */}
            <Paper
                elevation={2}
                sx={{
                    padding: 3,
                    margin: 'auto',
                    marginTop: '20px',
                    width: { xs: '95%', sm: '85%', md: '70%', lg: '60%' },
                }}
            >
                {loading ? (
                    <Typography align="center" variant="body1">
                        Cargando anuncios...
                    </Typography>
                ) : posts.length === 0 ? (
                    <Typography align="center" variant="body1">
                        No hay anuncios publicados.
                    </Typography>
                ) : (
                    <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {posts.map((post) => (
                            <React.Fragment key={post.postId}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        width: '100%',
                                        maxWidth: 600, // Limita el ancho máximo del post
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="h6"
                                                style={{
                                                    color: '#002776',
                                                    textAlign: 'center', // Centra el título
                                                }}
                                            >
                                                {post.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    style={{
                                                        marginBottom: '8px',
                                                        textAlign: 'center', // Centra la fecha
                                                        color: '#B2675E',
                                                        fontWeight: 'bold',// Aplica el color a la fecha
                                                    }}
                                                >
                                                    {`Publicado el: ${new Date(
                                                        post.creationPostDate
                                                    ).toLocaleString()}`}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    style={{
                                                        color: 'black',
                                                        textAlign: 'center', // Centra el contenido
                                                    }}
                                                >
                                                    {post.content}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                                <Divider style={{ width: '100%' }} />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </>
    );
};

export default AdminBulletinBoard;