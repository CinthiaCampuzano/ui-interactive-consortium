import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import ResponsiveAppBar from "./ResponsiveAppBar.jsx";
import AdministratorPage from "./administrator/AdministratorPage.jsx";
import Autentication from "./Atentication/Autentication.jsx";
import SuperAdminPage from "./superAdmin/SuperAdminPage.jsx";
import PrivateRoute from "./superAdmin/PrivateRoute/PrivateRoute.jsx";
import ResidentPage from "./resident/ResidentPage.jsx";
import SuperAdminSidebar from "./SuperAdminSidebar.jsx";
import React from "react";




function App() {
    const isAuthenticated = Boolean(localStorage.getItem('token')); // Verifica si hay un token

    return (
        <div>
            <BrowserRouter>

                <Routes>
                    {/* Redirige a /login si no está autenticado */}
                    {!isAuthenticated && <Route path="*" element={<Navigate to="/login" replace />} />}

                    {/* Ruta para la autenticación */}
                    <Route path="/login" element={<Autentication />} />

                    {/* Rutas protegidas para SuperAdmin */}
                    <Route
                        path="/superAdmin/management/*"
                        element={
                            <PrivateRoute requiredRole="ROLE_ROOT">
                                <SuperAdminPage />
                            </PrivateRoute>
                        }
                    />

                    {/* Rutas para Admin */}
                    <Route
                        path="/admin/management/*"
                        element={
                            <PrivateRoute requiredRole="ROLE_ADMIN">
                                <AdministratorPage />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/resident/management/*"
                        element={
                            <PrivateRoute requiredRole="ROLE_RESIDENT">
                                <ResidentPage />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;