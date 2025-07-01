
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
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

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (err) {
    console.error("Error al cerrar sesión", err);
  }
});

const tablaProgreso = document.getElementById("tabla-progreso");
const tablaCompletados = document.getElementById("tabla-completados");

let usuarioId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "index.html";
  usuarioId = user.uid;
  await cargarTratamientos();
});

async function cargarTratamientos() {
  const snap = await getDocs(query(
    collection(db, "tratamientos"),
    where("paciente", "==", usuarioId)
  ));
  const tratamientos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  renderTablas(tratamientos);
}

function renderTablas(tratamientos) {
  tablaProgreso.innerHTML = "";
  tablaCompletados.innerHTML = "";

  tratamientos.forEach(t => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${t.medicamento}</td>
      <td>${t.forma}</td>
      <td>${t.concentracion}</td>
      <td>${t.dosis}</td>
      <td>${t.via}</td>
      <td>${t.frecuencia}</td>
      <td>${t.dias}</td>
    `;

    const btnTd = document.createElement("td");
    const btn = document.createElement("button");

    if (t.completado) {
      btn.textContent = "🔴";
      btn.title = "Marcar como incompleto";
      btn.style.backgroundColor = "#ffc107"; // amarillo
      btn.addEventListener("click", async () => {
        await updateDoc(doc(db, "tratamientos", t.id), {
          completado: false
        });
        await cargarTratamientos();
      });
      btnTd.appendChild(btn);
      fila.appendChild(btnTd);
      tablaCompletados.appendChild(fila);
    } else {
      btn.textContent = "🟢";
      btn.title = "Marcar como completado";
      btn.style.backgroundColor = "#28a745"; // verde
      btn.addEventListener("click", async () => {
        await updateDoc(doc(db, "tratamientos", t.id), {
          completado: true
        });
        await cargarTratamientos();
      });
      btnTd.appendChild(btn);
      fila.appendChild(btnTd);
      tablaProgreso.appendChild(fila);
    }

    btn.style.color = "white";
    btn.style.borderRadius = "10px";
    btn.style.cursor = "pointer";
    btn.style.padding = "5px 10px";
  });
}

