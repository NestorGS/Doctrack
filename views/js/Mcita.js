document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const pacienteSelect = form.querySelectorAll("select")[0];
  const campoSelect = form.querySelectorAll("select")[1];
  const datoInput = form.querySelector("input");
  const boton = form.querySelector("button");

  function contieneCaracteresPeligrosos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patrones = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|OR\s+1=1)\b/i;
    return patrones.test(texto);
  }

  boton.addEventListener("click", (e) => {
    e.preventDefault();

    const paciente = pacienteSelect.value.trim();
    const campo = campoSelect.value.trim();
    const nuevoDato = datoInput.value.trim();
    let errores = [];

    if (paciente === "") {
      errores.push("Debe seleccionar un paciente.");
    }

    if (campo === "") {
      errores.push("Debe seleccionar el campo a modificar.");
    }

    if (nuevoDato === "") {
      errores.push("Debe ingresar el nuevo dato.");
    } else {
      if (contieneCaracteresPeligrosos(nuevoDato)) {
        errores.push("El nuevo dato contiene caracteres no permitidos.");
      }
      if (contieneInyeccionSQL(nuevoDato)) {
        errores.push("Se detectó un intento de inyección SQL.");
      }
    }

    if (errores.length > 0) {
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Validación exitosa. Modificación lista para ser procesada.");
      // form.submit(); // si deseas que se envíe el formulario realmente
    }
  });
});
