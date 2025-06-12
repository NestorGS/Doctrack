document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".sign-in");
 const emailInput = document.getElementById("email");
 const passwordInput = document.getElementById("password");
  const loginButton = loginForm.querySelector(".button");

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

  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    const correo = emailInput.value.trim();
    const contrasena = passwordInput.value.trim();
    let errores = [];

    if (correo === "" || contrasena === "") {
      errores.push("Todos los campos son obligatorios.");
    }

    if (!esCorreoValido(correo)) {
      errores.push("El formato del correo electrónico es inválido.");
    }

    if (contieneCaracteresPeligrosos(correo) || contieneCaracteresPeligrosos(contrasena)) {
      errores.push("Los campos contienen caracteres no permitidos.");
    }

    if (contieneInyeccionSQL(correo) || contieneInyeccionSQL(contrasena)) {
      errores.push("Se detectó un posible intento de inyección SQL.");
    }

    if (errores.length > 0) {
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    } else {
      alert("Datos validados correctamente. Procediendo al inicio de sesión.");
      // Aquí se puede enviar el formulario con form.submit() si se habilita
      // loginForm.submit();
    }
  });
});
