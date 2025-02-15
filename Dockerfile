# Use uma imagem base do Node.js
FROM node:16

# Define o diretório de trabalho no container
WORKDIR /usr/src/app

# Copia os arquivos necessários para o container
COPY package*.json ./
COPY .env ./
COPY . .

# Instala as dependências
RUN npm install

# Expõe a porta do servidor
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]
