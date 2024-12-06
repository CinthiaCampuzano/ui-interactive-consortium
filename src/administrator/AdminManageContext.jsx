import {createContext, useState} from "react";
import axios from "axios";
import { format } from 'date-fns';
import {jwtDecode} from "jwt-decode";

export const AdminManageContext = createContext()

export function AdminManageContextProvider(props){
    const [consortiumIdState , setConsortiumIdState] = useState(null)
    const [allPersons , setAllPersons] = useState([])
    const [allDepartments, setAllDepartments] = useState([])
    const [consortiumName, setConsortiumName] = useState("")
    const [aConsortiumByIdConsortium, setAConsortiumByIdConsortium] = useState({})
    const [allAmenities , setAllAmenities] = useState([])
    const [allPosts , setAllPosts] = useState([])
    const [allMaintenanceFees , setAllMaintenanceFees] = useState([])
    const [period , setPeriod] = useState(null)
    const [allMaintenanceFeesPayment , setAllMaintenanceFeesPayment] = useState([])
    const statusMapping = {
        PENDING: "Pendiente",
        PAID: "Pagado"
    };


    function formatDate(dateString) {
        if (!dateString) {
            return ''; // Si la fecha es null o undefined, retorna una cadena vacía
        }
        return format(new Date(dateString), "dd/MM/yyyy HH:mm"); // Formato de fecha legible
    }

    const getAllPersons = async () => {
        // Obtén el token del almacenamiento local
        const token = localStorage.getItem('token');

        // Verifica si hay un token presente
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener ejecución si no hay token
        }

        try {
            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener ejecución si no es ROLE_ADMIN
            }

            // Realiza la solicitud para obtener las personas del consorcio
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/consortiums/${consortiumIdState}/persons`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );

            console.log(res.data);
            const persons = res.data;

            // Mapea y establece las personas en el estado
            setAllPersons(persons.map(person => {
                return {
                    personId: person.personId,
                    name: person.name,
                    lastName: person.lastName,
                    mail: person.mail,
                    dni: person.dni,
                    phoneNumber: person.phoneNumber,
                    fullName: `${person.name} ${person.lastName}`,
                };
            }));
        } catch (error) {
            console.error("Error al obtener las personas:", error);
            alert("Hubo un problema al obtener los datos. Por favor, inténtalo nuevamente.");
        }
    };

    const getAllDepartmentsByConsortium = async (idConsortium) => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detener la ejecución si no hay token
        }

        try {
            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener la ejecución si no es ROLE_ADMIN
            }

            // Realizar la solicitud GET para obtener los departamentos
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/departments?consortiumId=${idConsortium}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en los encabezados
                }
            });

            // Acceder a los datos de los departamentos y actualizar el estado
            const departments = res.data.content;
            console.log(departments);
            setAllDepartments(departments.map(department => {
                return {
                    departmentId: department.departmentId,
                    code: department.code,
                    personIdP: department.propietary.personId,
                    fullNameP: department.propietary.name && department.propietary.lastName
                        ? `${department.propietary.name} ${department.propietary.lastName}`
                        : '',
                    personIdR: department.resident.personId,
                    fullNameR: department.resident.name && department.resident.lastName
                        ? `${department.resident.name} ${department.resident.lastName}`
                        : ''
                };
            }));

        } catch (error) {
            console.error("Error al obtener los departamentos:", error);
            alert("Hubo un problema al obtener los departamentos. Por favor, intenta nuevamente.");
        }
    };

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
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');

            if (!isAdmin) {
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
    };

    const getAllAmenitiesByIdConsortium= async () => {
        try {
            // Obtén el token almacenado
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No estás autorizado. Por favor, inicia sesión.");
                return; // Detener la ejecución si no hay token
            }

            // Decodifica el token para verificar el rol
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return; // Detener la ejecución si no es ROLE_ADMIN
            }

            // Si el usuario tiene el rol adecuado, realiza la solicitud
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/Amenities?idConsortium=${consortiumIdState}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );
            console.log(res.data);

            // Mapear y establecer las amenities
            const amenities = res.data.content;
            setAllAmenities(
                amenities.map((amenity) => {
                    return {
                        amenityId: amenity.amenityId,
                        name: amenity.name,
                        maxBookings: amenity.maxBookings,
                    };
                })
            );
        } catch (error) {
            console.error("Error al obtener amenities:", error);
            alert("Hubo un problema al obtener los amenities.");
        }
    };

    const getAllPostsByIdConsortium= async () => {   // Obtén el token del almacenamiento local
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return; // Detenemos la ejecución si no hay token
        }

        // Decodifica el token para verificar el rol
        const decodedToken = jwtDecode(token);
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            alert("No tienes permisos para ver esta información.");
            return; // Detenemos la ejecución si no tiene el rol ROLE_ADMIN
        }

        // Continúa con la solicitud si el usuario tiene permisos
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts?idConsortium=${consortiumIdState}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                },
            });

            console.log(res.data);
            const posts = res.data.content;
            setAllPosts(posts.map((post) => ({
                postId: post.postId,
                title: post.title,
                content: post.content,
                creationPostDate: formatDate(post.creationPostDate),
            })));
        } catch (error) {
            console.error("Error al obtener los posts:", error);
            if (error.response?.status === 403) {
                alert("No tienes permiso para acceder a esta información.");
            } else {
                alert("Ocurrió un error al intentar obtener los posts.");
            }
        }
    };

    const getAllMaintenanceFeesByIdConsortium= async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/maintenanceFee?consortiumId=${consortiumIdState}`)
        console.log(res.data);
        const maintenanceFees = res.data.content;
        setAllMaintenanceFees(maintenanceFees.map(maintenanceFee =>{
            return {
                maintenanceFeeId: maintenanceFee.maintenanceFeeId,
                period: maintenanceFee.period,
                fileName: maintenanceFee.fileName,
                uploadDate: formatDate(maintenanceFee.uploadDate)
            }
        }))
    }

    const getAllMaintenanceFeesPaymentByIdConsortium = async () => {
        try {
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
            if (!roles.includes('ROLE_ADMIN')) {
                alert("No tienes permisos para acceder a esta información.");
                return;
            }

            // Realiza la solicitud
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/maintenanceFeePayment/consortium/${consortiumIdState}`, // consortiumId en la URL
                {
                    params: { period }, // period como query param
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const maintenanceFeesPayment = res.data.content;
            setAllMaintenanceFeesPayment(
                maintenanceFeesPayment.map((maintenanceFeePayment) => ({
                    maintenanceFeePaymentId: maintenanceFeePayment.maintenanceFeePaymentId,
                    maintenanceFeeId: maintenanceFeePayment.maintenanceFee.maintenanceFeeId,
                    period: maintenanceFeePayment.maintenanceFee.period,
                    code: maintenanceFeePayment.department.code,
                    status: statusMapping[maintenanceFeePayment.status] || maintenanceFeePayment.status,
                    paymentDate: formatDate(maintenanceFeePayment.paymentDate)
                }))
            );
        } catch (error) {
            console.error("Error al obtener las expensas: ", error);
            alert("Hubo un error al obtener los datos.");
        }
    };

 return(
     <AdminManageContext.Provider value={{
         consortiumIdState,
         setConsortiumIdState,
         allPersons,
         setAllPersons,
         allDepartments,
         setAllDepartments,
         consortiumName,
         setConsortiumName,
         aConsortiumByIdConsortium,
         setAConsortiumByIdConsortium,
         allAmenities ,
         setAllAmenities,
         allPosts,
         setAllPosts,
         allMaintenanceFees ,
         setAllMaintenanceFees,
         period ,
         setPeriod,
         allMaintenanceFeesPayment , setAllMaintenanceFeesPayment,
         getAllPersons,
         getAllDepartmentsByConsortium,
         getAConsortiumByIdConsortium,
         getAllAmenitiesByIdConsortium,
         getAllPostsByIdConsortium,
         getAllMaintenanceFeesByIdConsortium,
         getAllMaintenanceFeesPaymentByIdConsortium

     }}>
         {props.children}
     </AdminManageContext.Provider>

 )
}
