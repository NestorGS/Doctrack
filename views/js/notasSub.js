// validarNotaSub.js

// Espera a que cargue el DOM
window.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".button");

  button.addEventListener("click", (e) => {
    const campos = [
      { selector: "textarea", nombre: "Campo vacío" }
    ];

    const validaciones = {
      "Médico Responsable": val => val.length >= 5,
      "Nombre, Cédula": val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+,\s*\d{5,}$/.test(val),
      "Servicio o Especialidad": val => val.length >= 3,
      "Temperatura (°C)": val => /^\d{2}(\.\d)?$/.test(val),
      "Frecuencia Cardíaca (/min)": val => /^\d{2,3}$/.test(val),
      "Frecuencia Respiratoria (/min)": val => /^\d{2,3}$/.test(val),
      "Talla (m)": val => /^\d(\.\d{1,2})?$/.test(val),
      "Peso (kg)": val => /^\d{2,3}(\.\d)?$/.test(val),
      "Tensión Arterial (Sistólica/Diastólica)": val => /^\d{2,3}\/\d{2,3}$/.test(val),
      "Nombre": val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/.test(val),
      "Edad": val => /^\d{1,3}$/.test(val),
      "CURP": val => /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(val),
      "Sexo": val => /^(Masculino|Femenino|Otro)$/i.test(val),
      "Notas e Indicaciones": val => val.length >= 10,
    };

    const etiquetas = document.querySelectorAll(".field label");
    const areas = document.querySelectorAll(".field textarea");

    for (let i = 0; i < areas.length; i++) {
      const campo = areas[i];
      const etiqueta = etiquetas[i].innerText.replace(":", "");
      const valor = campo.value.trim();

      if (valor === "") {
        alert(`❌ El campo "${etiqueta}" está vacío.`);
        campo.focus();
        e.preventDefault();
        return;
      }

      if (/[<>{};()"'`]/.test(valor)) {
        alert(`❌ El campo "${etiqueta}" contiene caracteres no permitidos.`);
        campo.focus();
        e.preventDefault();
        return;
      }

      if (/\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|OR\s+1=1)\b/i.test(valor)) {
        alert(`❌ El campo "${etiqueta}" contiene posible inyección SQL.`);
        campo.focus();
        e.preventDefault();
        return;
      }

      if (validaciones[etiqueta] && !validaciones[etiqueta](valor)) {
        alert(`❌ El campo "${etiqueta}" no cumple con el formato requerido.`);
        campo.focus();
        e.preventDefault();
        return;
      }
    }

    alert("✅ Formulario válido. Puedes continuar.");
  });
});