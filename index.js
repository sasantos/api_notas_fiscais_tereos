require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Importa o middleware CORS
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Configuração do CORS
const corsOptions = {
  origin: "*", // Permite todas as origens (use um domínio específico em produção)
  methods: ["GET", "POST"], // Métodos permitidos
  allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
};
app.use(cors(corsOptions)); // Adiciona o middleware de CORS

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// GET all records from notas_fiscais.notas_enviadas
app.get("/notas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, sapid, email_produtor, email_analista, nome_produtor, usuario, quantidade_notas, file_name, data_envio
      FROM notas_fiscais.notas_enviadas
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error retrieving notes:", err);
    res.status(500).send("Error retrieving notes.");
  }
});

// POST a new record to notas_fiscais.notas_enviadas
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
        JSON.stringify(file_name), // Convert file_name object to JSON
      ]
    );
    res.status(201).json({
      message: "Note created successfully.",
      note: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).send("Error creating note.");
  }
});

// Example GET route to test database connection
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res
      .status(200)
      .json({ message: "Database connected!", time: result.rows[0] });
  } catch (err) {
    console.error("Error connecting to the database:", err);
    res.status(500).json({ error: "Database connection failed." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
