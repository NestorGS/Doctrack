document.addEventListener("DOMContentLoaded", () => {
  const registrarBtn = document.querySelector(".btn");
  
  registrarBtn.addEventListener("click", (e) => {
    let errores = [];

    const form = document.getElementById("formPersonal");
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"]');
    const especialidad = document.getElementById("especialidad");
    const contrasena = document.querySelector('input[type="password"]:nth-of-type(1)');
    const confirmar = document.querySelector('input[type="password"]:nth-of-type(2)');

    // Validar campos de texto y email
    inputs.forEach((input, i) => {
      if (input.value.trim() === "") {
        errores.push(`El campo "${input.placeholder}" es obligatorio.`);
      }
    });

    // Validar correo electrónico
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      errores.push("El correo electrónico no tiene un formato válido.");
    }

    // Validar especialidad
    if (especialidad.value === "ninguna") {
      errores.push("Debe seleccionar una especialidad.");
    }

    // Validar contraseñas
    if (contrasena.value.trim() === "" || confirmar.value.trim() === "") {
      errores.push("Ambos campos de contraseña son obligatorios.");
    } else if (contrasena.value !== confirmar.value) {
      errores.push("Las contraseñas no coinciden.");
    }

    if (errores.length > 0) {
      e.preventDefault(); // Evita acción si hay errores
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    }
  });
});
