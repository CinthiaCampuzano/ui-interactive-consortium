import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Card, CardContent, CardMedia, Grid, TablePagination, TextField} from "@mui/material";
import React, {useContext, useEffect, useState} from "react";
import Button from "@mui/material/Button";
import SuperAdminCreateAdministrator from "../superAdmin/SuperAdminManageAdmin/SuperAdminCreateAdministrator.jsx";
import Paper from "@mui/material/Paper";
import axios from "axios";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

import IconButton from "@mui/material/IconButton";

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import {useNavigate} from "react-router-dom";

import {jwtDecode} from "jwt-decode";
import {ResidentManageContext} from "./ResidentManageContext.jsx";
import AdminGallerySidebar from "../administrator/AdminGallerySidebar.jsx";
import {LocationOn} from "@mui/icons-material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera.js";
import ResidentSidebar from "./ResidentSidebar.jsx";

const columns = [
    { id: 'name', label: 'Edificio', minWidth: 100 },
    { id: 'city', label: 'Ciudad', minWidth: 100 },
    { id: 'province', label: 'Provincia', minWidth: 100 }
]

function ResidentConsortiumList(){
    const {consortiumIdState, setConsortiumIdState} = useContext(ResidentManageContext)
    const [consortiumName, setConsortiumName] = useState('');
    const [consortiumCity, setConsortiumCity] = useState('')
    const [consortiumProvince, setConsortiumProvince] = useState('')
    const [allConsortiumByPerson , setAllConsortiumByPerson] = useState([])
    const [uploadedImages, setUploadedImages] = useState({});

    const navigate = useNavigate()
    const handleAdminClick = (consortiumId) => {
        setConsortiumIdState(consortiumId)
        localStorage.setItem('consortiumId', consortiumId)
        // Redirige a la nueva pantalla con el ID del consorcio
        navigate(`/resident/management/${consortiumId}/dashboard`)
    };

    useEffect(() => {
        if (consortiumName === '' && consortiumCity === '' && consortiumProvince === ''){
            getAllConsortiumByIdPerson()
        }
    }, [consortiumName, consortiumCity, consortiumProvince]);

    const getAllConsortiumByIdPerson= async () => {
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detiene la ejecución si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de ROLE_ADMIN
            const decodedToken = jwtDecode(token);
            const isResident = decodedToken?.role?.includes('ROLE_RESIDENT');

            if (!isResident) {
                alert("No tienes permisos de residente para realizar esta acción.");
                return; // Detiene la ejecución si no es ROLE_ADMIN
            }

            // Si tiene el rol adecuado, realiza la solicitud a la API
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums/person`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            console.log(res.data);
            const consortiums = res.data.content;
            setAllConsortiumByPerson(consortiums.map(consortium => {
                return {
                    consortiumId: consortium.consortiumId,
                    name: consortium.name,
                    address: consortium.address,
                    city: consortium.city.displayName,
                    province: consortium.province.displayName
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
                <ResidentSidebar/>

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
                        {allConsortiumByPerson.map((consortium) => (
                            <Grid
                                item
                                xs={12}
                                sm={allConsortiumByPerson.length === 1 ? 12 : 6}
                                md={allConsortiumByPerson.length === 1 ? 8 : 4}
                                key={consortium.consortiumId}
                            >
                                <Box onClick={() => handleAdminClick(consortium.consortiumId)} sx={{cursor: 'pointer'}}>
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
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
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
                                                        sx={{color: '#002776', display: 'flex', alignItems: 'center'}}
                                                    >
                                                        <LocationOn
                                                            sx={{fontSize: 20, color: '#002776', marginRight: '5px'}}/>
                                                        {`${consortium.address}, ${consortium.city}, ${consortium.province}`}
                                                    </Typography>
                                                </Box>
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
    )
}

export default ResidentConsortiumList