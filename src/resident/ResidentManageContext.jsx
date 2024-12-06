import {createContext, useState} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";


export const ResidentManageContext = createContext()
export function ResidentManageContextProvider(props){
    const [consortiumIdState , setConsortiumIdState] = useState(null)
    const [consortiumName, setConsortiumName] = useState("")
    const [aConsortiumByIdConsortium, setAConsortiumByIdConsortium] = useState({})

    const getAConsortiumByIdConsortium = async () => {
        // Obtén el token almacenado
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener la ejecución si no hay token
        }

        try {
            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isResident = decodedToken?.role?.includes('ROLE_RESIDENT');

            if (!isResident) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener la ejecución si no es ROLE_ADMIN
            }

            // Realiza la solicitud para obtener el consorcio por su ID
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums/consortium/${consortiumIdState}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            const consortium = res.data; // Almacenar directamente el objeto retornado

            // Guardamos el nombre y los detalles del consorcio
            setConsortiumName(consortium.name);
            setAConsortiumByIdConsortium({
                consortiumId: consortium.consortiumId,
                name: consortium.name,
                address: consortium.address,
                city: consortium.city,
                province: consortium.province
            });

        } catch (error) {
            console.error("Error fetching consortium data", error);
            alert("Hubo un problema al obtener los datos del consorcio. Por favor, intenta nuevamente.");
        }
    }

    return(
        <ResidentManageContext.Provider value={{
            consortiumIdState,
            setConsortiumIdState,
            consortiumName, setConsortiumName,
            aConsortiumByIdConsortium, setAConsortiumByIdConsortium,
            getAConsortiumByIdConsortium
        }}>
            {props.children}
        </ResidentManageContext.Provider>

    )
}