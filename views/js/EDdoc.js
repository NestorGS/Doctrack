document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputNombre = form.querySelector('input[type="text"]');

  form.addEventListener("submit", (e) => {
    const nombre = inputNombre.value.trim();

    if (nombre === "") {
      e.preventDefault();
      alert("Por favor ingresa el nombre del doctor que deseas eliminar.");
    } else {
      const confirmacion = confirm(`¿Estás seguro de que deseas eliminar al doctor "${nombre}"?`);
      if (!confirmacion) {
        e.preventDefault();
      }
    }
  });
});
