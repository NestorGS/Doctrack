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
    addDoc,
    serverTimestamp
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  /* ───── CONFIG FIREBASE ───── */
  const firebaseConfig = {
    apiKey:            "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
    authDomain:        "doctrack-46fc2.firebaseapp.com",
    projectId:         "doctrack-46fc2",
    storageBucket:     "doctrack-46fc2.appspot.com",
    messagingSenderId: "865552814891",
    appId:             "1:865552814891:web:cf8e79d5ffd847067bab6e",
    measurementId:     "G-XQPNKXK08Y"
  };

  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  const selectPacientes = document.getElementById("selectPacientes");
  const notaInput = document.querySelector('input[placeholder="Agregar una nota para el paciente"]');
  const botonEnviar = document.getElementById("btnEnviarNota");

  let doctorId = "";

  /* ───── AUTENTICACIÓN Y CARGA DE PACIENTES ───── */
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión primero.");
      window.location.href = "index.html";
      return;
    }

    doctorId = user.uid;

    try {
      const q = query(
        collection(db, "usuarios"),
        where("rol", "==", "paciente"),
        where("assignedDoctor", "==", doctorId)
      );
      const snap = await getDocs(q);

      selectPacientes.innerHTML =
        `<option value="" disabled selected>Pacientes</option>`;

      if (snap.empty) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = "Sin pacientes asignados";
        selectPacientes.appendChild(opt);
      } else {
        snap.forEach((p) => {
          const d   = p.data();
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = `${d.nombre} ${d.paterno} ${d.materno}`;
          selectPacientes.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
      alert("Ocurrió un error al cargar la lista de pacientes.");
    }
  });

  /* ───── BOTÓN ENVIAR NOTA ───── */
  botonEnviar.addEventListener("click", async () => {
    const pacienteId = selectPacientes.value;
    const contenido = notaInput.value.trim();

    if (!pacienteId || !contenido) {
      alert("Selecciona un paciente y escribe una nota.");
      return;
    }

    try {
      // ⬇️ Aquí está la corrección: guardamos en la subcolección del paciente
      const notaRef = collection(db, "notas", pacienteId, "notas_personales");
await addDoc(notaRef, {
  pacienteId,
  doctorId,
  contenido,
  fecha: serverTimestamp()
});

     alert("✅ Nota guardada correctamente.");
notaInput.value = "";
selectPacientes.selectedIndex = 0;

// ⬇️ Redirigir después de guardar
window.location.href = "Doctor.html";

    } catch (error) {
      console.error("Error al guardar la nota:", error);
      alert(" Ocurrió un error al guardar la nota.");
    }
  });

  /* ───── BOTÓN LOGOUT (si existe) ───── */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }