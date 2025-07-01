document.addEventListener("DOMContentLoaded", () => {

  
  const loginForm = document.querySelector(".sign-in");
 const emailInput = document.getElementById("email");
 const passwordInput = document.getElementById("password");
  const loginButton = loginForm.querySelector(".button");

  function contieneCaracteresPeligrosos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patronesSQL = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|TRUNCATE|ALTER|--|#|\/\*|\*\/|OR\s+1=1)\b/i;
    return patronesSQL.test(texto);
  }

  function esCorreoValido(correo) {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(correo);
  }

  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    const correo = emailInput.value.trim();
    const contrasena = passwordInput.value.trim();
    let errores = [];

    if (correo === "" || contrasena === "") {
      errores.push("Todos los campos son obligatorios.");
    }

    if (!esCorreoValido(correo)) {
      errores.push("El formato del correo electrónico es inválido.");
    }

    if (contieneCaracteresPeligrosos(correo) || contieneCaracteresPeligrosos(contrasena)) {
      errores.push("Los campos contienen caracteres no permitidos.");
    }

    if (contieneInyeccionSQL(correo) || contieneInyeccionSQL(contrasena)) {
      errores.push("Se detectó un posible intento de inyección SQL.");
    }

    if (errores.length > 0) {
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Datos validados correctamente. Procediendo al inicio de sesión.");
      // Aquí se puede enviar el formulario con form.submit() si se habilita
      // loginForm.submit();
    }
  });
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    doc,
    getDoc
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

  document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const loginButton = document.querySelector(".sign-in .button");
    const resendButton = document.querySelector("#reenviarVerificacion");

    loginButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) return alert("Llena todos los campos");

      try {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        const user = credentials.user;

        if (!user.emailVerified) {
          alert("Debes verificar tu correo antes de iniciar sesión.");
          resendButton.style.display = "inline-block";
          await signOut(auth);
          return;
        }

        const uid = user.uid;
        const usuarioSnap = await getDoc(doc(db, "usuarios", uid));
        const doctorSnap = await getDoc(doc(db, "doctores", uid));

        if (usuarioSnap.exists()) {
          window.location.href = "Paciente.html";
        } else if (doctorSnap.exists()) {
          window.location.href = "Doctor.html";
        } else {
          alert("Usuario no registrado");
          await signOut(auth);
        }

      } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
      }
    });

    resendButton.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        try {
          await sendEmailVerification(user);
          alert("Correo de verificación reenviado. Revisa tu bandeja de entrada.");
        } catch (err) {
          alert("Error al reenviar el correo: " + err.message);
        }
      }
    });

    // Validación de sesión activa
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const usuarioSnap = await getDoc(doc(db, "usuarios", user.uid));
          const doctorSnap = await getDoc(doc(db, "doctores", user.uid));

          if (!usuarioSnap.exists() && !doctorSnap.exists()) {
            alert("Usuario no registrado");
            await signOut(auth);
          }
        } catch (err) {
          console.error("Error comprobando sesión:", err);
          await signOut(auth);
        }
      }
    });
  });