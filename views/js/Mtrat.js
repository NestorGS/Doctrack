document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputDatoNuevo = form.querySelector("input[type='text']");
  const selects = form.querySelectorAll("select");
  const boton = form.querySelector("button");

  function contieneCaracteresProhibidos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patronesSQL = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|OR\s+1=1)\b/i;
    return patronesSQL.test(texto);
  }

  boton.addEventListener("click", (e) => {
    e.preventDefault();
    let errores = [];

    if (selects[0].value.trim() === "") {
      errores.push("Selecciona un nombre válido.");
    }

    if (selects[1].value.trim() === "") {
      errores.push("Selecciona el campo que deseas editar.");
    }

    const valor = inputDatoNuevo.value.trim();
    if (valor === "") {
      errores.push("El campo 'Dato nuevo' no puede estar vacío.");
    } else {
      if (contieneCaracteresProhibidos(valor)) {
        errores.push("El campo 'Dato nuevo' contiene caracteres no permitidos.");
      }
      if (contieneInyeccionSQL(valor)) {
        errores.push("El campo 'Dato nuevo' contiene patrones inseguros (posible inyección SQL).");
      }
    }

    if (errores.length > 0) {
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Formulario válido. Puedes continuar con el envío.");
      // form.submit(); // Descomenta si tienes lógica backend
    }
  });
});
