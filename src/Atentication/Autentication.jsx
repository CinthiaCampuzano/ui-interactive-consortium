import React, {useState} from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    Box, Alert,
} from '@mui/material';
import Auth from "./Auth.jsx";
import {isAdmin, isResident, isSuperAdmin} from "./TokenUtils.jsx";
import {useNavigate} from "react-router-dom";
import { Carousel } from 'react-responsive-carousel'; // Librería para el carrusel de imágenes
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Estilos para el carrusel




function Autentication() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false); // Controla la visibilidad del formulario de login
    const navigate = useNavigate(); // Nuevo hook para redirigir

    const handleLogin = async (event) => {
        event.preventDefault(); // Evita el comportamiento predeterminado del formulario
        try {
            const response = await Auth(email, password); // Llama al servicio de login
            const token = response.token;
            localStorage.setItem('token', token); // Guarda el token en localStorage

            // Verificamos el rol y redirigimos a la página correspondiente
            if (isSuperAdmin()) {
                navigate('/superAdmin/management'); // Redirige al Dashboard del SuperAdmin
            } else if (isAdmin()) {
                navigate('/admin/management'); // Redirige al Dashboard del Admin
            } else if (isResident()) {
                navigate('/resident/management'); // Redirige al Dashboard del Resident
            } else {
                navigate('/login'); // Redirige a login si no se encuentra un rol válido
            }

            // Indica éxito en la interfaz
            setSuccess(true);
            setError('');
        } catch (err) {
            console.log(err);
            setError("Usuario o contraseña incorrectos"); // Muestra el error en la interfaz
            setSuccess(false);
        }
    };

    return (
        <>
            {/* Barra superior con el botón de Iniciar sesión */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#ffffff' }}>
                <Typography variant="h3" sx={{ color: '#644536', fontWeight: 'bold', flexGrow: 1, textAlign: 'center' }}>
                    ¡Bienvenidos a Consorcio Interactivo!
                </Typography>
                <Button variant="outlined" sx={{ color: '#644536', borderColor: '#644536' }} onClick={() => setShowLoginForm(true)}>
                    Iniciar Sesión
                </Button>
            </Box>

            {/* Carrusel de imágenes con fondo azul #072246 en el área sin imagen */}
            <Carousel autoPlay interval={3000} infiniteLoop>
                <div style={{ backgroundColor: '#072246' }}>
                    <img src="/images/Administradora.jpg" alt="Imagen 1" style={{ width: '50%', height: 'auto', objectFit: 'contain', margin: '0 auto' }} />
                </div>
                <div style={{ backgroundColor: '#072246' }}>
                    <img src="/images/propietarios.jpg" alt="Imagen 2" style={{ width: '50%', height: 'auto', objectFit: 'contain', margin: '0 auto' }} />
                </div>
                <div style={{ backgroundColor: '#072246' }}>
                    <img src="/images/residentes.jpg" alt="Imagen 3" style={{ width: '50%', height: 'auto', objectFit: 'contain', margin: '0 auto' }} />
                </div>
            </Carousel>

            {/* Sección de autenticación, solo se muestra si showLoginForm es true */}
            {showLoginForm && (
                <Container
                    maxWidth="xs"
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        minHeight: '100vh',
                        paddingTop: '50px',
                        position: 'absolute', // Hace que el formulario se superponga al carrusel
                        top: '150px', // Ajusta para que el formulario no tape el nombre de la app
                        left: '50%',
                        transform: 'translateX(-50%)',
                        // backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo blanco semitransparente
                        zIndex: 1000, // Asegura que el formulario esté por encima del carrusel
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
                                sx={{
                                    marginTop: '20px',
                                    backgroundColor: '#002776',
                                    '&:hover': { backgroundColor: '#0043A6' },
                                }}
                            >
                                Iniciar Sesión
                            </Button>
                        </form>

                        <Box sx={{ marginTop: '20px' }}>
                            <Link
                                href="#"
                                sx={{
                                    color: '#0043A6',
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </Box>
                    </Paper>
                </Container>
            )}
        </>
    );
}

export default Autentication;