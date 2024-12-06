import React, {useContext} from 'react';
import { Grid, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ReportIcon from '@mui/icons-material/Report';
import { useNavigate } from 'react-router-dom';
import Container from "@mui/material/Container";
import ApartmentIcon from "@mui/icons-material/Apartment";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const options = [
    { title: 'Mis Consorcios', icon: <BusinessIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/resident/management' },
    { title: 'Expensas', icon: <ReceiptIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/resident/management/expensas' },
    { title: 'Tablón de Anuncios', icon: <AnnouncementIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/resident/management/publicaciones'},
    { title: 'Reclamos', icon: <ReportIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/resident/management/reclamos' },
    { title: 'Reservas', icon: <CalendarTodayIcon style={{ fontSize: 80, color: '#002776' }} />, path: '/resident/management/reservas' },
];

const ResidentDashboard = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Box
                sx={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    paddingX: { xs: '10px', sm: '20px', md: '40px' },
                }}
            >
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        color: '#003366',
                        fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                    }}
                >
                    Panel del Residente del Consorcio ...
                </Typography>
            </Box>
            <Container
                maxWidth="lg"
                style={{
                    marginTop: '40px',
                    marginBottom: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={2}
                    style={{
                        padding: '40px',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '900px',
                    }}
                >
                    <Grid container spacing={4} justifyContent="center" alignItems="center">
                        {/* Primera fila con 4 opciones */}
                        {options.slice(0, 4).map((option) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={3} // Cambiado a 3 para que entren 4 elementos por fila
                                key={option.title}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <Card
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => navigate(option.path)}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <CardContent style={{ textAlign: 'center' }}>
                                            {option.icon}
                                            <Typography variant="h6" style={{ marginTop: '10px' }}>
                                                {option.title}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                        {/* Segunda fila con 4 opciones */}
                        {options.slice(4).map((option) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={3} // Igual que arriba para mantener consistencia
                                key={option.title}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <Card
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => navigate(option.path)}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <CardContent style={{ textAlign: 'center' }}>
                                            {option.icon}
                                            <Typography variant="h6" style={{ marginTop: '10px' }}>
                                                {option.title}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Container>
        </div>
    );
};

export default ResidentDashboard;