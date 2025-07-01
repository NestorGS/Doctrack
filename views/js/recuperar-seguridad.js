import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import {
      getAuth,
      sendPasswordResetEmail
    } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

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

    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();

      if (!email) return alert("Ingresa tu correo.");

      try {
        await sendPasswordResetEmail(auth, email);
        alert("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
      } catch (error) {
        alert("Error al enviar el correo: " + error.message);
      }
    });