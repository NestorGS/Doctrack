// app.js
require('dotenv').config(); // Cargar variables de entorno
require("./keep-alive");
const express = require("express");
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

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar almacenamiento con multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "notas_subsecuentes",
    allowed_formats: ["jpg", "png", "pdf"],
    public_id: (req, file) => Date.now() + "_" + file.originalname,
  },
});

const upload = multer({ storage });

// Ruta para subir archivos
app.post("/api/upload", upload.single("archivo"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }
  res.status(200).json({ url: req.file.path });
});



// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

