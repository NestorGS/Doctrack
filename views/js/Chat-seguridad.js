 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    collection,
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

  const inputNota = document.getElementById("tratamientoField");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión como paciente.");
      window.location.href = "index.html";
      return;
    }

    const pacienteId = user.uid;

    try {
      const notasRef = collection(db, "notas", pacienteId, "notas_personales");
      const notasSnap = await getDocs(notasRef);

      if (notasSnap.empty) {
        inputNota.value = "No hay notas disponibles.";
      } else {
        let ultNota = "";
        notasSnap.forEach((doc) => {
          const data = doc.data();
          if (data.contenido) {
            ultNota = data.contenido; // mostrar la última nota que encuentre
          }
        });
        inputNota.value = ultNota;
      }
    } catch (error) {
      console.error("Error al obtener las notas:", error);
      inputNota.value = "Error al cargar la nota.";
    }
  });