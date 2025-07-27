import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getAuth,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    addDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
    authDomain: "doctrack-46fc2.firebaseapp.com",
    projectId: "doctrack-46fc2",
    storageBucket: "doctrack-46fc2.appspot.com",
    messagingSenderId: "865552814891",
    appId: "1:865552814891:web:cf8e79d5ffd847067bab6e",
    measurementId: "G-XQPNKXK08Y"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const pacienteSelect = document.getElementById("pacienteSelect");
  const btnGuardar = document.getElementById("btnGuardar");
  const archivoInput = document.getElementById("archivoAdjunto");

  const campos = {
    temperatura: document.getElementById("temperatura"),
    frecuencia_cardiaca: document.getElementById("frecuenciaCardiaca"),
    frecuencia_respiratoria: document.getElementById("frecuenciaRespiratoria"),
    talla: document.getElementById("talla"),
    peso: document.getElementById("peso"),
    tension_arterial: document.getElementById("tensionArterial"),
    notas: document.getElementById("notas")
  };

  let doctorId = null;

  // Cargar pacientes asignados
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión primero.");
      window.location.href = "index.html";
      return;
    }

    doctorId = user.uid;

    const q = query(
      collection(db, "usuarios"),
      where("rol", "==", "paciente"),
      where("doctorId", "==", doctorId)
    );

    const snap = await getDocs(q);
    pacienteSelect.innerHTML = `<option disabled selected>Selecciona un paciente</option>`;
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = `${d.nombre} ${d.paterno ?? ""} ${d.materno ?? ""}`;
      pacienteSelect.appendChild(option);
    });
  });

  // Guardar nota
  btnGuardar.addEventListener("click", async () => {
    const pacienteId = pacienteSelect.value;

    if (!pacienteId) {
      alert("Selecciona un paciente.");
      return;
    }

    const archivo = archivoInput.files[0];
    let archivoAdjuntoURL = "";

    if (archivo) {
      const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png"];
      const maxSizeBytes = 5 * 1024 * 1024;

      if (!tiposPermitidos.includes(archivo.type)) {
        alert("❌ Solo se permiten archivos PDF o imágenes (JPG, PNG).");
        return;
      }

      if (archivo.size > maxSizeBytes) {
        alert("❌ El archivo no debe superar los 5 MB.");
        return;
      }

      // Subida al backend de Railway para delegar a Cloudinary
      const formData = new FormData();
      formData.append("archivo", archivo);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          throw new Error("Fallo en el servidor al subir el archivo.");
        }

        const data = await res.json();
        archivoAdjuntoURL = data.url;
      } catch (err) {
        console.error("Error al subir archivo:", err);
        alert("❌ Error al subir archivo adjunto.");
        return;
      }
    }

    const nuevaNota = {
      doctorId,
      pacienteId,
      fecha: new Date(),
      temperatura: campos.temperatura.value.trim(),
      frecuencia_cardiaca: campos.frecuencia_cardiaca.value.trim(),
      frecuencia_respiratoria: campos.frecuencia_respiratoria.value.trim(),
      talla: campos.talla.value.trim(),
      peso: campos.peso.value.trim(),
      tension_arterial: campos.tension_arterial.value.trim(),
      notas: campos.notas.value.trim(),
      archivoAdjuntoURL
    };

    try {
      await addDoc(collection(db, "notas_subsecuentes"), nuevaNota);
      alert("✅ Nota guardada correctamente.");

      // Limpiar campos
      pacienteSelect.selectedIndex = 0;
      for (let key in campos) campos[key].value = "";
      archivoInput.value = "";
    } catch (e) {
      console.error("Error al guardar nota:", e);
      alert("❌ Error al guardar la nota.");
    }
  });