document.addEventListener("DOMContentLoaded", () => {
    const functions = require("firebase-functions");
    const admin = require("firebase-admin");
    admin.initializeApp();
    const db = admin.firestore();

    exports.assignDoctorRoundRobin = functions.firestore
    .document("usuarios/{uid}")
    .onCreate(async (snap, context) => {
        const data = snap.data();
        if (data.rol !== "paciente") return null;

        return db.runTransaction(async (t) => {
        // 1. Obtener todos los doctores ordenados por cédula
        const doctorsSnap = await t.get(
            db.collection("doctores").orderBy("cedula")
        );
        const numDoctors = doctorsSnap.size;
        if (numDoctors === 0) throw new Error("No hay doctores disponibles.");

        // 2. Obtener índice de la última asignación
        const cfgRef = db.doc("config/roundRobin");
        const cfgSnap = await t.get(cfgRef);
        const last = cfgSnap.exists ? cfgSnap.data().lastIndex : -1;

        // 3. Calcular siguiente índice
        const next = (last + 1) % numDoctors;
        const chosenDoctorId = doctorsSnap.docs[next].id;

        // 4. Asignar el doctor al paciente
        t.update(snap.ref, { doctorId: chosenDoctorId });

        // 5. Actualizar el puntero del round-robin
        t.set(cfgRef, { lastIndex: next }, { merge: true });

        // 6. (Opcional) crear entrada en subcolección
        t.set(
            db.doc(`doctores/${chosenDoctorId}/pacientes/${snap.id}`),
            { linkedAt: admin.firestore.FieldValue.serverTimestamp() }
        );
        });
    });

    const form = document.querySelector("form");
    const inputs = form.querySelectorAll("input[type='text'], input[type='password'], input[type='date']");
    const [nombre, paterno, materno, curp, nacimiento, pass, confirmPass] = inputs;

    function contieneCaracteresProhibidos(texto) {
        const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
        return regex.test(texto);
    }

    function contieneInyeccionSQL(texto) {
        const patrones = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|OR\s+1=1)\b/i;
        return patrones.test(texto);
    }

    form.addEventListener("submit", (e) => {
        for (let input of inputs) {
            const valor = input.value.trim();

            if (!valor) {
                alert(` El campo "${input.placeholder}" es obligatorio.`);
                e.preventDefault();
                return;
            }

            if (contieneCaracteresProhibidos(valor)) {
                alert(` El campo "${input.placeholder}" contiene caracteres no permitidos.`);
                e.preventDefault();
                return;
            }

            if (contieneInyeccionSQL(valor)) {
                alert(` Posible inyección SQL en "${input.placeholder}".`);
                e.preventDefault();
                return;
            }
        }

        if (pass.value !== confirmPass.value) {
            alert(" Las contraseñas no coinciden.");
            e.preventDefault();
            return;
        }

        // Si todo está correcto
        console.log("Formulario válido. Enviando...");
    });
});
