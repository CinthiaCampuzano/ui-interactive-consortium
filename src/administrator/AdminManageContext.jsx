// /home/gustavo/Develop/ui-interactive-consortium/src/administrator/AdminManageContext.jsx
import {createContext, useEffect, useState} from "react";
import axios from "axios";
import { format, parseISO } from 'date-fns'; // Asegúrate de importar parseISO si las fechas vienen como string ISO
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AdminManageContext = createContext()

export function AdminManageContextProvider(props){
    const [consortiumIdState , setConsortiumIdState] = useState(null)
    const [allPersons , setAllPersons] = useState([])
    const [allDepartments, setAllDepartments] = useState([])
    const [consortiumName, setConsortiumName] = useState("")
    const [aConsortiumByIdConsortium, setAConsortiumByIdConsortium] = useState({})
    const [allAmenities , setAllAmenities] = useState([])
    const [allPosts , setAllPosts] = useState([])
    // Cambiado: de allMaintenanceFees a allConsortiumFeePeriods
    const [allConsortiumFeePeriods , setAllConsortiumFeePeriods] = useState([])
    const [period , setPeriod] = useState(null) // Se mantiene por ahora, para la navegación a pagos
    const [allMaintenanceFeesPayment , setAllMaintenanceFeesPayment] = useState([]) // Esto podría necesitar revisión si la lógica de pagos también cambia
    const [allClaims , setAllClaims] = useState([])
    const [departmentStats, setDepartmentStats] = useState({
        occupied: 0,
        free: 0,
        onlyResident: 0,
        onlyOwner: 0
    });
    const [totalDepartments, setTotalDepartments] = useState(0);
    const [openDniDialog, setOpenDniDialog] = useState(false);

    const navigate = useNavigate();

    const statusMapping = {
        PENDING: "Pendiente",
        PAID: "Pagado",
        EXPIRED: "Expirado",
        CANCELED: "Cancelado",
        UNDER_REVIEW: "En Revisión",
        FINISHED : "Resuelto"
        // Añade aquí los mapeos para EConsortiumFeePeriodStatus si son diferentes
        // Ejemplo: EConsortiumFeePeriodStatus.GENERATED -> "Generado"
    };

    // Mapeo para EConsortiumFeePeriodStatus (basado en un ENUM típico)
    // Ajusta esto según los valores reales de tu EConsortiumFeePeriodStatus
    const feePeriodStatusMapping = {
        PENDING_GENERATION: "Pendiente Generación",
        GENERATED: "Generado",
        SENT: "Enviado",
        PARTIALLY_PAID: "Parcialmente Pagado",
        PAID: "Pagado",
        OVERDUE: "Vencido",
        // ...otros estados
    };


    const [newPersonDpto,   setNewPersonDpto] =  useState( {
        personId: null,
        fullName: null,
    })
    const [personCreationType, setPersonCreationType] = useState(null);

    const [newResidentDpto, setNewResidentDpto] =  useState( {
        personId: null,
        fullName: null,
    })


    function formatDate(dateString, outputFormat = "dd/MM/yyyy HH:mm") {
        if (!dateString) {
            return '';
        }
        try {
            // Intenta parsear la fecha. Si ya es un objeto Date, parseISO no hará nada.
            // Si es un string ISO 8601, lo parseará correctamente.
            const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
            return format(date, outputFormat);
        } catch (error) {
            console.error("Error formateando fecha:", dateString, error);
            return 'Fecha inválida';
        }
    }

    function formatPeriodDate(dateString) {
        if (!dateString) return '';
        // Asumiendo que periodDate es solo una fecha (LocalDate)
        // y la quieres mostrar como MM/yyyy o similar para el "Periodo"
        try {
            const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
            return format(date, "MM/yyyy");
        } catch (error) {
            console.error("Error formateando fecha de periodo:", dateString, error);
            return 'Fecha inválida';
        }
    }


    const getAllPersons = async () => {
        if (!consortiumIdState) {
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return;
            }
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/consortiums/${consortiumIdState}/persons`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const persons = res.data;
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

    const getAllDepartmentsByConsortium = async () => { // Eliminado idConsortium como parámetro, usa consortiumIdState
        if (!consortiumIdState) {
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return;
            }
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/departments?consortiumId=${consortiumIdState}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const departments = res.data.content;
            const total = departments.length;
            let occupied = 0;
            let free = 0;
            let onlyResident = 0;
            let onlyOwner = 0;

            const formattedDepartments = departments.map(department => {
                const hasOwner = department.propietary?.personId;
                const hasResident = department.resident?.personId;

                if (hasOwner && hasResident) {
                    occupied++;
                } else if (!hasOwner && !hasResident) {
                    free++;
                } else if (hasResident) {
                    onlyResident++;
                } else if (hasOwner) {
                    onlyOwner++;
                }
                return {
                    departmentId: department.departmentId,
                    code: department.code,
                    personIdP: hasOwner ? department.propietary.personId : null,
                    fullNameP: hasOwner
                        ? `${department.propietary.name} ${department.propietary.lastName}`
                        : "NO ASIGNADO",
                    personIdR: hasResident ? department.resident.personId : null,
                    fullNameR: hasResident
                        ? `${department.resident.name} ${department.resident.lastName}`
                        : "NO ASIGNADO",
                    active: department.active
                };
            });
            setAllDepartments(formattedDepartments);
            setDepartmentStats({
                occupied,
                free,
                onlyResident,
                onlyOwner
            });
            setTotalDepartments(total)
        } catch (error) {
            console.error("Error al obtener los departamentos:", error);
            alert("Hubo un problema al obtener los departamentos. Por favor, intenta nuevamente.");
        }
    };

    const getAConsortiumByIdConsortium = async () => {
        if (!consortiumIdState) {
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return;
            }
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiums/consortium/${consortiumIdState}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const consortium = res.data;
            setConsortiumName(consortium.name);
            setAConsortiumByIdConsortium({
                consortiumId: consortium.consortiumId,
                name: consortium.name,
                address: consortium.address,
                city: consortium.city,
                province: consortium.province,
                functionalUnits: consortium.functionalUnits
            });
        } catch (error) {
            console.error("Error fetching consortium data", error);
            alert("Hubo un problema al obtener los datos del consorcio. Por favor, intenta nuevamente.");
        }
    };

    const getAllAmenitiesByIdConsortium = async () => {
        try {
            if (!consortiumIdState) {
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No estás autorizado. Por favor, inicia sesión.");
                return;
            }
            const decodedToken = jwtDecode(token);
            const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
            if (!isAdmin) {
                alert("No tienes permisos para realizar esta acción.");
                return;
            }
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/Amenities?idConsortium=${consortiumIdState}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const amenities = res.data.content;
            setAllAmenities(
                amenities.map((amenity) => {
                    return {
                        amenityId: amenity.amenityId,
                        name: amenity.name,
                        maxBookings: amenity.maxBookings,
                        costOfUse: amenity.costOfUse,
                        imagePath: amenity.imagePath,
                    };
                })
            );
        } catch (error) {
            console.error("Error al obtener amenities:", error);
            alert("Hubo un problema al obtener los amenities.");
        }
    };

    const getAllPostsByIdConsortium = async () => {
        if (!consortiumIdState) {
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return;
        }
        const decodedToken = jwtDecode(token);
        const isAdmin = decodedToken?.role?.includes('ROLE_ADMIN');
        if (!isAdmin) {
            alert("No tienes permisos para ver esta información.");
            return;
        }
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts?idConsortium=${consortiumIdState}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
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

    // Cambiado: getAllMaintenanceFeesByIdConsortium a getAllConsortiumFeePeriodsByIdConsortium
    const getAllConsortiumFeePeriodsByIdConsortium = async (page = 0, size = 10) => { // Añadido parámetros de paginación
        if (!consortiumIdState) {
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado.");
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken?.role?.includes('ROLE_ADMIN')) {
                alert("No tienes permisos.");
                return;
            }
            // Endpoint actualizado
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/consortiumFeePeriods/query`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    consortiumId: consortiumIdState,
                    page, // Enviar paginación al backend
                    size
                }
            });

            const feePeriods = res.data.content; // Asumiendo que el backend devuelve Page<ConsortiumFeePeriodDto>
            const totalElements = res.data.totalElements; // Para la paginación

            // Mapeo actualizado al DTO ConsortiumFeePeriodDto
            setAllConsortiumFeePeriods(feePeriods.map(feePeriod => {
                return {
                    consortiumFeePeriodId: feePeriod.consortiumFeePeriodId,
                    periodDate: formatPeriodDate(feePeriod.periodDate), // Formato específico para el periodo
                    generationDate: formatDate(feePeriod.generationDate, "dd/MM/yyyy"), // Solo fecha
                    dueDate: formatDate(feePeriod.dueDate, "dd/MM/yyyy"), // Solo fecha
                    feePeriodStatus: feePeriodStatusMapping[feePeriod.feePeriodStatus] || feePeriod.feePeriodStatus,
                    totalAmount: feePeriod.totalAmount,
                    notes: feePeriod.notes,
                    pdfFilePath: feePeriod.pdfFilePath, // Se usará para la descarga
                }
            }));
            return { content: allConsortiumFeePeriods, totalElements: totalElements }; // Devolver para paginación
        } catch (error) {
            console.error("Error al obtener los periodos de expensas:", error);
            alert("Hubo un problema al obtener los periodos de expensas.");
            setAllConsortiumFeePeriods([]); // Limpiar en caso de error
            return { content: [], totalElements: 0 };
        }
    }

    // Nueva función para subir ConsortiumFeePeriod
    // Asume que el backend espera un FormData similar al anterior
    // pero para un endpoint diferente.
    // **NECESITARÁS EL DTO Y ENDPOINT EXACTO DEL BACKEND PARA ESTO**
    const uploadConsortiumFeePeriod = async (file, totalAmount, periodDate) => { // periodDate podría ser necesario
        if (!file || !consortiumIdState || !totalAmount || !periodDate) {
            // alert('Por favor, completa todos los campos y selecciona un archivo.');
            return { success: false, message: 'Por favor, completa todos los campos y selecciona un archivo.' };
        }
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, message: 'No estás autorizado.' };
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("consortiumId", consortiumIdState);
        formData.append("totalAmount", totalAmount);
        formData.append("periodDate", periodDate); // Ejemplo: '2023-10' o la fecha completa '2023-10-01'
        // Ajustar según lo que espere el backend

        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken?.role?.includes('ROLE_ADMIN')) {
                return { success: false, message: 'No tienes permisos.' };
            }
            // **ENDPOINT HIPOTÉTICO, AJUSTAR SEGÚN TU BACKEND**
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/consortiumFeePeriods/upload`, // O el endpoint correcto
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            await getAllConsortiumFeePeriodsByIdConsortium(); // Recargar lista
            return { success: true, message: 'Periodo de expensa cargado correctamente.' };
        } catch (error) {
            console.error('Error al cargar el periodo de expensa:', error);
            return { success: false, message: error.response?.data?.message || 'Error al cargar el periodo de expensa.' };
        }
    };

    // Nueva función para eliminar ConsortiumFeePeriod
    const deleteConsortiumFeePeriod = async (consortiumFeePeriodId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado.");
            return false;
        }
        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken?.role?.includes('ROLE_ADMIN')) {
                alert("No tienes permisos.");
                return false;
            }
            // Endpoint actualizado
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/consortiumFeePeriods/${consortiumFeePeriodId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Actualizar estado local
            setAllConsortiumFeePeriods(prevPeriods =>
                prevPeriods.filter(p => p.consortiumFeePeriodId !== consortiumFeePeriodId)
            );
            return true;
        } catch (error) {
            console.error("Error al eliminar el periodo de expensa:", error);
            alert(error.response?.data?.message || "Error al eliminar el periodo de expensa.");
            return false;
        }
    };

    // Nueva función para descargar PDF de ConsortiumFeePeriod
    const downloadConsortiumFeePeriod = async (consortiumFeePeriodId, fileNameFromState) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No estás autorizado.");
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken?.role?.includes('ROLE_ADMIN')) {
                alert("No tienes permisos.");
                return;
            }
            // Endpoint actualizado
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/consortiumFeePeriods/${consortiumFeePeriodId}/download`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob',
                }
            );
            const contentDisposition = response.headers['content-disposition'];
            let fileName = fileNameFromState || 'expensa.pdf'; // Fallback
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (fileNameMatch && fileNameMatch.length > 1) {
                    fileName = fileNameMatch[1];
                }
            }
            const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' }));
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(fileURL);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            alert('Hubo un error al descargar el archivo.');
        }
    };


    useEffect(() => {
        const storedConsortiumId = localStorage.getItem('consortiumId');
        if (storedConsortiumId) {
            setConsortiumIdState(storedConsortiumId);
        } else {
            navigate('/admin/management/');
        }
    }, [navigate]); // Añadir navigate a las dependencias

    // Este useEffect parece redundante con el de arriba y el de abajo.
    // Considera unificar la lógica de carga inicial.
    useEffect(() => {
        const localPeriod = localStorage.getItem('period'); // Renombrado para evitar conflicto
        const storedConsortiumId = localStorage.getItem('consortiumId');
        if (storedConsortiumId) {
            if (localPeriod) setPeriod(localPeriod); // Solo setea si existe
            // setConsortiumIdState(storedConsortiumId); // Ya se hace en el useEffect anterior
            // getAllMaintenanceFeesPaymentByIdConsortium() // Esto se llamará cuando period y consortiumIdState estén listos
        } else {
            // navigate('/admin/management/'); // Ya se hace en el useEffect anterior
        }
    }, [navigate]); // Añadir navigate

    useEffect(() => {
        if (consortiumIdState) {
            getAConsortiumByIdConsortium();
            // getAllConsortiumFeePeriodsByIdConsortium(); // Llamar aquí para la carga inicial de expensas
        }
    }, [consortiumIdState]);

    // useEffect(() => {
    //     if (consortiumIdState && period) { // Solo llama si ambos están definidos
    //         getAllMaintenanceFeesPaymentByIdConsortium();
    //     }
    // // }, [consortiumIdState, period]); // Dependencias correctas
    // }, []); // Dependencias correctas


    const getAllMaintenanceFeesPaymentByIdConsortium = async () => {
        try {
            if (!consortiumIdState || !period) {
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No tienes acceso. Por favor, inicia sesión.");
                return;
            }
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.role || [];
            if (!roles.includes('ROLE_ADMIN')) {
                alert("No tienes permisos para acceder a esta información.");
                return;
            }
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/maintenanceFeePayment/consortium/${consortiumIdState}`,
                {
                    params: { period },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const maintenanceFeesPayment = res.data.content;
            setAllMaintenanceFeesPayment(
                maintenanceFeesPayment.map((maintenanceFeePayment) => ({
                    maintenanceFeePaymentId: maintenanceFeePayment.maintenanceFeePaymentId,
                    maintenanceFeeId: maintenanceFeePayment.maintenanceFee.maintenanceFeeId, // Esto podría necesitar cambiar si la estructura de expensas cambió
                    period: maintenanceFeePayment.maintenanceFee.period, // Igual que arriba
                    code: maintenanceFeePayment.department.code,
                    status: statusMapping[maintenanceFeePayment.status] || maintenanceFeePayment.status,
                    paymentDate: formatDate(maintenanceFeePayment.paymentDate)
                }))
            );
        } catch (error) {
            console.error("Error al obtener los pagos de expensas: ", error);
            alert("Hubo un error al obtener los datos de pagos.");
        }
    };

    const getAllClaimByConsortium = async () => {
        try {
            if (!consortiumIdState) {
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) {
                alert("No tienes acceso. Por favor, inicia sesión.");
                return;
            }
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.role || [];
            if (!roles.includes('ROLE_ADMIN')) {
                alert("No tienes permisos para acceder a esta información.");
                return;
            }
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/issueReport/consortium/${consortiumIdState}/admin`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const claims = res.data.content;
            setAllClaims(
                claims.map((claim) => ({
                    issueReportId: claim.issueReportId,
                    subject: claim.subject,
                    issue: claim.issue,
                    user: claim.person.name && claim.person.lastName
                        ? `${claim.person.name} ${claim.person.lastName}`
                        : '',
                    status: statusMapping[claim.status] || claim.status,
                    createdDate: formatDate(claim.createdDate),
                    response: claim.response,
                    responseDate: formatDate(claim.responseDate),
                }))
            );
        } catch (error) {
            console.error("Error al obtener los reclamos: ", error);
            alert("Hubo un error al obtener los reclamos.");
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
            // Cambiado
            allConsortiumFeePeriods ,
            setAllConsortiumFeePeriods,
            period ,
            setPeriod,
            allMaintenanceFeesPayment , setAllMaintenanceFeesPayment,
            allClaims , setAllClaims,
            statusMapping, // General status mapping
            feePeriodStatusMapping, // Specific for fee periods
            departmentStats, setDepartmentStats,
            totalDepartments, setTotalDepartments,
            openDniDialog, setOpenDniDialog,
            newPersonDpto, setNewPersonDpto,
            personCreationType, setPersonCreationType,
            newResidentDpto, setNewResidentDpto,
            getAllPersons,
            getAllDepartmentsByConsortium,
            getAConsortiumByIdConsortium,
            getAllAmenitiesByIdConsortium,
            getAllPostsByIdConsortium,
            // Cambiado
            getAllConsortiumFeePeriodsByIdConsortium,
            uploadConsortiumFeePeriod,
            deleteConsortiumFeePeriod,
            downloadConsortiumFeePeriod,
            getAllMaintenanceFeesPaymentByIdConsortium, // Revisar si esta lógica de pagos también cambia
            getAllClaimByConsortium
        }}>
            {props.children}
        </AdminManageContext.Provider>
    )
}
