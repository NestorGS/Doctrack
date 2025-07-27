   import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import {
      getAuth,
      onAuthStateChanged,
      signOut
    } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
    import {
      getFirestore,
      collection,
      getDocs,
      query,
      where
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
    const pacienteSelect = document.getElementById("pacienteSelect");
    const tablaContenedor = document.getElementById("tablaDatos");

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("Debes iniciar sesión.");
        window.location.href = "index.html";
        return;
      }

      const doctorId = user.uid;
      const q = query(
        collection(db, "usuarios"),
        where("rol", "==", "paciente"),
        where("doctorId", "==", doctorId)
      );

      try {
        const querySnapshot = await getDocs(q);
        pacienteSelect.innerHTML = '<option disabled selected>Selecciona un paciente</option>';
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const option = document.createElement("option");
          option.value = doc.id;
          option.textContent = `${data.nombre} ${data.paterno ?? ""} ${data.materno ?? ""}`;
          pacienteSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Error cargando pacientes:", error);
        alert("No se pudieron cargar los pacientes.");
      }
    });

    pacienteSelect.addEventListener("change", async () => {
      const pacienteId = pacienteSelect.value;
      tablaContenedor.innerHTML = "<p class='loading-message'>Cargando datos...</p>";

      try {
        const datos = [];

        const colecciones = [
          { nombre: "antecedentes_paciente", campo: "pacienteId" },
          { nombre: "exploracion_fisica", campo: "pacienteId" },
          { nombre: "tratamientos", campo: "paciente" },
          { nombre: "notas_subsecuentes", campo: "pacienteId" }
        ];

        for (const { nombre, campo } of colecciones) {
          const q = query(collection(db, nombre), where(campo, "==", pacienteId));
          const snap = await getDocs(q);
          snap.forEach(doc => {
            datos.push({ tipo: nombre.replaceAll("_", " ").toUpperCase(), ...doc.data() });
          });
        }

        renderizarTabla(datos);
      } catch (err) {
        console.error(err);
        tablaContenedor.innerHTML = "<p class='loading-message'>Error al cargar los datos.</p>";
      }
    });
function formatoCampo(campo) {
  return campo
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function esURLArchivo(valor) {
  return typeof valor === "string" && (
    valor.startsWith("http://") || valor.startsWith("https://")
  ) && (
    valor.endsWith(".jpg") || valor.endsWith(".jpeg") || valor.endsWith(".png") ||
    valor.endsWith(".pdf") || valor.endsWith(".doc") || valor.endsWith(".docx")
  );
}

function renderizarTabla(registros) {
  if (registros.length === 0) {
    tablaContenedor.innerHTML = "<p class='loading-message'>No se encontraron datos para este paciente.</p>";
    return;
  }

  // Agrupar registros por tipo
  const registrosPorTipo = {};
  registros.forEach(reg => {
    const tipo = reg.tipo;
    if (!registrosPorTipo[tipo]) registrosPorTipo[tipo] = [];
    registrosPorTipo[tipo].push(reg);
  });

  let html = "";

  for (const tipo in registrosPorTipo) {
    html += `<h2 style="margin: 20px 0 10px; font-size: 20px; color: #0c5167;">${tipo}</h2>`;
    html += `
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>`;

    registrosPorTipo[tipo].forEach(reg => {
      Object.entries(reg).forEach(([k, v]) => {
        if (!["tipo", "pacienteId", "paciente", "doctorId", "creadaEn", "creadaPor"].includes(k)) {

          let valor = v;

          // Mostrar botón si es URL de archivo
         if (typeof valor === "string" && valor.startsWith("http")) {
  if (valor.match(/\.(pdf)$/i)) {
    valor = `<button onclick="window.open('${valor}', '_blank')" style="padding:5px 10px; background:#0c5167; color:white; border:none; border-radius:5px; cursor:pointer;">Ver PDF</button>`;
  } else if (valor.match(/\.(jpg|jpeg|png|webp)$/i)) {
    valor = `<img src="${valor}" alt="Imagen" style="max-width:200px; border-radius:8px;">`;
  } else {
    valor = `<a href="${valor}" target="_blank" style="color:#0c5167;">Ver Archivo</a>`;
  }
}
 else if (typeof valor === "boolean") {
            valor = valor ? "Sí" : "No";
          } else if (typeof valor === "object" && valor !== null) {
            return; // omitir objetos
          }

          html += `
            <tr>
              <td>${formatoCampo(k)}</td>
              <td>${valor}</td>
            </tr>`;
        }
      });
    });

    html += "</tbody></table><div style='height: 40px;'></div>";

  }

  tablaContenedor.innerHTML = html;
}

