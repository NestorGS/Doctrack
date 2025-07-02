import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getAuth,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    query,
    where,
    getDocs
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  // Configuración Firebase
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
  let doctorID = null;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión primero.");
      window.location.href = "index.html";
      return;
    }

    const docSnap = await getDoc(doc(db, "doctores", user.uid));
    if (!docSnap.exists()) {
      alert("No tienes permisos para registrar tratamientos.");
      window.location.href = "index.html";
      return;
    }

    doctorID = user.uid;

    try {
      const q = query(
        collection(db, "usuarios"),
        where("rol", "==", "paciente"),
        where("assignedDoctor", "==", doctorID)
      );

      const snap = await getDocs(q);

      // Limpiar el contenido previo y agregar un placeholder válido
      selectPacientes.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Selecciona un paciente";
      placeholder.disabled = true;
      placeholder.selected = true;
      selectPacientes.appendChild(placeholder);

      if (snap.empty) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.textContent = "Sin pacientes asignados";
        selectPacientes.appendChild(opt);
      } else {
        snap.forEach((pac) => {
          const p = pac.data();
          const opt = document.createElement("option");
          opt.value = pac.id; // Guardar UID del paciente
          opt.textContent = `${p.nombre} ${p.paterno} ${p.materno}`;
          selectPacientes.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
      alert("Error al cargar pacientes");
    }
  });

  // Guardar tratamiento
  document.getElementById("btnGuardar").addEventListener("click", async (e) => {
    e.preventDefault();

    const tratamiento = {
      medicamento: document.getElementById("medicamento").value.trim(),
      paciente: document.getElementById("selectPacientes").value, // aquí está el paciente seleccionado
      forma: document.getElementById("forma").value,
      dosis: document.getElementById("dosis").value.trim(),
      via: document.getElementById("via").value,
      frecuencia: document.getElementById("frecuencia").value.trim(),
      concentracion: document.getElementById("concentracion").value.trim(),
      dias: document.getElementById("dias").value.trim(),
      creado: new Date()
    };

    for (let key in tratamiento) {
      if (!tratamiento[key]) {
        return alert(`Falta llenar el campo: ${key}`);
      }
    }

    try {
      await addDoc(collection(db, "tratamientos"), tratamiento);
      alert("Tratamiento registrado correctamente.");
      window.location.href = "Tratamiento.html";
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al registrar el tratamiento.");
    }
  });