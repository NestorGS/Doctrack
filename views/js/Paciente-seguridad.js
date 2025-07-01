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
    getDocs
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

  const tratamientoField = document.getElementById("tratamientoField");
  const horaField = document.getElementById("horaField");
  const proximaField = document.getElementById("proximaField");

  // Verifica si el usuario está autenticado
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión como paciente.");
      window.location.href = "index.html";
      return;
    }

    const pacienteId = user.uid;

    try {
      // ───── Buscar la próxima cita ─────
      const citasRef = collection(db, "citas");
      const qCitas = query(citasRef, where("pacienteId", "==", pacienteId));
      const snapshotCitas = await getDocs(qCitas);

      if (!snapshotCitas.empty) {
        let citaProxima = null;

        snapshotCitas.forEach(doc => {
          const data = doc.data();
          if (data.fechaCita.toDate() > new Date()) {
            if (!citaProxima || data.fechaCita.toDate() < citaProxima.fechaCita.toDate()) {
              citaProxima = data;
            }
          }
        });

        if (citaProxima) {
          proximaField.value = citaProxima.fechaCita.toDate().toLocaleString("es-MX");
        } else {
          proximaField.value = "Sin próximas citas";
        }
      } else {
        proximaField.value = "Sin citas";
      }

      // ───── Buscar el tratamiento ─────
      const tratRef = collection(db, "tratamientos");
      const qTrat = query(tratRef, where("paciente", "==", pacienteId));
      const snapshotTrat = await getDocs(qTrat);

      if (!snapshotTrat.empty) {
        const data = snapshotTrat.docs[0].data();
        tratamientoField.value = data.medicamento || "Sin datos";
        horaField.value = data.frecuencia || "Sin datos";
      } else {
        tratamientoField.value = "Sin datos";
        horaField.value = "Sin datos";
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Hubo un error al obtener tus datos.");
    }
  });

  // Cerrar sesión
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "index.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error al cerrar sesión: " + error.message);
      }
    });
  }