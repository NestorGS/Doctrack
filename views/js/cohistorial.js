document.addEventListener("DOMContentLoaded", () => {
  const guardarBtn = document.querySelectorAll(".button")[1];
  const inputs = document.querySelectorAll('input[type="text"]');

  guardarBtn.addEventListener("click", (e) => {
    let errores = [];

    inputs.forEach(input => {
      const valor = input.value.trim();
      const nombreCampo = input.name;

      if (valor === "") {
        errores.push(`El campo "${nombreCampo}" está vacío.`);
        return;
      }

      // Validaciones específicas por campo
      switch (nombreCampo) {
        case "edad":
          if (!/^\d+$/.test(valor) || Number(valor) <= 0) {
            errores.push("La edad debe ser un número entero positivo.");
          }
          break;

        case "temperatura":
          if (isNaN(valor) || Number(valor) < 30 || Number(valor) > 45) {
            errores.push("La temperatura debe estar entre 30 y 45 °C.");
          }
          break;

        case "peso":
        case "talla":
          if (isNaN(valor) || Number(valor) <= 0) {
            errores.push(`El campo "${nombreCampo}" debe ser un número positivo.`);
          }
          break;

        case "tension_arterial":
          if (!/^\d{2,3}\/\d{2,3}$/.test(valor)) {
            errores.push("La tensión arterial debe tener el formato 120/80.");
          }
          break;

        case "frecuencia_cardiaca":
        case "frecuencia_respiratoria":
          if (!/^\d+$/.test(valor) || Number(valor) <= 0) {
            errores.push(`La "${nombreCampo.replace("_", " ")}" debe ser un número entero positivo.`);
          }
          break;

        case "fecha_registro":
          if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            errores.push("La fecha debe tener el formato yyyy-mm-dd.");
          }
          break;

        default:
          // Para otros campos de texto, solo validar que no esté vacío (ya se hizo)
          break;
      }
    });

    if (errores.length > 0) {
      e.preventDefault();
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Todos los datos fueron validados correctamente.");
      // Aquí podrías enviar o guardar los datos
    }
  });
});
