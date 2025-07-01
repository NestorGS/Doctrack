import { initializeApp, getApps, initializeApp as initApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import {
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      sendEmailVerification,
      signOut
    } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
    import {
      getFirestore,
      doc,
      setDoc,
      updateDoc
    } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
      authDomain: "doctrack-46fc2.firebaseapp.com",
      projectId: "doctrack-46fc2",
      storageBucket: "doctrack-46fc2.firebaseapp.com",
      messagingSenderId: "865552814891",
      appId: "1:865552814891:web:cf8e79d5ffd847067bab6e"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    document.getElementById("registrarBtn")?.addEventListener("click", async () => {
      const nombre = document.getElementById("nombre").value.trim();
      const paterno = document.getElementById("paterno").value.trim();
      const materno = document.getElementById("materno").value.trim();
      const curp = document.getElementById("curp").value.trim();
      const nacimiento = document.getElementById("nacimiento").value;
      const correo = document.getElementById("correo").value.trim();
      const password = document.getElementById("password").value;
      const confirmar = document.getElementById("confirmar").value;

      if (!nombre || !paterno || !materno || !correo || !password || !confirmar || !curp || !nacimiento) {
        return alert("Todos los campos son obligatorios.");
      }

      if (password !== confirmar) {
        return alert("Las contraseñas no coinciden.");
      }

      if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        return alert("La contraseña debe tener al menos 8 caracteres, incluir letras y números.");
      }

      try {
        const cred = await createUserWithEmailAndPassword(auth, correo, password);
        const uid = cred.user.uid;

        await setDoc(doc(db, "usuarios", uid), {
          nombre,
          paterno,
          materno,
          correo,
          curp,
          nacimiento,
          rol: "paciente"
        });

        await sendEmailVerification(cred.user);
        localStorage.setItem("correoPendiente", correo);
        localStorage.setItem("claveTemporal", password);

        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "0";
        popup.style.left = "0";
        popup.style.width = "100%";
        popup.style.height = "100%";
        popup.style.background = "rgba(0,0,0,0.8)";
        popup.style.display = "flex";
        popup.style.flexDirection = "column";
        popup.style.justifyContent = "center";
        popup.style.alignItems = "center";
        popup.style.zIndex = "9999";

        const msg = document.createElement("div");
        msg.style.background = "#fff";
        msg.style.padding = "30px";
        msg.style.borderRadius = "10px";
        msg.style.textAlign = "center";
        msg.style.maxWidth = "400px";
        msg.innerHTML = `
          <h2>Verifica tu correo electrónico</h2>
          <p>Hemos enviado un enlace de verificación a <strong>${correo}</strong>.</p>
          <p>Una vez confirmado, podrás iniciar sesión en DocTrack.</p>
          <button id="btnReenviarCorreo" style="margin-top: 20px; padding: 10px 20px; background: #114c5f; color: white; border: none; border-radius: 8px; cursor: pointer;">📩 Reenviar correo</button>
        `;

        popup.appendChild(msg);
        document.body.appendChild(popup);

        document.getElementById("btnReenviarCorreo").addEventListener("click", async () => {
          const email = localStorage.getItem("correoPendiente");
          const clave = localStorage.getItem("claveTemporal");

          if (!email || !clave) return alert("No se pudo reenviar: datos incompletos.");

          try {
            const credTemp = await signInWithEmailAndPassword(auth, email, clave);
            await sendEmailVerification(credTemp.user);
            await signOut(auth);
            alert("📩 Correo reenviado. Revisa tu bandeja de entrada.");
          } catch (err) {
            alert("❌ No se pudo reenviar: " + err.message);
          }
        });

      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          alert("El correo ya está registrado.");
        } else if (error.code === "auth/weak-password") {
          alert("La contraseña es débil.");
        } else {
          alert("Error al registrar: " + error.message);
        }
      }
    });