import React, { useState, useEffect, useContext } from "react";
import {Box, Typography, Paper, Button, CircularProgress, Card, CardContent} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import {AdminManageContext} from "../AdminManageContext.jsx";
import AdminGallerySidebar from "../AdminGallerySidebar.jsx";


const AdminBulletinBoard = () => {
    const { consortiumName, consortiumIdState } = useContext(AdminManageContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Función para manejar el clic en las reacciones
    const handleReaction = async (postId, reactionType) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}/reactions`, {
                reaction: reactionType
            });
            // Actualizar el estado de las reacciones para el post
            setPosts(posts.map(post =>
                post.postId === postId ? { ...post, reactions: response.data.reactions } : post
            ));
        } catch (error) {
            console.error("Error al agregar la reacción:", error);
        }
    };

    useEffect(() => {
        const fetchPosts = async () => {

            if (!consortiumIdState) {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
            if (!isAdmin) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts`, {
                    params: { idConsortium: consortiumIdState },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const sortedPosts = response.data.content.sort(
                    (a, b) => new Date(b.creationPostDate) - new Date(a.creationPostDate)
                );
                setPosts(sortedPosts);
            } catch (error) {
                setLoading(false);
                console.error("Error al cargar los posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [consortiumIdState]);



    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh', // Asegura que el contenedor ocupe toda la altura de la pantalla
            }}
        >
            <AdminGallerySidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1, // Permite que este componente ocupe el espacio restante
                    padding: { xs: '16px', sm: '24px' }, // Espaciado variable según el tamaño de la pantalla
                    marginLeft: { xs: 0, sm: '240px' }, // Evita que el contenido se superponga al sidebar
                    transition: 'margin-left 0.3s ease', // Suaviza la transición al cambiar de tamaño
                }}
            >
                <Box sx={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Título */}
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
                                fontSize: { xs: '1.5rem', md: '2rem' },
                                marginBottom: '20px',
                            }}
                        >
                            Tablón de Anuncios de {consortiumName}
                        </Typography>
                    </Box>

                    {/* Contenedor de los posts */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Tamaño mínimo reducido
                            gap: '30px', // Separación entre tarjetas
                        }}
                    >
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <CircularProgress color="primary" />
                            </Box>
                        ) : posts.length === 0 ? (
                            <Typography variant="body1" sx={{ textAlign: 'center', color: '#B2675E' }}>
                                No hay anuncios publicados.
                            </Typography>
                        ) : (
                            posts.map((post, index) => (
                                <Card
                                    key={post.postId}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? '#BCE7FD' : '#FFD9C0', // Alternar colores de fondo
                                        maxWidth: '300px', // Límite de ancho para mantener tamaño uniforme
                                        height: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                                        },
                                        borderRadius: '12px',
                                        padding: '16px',
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h5" sx={{ color: '#002776', fontWeight: '600' }}>
                                            {post.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6E6E6E', marginTop: '8px' }}>
                                            {`Publicado el: ${new Date(post.creationPostDate).toLocaleString()}`}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#333', marginTop: '15px', lineHeight: '1.5' }}>
                                            {post.content}
                                        </Typography>
                                    </CardContent>

                                    {/* Reacciones */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-around', marginTop: '15px' }}>
                                        <Button
                                            sx={{ color: '#4CAF50', fontSize: '1.3rem', '&:hover': { backgroundColor: '#E8F5E9' } }}
                                        >
                                            👍 {post.reactions?.THUMBS_UP || 0}
                                        </Button>
                                        <Button
                                            sx={{ color: '#F44336', fontSize: '1.3rem', '&:hover': { backgroundColor: '#FFEBEE' } }}
                                        >
                                            👎 {post.reactions?.THUMBS_DOWN || 0}
                                        </Button>
                                        <Button
                                            sx={{ color: '#FFC107', fontSize: '1.3rem', '&:hover': { backgroundColor: '#FFF8E1' } }}
                                        >
                                            👏 {post.reactions?.CLAPS || 0}
                                        </Button>
                                        <Button
                                            sx={{ color: '#2196F3', fontSize: '1.3rem', '&:hover': { backgroundColor: '#E3F2FD' } }}
                                        >
                                            😢 {post.reactions?.SAD_FACE || 0}
                                        </Button>
                                    </Box>
                                </Card>
                            ))
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AdminBulletinBoard;