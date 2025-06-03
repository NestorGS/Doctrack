// app.js
require('dotenv').config(); // Cargar variables de entorno
require("./keep-alive");
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Verifica que las variables de entorno estén cargadas correctamente
console.log("🟢 Cargando configuración de base de datos...");
console.log("Host:", process.env.MYSQLHOST);
console.log("Usuario:", process.env.MYSQLUSER);
console.log("Base de datos:", process.env.MYSQLDATABASE);
console.log("Puerto:", process.env.MYSQLPORT);

app.use(express.static('views')); // Sirve los archivos HTML, CSS, JS

// Conexión a la base de datos con manejo de errores y reconexión
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

const conectarBD = () => {
    db.connect((err) => {
        if (err) {
            console.error("❌ Error al conectar a la base de datos:", err);
            setTimeout(conectarBD, 5000); // Reintenta la conexión en 5 segundos
        } else {
            console.log("✅ Conexión exitosa a la base de datos.");
        }
    });
};

conectarBD();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
