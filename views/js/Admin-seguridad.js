
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import { getFirestore, query, where, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

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
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const userEmail = document.getElementById("usuario").value.trim();
    const userPassword = document.getElementById("password").value;

    try {
      // Iniciar sesión
      const { user } = await signInWithEmailAndPassword(auth, userEmail, userPassword);

      // Verificar si el correo está verificado
      if (!user.emailVerified) {
        // Si no está verificado, enviamos el correo de verificación
        sendVerificationEmail(user);  // Enviar correo de validación
        return;
      }

      // Si el correo ya está verificado
      alert("¡Bienvenido Administrador!");
      sessionStorage.setItem("adminUID", user.uid);
      window.location.href = "AdminP.html";  // Redirigir al panel de administración

    } catch (err) {
      console.error("Error al leer Firestore:", err);
      alert("Error de conexión:\n" + err.message);
    }
  });

  // Función para enviar el correo de verificación
  async function sendVerificationEmail(user) {
    try {
      await sendEmailVerification(user);  // Envía el correo de verificación
      console.log("Correo de verificación enviado!");
      alert("Se ha enviado un correo de validación. Revisa tu bandeja de entrada.");
    } catch (error) {
      console.error("Error al enviar el correo de verificación:", error);
      alert("Hubo un error al enviar el correo de verificación. Intenta nuevamente.");
    }
  }
