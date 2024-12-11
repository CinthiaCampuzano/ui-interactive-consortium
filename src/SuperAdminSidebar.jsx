import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';

const pages = [
    { name: 'Administradores', url: '/', icon: <AccountCircleIcon /> },
    { name: 'Consorcios', url: '/consortia', icon: <ApartmentIcon /> }
];

const SuperAdminSidebar = () => {
    const [isDrawerOpen, setDrawerOpen] = useState(false); // Estado para el Drawer
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirigir al login
    };

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // Detectar pantallas pequeñas

    const toggleDrawer = () => {
        setDrawerOpen(!isDrawerOpen);
    };

    const sidebarContent = (
        <Box
            sx={{
                width: 240,
                bgcolor: '#F4F3EF',
                color: '#002776',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
            }}
        >
            {/* Encabezado */}
            <Box
                sx={{
                    p: 2,
                    bgcolor: '#B2675E',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    borderBottom: '1px solid #E0D9C0',
                }}
            >
                <Typography variant="h6" fontWeight="bold" fontFamily="monospace">
                    Consorcios
                </Typography>
            </Box>

            {/* Menú */}
            <List sx={{ flexGrow: 1 }}>
                {pages.map((page) => (
                    <ListItem
                        button
                        key={page.name}
                        component={NavLink}
                        to={page.url}
                        sx={{
                            textDecoration: 'none',
                            color: '#002776',
                            '&.active': {
                                bgcolor: '#E0D9C0',
                                color: '#B2675E',
                                fontWeight: 'bold',
                            },
                            '&:hover': { bgcolor: '#F1ECE5' },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>{page.icon}</ListItemIcon>
                        <ListItemText primary={page.name} />
                    </ListItem>
                ))}
            </List>

            {/* Logout */}
            <ListItem
                button
                onClick={handleLogout}
                sx={{
                    borderTop: '1px solid #E0D9C0',
                    color: '#B2675E',
                    '&:hover': { bgcolor: '#F1ECE5' },
                }}
            >
                <ListItemIcon sx={{ color: 'inherit' }}>
                    <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Cerrar sesión" />
            </ListItem>
        </Box>
    );

    return (
        <>
            {/* Botón para abrir el Drawer en pantallas pequeñas */}
            {isSmallScreen && (
                <IconButton
                    onClick={toggleDrawer}
                    sx={{
                        position: 'fixed',
                        top: 10,
                        left: 10,
                        zIndex: 1201,
                        bgcolor: '#B2675E',
                        color: '#FFFFFF',
                        '&:hover': { bgcolor: '#A15D50' },
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* Solo renderizamos uno de los dos componentes según el tamaño de la pantalla */}
            {isSmallScreen ? (
                <Drawer
                    anchor="left"
                    open={isDrawerOpen}
                    onClose={toggleDrawer}
                    variant="temporary" // Drawer deslizante en pantallas pequeñas
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: 240,
                            bgcolor: '#F4F3EF',
                            color: '#002776',
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>
            ) : (
                <Box
                    sx={{
                        position: 'fixed',
                        width: 240,
                        height: '100vh',
                        bgcolor: '#F4F3EF',
                        color: '#002776',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {sidebarContent}
                </Box>
            )}
        </>
    );
};

export default SuperAdminSidebar;