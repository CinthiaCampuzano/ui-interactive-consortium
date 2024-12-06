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


function Autentication() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate(); // Nuevo hook para redirigir

    const handleLogin = async (event) => {
        event.preventDefault(); // Evita el comportamiento predeterminado del formulario
        try {
            const response = await Auth(email, password); // Llama al servicio de login
            const token = response.token;
            localStorage.setItem('token', token); // Guarda el token en localStorage
            console.log('Holaaaaa');

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
            console.error(err.message);
            setError(err.message); // Muestra el error en la interfaz
            setSuccess(false);
        }
    };
    return (
        <Container
            maxWidth="xs" // Cambié de "sm" a "xs" para hacerlo más estrecho
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: '100vh',
                paddingTop: '50px'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: '30px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    width: '100%',
                    minHeight: '60vh', // Incrementé la altura mínima
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        color: '#003366',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                    }}
                >
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
                            backgroundColor: '#003366',
                            '&:hover': { backgroundColor: '#00509E' },
                        }}
                    >
                        Iniciar Sesión
                    </Button>
                </form>

                <Box sx={{ marginTop: '20px' }}>
                    <Link
                        href="#"
                        sx={{
                            color: '#00509E',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
}

export default Autentication;