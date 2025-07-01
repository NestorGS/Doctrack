  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    Timestamp
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey:            "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
    authDomain:        "doctrack-46fc2.firebaseapp.com",
    projectId:         "doctrack-46fc2",
    storageBucket:     "doctrack-46fc2.appspot.com",
    messagingSenderId: "865552814891",
    appId:             "1:865552814891:web:cf8e79d5ffd847067bab6e",
    measurementId:     "G-XQPNKXK08Y"
  };

  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  const selectPacientes = document.getElementById("selectPacientes");
  const selectCitas     = document.getElementById("selectCitas");
  const selectCampo     = document.getElementById("selectCampo");
  const inputNuevoDato  = document.getElementById("nuevoDato");
  const inputNuevaFecha = document.getElementById("nuevaFecha");
  const form            = document.querySelector("form");

  let doctorId = null;
  let citasPaciente = [];

  onAuthStateChanged(auth, async (user) => {
    if (!user) return (window.location.href = "index.html");
    doctorId = user.uid;

    const snap = await getDocs(
      query(
        collection(db, "usuarios"),
        where("rol", "==", "paciente"),
        where("assignedDoctor", "==", doctorId)
      )
    );

    selectPacientes.innerHTML =
      `<option value="" disabled selected>Pacientes</option>`;

    snap.forEach((p) => {
      const d   = p.data();
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${d.nombre} ${d.paterno} ${d.materno}`;
      selectPacientes.appendChild(opt);
    });
  });

  selectPacientes.addEventListener("change", async () => {
    const pacienteId = selectPacientes.value;
    if (!pacienteId) return;

    const citasSnap = await getDocs(
      query(
        collection(db, "citas"),
        where("doctorID", "==", doctorId),
        where("pacienteId", "==", pacienteId)
      )
    );

    citasPaciente = [];
    selectCitas.innerHTML =
      `<option value="" disabled selected>Selecciona una cita</option>`;

    if (citasSnap.empty) {
      alert("Este paciente no tiene citas registradas.");
      return;
    }

    citasSnap.forEach((c) => {
      const data = c.data();
      if (!data.fechaCita || !(data.fechaCita instanceof Timestamp)) return;

      const iso   = data.fechaCita.toDate().toISOString().slice(0, 16);
      const opt   = document.createElement("option");
      opt.value   = c.id;
      opt.textContent = `${iso.replace("T", " ")} - ${data.motivo || "Sin motivo"}`;
      selectCitas.appendChild(opt);

      citasPaciente.push({ id: c.id, ...data });
    });
  });

  selectCitas.addEventListener("change", () => {
    const citaSel = citasPaciente.find((c) => c.id === selectCitas.value);
    if (!citaSel) return;

    inputNuevoDato.value  = citaSel.motivo || "";
    inputNuevaFecha.value = citaSel.fechaCita
      .toDate()
      .toISOString()
      .slice(0, 16);
  });

  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const citaId = selectCitas.value;
  if (!citaId) return alert("Selecciona una cita a modificar.");

  const campo = selectCampo.value;
  const nuevoTexto  = inputNuevoDato.value.trim();
  const nuevaFechaV = inputNuevaFecha.value;

  const cambios = {};

  if (campo === "motivo") {
    if (!nuevoTexto) return alert("Ingresa el nuevo motivo.");
    cambios.motivo = nuevoTexto;
  }

 if (campo === "fecha") {
  if (!nuevaFechaV) return alert("Selecciona la nueva fecha.");
  const nuevaFecha = new Date(nuevaFechaV);
  if (isNaN(nuevaFecha.getTime())) return alert("Fecha inválida.");
  cambios.fecha = Timestamp.fromDate(nuevaFecha); // ✅ ESTE SÍ COINCIDE CON TU BASE DE DATOS
}


  if (Object.keys(cambios).length === 0) {
    return alert("No se ingresaron cambios.");
  }

  try {
    const citaRef = doc(db, "citas", citaId);
    console.log("Actualizando:", citaId, cambios); // Debug
    await updateDoc(citaRef, cambios);
    alert("Cita actualizada correctamente.");
    window.location.href = "Doctor.html";
  } catch (err) {
    console.error("Error al actualizar cita:", err);
    alert("Error al modificar la cita.");
  }
});
