document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const selectDoctor = form.querySelectorAll("select")[0];
  const selectCampo = form.querySelectorAll("select")[1];
  const nuevoDato = form.querySelector('input[type="text"]');

  form.addEventListener("submit", (e) => {
    let errores = [];

    if (selectDoctor.value.trim() === "") {
      errores.push("Debe seleccionar el nombre del doctor.");
    }

    if (selectCampo.value.trim() === "") {
      errores.push("Debe seleccionar el campo que desea modificar.");
    }

    if (nuevoDato.value.trim() === "") {
      errores.push("Debe ingresar el nuevo dato.");
    }

    if (errores.length > 0) {
      e.preventDefault(); // Detiene el envío
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Datos validados correctamente. Procediendo a modificar...");
      // Aquí puedes agregar lógica adicional para envío
    }
  });
});
