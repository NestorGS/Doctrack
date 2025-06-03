document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const fechaInput = form.querySelector('input[type="datetime-local"]');
  const motivoTextarea = form.querySelector("textarea");

  form.addEventListener("submit", (e) => {
    let errores = [];

    if (fechaInput.value.trim() === "") {
      errores.push("El campo de fecha y hora es obligatorio.");
    }

    if (motivoTextarea.value.trim().length < 10) {
      errores.push("El motivo de la cita debe tener al menos 10 caracteres.");
    }

    if (errores.length > 0) {
      e.preventDefault(); // Evita el envío del formulario
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    }
  });
});
