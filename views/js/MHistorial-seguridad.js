import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// CONFIG FIREBASE
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

// DOM
const selectPacientes = document.getElementById("selectPacientes");
const guardarBtn = document.getElementById("guardarBtn");

// Identificación
const estadocivil = document.getElementById("estadocivil");
const sexo = document.getElementById("sexo");
const edad = document.getElementById("edad");
const religion = document.getElementById("religion");
const ocupacion = document.getElementById("ocupacion");

// Antecedentes
const hipertension = document.getElementById("hipertension");
const diabetes = document.getElementById("diabetes");
const cardiopatias = document.getElementById("cardiopatias");
const asma = document.getElementById("asma");
const otro = document.getElementById("otro");
const alcoholismo = document.getElementById("alcoholismo");
const tabaquismo = document.getElementById("tabaquismo");
const aseo_bucal = document.getElementById("aseo_bucal");
const aseo_fisico = document.getElementById("aseo_fisico");

// Exploración
const peso = document.getElementById("peso");
const presion_arterial = document.getElementById("presion_arterial");
const frecuencia_cardiaca = document.getElementById("frecuencia_cardiaca");
const frecuencia_respiratoria = document.getElementById("frecuencia_respiratoria");
const observaciones_generales = document.getElementById("observaciones_generales");
const estatura = document.getElementById("estatura");

// FUNCION LIMPIAR CAMPOS
function limpiarCampos() {
  [estadocivil, sexo, edad, religion, ocupacion,
   hipertension, diabetes, cardiopatias, asma, otro,
   alcoholismo, tabaquismo, aseo_bucal, aseo_fisico,
   peso, presion_arterial, frecuencia_cardiaca,
   frecuencia_respiratoria, observaciones_generales,
   estatura].forEach(el => el.value = "");
}

// CARGAR PACIENTES DEL DOCTOR
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Doctor logueado:", user.uid);
    const q = query(collection(db, "usuarios"), where("assignedDoctor", "==", user.uid));
    const snap = await getDocs(q);
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const opt = document.createElement("option");
      opt.value = docSnap.id; // usamos el ID
      opt.textContent = data.nombre;
      selectPacientes.appendChild(opt);
    });
  } else {
    console.log("No hay usuario logueado");
  }
});

// AL SELECCIONAR PACIENTE
selectPacientes.addEventListener("change", async (e) => {
  const pacienteId = e.target.value;
  if (!pacienteId) return;

  limpiarCampos();

  // IDENTIFICACION
  const qIdent = query(collection(db, "identificacion_paciente"), where("__name__", "==", pacienteId));
  const snapIdent = await getDocs(qIdent);
  snapIdent.forEach(docSnap => {
    const d = docSnap.data();
    estadocivil.value = d.estadocivil || "";
    sexo.value = d.sexo || "";
    edad.value = d.edad || "";
    religion.value = d.religion || "";
    ocupacion.value = d.ocupacion || "";
  });

  // ANTECEDENTES
  const qAnte = query(collection(db, "antecedentes_paciente"), where("pacienteId", "==", pacienteId));
  const snapAnte = await getDocs(qAnte);
  snapAnte.forEach(docSnap => {
    const d = docSnap.data();
    hipertension.value = d.hipertension ? "Sí" : "No";
    diabetes.value = d.diabetes ? "Sí" : "No";
    cardiopatias.value = d.cardiopatias ? "Sí" : "No";
    asma.value = d.asma ? "Sí" : "No";
    otro.value = d.otro ? "Sí" : "No";
    alcoholismo.value = d.alcoholismo ? "Sí" : "No";
    tabaquismo.value = d.tabaquismo ? "Sí" : "No";
    aseo_bucal.value = d.aseo_bucal ? "Sí" : "No";
    aseo_fisico.value = d.aseo_fisico ? "Sí" : "No";
  });

  // EXPLORACION
  const qExp = query(collection(db, "exploracion_fisica"), where("pacienteId", "==", pacienteId));
  const snapExp = await getDocs(qExp);
  snapExp.forEach(docSnap => {
    const d = docSnap.data();
    peso.value = d.peso || "";
    presion_arterial.value = d.presion_arterial || "";
    frecuencia_cardiaca.value = d.frecuencia_cardiaca || "";
    frecuencia_respiratoria.value = d.frecuencia_respiratoria || "";
    observaciones_generales.value = d.observaciones_generales || "";
    estatura.value = d.estatura || "";
  });

  guardarBtn.disabled = false;
});
