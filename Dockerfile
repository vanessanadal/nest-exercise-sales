FROM public.ecr.aws/lambda/nodejs:18

# Definir la ruta del código fuente
ENV LAMBDA_TASK_ROOT=/var/task

# Crear el directorio y copiar el contenido del proyecto
RUN mkdir -p ${LAMBDA_TASK_ROOT}
COPY . ${LAMBDA_TASK_ROOT}

# Establecer el directorio de trabajo
WORKDIR ${LAMBDA_TASK_ROOT}

# Instalar las dependencias
RUN npm install

# Construir la aplicación
RUN npm run build

# Establecer el CMD para iniciar la Lambda
CMD ["serverless.handler"]
