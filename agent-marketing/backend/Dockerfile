# Usa una imagen base de Python oficial
FROM python:3.9-slim

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo de requerimientos y los instala
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto 8080 para que Cloud Run pueda recibir tráfico
EXPOSE 8080

# Comando para ejecutar la aplicación usando gunicorn
# Cloud Run establece la variable de entorno PORT, que gunicorn usará
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
