import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc
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

// 🔥 CARGAR PACIENTES DEL DOCTOR
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const doctorId = user.uid;
    const pacientesQ = query(
      collection(db, "usuarios"),
      where("rol", "==", "paciente"),
      where("doctorId", "==", doctorId)
    );
    const pacientesSnap = await getDocs(pacientesQ);

    selectPacientes.innerHTML = `<option value="" selected>Todos los pacientes</option>`;

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
  } else {
    console.log("No hay usuario logueado");
  }
});

// 🔥 AL SELECCIONAR PACIENTE
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

// 🔥 GUARDAR DATOS
guardarBtn.addEventListener("click", async () => {
  const pacienteId = selectPacientes.value;
  if (!pacienteId) {
    alert("Selecciona un paciente primero");
    return;
  }

  try {
    // IDENTIFICACION
    const identRef = doc(db, "identificacion_paciente", pacienteId);
    const identSnap = await getDoc(identRef);
    const identData = {
      estadocivil: estadocivil.value,
      sexo: sexo.value,
      edad: edad.value,
      religion: religion.value,
      ocupacion: ocupacion.value
    };
    if (identSnap.exists()) {
      await updateDoc(identRef, identData);
    } else {
      await setDoc(identRef, identData);
    }

    // ANTECEDENTES
    const anteQ = query(collection(db, "antecedentes_paciente"), where("pacienteId", "==", pacienteId));
    const anteSnap = await getDocs(anteQ);
    if (!anteSnap.empty) {
      for (let d of anteSnap.docs) {
        await updateDoc(doc(db, "antecedentes_paciente", d.id), {
          hipertension: hipertension.value.toLowerCase() === "sí",
          diabetes: diabetes.value.toLowerCase() === "sí",
          cardiopatias: cardiopatias.value.toLowerCase() === "sí",
          asma: asma.value.toLowerCase() === "sí",
          otro: otro.value.toLowerCase() === "sí",
          alcoholismo: alcoholismo.value.toLowerCase() === "sí",
          tabaquismo: tabaquismo.value.toLowerCase() === "sí",
          aseo_bucal: aseo_bucal.value.toLowerCase() === "sí",
          aseo_fisico: aseo_fisico.value.toLowerCase() === "sí"
        });
      }
    } else {
      await setDoc(doc(collection(db, "antecedentes_paciente")), {
        pacienteId,
        hipertension: hipertension.value.toLowerCase() === "sí",
        diabetes: diabetes.value.toLowerCase() === "sí",
        cardiopatias: cardiopatias.value.toLowerCase() === "sí",
        asma: asma.value.toLowerCase() === "sí",
        otro: otro.value.toLowerCase() === "sí",
        alcoholismo: alcoholismo.value.toLowerCase() === "sí",
        tabaquismo: tabaquismo.value.toLowerCase() === "sí",
        aseo_bucal: aseo_bucal.value.toLowerCase() === "sí",
        aseo_fisico: aseo_fisico.value.toLowerCase() === "sí",
        creadaEn: new Date()
      });
    }

    // EXPLORACION
    const expQ = query(collection(db, "exploracion_fisica"), where("pacienteId", "==", pacienteId));
    const expSnap = await getDocs(expQ);
    if (!expSnap.empty) {
      for (let d of expSnap.docs) {
        await updateDoc(doc(db, "exploracion_fisica", d.id), {
          peso: peso.value,
          presion_arterial: presion_arterial.value,
          frecuencia_cardiaca: frecuencia_cardiaca.value,
          frecuencia_respiratoria: frecuencia_respiratoria.value,
          observaciones_generales: observaciones_generales.value,
          estatura: estatura.value
        });
      }
    } else {
      await setDoc(doc(collection(db, "exploracion_fisica")), {
        pacienteId,
        peso: peso.value,
        presion_arterial: presion_arterial.value,
        frecuencia_cardiaca: frecuencia_cardiaca.value,
        frecuencia_respiratoria: frecuencia_respiratoria.value,
        observaciones_generales: observaciones_generales.value,
        estatura: estatura.value,
        createdAt: new Date()
      });
    }

    alert("✅ Datos guardados correctamente");
  } catch (err) {
    console.error("Error al guardar:", err);
    alert("❌ Error al guardar datos");
  }
});
