// registro-firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  collection,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

document.getElementById("registrarBtn")?.addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value.trim();
  const paterno = document.getElementById("paterno").value.trim();
  const materno = document.getElementById("materno").value.trim();
  const curp = document.getElementById("curp").value.trim();
  const nacimiento = document.getElementById("nacimiento").value;
  const correo = document.getElementById("correo").value.trim();
  const password = document.getElementById("password").value;
  const confirmar = document.getElementById("confirmar").value;

  if (!nombre || !paterno || !materno || !correo || !password || !confirmar || !curp || !nacimiento) {
    return alert("Todos los campos son obligatorios.");
  }

  if (password !== confirmar) {
    return alert("Las contraseñas no coinciden.");
  }

  if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return alert("La contraseña debe tener al menos 8 caracteres, incluir letras y números.");
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, correo, password);
    const uid = cred.user.uid;

    // 🔄 Obtener lista de doctores ordenada
    const doctorsQuery = query(collection(db, "doctores"), orderBy("cedula"));
    const doctorsSnap = await getDocs(doctorsQuery);
    const doctors = doctorsSnap.docs;

    if (doctors.length === 0) {
      throw new Error("No hay doctores disponibles.");
    }

    const cfgRef = doc(db, "config", "roundRobin");
    const cfgSnap = await getDoc(cfgRef);
    const lastIndex = cfgSnap.exists() ? cfgSnap.data().lastIndex : -1;
    const nextIndex = (lastIndex + 1) % doctors.length;
    const chosenDoctor = doctors[nextIndex];

    // 🩺 Guardar al nuevo paciente con el doctor asignado
    await setDoc(doc(db, "usuarios", uid), {
      nombre,
      paterno,
      materno,
      correo,
      curp,
      nacimiento,
      rol: "paciente",
      doctorId: chosenDoctor.id,
      creadoEn: new Date()
    });

    // 🔗 Relación en subcolección del doctor
    await setDoc(doc(db, `doctores/${chosenDoctor.id}/pacientes`, uid), {
      linkedAt: new Date()
    });

    // 🔁 Actualizar índice de round-robin
    await setDoc(cfgRef, { lastIndex: nextIndex }, { merge: true });

    // 📧 Enviar verificación de correo
    try {
      await sendEmailVerification(cred.user);
      localStorage.setItem("correoPendiente", correo);
      localStorage.setItem("claveTemporal", password);
    } catch (err) {
      console.warn("No se pudo enviar verificación automáticamente:", err);
    }

    // ✅ Popup para reenviar correo
    const popup = document.createElement("div");
    popup.style = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); display: flex; flex-direction: column;
      justify-content: center; align-items: center; z-index: 9999;
    `;

    const msg = document.createElement("div");
    msg.style = `
      background: #fff; padding: 30px; border-radius: 10px;
      text-align: center; max-width: 400px;
    `;
    msg.innerHTML = `
      <h2>Verifica tu correo electrónico</h2>
      <p>Hemos enviado un enlace a <strong>${correo}</strong>.</p>
      <p>Una vez confirmado, podrás iniciar sesión.</p>
      <button id="btnReenviarCorreo" style="margin-top: 20px; padding: 10px 20px; background: #114c5f; color: white; border: none; border-radius: 8px; cursor: pointer;">📩 Reenviar correo</button>
    `;

    popup.appendChild(msg);
    document.body.appendChild(popup);

    document.getElementById("btnReenviarCorreo").addEventListener("click", async () => {
      const email = localStorage.getItem("correoPendiente");
      const clave = localStorage.getItem("claveTemporal");
      if (!email || !clave) return alert("No se pudo reenviar: datos incompletos.");

      try {
        const credTemp = await signInWithEmailAndPassword(auth, email, clave);
        await sendEmailVerification(credTemp.user);
        await signOut(auth);
        alert("📩 Correo reenviado. Revisa tu bandeja de entrada.");
      } catch (err) {
        alert("❌ No se pudo reenviar: " + err.message);
      }
    });

  } catch (error) {
    console.error("Error en el registro:", error);
    alert("❌ No se pudo registrar: " + error.message);
  }
});
