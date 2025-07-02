import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    doc,
    setDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
    authDomain: "doctrack-46fc2.firebaseapp.com",
    projectId: "doctrack-46fc2",
    storageBucket: "doctrack-46fc2.firebasestorage.app",
    messagingSenderId: "865552814891",
    appId: "1:865552814891:web:cf8e79d5ffd847067bab6e",
    measurementId: "G-XQPNKXK08Y"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  document.getElementById("registrarBtn")?.addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const paterno = document.getElementById("paterno").value.trim();
    const materno = document.getElementById("materno").value.trim();
    const cedula = document.getElementById("cedula").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const especialidad = document.getElementById("especialidad").value;
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;

    // Validación de campos
    if (!nombre || !paterno || !materno || !cedula || !correo || especialidad === "ninguna" || !password || !confirmar) {
      return alert("Todos los campos son obligatorios.");
    }

    // Validación de coincidencia de contraseñas
    if (password !== confirmar) {
      return alert("Las contraseñas no coinciden.");
    }

    // Validación de seguridad de la contraseña
    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      return alert("La contraseña debe tener al menos 8 caracteres y contener letras y números.");
    }

    try {
      // Crear usuario en Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, correo, password);

      // Guardar los datos del doctor (sin contraseña)
      await setDoc(doc(db, "doctores", cred.user.uid), {
        nombre,
        ap_paterno: paterno,
        ap_materno: materno,
        cedula,
        correo,
        especialidad,
        rol: "doctor"
      });

      // Enviar verificación de correo
      await sendEmailVerification(cred.user);
      alert("Registro exitoso. Revisa tu correo para verificar tu cuenta.");

      // Redirigir al login
      window.location.href = "index.html";

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("El correo ya está registrado.");
      } else if (error.code === "auth/weak-password") {
        alert("La contraseña es demasiado débil.");
      } else {
        alert("Error al registrar: " + error.message);
      }
    }
  });