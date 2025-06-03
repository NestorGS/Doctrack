document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("button");
  const inputs = document.querySelectorAll('input[type="text"]');
  const textarea = document.querySelector("textarea");

  button.addEventListener("click", (e) => {
    let errores = [];

    const peso = inputs[0].value.trim();
    const estatura = inputs[1].value.trim();
    const presion = inputs[2].value.trim();
    const frecCard = inputs[3].value.trim();
    const frecResp = inputs[4].value.trim();
    const observaciones = textarea.value.trim();

    // Validar campos vacíos
    if (!peso || !estatura || !presion || !frecCard || !frecResp || !observaciones) {
      errores.push("Todos los campos deben estar llenos.");
    }

    // Validar peso y estatura como números positivos
    if (peso && (isNaN(peso) || Number(peso) <= 0)) {
      errores.push("El peso debe ser un número positivo.");
    }

    if (estatura && (isNaN(estatura) || Number(estatura) <= 0)) {
      errores.push("La estatura debe ser un número positivo.");
    }

    // Validar formato de presión arterial
    if (presion && !/^\d{2,3}\/\d{2,3}$/.test(presion)) {
      errores.push("La presión arterial debe tener el formato 120/80.");
    }

    if (errores.length > 0) {
      e.preventDefault();
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Datos validados correctamente. Guardando...");
      // Aquí puedes continuar con el guardado real (envío de formulario o almacenamiento)
    }
  });
});
