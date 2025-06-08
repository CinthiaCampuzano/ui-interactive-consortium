import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Card, CardActions, CardContent, CardMedia, Grid, TablePagination, TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Button from "@mui/material/Button";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import {useNavigate} from "react-router-dom";
import {AdminManageContext} from "./AdminManageContext.jsx";
import {jwtDecode} from "jwt-decode";
import AdminGallerySidebar from "./AdminGallerySidebar.jsx";
import {LocationOn} from "@mui/icons-material";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const columns = [
    { id: 'name', label: 'Edificio', minWidth: 100 },
    { id: 'city', label: 'Ciudad', minWidth: 100 },
    { id: 'province', label: 'Provincia', minWidth: 100 }
]

function AdminConsortiumList(){
    const {consortiumIdState, setConsortiumIdState} = useContext(AdminManageContext)
    const [consortiumName, setConsortiumName] = useState('');
    const [consortiumCity, setConsortiumCity] = useState('')
    const [consortiumProvince, setConsortiumProvince] = useState('')
    const [allConsortiumByAdmin , setAllConsortiumByAdmin] = useState([])
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);
    const navigate = useNavigate()
    const [uploadedImages, setUploadedImages] = useState({}); // Estado para manejar las imágenes subidas

    // TODO ajustar la carga de imagenes
    const handleImageUpload = async (event, consortiumId) => {
        const file = event.target.files[0];
        if (file) {
            const token = localStorage.getItem('token'); // Get the stored token
            if (!token) {
                alert("No estás autorizado. Por favor, inicia sesión.");
                return; // Stop execution if no token
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/consortiums/${consortiumId}/upload`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Create a URL for the uploaded image file
                const imageUrl = URL.createObjectURL(file);
                setUploadedImages((prev) => ({ ...prev, [consortiumId]: imageUrl }));

            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Ocurrió un error al intentar subir la imagen.");
            }
        }
    };

    const handleAdminClick = (consortiumId) => {
        setConsortiumIdState(consortiumId)
        localStorage.setItem('consortiumId', consortiumId)
        // Redirige a la nueva pantalla con el ID del consorcio
        navigate(`/admin/management/${consortiumId}/dashboard`)
    };
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        if (consortiumName === '' && consortiumCity === '' && consortiumProvince === ''){
            getAllConsortiumByIdAdmin()
        }
    }, [consortiumName, consortiumCity, consortiumProvince]);

    const getAllConsortiumByIdAdmin= async () => {
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detiene la ejecución si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de ROLE_ADMIN
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos de administrador para realizar esta acción.");
                return; // Detiene la ejecución si no es ROLE_ADMIN
            }

            // Si tiene el rol adecuado, realiza la solicitud a la API
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums/administrator`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            const consortiums = res.data.content;
            console.log(consortiums)

            setAllConsortiumByAdmin(consortiums.map(consortium => {
                return {
                    consortiumId: consortium.consortiumId,
                    name: consortium.name,
                    address: consortium.address,
                    city: consortium.city,
                    province: consortium.province
                };

            }));


            // Create an array of promises for the image download requests
            const imagePromises = consortiums.map(async (consortium) => {
                if (consortium.imagePath !== null) {
                    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums/${consortium.consortiumId}/download`, {
                        headers: {
                            Authorization: `Bearer ${token}` // Include the token in the headers
                        },
                        responseType: 'blob' // Ensure the response is a Blob
                    });
                    const imageBlob = res.data;
                    const imageUrl = URL.createObjectURL(imageBlob);
                    return { consortiumId: consortium.consortiumId, imageUrl };
                }
                return null;
            });

            // Wait for all the promises to resolve
            const images = await Promise.all(imagePromises);

            // Update the state with the downloaded images
            images.forEach(image => {
                if (image) {
                    setUploadedImages((prev) => ({ ...prev, [image.consortiumId]: image.imageUrl }));
                }
            });
        } catch (error) {
            console.error("Error al obtener los consorcios:", error);
            alert("Ocurrió un error al intentar obtener los consorcios.");
        }
    };


    return (
        <div>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh', // Ensure the container takes up the full height of the screen
                }}
            >
                {/* Sidebar */}
                <AdminGallerySidebar />

                {/* Main content */}
                <Box
                    sx={{
                        flexGrow: 1, // Allow this Box to take up the remaining space
                        marginLeft: '240px', // Same width as the Sidebar to avoid overlap
                        padding: '20px',
                        backgroundColor: '#ffffff', // Main background
                        minHeight: '100vh',
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: '#002776', // Dark blue
                            textAlign: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        Mis Consorcios
                    </Typography>

                    <Grid container spacing={3}>
                        {allConsortiumByAdmin.map((consortium) => (
                            <Grid
                                item
                                xs={12}
                                sm={allConsortiumByAdmin.length === 1 ? 12 : 6}
                                md={allConsortiumByAdmin.length === 1 ? 8 : 4}
                                key={consortium.consortiumId}
                            >
                                <Box onClick={() => handleAdminClick(consortium.consortiumId)} sx={{ cursor: 'pointer' }}>
                                    <Card
                                        sx={{
                                            maxWidth: 400,
                                            margin: '0 auto', // Center the cards when there are few
                                            backgroundColor: 'transparent',
                                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: '0px 16px 32px rgba(184, 218, 227, 0.8)',
                                            },
                                        }}
                                    >
                                        {/* Show the uploaded image if it exists */}
                                        {uploadedImages[consortium.consortiumId] ? (
                                            <CardMedia
                                                component="img"
                                                height="220"
                                                image={uploadedImages[consortium.consortiumId]} // Uploaded image
                                                alt={consortium.name}
                                            />
                                        ) : (
                                            <CardMedia
                                                component="img"
                                                height="220"
                                                image={consortium.image || '/images/consortiumPlaceHolderl2.webp'} // Default image
                                                alt={consortium.name}
                                            />
                                        )}
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        component="div"
                                                        sx={{
                                                            color: '#002776', // Dark blue
                                                            fontWeight: 'bold',
                                                            marginBottom: '8px',
                                                            marginLeft: '3px',
                                                        }}
                                                    >
                                                        {consortium.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ color: '#002776', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <LocationOn sx={{ fontSize: 20, color: '#002776', marginRight: '5px'}} />
                                                        {`${consortium.address}, ${consortium.city}, ${consortium.province}`}
                                                    </Typography>
                                                </Box>
                                                <IconButton component="label" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={(event) => handleImageUpload(event, consortium.consortiumId)}
                                                    />
                                                    <PhotoCameraIcon sx={{ color: '#002776' }} /> {/* Icon for "Change photo" */}
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </div>
    );
}

export default AdminConsortiumList