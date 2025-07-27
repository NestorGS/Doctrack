import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc
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
const btnGuardar = document.getElementById("btnGuardar");

/* ---------- cargar pacientes del doctor ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "index.html";
    return;
  }

  try {
    const pacientesQ = query(
      collection(db, "usuarios"),
      where("rol", "==", "paciente"),
      where("doctorId", "==", doctorId) // 🔥 usar el campo correcto
    );
    const pacientesSnap = await getDocs(pacientesQ);

    selectPacientes.innerHTML =
      `<option value="" selected>Todos los pacientes</option>`;

    if (pacientesSnap.empty) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "Sin pacientes asignados";
      selectPacientes.appendChild(opt);
    } else {
      pacientesSnap.forEach((p) => {
        const data = p.data();
        const opt = document.createElement("option");
        opt.value = p.id;  // UID paciente
        opt.textContent = `${data.nombre} ${data.paterno} ${data.materno}`;
        selectPacientes.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error cargando pacientes:", err);
    alert("No se pudo cargar la lista de pacientes.");
  }
});

/* ---------- validaciones y guardado ---------- */
btnGuardar.addEventListener("click", async () => {
  const pacienteId = selectPacientes.value;
  const nombrePaciente = selectPacientes.options[selectPacientes.selectedIndex]?.textContent?.trim() || "";

  const edad = document.getElementById("edad").value.trim();
  const genero = document.getElementById("genero").value;
  const ocupacion = document.getElementById("ocupacion").value.trim();
  const estadoCivil = document.getElementById("estado-civil").value.trim();
  const religion = document.getElementById("religion").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();

  // — RegEx —
  const regSoloLetras = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/;
  const regEdad = /^(?:[1-9][0-9]?|1[01][0-9]|120)$/;
  const regTelefono = /^[0-9]{7,15}$/;
  const regCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // — Validaciones —
  if (!pacienteId) return alert("Selecciona un paciente.");
  if (!regEdad.test(edad)) return alert("Edad inválida (1-120).");
  if (!genero) return alert("Selecciona el género.");
  if (!regSoloLetras.test(ocupacion)) return alert("Ocupación inválida.");
  if (!regSoloLetras.test(estadoCivil)) return alert("Estado civil inválido.");
  if (!regSoloLetras.test(religion)) return alert("Religión inválida.");
  if (!regTelefono.test(telefono)) return alert("Teléfono inválido (7-15 dígitos).");
  if (!regCorreo.test(correo)) return alert("Correo electrónico inválido.");

  try {
    const fichaRef = doc(db, "identificacion_paciente", pacienteId);
    const fichaSnap = await getDoc(fichaRef);

    // ❌ Ya existe una ficha con este ID de paciente
    if (fichaSnap.exists()) {
      alert("⚠️ Este paciente ya tiene una ficha registrada. Si deseas modificarla, ve a la sección correspondiente.");
      return;
    }

    // ✅ Crear nuevo registro
    await setDoc(fichaRef, {
      nombre: nombrePaciente,
      correo,
      edad,
      estadocivil: estadoCivil,
      ocupacion,
      religion,
      sexo: genero,
      telefono,
      creadaPor: auth.currentUser.uid,
      creadaEn: new Date()
    });

    alert("✅ Ficha de identificación guardada exitosamente.");
  } catch (e) {
    console.error("❌ Error al guardar ficha:", e.message || e);
    alert("Ocurrió un error al guardar. Revisa la consola para más detalles.");
  }
});


/* ---------- cerrar sesión si tienes #logoutBtn ---------- */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}