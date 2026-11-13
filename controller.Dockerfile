# Imagem base derivada do Node
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Instala as dependências compartilhadas do monorepo
COPY package*.json ./
RUN npm install --silent --loglevel=error

# Copia os contratos gRPC e o microsserviço
COPY proto ./proto
COPY services/controller ./services/controller

ENV PORT=3000

EXPOSE 3000

CMD ["node", "services/controller/index.js"]
