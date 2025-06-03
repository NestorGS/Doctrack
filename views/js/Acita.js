document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const nombreInput = document.querySelector('input[type="text"]');
  const medicoSelect = document.querySelector("select");
  const fechaInput = document.querySelector('input[type="date"]');
  const motivoTextarea = document.querySelector("textarea");

  form.addEventListener("submit", (e) => {
    let errores = [];

    // Validar nombre
    if (nombreInput.value.trim() === "") {
      errores.push("El nombre del paciente es obligatorio.");
    }

    // Validar médico
    if (medicoSelect.value === "") {
      errores.push("Debe seleccionar un médico.");
    }

    // Validar fecha
    if (fechaInput.value === "") {
      errores.push("Debe seleccionar una fecha.");
    } else {
      const hoy = new Date();
      const fechaSeleccionada = new Date(fechaInput.value);
      if (fechaSeleccionada < hoy.setHours(0, 0, 0, 0)) {
        errores.push("La fecha debe ser igual o posterior a hoy.");
      }
    }

    // Validar motivo
    if (motivoTextarea.value.trim().length < 10) {
      errores.push("El motivo debe tener al menos 10 caracteres.");
    }

    // Mostrar errores si hay
    if (errores.length > 0) {
      e.preventDefault(); // Evita que se envíe el formulario
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    }
  });
});
