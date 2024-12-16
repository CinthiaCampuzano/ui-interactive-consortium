import {Route, Routes} from "react-router-dom";
import {ResidentManageContextProvider} from "./ResidentManageContext.jsx";
import ResidentBulletinBoard from "./ResidentBulletinBoard/ResidentBulletinBoard.jsx";
import ResidentConsortiumList from "./ResdientConsortiumList.jsx";
import ResidentDashboard from "./ResidentDashboard.jsx";
import ResidentMaintenanceFeePayments from "./ResidentMaintenanceFee/ResidentMaintenanceFeePayments.jsx";
import ResidentClaim from "./ResidentClaim/ResidentClaim.jsx";
import ReserveSpace from "./ResidentBooking/ResidentBooking.jsx";

function ResidentPage(){
    return (
        <ResidentManageContextProvider>
            <Routes>
                {/* Ruta para la lista de consorcios que administra el usuario */}
                <Route path="/" element={<ResidentConsortiumList />} />

                <Route path="/:consortiumId/dashboard" element={<ResidentDashboard />} />

                {/* Ruta para la gestión de usuarios dentro de un consorcio específico */}

                <Route path="/publicaciones" element={<ResidentBulletinBoard />} />

                <Route path="/reclamos" element={<ResidentClaim />} />

                <Route path="/expensas" element={<ResidentMaintenanceFeePayments/>} />

                <Route path="/reservas" element={<ReserveSpace/>} />


            </Routes>
        </ResidentManageContextProvider>

    )
}
export default ResidentPage