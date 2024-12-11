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

    const handleImageUpload = (event, consortiumId) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                console.log(reader.result)
                setUploadedImages((prev) => ({ ...prev, [consortiumId]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdminClick = (consortiumId) => {
        setConsortiumIdState(consortiumId)
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

            console.log(res.data);
            const consortiums = res.data.content;
            setAllConsortiumByAdmin(consortiums.map(consortium => {
                return {
                    consortiumId: consortium.consortiumId,
                    name: consortium.name,
                    address: consortium.address,
                    city: consortium.city,
                    province: consortium.province
                };
            }));
        } catch (error) {
            console.error("Error al obtener los consorcios:", error);
            alert("Ocurrió un error al intentar obtener los consorcios.");
        }
    };
    const getAllConsortiumByFilter = async () => {
        const handleEmptyValues = (value) => {
            return value === '' ? null : value;
        };

        const name = handleEmptyValues(consortiumName)
        const city = handleEmptyValues(consortiumCity)
        const province = handleEmptyValues(consortiumProvince)

        let params = {};
        if (name !== null) params.name = name;
        if (city !== null) params.city = city;
        if (province !== null) params.province = province;

        if (Object.keys(params).length === 0) {
            getAllConsortiumByIdAdmin();

        } else {
            const queryParams = new URLSearchParams(params).toString();
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums/43/filter?${queryParams}`)
            const consortiums = res.data.content;

            setAllConsortiumByAdmin(consortiums.map(consortium =>{
                return {
                    consortiumId : consortium.consortiumId,
                    name: consortium.name,
                    address: consortium.address,
                    city: consortium.city,
                    province: consortium.province,

                }
            }))
        }
    };

    return(
        <div>
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh', // Asegura que el contenedor ocupe toda la altura de la pantalla
                }}
            >
                {/* Sidebar */}
                <AdminGallerySidebar />

                {/* Contenido principal */}
                <Box
                    sx={{
                        flexGrow: 1, // Permite que este Box ocupe el espacio restante
                        marginLeft: '240px', // Mismo ancho que el Sidebar para evitar la superposición
                        padding: '20px',
                        backgroundColor: '#ffffff', // Fondo principal
                        minHeight: '100vh',
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: '#002776', // Azul oscuro
                            textAlign: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        Mis Consorcios
                    </Typography>

                    <Grid container spacing={3} justifyContent="center">
                        {allConsortiumByAdmin.map((consortium, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={allConsortiumByAdmin.length === 1 ? 12 : 6}
                                md={allConsortiumByAdmin.length === 1 ? 8 : 4}
                                key={consortium.consortiumId}
                            >
                                <Card
                                    sx={{
                                        maxWidth: 400,
                                        margin: '0 auto', // Centrar las tarjetas cuando hay pocas
                                        backgroundColor: '#FFF', // Fondo de las tarjetas
                                        border: `1px solid #B2675E`, // Borde con el color marrón
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    {/* Mostrar la imagen cargada, si existe */}
                                    {uploadedImages[consortium.consortiumId] ? (
                                        <CardMedia
                                            component="img"
                                            height="220"
                                            image={uploadedImages[consortium.consortiumId]} // Imagen cargada
                                            alt={consortium.name}
                                        />
                                    ) : (
                                        <CardMedia
                                            component="img"
                                            height="220"
                                            image={consortium.image || 'https://via.placeholder.com/400x220'} // Imagen predeterminada
                                            alt={consortium.name}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            component="div"
                                            sx={{
                                                color: '#002776', // Azul oscuro
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {consortium.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ color: '#B2675E' }}
                                        >
                                            <LocationOn sx={{ fontSize: 20, color: '#002776' }} />
                                            {`${consortium.address}, ${consortium.city}, ${consortium.province}`}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="medium"
                                            variant="contained"
                                            onClick={() => handleAdminClick(consortium.consortiumId)}
                                            sx={{
                                                backgroundColor: '#002776',
                                                color: '#FFF',
                                                borderRadius: '20px', // Bordes redondeados
                                                padding: '10px 20px', // Más relleno para un diseño moderno
                                                fontWeight: 'bold',
                                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Sombra ligera
                                                transition: 'all 0.3s ease', // Animación suave
                                                '&:hover': {
                                                    backgroundColor: '#001B5E',
                                                    transform: 'translateY(-2px)', // Efecto de "levitación" al pasar el mouse
                                                    boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.2)', // Sombra más intensa
                                                },
                                            }}
                                        >
                                            Administrar
                                        </Button>
                                        <IconButton component="label">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(event) => handleImageUpload(event, consortium.consortiumId)}
                                            />
                                            <PhotoCameraIcon sx={{ color: '#002776' }} /> {/* Icono para "Cambiar foto" */}
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </div>
    )
}

export default AdminConsortiumList