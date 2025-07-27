import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 🔥 Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
  authDomain: "doctrack-46fc2.firebaseapp.com",
  projectId: "doctrack-46fc2",
  storageBucket: "doctrack-46fc2.appspot.com",
  messagingSenderId: "865552814891",
  appId: "1:865552814891:web:cf8e79d5ffd847067bab6e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔥 Referencias a elementos HTML
const selectPacientes = document.getElementById("selectPacientes");
const guardarBtn = document.getElementById("guardarBtn");

// 🔥 Campos del formulario (ajusta los IDs a los tuyos)
const nombreInput = document.getElementById("nombre");
const edadInput = document.getElementById("edad");
const sexoInput = document.getElementById("sexo");
const estadoCivilInput = document.getElementById("estadoCivil");
const ocupacionInput = document.getElementById("ocupacion");
const religionInput = document.getElementById("religion");
const telefonoInput = document.getElementById("telefono");

let pacienteActualId = null;

// 🔥 Al cargar usuario doctor
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "index.html";
    return;
  }

  const doctorId = user.uid;

  try {
    // Obtener todos los pacientes asignados a este doctor
    const q = query(
      collection(db, "usuarios"),
      where("rol", "==", "paciente"),
      where("doctorId", "==", doctorId)
    );
    const snap = await getDocs(q);

    selectPacientes.innerHTML = `<option value="" selected disabled>Selecciona un paciente</option>`;

    if (snap.empty) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "Sin pacientes asignados";
      selectPacientes.appendChild(opt);
    } else {
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        const opt = document.createElement("option");
        opt.value = docSnap.id;
        opt.textContent = `${d.nombre} ${d.paterno || ""} ${d.materno || ""}`;
        selectPacientes.appendChild(opt);
      });
    }
  } catch (e) {
    console.error("Error cargando pacientes:", e);
    alert("No se pudo cargar la lista de pacientes.");
  }
});

selectPacientes.addEventListener("change", async () => {
  const selectedId = selectPacientes.value; // ID del documento en usuarios
  if (!selectedId) return;

  try {
    // Obtenemos el documento de usuarios
    const userDoc = await getDoc(doc(db, "usuarios", selectedId));
    if (!userDoc.exists()) {
      alert("No se encontró el usuario seleccionado.");
      return;
    }

    const userData = userDoc.data();
    const nombreUsuario = userData.nombre?.toLowerCase().trim();

    if (!nombreUsuario) {
      alert("El usuario no tiene nombre para buscar.");
      return;
    }

    // 🔥 Buscamos en la colección identificacion_paciente por el nombre
    const q = query(
      collection(db, "identificacion_paciente"),
      where("nombre", "==", userData.nombre) // aquí compara exactamente el nombre
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("No se encontraron datos de identificación para ese nombre.");
      return;
    }

    // Si hay más de uno, tomamos el primero
    const idSnap = snap.docs[0];
    const data = idSnap.data();

    // Guardamos el ID para futuras actualizaciones
    pacienteActualId = idSnap.id;

    // Llenamos los campos
    nombreInput.value = data.nombre || "";
    edadInput.value = data.edad || "";
    sexoInput.value = data.sexo || "";
    estadoCivilInput.value = data.estadocivil || "";
    ocupacionInput.value = data.ocupacion || "";
    religionInput.value = data.religion || "";
    telefonoInput.value = data.telefono || "";

  } catch (e) {
    console.error("Error obteniendo datos:", e);
    alert("No se pudo obtener información del paciente.");
  }
});


// 🔥 Guardar cambios
guardarBtn.addEventListener("click", async () => {
  if (!pacienteActualId) {
    alert("Selecciona un paciente primero.");
    return;
  }

  try {
    const idRef = doc(db, "identificacion_paciente", pacienteActualId);
    await updateDoc(idRef, {
      nombre: nombreInput.value,
      edad: edadInput.value,
      sexo: sexoInput.value,
      estadocivil: estadoCivilInput.value,
      ocupacion: ocupacionInput.value,
      religion: religionInput.value,
      telefono: telefonoInput.value
    });

    alert("Datos actualizados correctamente.");
  } catch (e) {
    console.error("Error actualizando datos:", e);
    alert("No se pudieron guardar los datos.");
  }
});

// 🔥 Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (!confirmar) return;

    try {
      await signOut(auth);
      alert("Sesión cerrada correctamente.");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un error al cerrar sesión.");
    }
  });
}
