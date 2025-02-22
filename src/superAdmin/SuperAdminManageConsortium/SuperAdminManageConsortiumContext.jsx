import {createContext, useState} from "react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

export const SuperAdminManageConsortiumContext= createContext()

export function SuperAdminManageConsortiumContextProvider(props){
    const [allConsortia, setAllConsortia] = useState([]);
    const [allAdministrator , setAllAdministrator] = useState([])


    const getAllConsortium = async () => {
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // No continúa si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de SuperAdmin
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para acceder a esta página.");
                return; // No continúa si no es SuperAdmin
            }

            // Si el usuario tiene el rol adecuado, hace la solicitud al backend
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Se incluye el token en el encabezado de la solicitud
                }
            });

            const consortiums = res.data.content;
            setAllConsortia(consortiums.map(consortium => {
                const administrator = consortium.administrator || {};
                return {
                    consortiumId: consortium.consortiumId,
                    name: consortium.name,
                    address: consortium.address,
                    city: consortium.city,
                    province: consortium.province,
                    administratorId: administrator.administratorId || '',
                    fullName: administrator.name && administrator.lastName
                        ? `${administrator.name} ${administrator.lastName}`
                        : '',
                    consortiumType: consortium.consortiumType,
                    functionalUnits: consortium.functionalUnits,
                    floors: consortium.floors,
                    apartmentsPerFloor: consortium.apartmentsPerFloor
                };
            }));
        } catch (exception) {
            console.error('Error al obtener los consorcios:', exception);
            alert("Hubo un error al cargar los consorcios.");
        }
    };

    const getAllAdministrator = async () => {
        const token = localStorage.getItem('token'); // Obtén el token almacenado

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // No continúa si no hay token
        }

        try {
            // Decodifica el token y verifica si tiene el rol de SuperAdmin
            const decodedToken = jwtDecode(token);
            const isSuperAdmin = decodedToken?.role?.includes('ROLE_ROOT');

            if (!isSuperAdmin) {
                alert("No tienes permisos para acceder a esta página.");
                return; // No continúa si no es SuperAdmin
            }

            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/administrators`, {
                headers: {
                    Authorization: `Bearer ${token}` // Se incluye el token en el encabezado de la solicitud
                }
            });

            const administrators = res.data.content;
            setAllAdministrator(
                administrators.map(administrator => ({
                    administratorId: administrator.administratorId,
                    fullName: `${administrator.name} ${administrator.lastName}`
                }))
            );
        } catch (error) {
            console.error("Error al obtener los administradores:", error);
            alert("Ocurrió un error al obtener los administradores. Intenta nuevamente.");
        }
    };

    return(
        <SuperAdminManageConsortiumContext.Provider value={{
            allConsortia,
            setAllConsortia,
            allAdministrator ,
            setAllAdministrator,
            getAllConsortium,
            getAllAdministrator
        }}>
            {props.children}
        </SuperAdminManageConsortiumContext.Provider>
    )
}