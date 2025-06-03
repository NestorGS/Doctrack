document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const usuarioInput = document.getElementById("usuario");
  const passwordInput = document.getElementById("password");

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
