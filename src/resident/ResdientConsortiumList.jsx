import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {TablePagination, TextField} from "@mui/material";
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
    const [allConsortiumByAdmin , setAllConsortiumByAdmin] = useState([])
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [page, setPage] = React.useState(0);

    const navigate = useNavigate()
    const handleAdminClick = (consortiumId) => {
        setConsortiumIdState(consortiumId)
        // Redirige a la nueva pantalla con el ID del consorcio
        navigate(`/resident/management/${consortiumId}/dashboard`)
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
            getAllConsortiumByIdPerson();

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
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    // Ajustar padding dependiendo del tamaño de la pantalla
                    paddingX: { xs: '10px', sm: '20px', md: '40px' }
                }}
            >
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        color: '#003366',
                        // Ajustar el tamaño de la fuente para diferentes tamaños de pantalla
                        fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }
                    }}
                >
                    Mis Consorcios
                </Typography>
            </Box>
            <Paper
                elevation={2}
                sx={{
                    padding: 2,
                    margin: 'auto',
                    marginTop: '20px',
                    width: { xs: '90%', sm: '80%', md: '40%', lg: '30%' },
                }}
            >
                <Box
                    mt={3}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'nowrap', // No permite que los elementos se envuelvan
                        gap: '16px' // Espacio entre los inputs
                    }}
                >
                    <TextField
                        id="outlined-basic"
                        label="Nombre"
                        variant="outlined"
                        size="small"
                        type="text"
                        focused
                        value={consortiumName}
                        onChange={(e) => {
                            setConsortiumName(e.target.value);
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: '#002776', // Azul Francia oscuro
                                },
                            },
                            '& label.Mui-focused': {
                                color: '#002776', // Cambia el color del label al enfocarse
                            },
                        }}
                    />

                    <TextField
                        id="outlined-basic"
                        label="Ciudad"
                        variant="outlined"
                        size="small"
                        type="text"
                        focused
                        // inputRef={textFieldRef}
                        value={consortiumCity}
                        onChange={(e) => {
                            setConsortiumCity(e.target.value);
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: '#002776', // Azul Francia oscuro
                                },
                            },
                            '& label.Mui-focused': {
                                color: '#002776', // Cambia el color del label al enfocarse
                            },
                        }}
                    />

                    <TextField
                        id="outlined-basic"
                        label="Provincia"
                        variant="outlined"
                        size="small"
                        type="text"
                        focused
                        // inputRef={textFieldRef}
                        value={consortiumProvince}
                        onChange={(e) => {
                            setConsortiumProvince(e.target.value);
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: '#002776', // Azul Francia oscuro
                                },
                            },
                            '& label.Mui-focused': {
                                color: '#002776', // Cambia el color del label al enfocarse
                            },
                        }}
                    />
                </Box>

                <Box mt={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#002776',
                            '&:hover': { backgroundColor: '#001B5E' },
                            marginRight: '10px',
                        }}
                        onClick={getAllConsortiumByFilter}
                    >
                        Buscar
                    </Button>
                </Box>
            </Paper>
            <Paper
                elevation={2}
                sx={{
                    padding: 2,
                    margin: 'auto',
                    marginTop: '20px',
                    width: { xs: '95%', sm: '85%', md: '45%', lg: '35%' },
                }}
            >
                <Box display="flex" justifyContent="center" mt={3}>
                    <Paper sx={{ width: '90%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow sx={{ height: '24px' }}>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth, backgroundColor: '#F5F5DC', color:'#002776',  fontWeight: 'bold', padding: '4px'  }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                        <TableCell align="center" style={{ minWidth: 60, backgroundColor: '#F5F5DC', fontWeight: 'bold', padding: '1px' }}>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allConsortiumByAdmin
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((consortium) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={consortium.name} sx={{ height: '24px' }}>
                                                    {columns.map((column) => {
                                                        const value = consortium[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align} style={{
                                                                padding: '4px',
                                                                minWidth: column.minWidth
                                                            }}>
                                                                {value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell align="center" style={{ padding: '4px' }}>
                                                        <IconButton onClick={() => handleAdminClick(consortium.consortiumId)}>
                                                            <ManageAccountsIcon color="primary" /> {/* Ícono de administrar */}
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 20, 50]}
                            component="div"
                            count={allConsortiumByAdmin.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página"
                        />
                    </Paper>
                </Box>
            </Paper>
        </div>
    )
}
export default ResidentConsortiumList