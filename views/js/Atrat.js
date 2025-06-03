document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const inputsTexto = form.querySelectorAll('input[type="text"]');
  const selects = form.querySelectorAll("select");

  form.addEventListener("submit", (e) => {
    let errores = [];

    // Validar campos de texto
    inputsTexto.forEach((input, index) => {
      if (input.value.trim() === "") {
        errores.push(`El campo ${index + 1} está vacío.`);
      }
    });

    // Validar selects
    selects.forEach((select, i) => {
      if (select.selectedIndex === 0) {
        errores.push(`Debe seleccionar una opción válida en el campo ${i === 0 ? 'Forma farmacéutica' : 'Vía de administración'}.`);
      }
    });

    if (errores.length > 0) {
      e.preventDefault(); // Evita envío del formulario
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    }
  });
});
