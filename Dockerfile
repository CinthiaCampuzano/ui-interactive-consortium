# --- Etapa de construcción ---
# Usar una imagen base de Node.js compatible con ARM (para Raspberry Pi)
FROM arm64v8/node:20-alpine AS build

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package.json ./
COPY package-lock.json ./

# Instalar las dependencias del proyecto usando npm
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación React (se generará la carpeta 'dist' o 'build')
RUN npm run build

# --- Etapa de producción ---
# Usar una imagen ligera de Nginx compatible con ARM para servir la aplicación
FROM arm64v8/nginx:alpine-slim

RUN rm /etc/nginx/conf.d/default.conf
# Copiar tu archivo de configuración de Nginx personalizado (nginx.conf en la raíz de tu proyecto React)
# Ya no necesitamos RUN rm, ya que COPY lo sobrescribe directamente.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos de tu aplicación construida desde la etapa de construcción
# Asegúrate de que la ruta '/app/dist' sea la correcta para tu carpeta de salida de la construcción.
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80 (puerto HTTP predeterminado de Nginx)
EXPOSE 80

# Comando para iniciar Nginx cuando el contenedor se ejecute
CMD ["nginx", "-g", "daemon off;"]
