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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";

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

// Referencias a los elementos del DOM
const selectPacientes = document.getElementById("selectPacientes");
const guardarBtn = document.getElementById("guardarBtn");

// Campos de identificación
const estadocivil = document.getElementById("estadocivil");
const sexo = document.getElementById("sexo");
const edad = document.getElementById("edad");
const religion = document.getElementById("religion");
const ocupacion = document.getElementById("ocupacion");

// Campos de antecedentes
const hipertension = document.getElementById("hipertension");
const diabetes = document.getElementById("diabetes");
const cardiopatias = document.getElementById("cardiopatias");
const asma = document.getElementById("asma");
const otro = document.getElementById("otro");
const alcoholismo = document.getElementById("alcoholismo");
const tabaquismo = document.getElementById("tabaquismo");
const aseo_bucal = document.getElementById("aseo_bucal");
const aseo_fisico = document.getElementById("aseo_fisico");

// Campos de exploración
const peso = document.getElementById("peso");
const presion_arterial = document.getElementById("presion_arterial");
const frecuencia_cardiaca = document.getElementById("frecuencia_cardiaca");
const frecuencia_respiratoria = document.getElementById("frecuencia_respiratoria");
const observaciones_generales = document.getElementById("observaciones_generales");
const estatura = document.getElementById("estatura");

let doctorIdActual = null;

// Cuando inicia sesión un doctor
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // El UID del doctor logueado
    doctorIdActual = user.uid;

    // Buscar pacientes asignados a este doctor
    const q = query(collection(db, "usuarios"), where("assignedDoctor", "==", doctorIdActual));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const option = document.createElement("option");
      option.value = data.nombre; // usamos nombre para buscar luego
      option.textContent = data.nombre;
      selectPacientes.appendChild(option);
    });

  } else {
    console.log("No hay usuario logueado");
  }
});

// Evento al seleccionar un paciente
selectPacientes.addEventListener("change", async (e) => {
  const nombreSeleccionado = e.target.value;
  if (!nombreSeleccionado) return;

  // Buscar en identificacion_paciente
  const q1 = query(collection(db, "identificacion_paciente"), where("nombre", "==", nombreSeleccionado));
  const snap1 = await getDocs(q1);
  snap1.forEach((docSnap) => {
    const d = docSnap.data();
    estadocivil.value = d.estadocivil || "";
    sexo.value = d.sexo || "";
    edad.value = d.edad || "";
    religion.value = d.religion || "";
    ocupacion.value = d.ocupacion || "";
  });

  // Buscar en antecedentes_paciente
  const q2 = query(collection(db, "antecedentes_paciente"));
  const snap2 = await getDocs(q2);
  snap2.forEach((docSnap) => {
    const d = docSnap.data();
    // necesitamos comparar por pacienteId, pero tú dijiste por nombre, si nombre también existe ahí, usa nombre, si no hay, se puede relacionar por id
    // En tus datos veo que antecedentes_paciente tiene pacienteId, así que necesitamos obtener primero el id correcto:
    // Pero usaremos nombre, revisa si la colección tiene campo nombre
    if (d.pacienteId && nombreSeleccionado) {
      // Como no hay nombre en antecedentes_paciente, debemos relacionar por pacienteId:
      // Obtenemos el id primero
    }
  });

  // Mejor solución: como en antecedentes_paciente solo tienes pacienteId, necesitamos buscar antes:
  // Busca el documento en usuarios que tiene ese nombre para sacar su id
  const qUser = query(collection(db, "usuarios"), where("nombre", "==", nombreSeleccionado));
  const snapUser = await getDocs(qUser);
  let pacienteId = null;
  snapUser.forEach(docSnap => {
    pacienteId = docSnap.id;
  });

  if (pacienteId) {
    // Ahora busca antecedentes con ese pacienteId
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

    // Ahora busca exploracion_fisica con ese pacienteId
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
  }

  guardarBtn.disabled = false;
});
