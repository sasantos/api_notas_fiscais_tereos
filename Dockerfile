# Use a imagem oficial do Node.js
FROM node:16

# Define o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copia o package.json e package-lock.json
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código do app para o contêiner
COPY . .

# Expõe a porta usada pelo app
EXPOSE 3000

# Define o comando para iniciar o app
CMD ["npm", "start"]
