import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Link,
} from '@mui/material';
import Auth from './Auth.jsx';
import { isAdmin, isPerson, isResident, isSuperAdmin } from './TokenUtils.jsx';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

function Autentication() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await Auth(email, password);
            const token = response.token;
            localStorage.setItem('token', token);

            if (isSuperAdmin()) {
                navigate('/superAdmin/management');
            } else if (isAdmin()) {
                navigate('/admin/management');
            } else if (isPerson()) {
                navigate('/resident/management');
            } else {
                navigate('/login');
            }

            setSuccess(true);
            setError('');
        } catch (err) {
            console.log(err);
            setError('Usuario o contraseña incorrectos');
            setSuccess(false);
        }
    };

    return (
        <Box sx={{ margin: 0, padding: 0, width: '100%', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#6c8fbf', maxHeight: '15vh' }}>
                <img src="/CiLogoLq.jpg" alt="Icon" style={{ width: '4%', height: 'auto', display: 'block' }} />
                <Typography
                    variant="h3"
                    sx={{
                        color: '#ffffff',
                        fontWeight: 'bold',
                        flexGrow: 1,
                        textAlign: 'center',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                        letterSpacing: '0.1em',
                        background: 'linear-gradient(90deg, rgba(0,67,166,1) 0%, rgba(0,39,118,1) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Consorcio Interactivo
                </Typography>
                <Button variant="contained" sx={{ padding: '10px 20px', backgroundColor: '#0043A6', '&:hover': { backgroundColor: '#002776' }, alignSelf: 'center' }} onClick={() => setShowLoginForm(true)}>
                    Iniciar Sesión
                </Button>
            </Box>

            <Carousel autoPlay interval={3000} infiniteLoop showThumbs={false}>
                <div style={{ backgroundColor: '#072246', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <img src="/images/CICar2.png" alt="Imagen 1" style={{ width: 'auto', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ backgroundColor: '#072246', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <img src="/images/CICar1.png" alt="Imagen 2" style={{ width: 'auto', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ backgroundColor: '#072246', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <img src="/images/CICar3.png" alt="Imagen 3" style={{ width: 'auto', height: '100%', objectFit: 'cover' }} />
                </div>
            </Carousel>

            <Container sx={{ padding: '50px 0', backgroundColor: '#f4f4f4' }}>
                <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '30px', color: '#002776' }}>
                    Nuestras Características
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ maxWidth: 345 }}>
                            <CardMedia component="img" height="140" image="/images/Administradora.jpg" alt="Feature 1" />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Gestión de Consorcios
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Administra todos los aspectos de tu consorcio de manera eficiente y sencilla.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ maxWidth: 345 }}>
                            <CardMedia component="img" height="140" image="/images/propietarios.jpg" alt="Feature 2" />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Reservas de Espacios Comunes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Reserva fácilmente los espacios comunes de tu consorcio.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ maxWidth: 345 }}>
                            <CardMedia component="img" height="140" image="/images/residentes.jpg" alt="Feature 3" />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    Comunicación Efectiva
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Mantente informado y comunica fácilmente con los residentes y administradores.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Box sx={{ backgroundColor: '#002776', color: '#ffffff', padding: '20px', textAlign: 'center' }}>
                <Typography variant="h6">Contacto</Typography>
                <Typography variant="body2">Email: contacto@consorciointeractivo.com</Typography>
                <Typography variant="body2">Teléfono: +123 456 7890</Typography>
                <Typography variant="body2">Dirección: Calle utn 123, Resistencia, Argentina</Typography>
            </Box>

            {showLoginForm && (
                <Container
                    maxWidth="xs"
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        minHeight: '100vh',
                        paddingTop: '50px',
                        position: 'absolute',
                        top: '150px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                    }}
                >
                    <Paper elevation={3} sx={{ padding: '30px', borderRadius: '12px', textAlign: 'center', width: '100%', minHeight: 'auto' }}>
                        <Typography variant="h4" component="h1" sx={{ color: '#002776', fontWeight: 'bold', marginBottom: '20px' }}>
                            Iniciar Sesión
                        </Typography>

                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">Inicio de sesión exitoso</Alert>}

                        <form onSubmit={handleLogin}>
                            <TextField
                                label="Usuario"
                                type="text"
                                fullWidth
                                margin="normal"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                label="Contraseña"
                                type="password"
                                fullWidth
                                margin="normal"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ marginTop: '20px', backgroundColor: '#002776', '&:hover': { backgroundColor: '#0043A6' } }}
                            >
                                Iniciar Sesión
                            </Button>
                        </form>
                    </Paper>
                </Container>
            )}
        </Box>
    );
}

export default Autentication;