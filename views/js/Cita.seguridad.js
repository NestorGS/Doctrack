  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getAuth,
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp
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

  const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    alert("Error al cerrar sesión.");
    console.error(error);
  }
});


  const form = document.querySelector("form");
  const fechaInput = document.querySelector("input[type='datetime-local']");
  const motivoInput = document.querySelector("textarea");

  let userGlobal = null;
  let assignedDoctor = null;
  let pacienteNombre = "";

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión primero.");
      return (window.location.href = "index.html");
    }

    userGlobal = user;
    const docRef = doc(db, "usuarios", user.uid);
    const userDoc = await getDoc(docRef);

    if (!userDoc.exists()) {
      alert("Usuario no registrado.");
      return (window.location.href = "index.html");
    }

    const data = userDoc.data();
    if (data.rol !== "paciente") {
      alert("Acceso no autorizado.");
      return (window.location.href = "index.html");
    }

    if (!data.doctorId) {
      alert("No tienes un doctor asignado. Contacta al administrador.");
      return;
    }

    assignedDoctor = data.assignedDoctor;
    pacienteNombre = `${data.nombre} ${data.paterno} ${data.materno}`;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!userGlobal || !assignedDoctor) {
      alert("Datos del paciente o doctor no cargados.");
      return;
    }

    const fecha = fechaInput.value;
    const motivo = motivoInput.value.trim();

    if (!fecha || !motivo) {
      return alert("Completa todos los campos.");
    }

    const fechaCita = new Date(fecha);
    const ahora = new Date();

    // 🚫 Validar que la cita no esté en el pasado
    if (fechaCita <= ahora) {
      return alert("No puedes agendar una cita en el pasado.");
    }

    // 🚫 Validar que no sea domingo (domingo = 0)
    if (fechaCita.getDay() === 0) {
      return alert("No se pueden agendar citas los domingos.");
    }

    // 🚫 Validar horario entre 8:00 a.m. y 6:00 p.m.
    const hora = fechaCita.getHours();
    if (hora < 8 || hora >= 18) {
      return alert("Las citas deben ser entre las 8:00 a.m. y las 6:00 p.m.");
    }

    try {
      await addDoc(collection(db, "citas"), {
        pacienteId: userGlobal.uid,
        pacienteNombre,
        doctorID: assignedDoctor,
        motivo,
        fechaCita,
        creadaEn: serverTimestamp()
      });

      alert("Cita registrada correctamente.");
      window.location.href = "Paciente.html";
    } catch (error) {
      console.error("Error al guardar cita:", error);
      alert("Error al guardar la cita.");
    }
  });