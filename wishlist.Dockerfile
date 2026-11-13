# Imagem base derivada do Node
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Instala as dependências compartilhadas do monorepo
COPY package*.json ./
RUN npm install --silent --loglevel=error

# Copia os contratos gRPC e o microsserviço
COPY proto ./proto
COPY services/wishlist ./services/wishlist

# Diretório onde o arquivo JSON será persistido
RUN mkdir -p /app/data

# Configurações do serviço
ENV WISHLIST_HOST=0.0.0.0
ENV WISHLIST_PORT=3003
ENV WISHLIST_DATA_FILE=/app/data/wishlist.json

EXPOSE 3003

VOLUME ["/app/data"]

CMD ["node", "services/wishlist/index.js"]
