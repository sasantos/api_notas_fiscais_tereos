# Use a imagem oficial do Node.js
FROM node:16

# Define o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copia o package.json e o package-lock.json para o contêiner
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante dos arquivos do projeto para o contêiner
COPY . .

# Expõe a porta usada pelo app
EXPOSE 3000

# Comando para iniciar o app
CMD ["npm", "start"]
