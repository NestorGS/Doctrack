 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getAuth,
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    Timestamp
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

  const selectPacientes = document.getElementById("selectPacientes");
  const inputPeso = document.querySelector("input[placeholder='Ej: 68.5']");
  const inputEstatura = document.querySelector("input[placeholder='Ej: 170']");
  const inputPresion = document.querySelector("input[placeholder='Ej: 120/80']");
  const inputFC = document.querySelector("input[placeholder='Ej: 72 lpm']");
  const inputFR = document.querySelector("input[placeholder='Ej: 18 rpm']");
  const inputObservaciones = document.querySelector("textarea");
  const btnGuardar = document.querySelector("button");

  let doctorId = null;

  onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Debes iniciar sesión primero.");
    return (location.href = "index.html");
  }

  const doctorId = user.uid;

  try {
    // 🔥 Usa el campo correcto: doctorId
    const q = query(
      collection(db, "usuarios"),
      where("rol", "==", "paciente"),
      where("doctorId", "==", doctorId)
    );
    const snap = await getDocs(q);

    selectPacientes.innerHTML = "";

    if (snap.empty) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.selected = true;
      opt.textContent = "Sin pacientes asignados";
      selectPacientes.appendChild(opt);
    } else {
      const defaultOpt = document.createElement("option");
      defaultOpt.disabled = true;
      defaultOpt.selected = true;
      defaultOpt.textContent = "Selecciona un paciente";
      selectPacientes.appendChild(defaultOpt);

      snap.forEach((p) => {
        const d = p.data();
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${d.nombre} ${d.paterno || ""} ${d.materno || ""}`;
        selectPacientes.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error cargando pacientes:", err);
    alert("No se pudo cargar la lista de pacientes.");
  }
});


  btnGuardar.addEventListener("click", async () => {
    const pacienteId = selectPacientes.value;
    if (!pacienteId) return alert("Selecciona un paciente válido.");

    try {
      // Verificar si ya existe un registro con ese pacienteId
      const q = query(
        collection(db, "exploracion_fisica"),
        where("pacienteId", "==", pacienteId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert("Este paciente ya tiene una exploración registrada. Puedes modificarla en la sección correspondiente.");
        return;
      }
    } catch (err) {
      console.error("Error al verificar duplicados:", err);
      return alert("Error al verificar si ya existe una exploración.");
    }

    const datos = {
      doctorId,
      pacienteId,
      peso: inputPeso.value.trim(),
      estatura: inputEstatura.value.trim(),
      presion_arterial: inputPresion.value.trim(),
      frecuencia_cardiaca: inputFC.value.trim(),
      frecuencia_respiratoria: inputFR.value.trim(),
      observaciones_generales: inputObservaciones.value.trim(),
      createdAt: Timestamp.now()
    };

    try {
      await addDoc(collection(db, "exploracion_fisica"), datos);
      alert("Exploración física guardada correctamente.");

      inputPeso.value = inputEstatura.value =
      inputPresion.value = inputFC.value = inputFR.value =
      inputObservaciones.value = "";

      selectPacientes.selectedIndex = 0;
    } catch (err) {
      console.error("Error guardando:", err);
      alert("Error al guardar. Intenta de nuevo.");
    }
  });