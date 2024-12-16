import {createContext, useEffect, useState} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {format} from "date-fns";


export const ResidentManageContext = createContext()
export function ResidentManageContextProvider(props){
    const [consortiumIdState , setConsortiumIdState] = useState(null)
    const [consortiumName, setConsortiumName] = useState("")
    const [aConsortiumByIdConsortium, setAConsortiumByIdConsortium] = useState({})
    const [allMaintenanceFeesPaymentPerson , setAllMaintenanceFeesPaymentPerson] = useState([])
    const [allClaims , setAllClaims] = useState([])
    const statusMapping = {
        PENDING: "Pendiente",
        PAID: "Pagado"
    };
    const statusMappingClaim = {
        PENDING: "Pendiente",
        PAID: "Pagado",
        EXPIRED: "Expirado",
        CANCELED: "Cancelado",
        UNDER_REVIEW: "En Revisión",
        FINISHED : "Resuelto"
    };

    useEffect(() => {
        const storedConsortiumId = localStorage.getItem('consortiumId');
        if (storedConsortiumId) {
            setConsortiumIdState(storedConsortiumId);
        } else {
            navigate('/admin/management/'); // Redirect if no consortiumId is found
        }
    }, []);

    function formatDate(dateString) {
        if (!dateString) {
            return ''; // Si la fecha es null o undefined, retorna una cadena vacía
        }
        return format(new Date(dateString), "dd/MM/yyyy HH:mm"); // Formato de fecha legible
    }

    useEffect(() => {
        if (consortiumIdState) {
            getAConsortiumByIdConsortium();
        }
    }, [consortiumIdState]);

    const getAConsortiumByIdConsortium = async () => {

        if (!consortiumIdState) {
            return;
        }

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

    const getAllMaintenanceFeesPaymentByIdConsortiumAndPerson = async () => {
        try {
            if (!consortiumIdState) {
                return;
            }

            // Obtén el token
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No tienes acceso. Por favor, inicia sesión.");
                return;
            }

            // Decodifica el token
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.role || [];

            // Verifica el rol
            if (!roles.includes('ROLE_RESIDENT')) {
                alert("No tienes permisos para acceder a esta información.");
                return;
            }

            // Realiza la solicitud
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/maintenanceFeePayment/${consortiumIdState}/person`, // consortiumId en la URL
                {
                    // params: { period }, // period como query param
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const maintenanceFeesPayment = res.data.content;
            setAllMaintenanceFeesPaymentPerson(
                maintenanceFeesPayment.map((maintenanceFeePayment) => ({
                    maintenanceFeePaymentId: maintenanceFeePayment.maintenanceFeePaymentId,
                    maintenanceFeeId: maintenanceFeePayment.maintenanceFee.maintenanceFeeId,
                    period: maintenanceFeePayment.maintenanceFee.period,
                    code: maintenanceFeePayment.department.code,
                    status: statusMapping[maintenanceFeePayment.status] || maintenanceFeePayment.status,
                    paymentDate: formatDate(maintenanceFeePayment.paymentDate),
                    amount: maintenanceFeePayment.amount
                }))
            );
        } catch (error) {
            console.error("Error al obtener las expensas: ", error);
            alert("Hubo un error al obtener los datos.");
        }
    };

    const getAllClaimByConsortiumAndPerson = async () => {
        try {

            if (!consortiumIdState) {
                return;
            }

            // Obtén el token
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No tienes acceso. Por favor, inicia sesión.");
                return;
            }

            // Decodifica el token
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.role || [];

            // Verifica el rol
            if (!roles.includes('ROLE_RESIDENT')) {
                alert("No tienes permisos para acceder a esta información.");
                return;
            }

            // Realiza la solicitud
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/issueReport/consortium/${consortiumIdState}/person`, // consortiumId en la URL
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const claims = res.data.content;
            console.log(claims)
            setAllClaims(
                claims.map((claim) => ({
                    issueReportId: claim.issueReportId,
                    subject: claim.subject,
                    issue: claim.issue,
                    status: statusMappingClaim[claim.status] || claim.status,
                    createdDate: formatDate(claim.createdDate),
                    response: claim.response,
                    responseDate: formatDate(claim.responseDate),
                }))
            );
            console.log(allClaims)
        } catch (error) {
            console.error("Error al obtener las expensas: ", error);
            alert("Hubo un error al obtener los datos.");
        }
    };


    return(
        <ResidentManageContext.Provider value={{
            consortiumIdState,
            setConsortiumIdState,
            consortiumName, setConsortiumName,
            aConsortiumByIdConsortium, setAConsortiumByIdConsortium,
            allMaintenanceFeesPaymentPerson , setAllMaintenanceFeesPaymentPerson,statusMappingClaim,
            allClaims , setAllClaims,
            getAConsortiumByIdConsortium,
            getAllMaintenanceFeesPaymentByIdConsortiumAndPerson,
            getAllClaimByConsortiumAndPerson
        }}>
            {props.children}
        </ResidentManageContext.Provider>

    )
}