// archivo: upload.js o en tu backend existente
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/api/upload', upload.single('archivo'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${fileBuffer}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: `notas_subsecuentes/${req.body.pacienteId}`,
    });

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error('Error al subir a Cloudinary:', err);
    res.status(500).json({ error: 'Error al subir archivo.' });
  }
});

export default router;
