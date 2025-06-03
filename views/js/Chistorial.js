document.addEventListener("DOMContentLoaded", () => {
  const searchTextarea = document.querySelector(".search-bar textarea");

  // Validar al presionar Enter
  searchTextarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evita salto de línea
      realizarBusqueda();
    }
  });

  // Si usas un icono de búsqueda con imagen (que falta en tu HTML), puedes agregarlo así:
  const searchIcon = document.querySelector(".search-bar img");
  if (searchIcon) {
    searchIcon.addEventListener("click", realizarBusqueda);
  }

  function realizarBusqueda() {
    const texto = searchTextarea.value.trim();

    if (texto === "") {
      alert("Por favor escribe un nombre para buscar.");
    } else {
      // Aquí podrías hacer la lógica para buscar
      alert(`Buscando a: ${texto}`);
    }
  }
});
