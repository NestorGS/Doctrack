document.addEventListener("DOMContentLoaded", () => {
  const botonGuardar = document.querySelector(".button");
  const textareas = document.querySelectorAll("textarea");

  function contieneCaracteresNoPermitidos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patrones = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|OR\s+1=1)\b/i;
    return patrones.test(texto);
  }

  botonGuardar.addEventListener("click", (e) => {
    e.preventDefault();
    let errores = [];

    textareas.forEach((area, index) => {
      const valor = area.value.trim();
      const etiqueta = area.parentElement.querySelector("label").textContent;

      if (valor === "") {
        errores.push(`El campo "${etiqueta}" está vacío.`);
      } else {
        if (contieneCaracteresNoPermitidos(valor)) {
          errores.push(`"${etiqueta}" contiene caracteres no permitidos.`);
        }
        if (contieneInyeccionSQL(valor)) {
          errores.push(`"${etiqueta}" contiene posible inyección SQL.`);
        }
      }
    });

    if (errores.length > 0) {
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Todos los datos son válidos. Puedes guardar los cambios.");
      // Aquí podrías usar form.submit() si lo deseas
    }
  });
});
