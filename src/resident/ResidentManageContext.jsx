import {createContext, useEffect, useState} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {format, parseISO} from "date-fns";
import { useNavigate } from "react-router-dom";

export const ResidentManageContext = createContext()

export function ResidentManageContextProvider(props){
    const [consortiumIdState , setConsortiumIdState] = useState(null)
    const [consortiumName, setConsortiumName] = useState("")
    const [aConsortiumByIdConsortium, setAConsortiumByIdConsortium] = useState({})
    const [allMaintenanceFeesPaymentPerson , setAllMaintenanceFeesPaymentPerson] = useState([])
    const [allClaims , setAllClaims] = useState([])
    const navigate = useNavigate();
    const [allConsortiumFeePeriods , setAllConsortiumFeePeriods] = useState([])
    const [period , setPeriod] = useState(null)
    const [periodStatus , setPeriodStatus] = useState(null)
    const [departmentFeeQueryData, setDepartmentFeeQueryData] = useState({ content: [], totalElements: 0 });

    const statusMapping = {
        PENDING: "Pendiente",
        PAID: "Pagado",
        PARTIALLY_PAID: "Parcialmente Pagado",
        OVERDUE: "Vencido"
    };

    const statusMappingClaim = {
        PENDING: "Pendiente",
        PAID: "Pagado",
        EXPIRED: "Expirado",
        CANCELED: "Cancelado",
        UNDER_REVIEW: "En Revisión",
        FINISHED : "Resuelto"
    };

    const feePeriodStatusMapping = {
        PENDING_GENERATION: "Pendiente Generación",
        GENERATED: "Generado",
        IN_PROCESS: "En Proceso",
        CLOSED: "Cerrado",
        SENT: "Enviado",
        PARTIALLY_PAID: "Parcialmente Pagado",
        PAID: "Pagado",
        OVERDUE: "Vencido",
    };


    useEffect(() => {
        const storedConsortiumId = localStorage.getItem('consortiumId');
        if (storedConsortiumId) {
            setConsortiumIdState(storedConsortiumId);
        }
    }, []);

    function formatDate(dateString, outputFormat = "dd/MM/yyyy HH:mm") {
        if (!dateString) {
            return '';
        }
        try {
            const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
            return format(date, outputFormat);
        } catch (error) {
            console.error("Error formateando fecha:", dateString, error);
            return 'Fecha inválida';
        }
    }

    function formatPeriodDate(dateString) {
        if (!dateString) return '';
        try {
            const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
            return format(date, "MM/yyyy");
        } catch (error) {
            console.error("Error formateando fecha de periodo:", dateString, error);
            return 'Fecha inválida';
        }
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

        const token = localStorage.getItem('token');

        if (!token) {
            alert("No estás autorizado. Por favor, inicia sesión.");
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const isResident = decodedToken?.role?.includes('ROLE_RESIDENT') || decodedToken?.role?.includes('ROLE_PROPIETARY');

            if (!isResident) {
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
                province: consortium.province
            });

        } catch (error) {
            console.error("Error fetching consortium data", error);
            alert("Hubo un problema al obtener los datos del consorcio. Por favor, intenta nuevamente.");
        }
    }

    const getAllConsortiumFeePeriodsByIdConsortium = async (page = 0, size = 10) => {
        if (!consortiumIdState) {
            return { content: [], totalElements: 0 };
        }
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No estás autorizado.");
            return { content: [], totalElements: 0 };
        }
        try {
            const decodedToken = jwtDecode(token);
            const isResident = decodedToken?.role?.includes('ROLE_RESIDENT') || decodedToken?.role?.includes('ROLE_PROPIETARY');
            if (!isResident) {
                console.error("No tienes permisos.");
                return { content: [], totalElements: 0 };
            }
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/department-fees/residents/query`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    consortiumId: consortiumIdState,
                    page,
                    size
                }
            });

            const feePeriodsData = res.data.content || [];
            const totalElements = res.data.totalElements || 0;

            const mappedFeePeriods = feePeriodsData.map(feePeriod => {
                return {
                    ...feePeriod,
                    displayPeriodDate: formatPeriodDate(feePeriod.periodDate),
                    displayGenerationDate: formatDate(feePeriod.generationDate, "dd/MM/yyyy"),
                    displayDueDate: formatDate(feePeriod.dueDate, "dd/MM/yyyy"),
                    displayFeePeriodStatus: feePeriodStatusMapping[feePeriod.feePeriodStatus] || feePeriod.feePeriodStatus,
                }
            });
            setAllConsortiumFeePeriods(mappedFeePeriods);
            return { content: mappedFeePeriods, totalElements: totalElements };
        } catch (error) {
            console.error("Error al obtener los periodos de expensas:", error);
            setAllConsortiumFeePeriods([]);
            return { content: [], totalElements: 0 };
        }
    }

    const fetchDepartmentFeeQueryData = async (currentPage = 0, pageSize = 10) => {
        if (!consortiumIdState || !period) {
            setDepartmentFeeQueryData({ content: [], totalElements: 0 });
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No estás autorizado.");
            setDepartmentFeeQueryData({ content: [], totalElements: 0 });
            return;
        }
        try {
            const decodedToken = jwtDecode(token);
            const isResident = decodedToken?.role?.includes('ROLE_RESIDENT') || decodedToken?.role?.includes('ROLE_PROPIETARY');
            if (!isResident) {
                console.error("No tienes permisos.");
                setDepartmentFeeQueryData({ content: [], totalElements: 0 });
                return;
            }

            const periodArray = period.split('/');
            const formattedPeriod = `${periodArray[1]}-${periodArray[0]}-01`;

            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/department-fees/residents/query`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    period: formattedPeriod,
                    consortiumId: consortiumIdState,
                    page: currentPage,
                    size: pageSize,
                }
            });
            setDepartmentFeeQueryData({
                content: response.data.content,
                totalElements: response.data.totalElements
            });
        } catch (error) {
            console.error("Error al obtener los datos de expensas por departamento:", error);
            setDepartmentFeeQueryData({ content: [], totalElements: 0 });
        }
    };

    const getAllMaintenanceFeesPaymentByIdConsortiumAndPerson = async () => {
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

            if (!(roles.includes('ROLE_RESIDENT') || roles.includes('ROLE_PROPIETARY'))) {
                alert("No tienes permisos para acceder a esta información.");
                return;
            }

            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/maintenanceFeePayment/${consortiumIdState}/person`,
                {
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

            const token = localStorage.getItem('token');
            if (!token) {
                alert("No tienes acceso. Por favor, inicia sesión.");
                return;
            }

            const decodedToken = jwtDecode(token);
            const roles = decodedToken.role || [];

            if (!(roles.includes('ROLE_RESIDENT') || roles.includes('ROLE_PROPIETARY'))) {
                alert("No tienes permisos para acceder a esta información.");
                return;
            }

            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/issueReport/consortium/${consortiumIdState}/person`,
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
                    status: statusMappingClaim[claim.status] || claim.status,
                    createdDate: formatDate(claim.createdDate),
                    response: claim.response,
                    responseDate: formatDate(claim.responseDate),
                }))
            );
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
            statusMapping,
            allClaims , setAllClaims,
            allConsortiumFeePeriods,
            setAllConsortiumFeePeriods,
            period,
            setPeriod,
            periodStatus,
            setPeriodStatus,
            departmentFeeQueryData,
            setDepartmentFeeQueryData,
            getAConsortiumByIdConsortium,
            getAllMaintenanceFeesPaymentByIdConsortiumAndPerson,
            getAllClaimByConsortiumAndPerson,
            getAllConsortiumFeePeriodsByIdConsortium,
            fetchDepartmentFeeQueryData
        }}>
            {props.children}
        </ResidentManageContext.Provider>

    )
}
