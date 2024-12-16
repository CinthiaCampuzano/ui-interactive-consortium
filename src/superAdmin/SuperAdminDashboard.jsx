import React from 'react';
import { Box, Typography, Container, Paper, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment'; // Ícono para Consorcios
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // Ícono para Administradores
import { useNavigate } from 'react-router-dom';
import SuperAdminSidebar from "../SuperAdminSidebar.jsx";



const options = [
    { title: 'Consorcios', icon: <ApartmentIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/superAdmin/management/consorcios' },
    { title: 'Administradores', icon: <SupervisorAccountIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/superAdmin/management/administradores' }
];

const SuperAdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
            }}
        >
            <SuperAdminSidebar />
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
                        justifyContent: 'flex-start',
                        minHeight: '100vh',
                        paddingTop: '40px',
                    }}
                >
                    <Typography
                        variant="h6"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: '#003366',
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            marginBottom: '20px', // Se aumentó el margen para separar más el título de las tarjetas
                        }}
                    >
                        Panel de Gestión del SuperAdmin
                    </Typography>

                    <Grid container spacing={3} justifyContent="center" maxWidth="1000px"> {/* Se aumentó el spacing entre las tarjetas */}
                        {options.map((option, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={3}
                                key={option.title}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: index >= 4 ? '30px' : '0px',
                                }}
                            >
                                <Card
                                    sx={{
                                        width: '200px',
                                        height: '200px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: 'transparent',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0px 16px 32px rgba(184, 218, 227, 0.8)',
                                        },
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => navigate(option.path)}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            '&:hover .MuiCardContent-root': {
                                                backgroundColor: 'transparent',
                                            },
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                textAlign: 'center',
                                                transition: 'background-color 0.3s ease',
                                                backgroundColor: 'transparent',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    marginBottom: '15px', // Aumenté el margen para bajar los iconos
                                                    transition: 'color 0.3s ease',
                                                    color: '#002776',
                                                    fontSize: { xs: '2rem', md: '2.5rem' }, // Aumenté el tamaño de los iconos
                                                }}
                                            >
                                                {option.icon}
                                            </Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: '#644536',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {option.title}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default SuperAdminDashboard;