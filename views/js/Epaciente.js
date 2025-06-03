document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputNombre = form.querySelector('input[type="text"]');

  // Funciones de seguridad
  function contieneCaracteresPeligrosos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patronesSQL = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|TRUNCATE|ALTER|--|#|\/\*|\*\/|OR\s+1=1)\b/i;
    return patronesSQL.test(texto);
  }

  form.addEventListener("submit", (e) => {
    const nombre = inputNombre.value.trim();

    if (nombre === "") {
      e.preventDefault();
      alert("Por favor ingresa el nombre del paciente que deseas eliminar.");
      return;
    }

    if (contieneCaracteresPeligrosos(nombre)) {
      e.preventDefault();
      alert("El nombre contiene caracteres no permitidos.");
      return;
    }

    if (contieneInyeccionSQL(nombre)) {
      e.preventDefault();
      alert("Se detectó un intento de inyección SQL. Operación cancelada.");
      return;
    }

    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar al paciente "${nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmacion) {
      e.preventDefault();
    }
  });
});
