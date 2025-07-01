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