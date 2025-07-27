import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* ───────── Config Firebase ───────── */
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
const formCita = document.getElementById("formCita");

// 🔥 VARIABLE GLOBAL DEL DOCTOR
let doctorID = null;

/* ───────── Autenticación y carga de pacientes ───────── */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "index.html";
    return;
  }

  // Verifica que sea un doctor registrado
  const docSnap = await getDoc(doc(db, "doctores", user.uid));
  if (!docSnap.exists()) {
    alert("No tienes permisos para registrar citas.");
    window.location.href = "index.html";
    return;
  }

  // ⚠️ Asignar a la variable global, no redeclarar
  doctorID = user.uid;

  /* ▼ Cargar pacientes asignados ▼ */
  try {
    const q = query(
      collection(db, "usuarios"),
      where("rol", "==", "paciente"),
      where("doctorId", "==", doctorID)
    );

    const snap = await getDocs(q);

    // Limpiar y placeholder
    selectPacientes.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecciona un paciente";
    placeholder.disabled = true;
    placeholder.selected = true;
    selectPacientes.appendChild(placeholder);

    if (snap.empty) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "Sin pacientes asignados";
      selectPacientes.appendChild(opt);
    } else {
      snap.forEach((pac) => {
        const p = pac.data();
        const opt = document.createElement("option");
        opt.value = pac.id; // Guardamos el UID del paciente
        opt.textContent = `${p.nombre} ${p.paterno} ${p.materno}`;
        selectPacientes.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error al cargar pacientes:", err);
    alert("Error al cargar pacientes");
  }
});

/* ───────── Envío del formulario ───────── */
formCita.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pacienteId = selectPacientes.value;
  const pacienteNombre =
    selectPacientes.options[selectPacientes.selectedIndex]?.textContent || "";
  const fechaCitaInput = document.getElementById("fechaCita").value;
  const motivo = document.getElementById("motivoCita").value.trim();

  if (!pacienteId || !fechaCitaInput || !motivo) {
    return alert("Por favor, llena todos los campos.");
  }

  const fechaCita = new Date(fechaCitaInput);
  const ahora = new Date();

  if (fechaCita <= ahora) {
    return alert("La fecha y hora de la cita debe ser futura.");
  }

  const hora = fechaCita.getHours();
  if (hora < 7 || hora >= 18) {
    return alert("La hora de la cita debe ser entre 7:00 a.m. y 6:00 p.m.");
  }

  if (!doctorID) {
    console.error("doctorID no asignado aún");
    return alert("Error interno: no se pudo determinar el doctor.");
  }

  try {
    await addDoc(collection(db, "citas"), {
      pacienteId,
      pacienteNombre,
      fechaCita: Timestamp.fromDate(fechaCita),
      motivo,
      doctorId: doctorID, // ✅ campo correcto y con valor
      creadaEn: Timestamp.now()
    });

    alert("Cita registrada correctamente.");
    window.location.href = "Doctor.html";
  } catch (error) {
    console.error("Error al registrar la cita:", error);
    alert("Error al registrar la cita. Intenta de nuevo.");
  }
});
