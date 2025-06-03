document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputNota = form.querySelector("input[type='text']");

  function contieneCaracteresProhibidos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patronesSQL = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|OR\s+1=1)\b/i;
    return patronesSQL.test(texto);
  }

  form.addEventListener("submit", (e) => {
    const nota = inputNota.value.trim();

    if (nota === "") {
      alert("❌ La nota no puede estar vacía.");
      e.preventDefault();
      return;
    }

    if (contieneCaracteresProhibidos(nota)) {
      alert("❌ La nota contiene caracteres no permitidos.");
      e.preventDefault();
      return;
    }

    if (contieneInyeccionSQL(nota)) {
      alert("❌ Intento de inyección SQL detectado.");
      e.preventDefault();
      return;
    }

    // Si todo es válido, continúa con el envío
    console.log("Nota válida:", nota);
  });
});
