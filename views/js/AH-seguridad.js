import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  // ───── Firebase Config ─────
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
  const btnGuardar = document.getElementById("btnGuardar");

  // ───── Cargar pacientes ─────
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión primero.");
      window.location.href = "index.html";
      return;
    }

    try {
      const q = query(
        collection(db, "usuarios"),
        where("rol", "==", "paciente"),
        where("assignedDoctor", "==", user.uid)
      );

      const snap = await getDocs(q);

      selectPacientes.innerHTML = `<option value="" disabled selected>Pacientes</option>`;

      snap.forEach((docSnap) => {
        const d = docSnap.data();
        const opt = document.createElement("option");
        opt.value = docSnap.id; // ← Este será el ID del paciente
        opt.textContent = `${d.nombre} ${d.paterno} ${d.materno}`;
        selectPacientes.appendChild(opt);
      });
    } catch (e) {
      console.error("Error cargando pacientes:", e);
      alert("No se pudo cargar la lista de pacientes.");
    }
  });

  // ───── Guardar antecedentes ─────
  btnGuardar.addEventListener("click", async () => {
    const pacienteId = selectPacientes.value;
    if (!pacienteId) return alert("Selecciona un paciente.");

    // Obtener valores de los radios
    const valorRadio = (name) =>
      [...document.querySelectorAll(`input[name="${name}"]`)]
        .find(r => r.checked)?.parentElement.textContent?.trim().toLowerCase();

    const diabetes     = valorRadio("diabetes");
    const hipertension = valorRadio("hipertension");
    const cardiopatias = valorRadio("cardiopatias");
    const asma         = valorRadio("asma");
    const otros        = valorRadio("otros");

    const bano     = valorRadio("baño");
    const aseo     = valorRadio("aseo");
    const tabaco   = valorRadio("tabaco");
    const alcohol  = valorRadio("alcohol");

    const descripcion = document.querySelector("textarea")?.value.trim() || "";

    const radiosOK = [diabetes, hipertension, cardiopatias, asma, otros,
                      bano, aseo, tabaco, alcohol].every(v => v === "sí" || v === "no");

    if (!radiosOK) {
      return alert("Responde todas las preguntas (Sí/No).");
    }

    try {
      const ref = doc(db, "antecedentes_paciente", pacienteId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        alert("Este paciente ya tiene antecedentes registrados.");
        return;
      }

      await setDoc(ref, {
        pacienteId, // ← se guarda explícitamente también en el documento
        diabetes        : diabetes === "sí",
        hipertension    : hipertension === "sí",
        cardiopatias    : cardiopatias === "sí",
        asma            : asma === "sí",
        otro            : otros === "sí",
        aseo_fisico     : bano === "sí",
        aseo_bucal      : aseo === "sí",
        tabaquismo      : tabaco === "sí",
        alcoholismo     : alcohol === "sí",
        descripcion     : descripcion || "",
        creadaPor       : auth.currentUser.uid,
        creadaEn        : new Date()
      });

      alert("Antecedentes guardados correctamente ✅");
    } catch (e) {
      console.error("Error al guardar antecedentes:", e);
      alert("No se pudo guardar. Revisa consola.");
    }
  });