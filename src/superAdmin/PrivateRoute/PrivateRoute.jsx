import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function PrivateRoute({ children, requiredRole, orRequiredRole }) {
    const token = localStorage.getItem('token'); // Obtén el token almacenado

    if (!token) {
        return <Navigate to="/login" replace />; // Redirige si no hay token
    }

    try {
        const decodedToken = jwtDecode(token); // Decodifica el token

        // Verifica si el rol del usuario coincide con el rol requerido
        const hasRequiredRole = decodedToken?.role.includes(requiredRole) || decodedToken?.role.includes(orRequiredRole);

        if (!hasRequiredRole) {
            return <Navigate to="/login" replace />; // Redirige si no tiene el rol requerido
        }

        return children; // Renderiza la página si tiene el rol adecuado
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return <Navigate to="/login" replace />; // Redirige si hay un error en la decodificación
    }
}

export default PrivateRoute;