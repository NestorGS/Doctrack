document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputId = form.querySelector('input[type="text"]');

  form.addEventListener("submit", (e) => {
    const id = inputId.value.trim();

    if (id === "") {
      e.preventDefault(); // Bloquea el envío
      alert("Por favor ingresa el ID de la cita que deseas eliminar.");
    } else {
      const confirmar = confirm(`¿Estás seguro de que deseas eliminar la cita con ID: "${id}"?`);
      if (!confirmar) {
        e.preventDefault(); // Bloquea si el usuario cancela
      }
    }
  });
});
