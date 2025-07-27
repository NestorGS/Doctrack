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
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
  authDomain: "doctrack-46fc2.firebaseapp.com",
  projectId: "doctrack-46fc2",
  storageBucket: "doctrack-46fc2.appspot.com",
  messagingSenderId: "865552814891",
  appId: "1:865552814891:web:cf8e79d5ffd847067bab6e"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const tabla = document.getElementById("tabla-citas");
const selectPacientes = document.getElementById("selectPacientes");
const logoutBtn = document.getElementById("logoutBtn");

// Datos globales
let tratamientos = [];
let pacientes = {};
let pacientesAsignados = []; // 🔥 lista de IDs asignados al doctor

function crearInput(valor) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = valor;
  input.style.width = "100px";
  return input;
}

function pintarTabla(pacienteId) {
  tabla.innerHTML = "";

  // 🔥 Filtrar tratamientos para solo los pacientes asignados
  const filtradosBase = tratamientos.filter(t =>
    pacientesAsignados.includes(t.data.paciente)
  );

  // Si hay pacienteId seleccionado, filtrar más
  const filtrados = pacienteId
    ? filtradosBase.filter(t => t.data.paciente === pacienteId)
    : filtradosBase;

  if (filtrados.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 10;
    td.textContent = pacienteId
      ? "Este paciente no tiene tratamientos."
      : "No hay tratamientos registrados para tus pacientes.";
    td.style.textAlign = "center";
    tr.appendChild(td);
    tabla.appendChild(tr);
    return;
  }

  filtrados.forEach(({ id, data }) => {
    const row = document.createElement("tr");
    row.style.fontFamily = "Sora, sans-serif";

    // Paciente
    const tdPaciente = document.createElement("td");
    tdPaciente.textContent = pacientes[data.paciente] || "Desconocido";
    row.appendChild(tdPaciente);

    // Campos
    const campos = [
      data.medicamento,
      data.forma,
      data.dosis,
      data.via,
      data.frecuencia,
      data.concentracion,
      data.dias
    ];
    const tdCampos = campos.map(valor => {
      const td = document.createElement("td");
      td.textContent = valor;
      return td;
    });
    tdCampos.forEach(td => row.appendChild(td));

    // Botón eliminar
    const tdEliminar = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.title = "Eliminar tratamiento";
    btnEliminar.style.cssText = `
      background:#ff4d4d;
      color:white;
      border:none;
      border-radius:10px;
      cursor:pointer;
      font-size:16px;
    `;
    btnEliminar.addEventListener("click", async () => {
      if (confirm("¿Eliminar este tratamiento?")) {
        await deleteDoc(doc(db, "tratamientos", id));
        alert("Tratamiento eliminado");
        pintarTabla(selectPacientes.value);
      }
    });
    tdEliminar.appendChild(btnEliminar);
    row.appendChild(tdEliminar);

    // Botón editar
    const tdModificar = document.createElement("td");
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "✏️";
    btnEditar.title = "Editar tratamiento";
    btnEditar.style.cssText = `
      background:#ffd966;
      color:black;
      border:none;
      border-radius:10px;
      cursor:pointer;
      font-size:16px;
    `;
    tdModificar.appendChild(btnEditar);
    row.appendChild(tdModificar);

    btnEditar.addEventListener("click", () => {
      const inputs = [];
      tdCampos.forEach((td) => {
        const input = crearInput(td.textContent);
        td.innerHTML = "";
        td.appendChild(input);
        inputs.push(input);
      });

      tdModificar.innerHTML = "";
      const btnGuardar = document.createElement("button");
      btnGuardar.textContent = "💾";
      btnGuardar.style.marginRight = "8px";

      const btnCancelar = document.createElement("button");
      btnCancelar.textContent = "❌";

      tdModificar.appendChild(btnGuardar);
      tdModificar.appendChild(btnCancelar);

      btnGuardar.addEventListener("click", async () => {
        const [medicamento, forma, dosis, via, frecuencia, concentracion, dias] = inputs.map(i => i.value.trim());
        if (!medicamento || !forma || !dosis || !via || !frecuencia || !concentracion || !dias) {
          alert("Todos los campos son obligatorios.");
          return;
        }
        try {
          await updateDoc(doc(db, "tratamientos", id), {
            medicamento, forma, dosis, via, frecuencia, concentracion, dias
          });
          alert("Tratamiento actualizado correctamente.");
          pintarTabla(selectPacientes.value);
        } catch (e) {
          alert("Error al guardar.");
          console.error(e);
        }
      });

      btnCancelar.addEventListener("click", () => pintarTabla(selectPacientes.value));
    });

    tabla.appendChild(row);
  });
}

// Autenticación y carga inicial
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const doctorId = user.uid;

  try {
    // 🔥 Cargar pacientes del doctor
    const pacientesQ = query(
      collection(db, "usuarios"),
      where("rol", "==", "paciente"),
      where("doctorId", "==", doctorId)
    );
    const pacientesSnap = await getDocs(pacientesQ);

    selectPacientes.innerHTML = `<option value="" selected>Todos los pacientes</option>`;

    pacientesAsignados = [];
    if (pacientesSnap.empty) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "Sin pacientes asignados";
      selectPacientes.appendChild(opt);
    } else {
      pacientesSnap.forEach((p) => {
        const data = p.data();
        pacientes[p.id] = `${data.nombre} ${data.paterno} ${data.materno}`;
        pacientesAsignados.push(p.id);
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = pacientes[p.id];
        selectPacientes.appendChild(opt);
      });
    }

    // 🔥 Cargar todos los tratamientos de la colección
    const snapTrat = await getDocs(collection(db, "tratamientos"));
    tratamientos = snapTrat.docs.map((docu) => ({ id: docu.id, data: docu.data() }));

    // Pintar tabla inicialmente (todos los pacientes asignados)
    pintarTabla(""); // vacío = todos

    // Escuchar cambios del select
    selectPacientes.addEventListener("change", () => {
      pintarTabla(selectPacientes.value);
    });
  } catch (error) {
    console.error("Error al cargar pacientes o tratamientos:", error);
    alert("Hubo un problema al cargar los pacientes asignados.");
  }
});

// Cerrar sesión
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
