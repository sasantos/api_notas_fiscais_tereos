require("dotenv").config(); // Carrega variáveis de ambiente
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Middleware CORS
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Configuração do CORS
const corsOptions = {
  origin: "*", // Permitir todas as origens (alterar para domínio específico em produção)
  methods: ["GET", "POST"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization", "x-api-password"], // Cabeçalhos permitidos
};
app.use(cors(corsOptions));

// Middleware para verificar a senha
app.use((req, res, next) => {
  const clientPassword = req.headers["x-api-password"]; // Cabeçalho personalizado para senha
  const serverPassword = process.env.API_PASSWORD; // Senha definida no arquivo .env

  console.log("Senha recebida:", clientPassword); // Log da senha enviada
  console.log("Senha esperada:", serverPassword); // Log da senha esperada

  if (!clientPassword || clientPassword !== serverPassword) {
    return res.status(403).json({ error: "Acesso negado. Senha inválida." });
  }
  next(); // Continua para as próximas rotas se a senha for válida
});

// Configuração do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Rota GET para buscar todos os registros de notas fiscais
app.get("/notas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, sapid, email_produtor, email_analista, nome_produtor, usuario, quantidade_notas, file_name, data_envio
      FROM notas_fiscais.notas_enviadas
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar notas:", err);
    res.status(500).send("Erro ao buscar notas.");
  }
});

// Rota POST para inserir um novo registro de notas fiscais
app.post("/notas", async (req, res) => {
  const {
    sapid,
    email_produtor,
    email_analista,
    nome_produtor,
    usuario,
    quantidade_notas,
    file_name,
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO notas_fiscais.notas_enviadas 
      (sapid, email_produtor, email_analista, nome_produtor, usuario, quantidade_notas, file_name, data_envio)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
      RETURNING id, sapid, email_produtor, email_analista, nome_produtor, usuario, quantidade_notas, file_name, data_envio;
      `,
      [
        sapid,
        email_produtor,
        email_analista,
        nome_produtor,
        usuario,
        quantidade_notas,
        JSON.stringify(file_name), // Converte o objeto file_name para JSON
      ]
    );
    res.status(201).json({
      message: "Nota criada com sucesso.",
      note: result.rows[0],
    });
  } catch (err) {
    console.error("Erro ao criar nota:", err);
    res.status(500).send("Erro ao criar nota.");
  }
});

// Rota GET para testar a conexão com o banco de dados
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      message: "Conexão com o banco de dados bem-sucedida!",
      time: result.rows[0],
    });
  } catch (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    res.status(500).json({ error: "Falha na conexão com o banco de dados." });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
