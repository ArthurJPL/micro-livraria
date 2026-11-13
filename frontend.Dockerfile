# Imagem base derivada do Node
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Instala as dependências compartilhadas do monorepo
COPY package*.json ./
RUN npm install --silent --loglevel=error

# Copia o frontend estático
COPY services/frontend ./services/frontend

EXPOSE 5000

CMD ["npx", "serve", "-p", "5000", "services/frontend"]
