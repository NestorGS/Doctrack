document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const nombreInput = document.querySelector('input[placeholder="Escribe el nombre del doctor"]');
  const apellidoPaternoInput = document.querySelector('input[placeholder="Escribe el apellido paterno"]');
  const apellidoMaternoInput = document.querySelector('input[placeholder="Escribe el apellido materno"]');
  const cedulaInput = document.querySelector('input[placeholder="Escribe la cedula"]');
  const correoInput = document.querySelector('input[placeholder="Escribe el correo"]');
  const especialidadSelect = document.getElementById("especialidad");

  form.addEventListener("submit", (e) => {
    let errores = [];

    if (nombreInput.value.trim() === "") {
      errores.push("El nombre del doctor es obligatorio.");
    }

    if (apellidoPaternoInput.value.trim() === "") {
      errores.push("El apellido paterno es obligatorio.");
    }

    if (apellidoMaternoInput.value.trim() === "") {
      errores.push("El apellido materno es obligatorio.");
    }

    if (cedulaInput.value.trim() === "") {
      errores.push("La cédula o matrícula es obligatoria.");
    }

    if (correoInput.value.trim() === "") {
      errores.push("El correo electrónico es obligatorio.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoInput.value)) {
      errores.push("El correo electrónico no tiene un formato válido.");
    }

    if (especialidadSelect.value === "ninguna") {
      errores.push("Debe seleccionar una especialidad.");
    }

    if (errores.length > 0) {
      e.preventDefault(); // Bloquea el envío
      alert("Corrige los siguientes errores:\n\n" + errores.join("\n"));
    }
  });
});
