import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {Paper, Box, Typography, List, ListItem, ListItemText, Divider, Button} from '@mui/material';
import {AdminManageContext} from "../AdminManageContext.jsx";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import {ArrowBack} from "@mui/icons-material";

const AdminBulletinBoard = () => {
    const {consortiumName, consortiumIdState} = useContext(AdminManageContext)
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()
    const settings = {
        dots: true, // Activa los puntos de navegación
        infinite: true, // El carrusel no se detiene al final
        speed: 500, // Velocidad de transición
        slidesToShow: 1, // Muestra un solo anuncio a la vez
        slidesToScroll: 1, // Desplaza un anuncio por vez
        autoplay: true, // Activar reproducción automática
        autoplaySpeed: 3000, // Intervalo entre anuncios
    };

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
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
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
            <Box
                sx={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginTop: '20px',
                }}
            >
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        color: '#002776',
                        fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                    }}
                >
                    Tablón de Anuncios de {consortiumName}
                </Typography>
            </Box>

            {/* Contenedor de los post-its */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    alignItems: 'center',
                    marginTop: '20px',
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
                    posts.map((post) => (
                        <Box key={post.postId} sx={{ position: 'relative', width: '90%', maxWidth: 600 }}>
                            {/* Pin arriba del post-it */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: '#D32F2F', // Rojo para el pin
                                    border: '2px solid #B71C1C', // Borde más oscuro
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                            />

                            {/* Post-it */}
                            <Paper
                                elevation={3}
                                sx={{
                                    padding: 2,
                                    borderRadius: '8px',
                                    backgroundColor: '#FFF9C4',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #FDD835',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#002776',
                                        fontWeight: 'bold',
                                        marginBottom: 1,
                                    }}
                                >
                                    {post.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#B2675E',
                                        fontWeight: 'bold',
                                        marginBottom: 1,
                                    }}
                                >
                                    {`Publicado el: ${new Date(post.creationPostDate).toLocaleString()}`}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#000' }}>
                                    {post.content}
                                </Typography>
                            </Paper>
                        </Box>
                    ))
                )}
            </Box>
        </>
    );
};

export default AdminBulletinBoard;