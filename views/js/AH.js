document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-container");
  const button = form.querySelector("button");

  const radios = [
    "diabetes",
    "hipertension",
    "cardiopatias",
    "asma",
    "otros",
    "baño",
    "aseo",
    "tabaco",
    "alcohol"
  ];

  const fechaInput = form.querySelector('input[type="date"]');
  const descripcionTextarea = form.querySelector("textarea");

  button.addEventListener("click", (e) => {
    let errores = [];

    radios.forEach((grupo) => {
      const opciones = form.querySelectorAll(`input[name="${grupo}"]`);
      const algunaSeleccionada = Array.from(opciones).some(op => op.checked);
      if (!algunaSeleccionada) {
        errores.push(`Debes seleccionar una opción para "${grupo}".`);
      }
    });

    if (fechaInput.value.trim() === "") {
      errores.push("La fecha de registro es obligatoria.");
    }

    if (descripcionTextarea.value.trim().length < 10) {
      errores.push("La descripción general debe tener al menos 10 caracteres.");
    }

    if (errores.length > 0) {
      e.preventDefault(); // Detiene el comportamiento del botón
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    }
  });
});
