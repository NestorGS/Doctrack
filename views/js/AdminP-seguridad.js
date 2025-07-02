  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
    const db  = getFirestore(app);

    // Protección y logout
    if (!sessionStorage.getItem("adminUID")) window.location.href = "Admin.html";
    document.getElementById("logoutBtn").onclick = () => {
      sessionStorage.removeItem("adminUID");
      window.location.href = "Admin.html";
    };

    // Carga y renderizado
    async function loadPacientes() {
      const snapUsers = await getDocs(collection(db, "usuarios"));
      const patients = await Promise.all(snapUsers.docs.map(async d=>{
        const p = { id:d.id, ...d.data() };
        // Calcula edad
        let edad = "-";
        if (p.nacimiento) {
          const diff = Date.now() - new Date(p.nacimiento).getTime();
          edad = Math.floor(new Date(diff).getUTCFullYear()-1970);
        }
        // Trae antecedentes
        const docAnc = await getDoc(doc(db, "antecedentes_paciente", d.id));
        const ancData = docAnc.exists() ? docAnc.data() : {};
        const listaAnc = Object.entries(ancData)
                              .filter(([k,v])=> v===true)
                              .map(([k])=> k);
        return {
          ...p,
          edad,
          antecedentes: listaAnc,
          estadoCivil: (p.estadoCivil || "-")
        };
      }));

      // Tabla
      const tbody = document.getElementById("pacientesBody");
      tbody.innerHTML = "";
      patients.forEach(p=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${[p.nombre,p.paterno,p.materno].filter(Boolean).join(" ")}</td>
          <td>${p.correo||"-"}</td>
          <td>${p.curp||"-"}</td>
          <td>${p.nacimiento||"-"}</td>
          <td>${p.edad}</td>
          <td>${p.rol||"-"}</td>
          <td>${p.antecedentes.join(", ")||"-"}</td>
          <td>${p.estadoCivil}</td>
        `;
        tbody.appendChild(tr);
      });

      // Gráfica edades
      const countEdades = patients.reduce((acc,p)=>{
        acc[p.edad] = (acc[p.edad]||0)+1; return acc;
      }, {});
      const labelsE = Object.keys(countEdades).sort((a,b)=>a-b);
      const dataE   = labelsE.map(l=>countEdades[l]);
      new Chart(document.getElementById("graficaEdad"), {
        type: "bar",
        data: {
          labels: labelsE,
          datasets: [{ label:"Pacientes por edad", data:dataE,
            backgroundColor:"#9cd2d3", borderColor:"#114c5f", borderWidth:1 }]
        },
        options:{ scales:{ y:{ beginAtZero:true } } }
      });

      // Gráfica antecedentes
      const countAnc = {};
      patients.forEach(p=>{
        p.antecedentes.forEach(a=>{
          countAnc[a] = (countAnc[a]||0)+1;
        });
      });
      const labelsA = Object.keys(countAnc);
      const dataA   = labelsA.map(l=>countAnc[l]);
      new Chart(document.getElementById("graficaAnc"), {
        type: "bar",
        data: {
          labels: labelsA,
          datasets: [{ label:"Pacientes con antecedente", data:dataA,
            backgroundColor:"#9cd2d3", borderColor:"#114c5f", borderWidth:1 }]
        },
        options:{ scales:{ y:{ beginAtZero:true } } }
      });
    }

    loadPacientes();