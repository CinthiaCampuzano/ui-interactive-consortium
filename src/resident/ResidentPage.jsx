import {Route, Routes} from "react-router-dom";
import AdminDashboard from "../administrator/AdminDashboard.jsx";
import {ResidentManageContextProvider} from "./ResidentManageContext.jsx";
import ResidentBulletinBoard from "./ResidentBulletinBoard/ResidentBulletinBoard.jsx";
import ResidentConsortiumList from "./ResdientConsortiumList.jsx";
import ResidentDashboard from "./ResidentDashboard.jsx";

function ResidentPage(){
    return (
        <ResidentManageContextProvider>
            <Routes>
                {/* Ruta para la lista de consorcios que administra el usuario */}
                <Route path="/" element={<ResidentConsortiumList />} />

                <Route path="/:consortiumId/dashboard" element={<ResidentDashboard />} />

                {/* Ruta para la gestión de usuarios dentro de un consorcio específico */}

                <Route path="/publicaciones" element={<ResidentBulletinBoard />} />

                {/*<Route path="/reclamos" element={<AdminClaimManagement />} />*/}

                {/*<Route path="/expensas" element={<AdminMaintenanceFeesAdministrator/>} />*/}

                {/*<Route path="/expensas/pago" element={<AdminMaintenanceFeePayments/>} />*/}


            </Routes>
        </ResidentManageContextProvider>

    )
}
export default ResidentPage