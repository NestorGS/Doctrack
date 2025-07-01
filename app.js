// app.js
require('dotenv').config(); // Cargar variables de entorno
require("./keep-alive");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require('bcryptjs');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Forzar HTTPS en Railway
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// 🛡️ Encabezados de seguridad con Helmet
app.use(helmet());

// 🎯 Política CSP personalizada
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://www.gstatic.com",
        "https://www.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://res.cloudinary.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com"
      ],
      connectSrc: [
        "'self'",
        "https://firestore.googleapis.com",
        "https://cloudinary.com",
        "https://identitytoolkit.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// 🔍 Política Referrer-Policy
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

// 🚫 Permissions-Policy para limitar acceso a APIs sensibles del navegador
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  next();
});

// 🧱 Middlewares generales
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views')); // Servir archivos estáticos (HTML, CSS, JS)

// 📦 Verificar variables de entorno
console.log("🟢 Cargando configuración de base de datos...");
console.log("Host:", process.env.MYSQLHOST);
console.log("Usuario:", process.env.MYSQLUSER);
console.log("Base de datos:", process.env.MYSQLDATABASE);
console.log("Puerto:", process.env.MYSQLPORT);

// ☁️ Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: "temp/" }); // Almacenamiento temporal

// 📤 Subida de archivos a Cloudinary
app.post("/api/upload", upload.single("archivo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "notas_subsecuentes",
      public_id: Date.now() + "_" + req.file.originalname,
    });

    fs.unlinkSync(req.file.path);
    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("❌ Error al subir a Cloudinary:", err);
    res.status(500).json({ error: "Error al subir a Cloudinary." });
  }
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en https://doctrack-production.up.railway.app`);
});
