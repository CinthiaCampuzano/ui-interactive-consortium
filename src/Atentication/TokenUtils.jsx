import { jwtDecode } from 'jwt-decode';

// Función para obtener el token almacenado
export const getToken = () => localStorage.getItem('token');

// Función para decodificar el token y verificar el rol
export const getRole = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token); // Decodifica el token
        return decoded.role || [];
    } catch (error) {
        console.error('Error decodificando el token:', error);
        return [];
    }
};

export const isSuperAdmin = () => {
    const role = getRole();
    return role.includes('ROLE_ROOT');
};

export const isAdmin = () => {
    const role = getRole();
    return role.includes('ROLE_ADMIN');

}

export const isResident = () => {
    const role = getRole();
    return role.includes('ROLE_RESIDENT');
}

export const isPropietary = () => {
    const role = getRole();
    return role.includes('ROLE_PROPIETARY');
}

export const isPerson = () => {
    return isResident() || isPropietary()
}
