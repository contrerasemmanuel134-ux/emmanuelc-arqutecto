# Dockerfile

# --- Etapa 1: Compilación ---
# Usamos una imagen de Node.js para instalar dependencias y compilar la aplicación.
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos los archivos de manifiesto del paquete e instalamos dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Copiamos el resto del código fuente de la aplicación
COPY . .

# Ejecutamos el script de compilación que genera las carpetas 'dist' y 'functions/lib'
RUN npm run build


# --- Etapa 2: Producción ---
# Usamos una imagen ligera de Node.js para la versión final.
FROM node:20-alpine AS production

WORKDIR /app

# Copiamos el manifiesto del paquete y las dependencias de producción
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copiamos los artefactos de compilación desde la etapa 'builder'
COPY --from=builder /app/dist ./dist

# Copiamos el servidor de entrada para Docker
COPY --from=builder /app/server.js .

# Exponemos el puerto en el que correrá el servidor
EXPOSE 4000

# El comando para iniciar la aplicación cuando el contenedor se ejecute
CMD [ "node", "server.js" ]
