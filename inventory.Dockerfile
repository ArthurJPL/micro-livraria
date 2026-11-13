# Imagem base derivada do Node
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Instala as dependências compartilhadas do monorepo
COPY package*.json ./
RUN npm install --silent --loglevel=error

# Copia os contratos gRPC e o microsserviço
COPY proto ./proto
COPY services/inventory ./services/inventory

ENV INVENTORY_HOST=0.0.0.0
ENV INVENTORY_PORT=3002

EXPOSE 3002

CMD ["node", "services/inventory/index.js"]
