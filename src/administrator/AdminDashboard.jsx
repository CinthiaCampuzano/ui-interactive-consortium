import React, {useContext, useEffect} from 'react';
import { Box, Container, Grid, Card, CardActionArea, CardContent, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Iconos
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ReportIcon from "@mui/icons-material/Report";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AdminGallerySidebar from "./AdminGallerySidebar.jsx";
import {AdminManageContext} from "./AdminManageContext.jsx";

const options = [
    { title: 'Mis Consorcios', icon: <BusinessIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/admin/management' },
    { title: 'Usuarios', icon: <PeopleIcon style={{ fontSize: 80, color: '#002776' }} />, path: `/admin/management/users` },
    { title: 'Departamentos', icon: <ApartmentIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/admin/management/departamentos' },
    { title: 'Espacio Común', icon: <HomeIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/admin/management/espacio-comun' },
    { title: 'Expensas', icon: <ReceiptIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/admin/management/expensas' },
    { title: 'Tablón de Anuncios', icon: <AnnouncementIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/admin/management/publicaciones' },
    { title: 'Reclamos', icon: <ReportIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/admin/management/reclamos' },
    { title: 'Reservas', icon: <CalendarTodayIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/admin/management/reservas' },
];


const Dashboard = () => {
    const {consortiumName, consortiumIdState, getAConsortiumByIdConsortium} = useContext(AdminManageContext)
    const navigate = useNavigate();

    useEffect(() => {
        getAConsortiumByIdConsortium();
    }, [consortiumIdState]);

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
            }}
        >
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
                        Panel de Gestión de {consortiumName}
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
export default Dashboard;
