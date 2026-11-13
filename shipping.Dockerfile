# Imagem base derivada do Node
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Instala as dependências compartilhadas do monorepo
COPY package*.json ./
RUN npm install --silent --loglevel=error

# Copia os contratos gRPC e o microsserviço
COPY proto ./proto
COPY services/shipping ./services/shipping

ENV SHIPPING_HOST=0.0.0.0
ENV SHIPPING_PORT=3001

EXPOSE 3001

CMD ["node", "services/shipping/index.js"]
