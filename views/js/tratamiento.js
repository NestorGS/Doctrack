

import { initializeApp }   from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged }
       from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* -----------------------  Config Firebase  -------------------- */
const firebaseConfig = {
  apiKey:            "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
  authDomain:        "doctrack-46fc2.firebaseapp.com",
  projectId:         "doctrack-46fc2",
  storageBucket:     "doctrack-46fc2.appspot.com",
  messagingSenderId: "865552814891",
  appId:             "1:865552814891:web:cf8e79d5ffd847067bab6e",
  measurementId:     "G-XQPNKXK08Y"
};

/* Evita re-inicializar si ya existe */
import { getApps } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db   = getFirestore(app);

/* ───────────────── 1 · Funciones de validación ──────────────── */
function contieneEtiquetasHTML(str) {
  return /<[^>]*>/g.test(str);
}

function contieneCaracteresEspeciales(str) {
  return /[!@#$%^&*(),.?":{}|<>]/g.test(str);
}

function contieneInyeccionSQL(str) {
  const sql = /(--|;|\/\*|\*\/|@@|@|char\(|nchar\(|varchar\(|alter |begin |cast\(|create |cursor |declare |delete |drop |end |exec |execute |fetch |insert |kill |open |select |sys|system_user|table |update )/i;
  return sql.test(str);
}

function soloLetras(str) {
  return /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/.test(str);
}

function validarFormulario(campo, valor) {
  const errores = [];
  if (!valor.trim()) errores.push(`El campo "${campo}" no puede estar vacío.`);
  if (contieneEtiquetasHTML(valor)) errores.push(`El campo "${campo}" contiene etiquetas HTML no permitidas.`);
  if (contieneCaracteresEspeciales(valor) && campo !== "Motivo")
    errores.push(`El campo "${campo}" contiene caracteres especiales inválidos.`);
  if (contieneInyeccionSQL(valor))
    errores.push(`El campo "${campo}" contiene patrones sospechosos de inyección SQL.`);
  if ((campo === "Nombre del paciente" || campo === "Tratamiento") && !soloLetras(valor))
    errores.push(`El campo "${campo}" solo debe contener letras.`);
  return errores;
}

function validarCita(datos) {
  const todosErrores = [];
  for (const [campo, valor] of Object.entries(datos)) {
    const errs = validarFormulario(campo, valor);
    if (errs.length) todosErrores.push(...errs);
  }
  return todosErrores;
}

/* ──────────────── 2 · Lógica al cargar la página ────────────── */
document.addEventListener("DOMContentLoaded", () => {
  /* -------- 2a · Popular <select id="selectPacientes"> -------- */

    alert("holaaaaaaaaaa")

  const selectPacientes = document.getElementById("selectPacientes");
  if (selectPacientes) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return console.warn("Doctor no autenticado.");

      const q = query(
        collection(db, "usuarios"),
        where("rol", "==", "paciente"),
        where("assignedDoctor", "==", user.uid)   //  campo que pusimos en la Cloud Function
      );

      try {
        const snap = await getDocs(q);

        /* Limpia opciones previas excepto el primer placeholder */
        selectPacientes.querySelectorAll("option:not([disabled])").forEach(o=>o.remove());

        if (snap.empty) {
          const opt = document.createElement("option");
          opt.disabled = true;
          opt.textContent = "Sin pacientes asignados";
          selectPacientes.appendChild(opt);
        } else {
          snap.forEach((doc) => {
            const p = doc.data();
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `${p.nombre || ""} ${p.paterno || ""} ${p.materno || ""}`.trim();
            selectPacientes.appendChild(opt);
          });
        }
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
      }
    });
  }

  /* -------- 2b · Validaciones de formulario de citas ---------- */
  const formulario = document.getElementById("formulario-cita");
  if (formulario) {
    formulario.addEventListener("submit", (e) => {
      e.preventDefault();

      const datos = {
        "Nombre del paciente": document.getElementById("nombre").value,
        "Tratamiento":         document.getElementById("tratamiento").value,
        "Hora de la cita":     document.getElementById("hora").value,
        "Alergias":            document.getElementById("alergias").value,
        "Motivo":              document.getElementById("motivo").value
      };

      const errores = validarCita(datos);
      if (errores.length) {
        alert("Errores:\n" + errores.join("\n"));
      } else {
        formulario.submit();   // pasa validaciones
      }
    });
  }
});


