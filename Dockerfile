FROM public.ecr.aws/lambda/nodejs:18

# Definir la ruta del código fuente
ENV LAMBDA_TASK_ROOT=/var/task

# Crear el directorio y copiar el contenido del proyecto
RUN mkdir -p ${LAMBDA_TASK_ROOT}
COPY . ${LAMBDA_TASK_ROOT}

# Establecer el directorio de trabajo
WORKDIR ${LAMBDA_TASK_ROOT}

# Instalar dependencias globales necesarias
RUN npm install -g @nestjs/cli

# Instalar las dependencias del proyecto
RUN npm install

# Construir la aplicación
RUN npm run build

# Establecer el CMD para iniciar la Lambda
CMD [ "dist/serverless.handler" ]