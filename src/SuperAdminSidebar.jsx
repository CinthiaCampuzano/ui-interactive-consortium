import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Drawer,
    useMediaQuery,
    useTheme,
    ListItem,
    ListItemIcon,
    ListItemText, List
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';



const SuperAdminSidebar = () => {
    const [isDrawerOpen, setDrawerOpen] = useState(false); // Estado para el Drawer

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const toggleDrawer = () => {
        setDrawerOpen(!isDrawerOpen);
    };

    const menuItems = [
        { title: 'Administradores', path: '/superAdmin/management/administradores', icon: <AccountCircleIcon /> },
        { title: 'Consorcios', path: '/superAdmin/management/consorcios', icon: <ApartmentIcon /> }
    ];

    const sidebarContent = (
        <Box
            sx={{
                width: 240,
                bgcolor: '#072246',
                color: '#ffffff',
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
                    bgcolor: '#072246',
                    color: '#072246',
                    textAlign: 'center',
                }}
            >
                <img src="/CiLogoLq.jpg" alt="Icon" style={{
                    width: '75%', // Adjust the width to fit within the sidebar
                    height: 'auto', // Maintain the aspect ratio
                    margin: '0 auto', // Center the image
                    display: 'block', // Ensure the image is a block element
                }}/>
                {/*<Typography*/}
                {/*    variant="h5"*/}
                {/*    fontWeight="700"*/}
                {/*    fontFamily="'Poppins', sans-serif"*/}
                {/*    letterSpacing="0.8px"*/}
                {/*    sx={{*/}
                {/*        textTransform: 'capitalize',*/}
                {/*        color: '#ffffff',*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Consorcio interactivo*/}
                {/*</Typography>*/}
            </Box>

            {/* Menú de navegación */}
            <List>
                {menuItems.map((item, index) => (
                    <ListItem
                        button
                        key={index}
                        onClick={() => (window.location.href = item.path)}
                        sx={{
                            color: '#ffffff',
                            '&:hover': { bgcolor: '#004481' },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.title} />
                    </ListItem>
                ))}
            </List>

            {/* Espacio flexible */}
            <Box sx={{ flex: 1 }}></Box>

            {/* Usuario actual */}
            <Box
                sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: '#004481',
                    marginBottom: 1,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    <AccountCircleIcon
                        sx={{
                            fontSize: 24,
                            color: '#ffffff',
                        }}
                    />
                    <Typography variant="body1" fontWeight="bold">
                        SuperAdmin
                    </Typography>
                </Box>
            </Box>

            {/* Botón de Cerrar sesión */}
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

            {isSmallScreen ? (
                <Drawer
                    anchor="left"
                    open={isDrawerOpen}
                    onClose={toggleDrawer}
                    variant="temporary"
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
                        top: 0,
                        left: 0,
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