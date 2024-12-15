import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AdministratorPage from "./administrator/AdministratorPage.jsx";
import Autentication from "./Atentication/Autentication.jsx";
import SuperAdminPage from "./superAdmin/SuperAdminPage.jsx";
import PrivateRoute from "./superAdmin/PrivateRoute/PrivateRoute.jsx";
import ResidentPage from "./resident/ResidentPage.jsx";
import React from "react";
import {isAdmin, isResident, isSuperAdmin} from "./Atentication/TokenUtils.jsx";

function App() {
    const isAuthenticated = Boolean(localStorage.getItem('token')); // Verifica si hay un token

    const getRedirectPath = () => {
        if (isSuperAdmin()) {
            return '/superAdmin/management';
        } else if (isAdmin()) {
            return '/admin/management';
        } else if (isResident()) {
            return '/resident/management';
        } else {
            return '/login';
        }
    };

    return (
        <div>
            <BrowserRouter>
                <Routes>
                    {/* Redirige a la página correspondiente si está autenticado */}
                    {isAuthenticated && <Route path="/" element={<Navigate to={getRedirectPath()} replace/>}/>}

                    {/* Ruta por defecto para redirigir a /login */}
                    <Route path="/" element={<Navigate to="/login" replace/>}/>

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