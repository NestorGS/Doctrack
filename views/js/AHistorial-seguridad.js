import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getAuth,
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    doc,
    getDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

   const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión primero.");
      return (window.location.href = "index.html");
    }

    const uid = user.uid;
    const docRef = doc(db, "usuarios", uid);
    const userDoc = await getDoc(docRef);

    if (!userDoc.exists()) {
      alert("Usuario no registrado.");
      return (window.location.href = "index.html");
    }

    const rol = userDoc.data().rol;
    const pagina = window.location.pathname;

    if (rol === "paciente" && !pagina.includes("Paciente.html")) {
      return (window.location.href = "Paciente.html");
    }

    if (rol === "doctor" && !pagina.includes("Doctor.html")) {
      return (window.location.href = "Doctor.html");
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }