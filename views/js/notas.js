document.addEventListener("DOMContentLoaded", () => {
  const contenidoNota = document.querySelector(".contenido-nota");

  function contieneCaracteresProhibidos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patronesSQL = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|OR\s+1=1)\b/i;
    return patronesSQL.test(texto);
  }

  // Ejemplo de validación preventiva al insertar contenido dinámicamente:
  const textoNota = contenidoNota.textContent.trim();

  if (contieneCaracteresProhibidos(textoNota) || contieneInyeccionSQL(textoNota)) {
    contenidoNota.textContent = "⚠️ El contenido cargado es inválido o ha sido modificado.";
    contenidoNota.style.color = "red";
  }

  // En caso de que desees manipular datos desde backend, aquí podrías usar:
  // fetch("url").then(...).then(validarTexto).catch(...);
});
