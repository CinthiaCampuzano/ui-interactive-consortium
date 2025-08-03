import AdminConsortiumList from "./AdminConsortiumList.jsx";
import {AdminManageContextProvider} from "./AdminManageContext.jsx";
import AdminUserManagement from "./AdminUserAdministrator/AdminUserManagement.jsx";
import {Route, Routes} from "react-router-dom";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminDepartmentManagement from "./AdminDepartmentAdministrator/AdminDepartmentManagement.jsx";
import AdminAmenitiesManagement from "./AdminAmenitiesAdministrator/AdminAmenitiesManagement.jsx";
import AdminPostManagement from "./AdminPostAdministrator/AdminPostManagement.jsx";
import AdminBulletinBoard from "./AdminPostAdministrator/AdminBulletinBoard.jsx";
import AdminClaimManagement from "./AdminClaimAdministrator/AdminClaimManagement.jsx";
import AdminMaintenanceFeesManagement from "./AdminMaintenanceFees/AdminMaintenanceFeesManagement.jsx";
import AdminMaintenanceFeePayments from "./AdminMaintenanceFees/AdminMaintenanceFeePayments.jsx";
import AdminBooking from "./AdminBooking/AdminBooking.jsx";
import AdminConsortiumFeesManagement from "./AdminConsortiumFees/AdminConsortiumFeesManagement.jsx";
import AdminConsortiumFeeConcepts from "./AdminConsortiumFees/AdminConsortiumFeeConcepts.jsx";
import AdminConsortiumFeeAdjustments from "./AdminConsortiumFees/AdminConsortiumFeeAdjustments.jsx";


function AdministratorPage(){
    return (
<AdminManageContextProvider>
    <Routes>
        {/* Ruta para la lista de consorcios que administra el usuario */}
        <Route path="/" element={<AdminConsortiumList />} />

        <Route path="/:consortiumId/dashboard" element={<AdminDashboard />} />

        {/* Ruta para la gestión de usuarios dentro de un consorcio específico */}
        <Route path="/users" element={<AdminUserManagement />} />

        <Route path="/departamentos" element={<AdminDepartmentManagement />} />

        <Route path="/espacio-comun" element={<AdminAmenitiesManagement />} />

        <Route path="/publicaciones" element={<AdminPostManagement />} />

        <Route path="/tablon_de_anuncios" element={<AdminBulletinBoard />} />

        <Route path="/reclamos" element={<AdminClaimManagement />} />

        <Route path="/expensas" element={<AdminConsortiumFeesManagement/>} />

        <Route path="/configuracion-expensas" element={<AdminConsortiumFeeConcepts/>} />

        <Route path="/expensas/pago" element={<AdminMaintenanceFeePayments/>} />

        <Route path="/reservas" element={<AdminBooking/>} />

        <Route path="expensas/ajustes/:consortiumFeePeriodId" element={<AdminConsortiumFeeAdjustments/>} />

    </Routes>
</AdminManageContextProvider>

    )
}
export default AdministratorPage
