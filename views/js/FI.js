document.addEventListener("DOMContentLoaded", () => {
  const guardarBtn = document.querySelector("button[type='submit']");
  const form = document.querySelector(".form-container");
  const campos = form.querySelectorAll("input[type='text'], select");

  function contieneCaracteresPeligrosos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patronesSQL = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|TRUNCATE|ALTER|--|#|\/\*|\*\/|OR\s+1=1)\b/i;
    return patronesSQL.test(texto);
  }

  function esCorreoValido(correo) {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(correo);
  }

  guardarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let errores = [];

    campos.forEach(campo => {
      const valor = campo.value.trim();
      const nombre = campo.name || campo.id;

      if (valor === "") {
        errores.push(`El campo "${nombre}" es obligatorio.`);
        return;
      }

      if (contieneCaracteresPeligrosos(valor)) {
        errores.push(`El campo "${nombre}" contiene caracteres no permitidos.`);
      }

      if (contieneInyeccionSQL(valor)) {
        errores.push(`El campo "${nombre}" parece contener una inyección SQL.`);
      }

      if (nombre === "edad" && (!/^\d+$/.test(valor) || Number(valor) <= 0)) {
        errores.push("La edad debe ser un número entero positivo.");
      }

      if (nombre === "telefono" && !/^[\d\- ]{7,20}$/.test(valor)) {
        errores.push("El teléfono debe contener solo números, guiones o espacios.");
      }

      if (nombre === "correo" && !esCorreoValido(valor)) {
        errores.push("El correo electrónico no tiene un formato válido.");
      }
    });

    if (errores.length > 0) {
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Todos los datos han sido validados correctamente.");
      // Aquí podrías hacer submit() si el formulario fuera real
      // form.submit();
    }
  });
});
