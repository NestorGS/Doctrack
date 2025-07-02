 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getFirestore, collection, getDocs }
      from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

    // Configuración de Firebase
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

    // Protege la página
    if (!sessionStorage.getItem('adminUID')) {
      window.location.href = 'Admin.html';
    }

    async function loadData() {
      // Traigo todas las colecciones necesarias
      const [docsSnap, citasSnap, trSnap, usersSnap] = await Promise.all([
        getDocs(collection(db,'doctores')),
        getDocs(collection(db,'citas')),
        getDocs(collection(db,'tratamientos')),
        getDocs(collection(db,'usuarios'))
      ]);

      // Mapas de datos
      const doctors      = docsSnap.docs.map(d=>({ id:d.id, ...d.data() }));
      const citas        = citasSnap.docs.map(d=>d.data());
      const tratamientos = trSnap.docs.map(d=>d.data());
      const usuarios     = usersSnap.docs.map(d=>({ id:d.id, ...d.data() }));
      const userMap = {};
      usuarios.forEach(u=>{
        userMap[u.id] = [u.nombre,u.paterno,u.materno].filter(Boolean).join(' ');
      });

      // 1) Pacientes por doctor
      const pacientesData = doctors.map(d=>({
        nombre: `${d.nombre} ${d.ap_paterno||''}`.trim(),
        cnt: Object.keys(d.pacientes||{}).length
      }));
      fillTable('tablaPacientes', pacientesData);
      drawBar('chartPacientes', pacientesData, 'nombre','cnt','Pacientes');

      // 2) Citas por doctor
      const citasData = doctors.map(d=>({
        nombre: `${d.nombre} ${d.ap_paterno||''}`.trim(),
        cnt: citas.filter(c=>c.doctorID===d.id).length
      }));
      fillTable('tablaCitas', citasData);
      drawBar('chartCitas', citasData, 'nombre','cnt','Citas');

      // 3) Tratamientos: tabla y gráfica con nombres
      const tablaT = document.getElementById('tablaTratamientos');
      tablaT.innerHTML = tratamientos.map(t=>{
        const pacienteNombre = userMap[t.paciente]||'-';
        return `
          <tr>
            <td>${pacienteNombre}</td>
            <td>${t.medicamento||'-'}</td>
            <td>${t.forma||'-'}</td>
            <td>${t.dosis||'-'}</td>
            <td>${t.via||'-'}</td>
            <td>${t.frecuencia||'-'}</td>
            <td>${t.concentracion||'-'}</td>
            <td>${t.dias||'-'}</td>
          </tr>
        `;
      }).join('');

      // Gráfica de barras tratamientos por paciente
      const dist = {};
      tratamientos.forEach(t=>{
        const name = userMap[t.paciente]||'Desconocido';
        dist[name] = (dist[name]||0) + 1;
      });
      const labels = Object.keys(dist);
      const values = labels.map(l=>dist[l]);
      drawBarGeneric('chartTratamientosBar', labels, values, 'Tratamientos');
    }

    function fillTable(id, arr){
      document.getElementById(id).innerHTML = arr.map(i=>
        `<tr><td>${i.nombre}</td><td>${i.cnt}</td></tr>`
      ).join('');
    }

    function drawBar(cid, data, labelKey, valKey, label){
      const ctx = document.getElementById(cid).getContext('2d');
      new Chart(ctx,{
        type:'bar',
        data:{
          labels: data.map(i=>i[labelKey]),
          datasets:[{
            label,
            data:  data.map(i=>i[valKey]),
            backgroundColor:'rgba(156,210,211,0.7)',
            borderColor:'#114c5f',
            borderWidth:1
          }]
        },
        options:{
          responsive:true,
          plugins:{
            title:{ display:true, text:label },
            tooltip:{ callbacks:{ label:ctx=>`${ctx.parsed.y} ${label.toLowerCase()}` }}
          },
          scales:{
            x:{ title:{ display:true, text:'Doctor' }, ticks:{ autoSkip:false } },
            y:{ title:{ display:true, text:label }, beginAtZero:true }
          }
        }
      });
    }

    function drawBarGeneric(cid, labels, values, label){
      const ctx = document.getElementById(cid).getContext('2d');
      new Chart(ctx,{
        type:'bar',
        data:{
          labels,
          datasets:[{
            label,
            data: values,
            backgroundColor:'rgba(156,210,211,0.7)',
            borderColor:'#114c5f',
            borderWidth:1
          }]
        },
        options:{
          responsive:true,
          plugins:{
            title:{ display:true, text:`${label} por Paciente` },
            tooltip:{ callbacks:{ label:ctx=>`${ctx.parsed.y} ${label.toLowerCase()}` }}
          },
          scales:{
            x:{ title:{ display:true, text:'Paciente' }, ticks:{ autoSkip:false } },
            y:{ title:{ display:true, text:label }, beginAtZero:true }
          }
        }
      });
    }

    loadData();