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
const fs = require("fs");

const upload = multer({ dest: "temp/" }); // almacenamiento temporal local

app.post("/api/upload", upload.single("archivo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto", // ⬅️ ¡Esto sí funciona aquí!
      folder: "notas_subsecuentes",
      public_id: Date.now() + "_" + req.file.originalname,
    });

    // Elimina el archivo temporal
    fs.unlinkSync(req.file.path);

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("❌ Error al subir a Cloudinary:", err);
    res.status(500).json({ error: "Error al subir a Cloudinary." });
  }
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

