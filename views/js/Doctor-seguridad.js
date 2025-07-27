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
  doc,
  Timestamp,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* ───────── CONFIG FIREBASE ───────── */
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
const tablaCitas = document.getElementById("tabla-citas");

/* ───────── FUNC. UTIL PARA PINTAR LA TABLA ───────── */
async function cargarCitas(doctorId, pacienteId = null) {
  tablaCitas.innerHTML = ""; // vaciar tabla

  // Consulta base
  let q;
  if (pacienteId) {
    q = query(
      collection(db, "citas"),
      where("doctorId", "==", doctorId),
      where("pacienteId", "==", pacienteId)
    );
  } else {
    q = query(
      collection(db, "citas"),
      where("doctorId", "==", doctorId)
    );
  }

  const snap = await getDocs(q);

  if (snap.empty) {
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = pacienteId
      ? "Este paciente no tiene citas."
      : "No hay citas registradas.";
    td.style.textAlign = "center";
    row.appendChild(td);
    tablaCitas.appendChild(row);
    return;
  }

  snap.forEach((docCita) => {
    const cita = docCita.data();
    const row = document.createElement("tr");

    // Paciente
    const nombreTd = document.createElement("td");
    nombreTd.textContent =
      cita.pacienteNombre ?? cita.nombrePaciente ?? "—";

    // Fecha
    const fechaTd = document.createElement("td");
    if (cita.fechaCita && cita.fechaCita.toDate) {
      fechaTd.textContent = cita.fechaCita.toDate().toLocaleString("es-MX");
    } else {
      fechaTd.textContent = "Sin fecha";
    }

    // Motivo
    const motivoTd = document.createElement("td");
    motivoTd.textContent = cita.motivo || "—";

    // Eliminar
    const eliminarTd = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.title = "Eliminar cita";
    btnEliminar.style.cssText = `
      background:#ff4d4d;
      color:#fff;
      border:none;
      border-radius:10px;
      cursor:pointer;
      font-size:16px;
    `;
    btnEliminar.addEventListener("click", async () => {
      if (confirm("¿Seguro que deseas eliminar esta cita?")) {
        await deleteDoc(doc(db, "citas", docCita.id));
        await cargarCitas(doctorId, pacienteId); // recarga
      }
    });
    eliminarTd.appendChild(btnEliminar);

    // Editar
    const modificarTd = document.createElement("td");
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "✏️";
    btnEditar.title = "Editar cita";
    btnEditar.style.cssText = `
      background:#ffd966;
      color:black;
      border:none;
      border-radius:10px;
      cursor:pointer;
      font-size:16px;
    `;

    btnEditar.addEventListener("click", () => {
      const motivoInput = document.createElement("input");
      motivoInput.type = "text";
      motivoInput.value = cita.motivo;
      motivoInput.style.width = "90%";

      const fechaInput = document.createElement("input");
      fechaInput.type = "datetime-local";
      fechaInput.value = cita.fechaCita
        .toDate()
        .toISOString()
        .slice(0, 16);

      const btnGuardar = document.createElement("button");
      btnGuardar.textContent = "💾";
      btnGuardar.title = "Guardar";
      btnGuardar.style.marginRight = "8px";

      const btnCancelar = document.createElement("button");
      btnCancelar.textContent = "❌";
      btnCancelar.title = "Cancelar";

      motivoTd.innerHTML = "";
      motivoTd.appendChild(motivoInput);

      fechaTd.innerHTML = "";
      fechaTd.appendChild(fechaInput);

      modificarTd.innerHTML = "";
      modificarTd.appendChild(btnGuardar);
      modificarTd.appendChild(btnCancelar);

      btnGuardar.addEventListener("click", async () => {
        const nuevoMotivo = motivoInput.value.trim();
        const nuevaFecha = new Date(fechaInput.value);

        if (!nuevoMotivo || isNaN(nuevaFecha.getTime())) {
          alert("Completa el motivo y una fecha válida.");
          return;
        }

        const ahora = new Date();
        if (nuevaFecha < ahora) {
          alert("No puedes agendar una cita en el pasado.");
          return;
        }

        const hora = nuevaFecha.getHours();
        if (hora < 7 || hora >= 18) {
          alert("La cita debe estar entre las 07:00 a.m. y las 6:00 p.m.");
          return;
        }

        try {
          await updateDoc(doc(db, "citas", docCita.id), {
            motivo: nuevoMotivo,
            fechaCita: Timestamp.fromDate(nuevaFecha)
          });

          alert("Cita actualizada correctamente ✅");
          motivoTd.textContent = nuevoMotivo;
          fechaTd.textContent = nuevaFecha.toLocaleString("es-MX");
          modificarTd.innerHTML = "";
          modificarTd.appendChild(btnEditar);

          cita.motivo = nuevoMotivo;
          cita.fechaCita = Timestamp.fromDate(nuevaFecha);

        } catch (e) {
          console.error("Error al guardar:", e);
          alert("No se pudo guardar.");
        }
      });

      btnCancelar.addEventListener("click", () => {
        motivoTd.textContent = cita.motivo;
        fechaTd.textContent = cita.fechaCita
          .toDate()
          .toLocaleString("es-MX");
        modificarTd.innerHTML = "";
        modificarTd.appendChild(btnEditar);
      });
    });

    modificarTd.appendChild(btnEditar);

    row.appendChild(nombreTd);
    row.appendChild(fechaTd);
    row.appendChild(motivoTd);
    row.appendChild(eliminarTd);
    row.appendChild(modificarTd);

    tablaCitas.appendChild(row);
  });
}

/* ───────── MAIN ───────── */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "index.html";
    return;
  }

  const doctorId = user.uid;

  try {
    // Poblar select de pacientes
    const pacientesQ = query(
      collection(db, "usuarios"),
      where("rol", "==", "paciente"),
      where("doctorId", "==", doctorId)
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
        opt.value = p.id;
        opt.textContent = `${data.nombre} ${data.paterno} ${data.materno}`;
        selectPacientes.appendChild(opt);
      });
    }

    // Cargar todas las citas inicialmente
    await cargarCitas(doctorId);

    // Filtrar al seleccionar un paciente
    selectPacientes.addEventListener("change", async () => {
      const pacienteIdElegido = selectPacientes.value || null;
      await cargarCitas(doctorId, pacienteIdElegido);
    });

  } catch (error) {
    console.error("Error al cargar datos:", error);
    alert("Error al cargar citas o pacientes.");
  }
});

/* ───────── CERRAR SESIÓN ───────── */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión.");
    }
  });
}
