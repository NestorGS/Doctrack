import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
    import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...",
      messagingSenderId: "...", appId: "..."
    };
    initializeApp(firebaseConfig);
    const auth = getAuth();
    const db = getFirestore();

    const tabla = document.getElementById("tabla-doctores");
    const ctx = document.getElementById("graficaDoctores").getContext("2d");
    const logoutBtn = document.getElementById("logoutBtn");

    onAuthStateChanged(auth, async user => {
      if(!user) return location.href="index.html";

      // Carga doctores
      const snap = await getDocs(collection(db,"doctores"));
      const labels = [];
      const data   = [];
      tabla.innerHTML = "";

      snap.forEach(docSnap => {
        const d = docSnap.data();
        const pacientes = d.pacientes ? Object.keys(d.pacientes).length : 0;
        // Rellenar tabla
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${d.especialidad}</td>
          <td>${d.nombre} ${d.ap_paterno} ${d.ap_materno}</td>
          <td>${pacientes}</td>
        `;
        tabla.appendChild(tr);

        // Datos para gráfica
        labels.push(`${d.nombre} ${d.ap_paterno}`);
        data.push(pacientes);
      });

      // Crear gráfica
      new Chart(ctx, {
        type: "bar",
        data: { labels, datasets:[{ label:"Pacientes", data, backgroundColor:"#9cd2d3", borderColor:"#114c5f", borderWidth:1 }]},
        options:{ scales:{ y:{ beginAtZero:true } } }
      });
    });

    logoutBtn.addEventListener("click", async()=>{
      await signOut(auth);
      location.href="index.html";
    });