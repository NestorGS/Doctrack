document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const usuarioInput = document.getElementById("usuario");
  const passwordInput = document.getElementById("password");

  if (!form || !usuarioInput || !passwordInput) {
    console.warn("⛔ No se encontró el formulario o algún input requerido.");
    return; // Salir sin ejecutar el resto
  }

  form.addEventListener("submit", (e) => {
    let errores = [];

    if (usuarioInput.value.trim() === "") {
      errores.push("El campo 'Usuario' es obligatorio.");
    }

    if (passwordInput.value.trim() === "") {
      errores.push("El campo 'Contraseña' es obligatorio.");
    }

    if (errores.length > 0) {
      e.preventDefault(); // Evita el envío
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    }
  });
});
