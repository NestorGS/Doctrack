// Animación de fondo
const fondo = document.getElementById('fondo-bolitas');
for (let i = 0; i < 15; i++) {
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.style.left = Math.random() * 100 + '%';
  dot.style.top = Math.random() * 100 + '%';
  fondo.appendChild(dot);
}

// Función para alternar vistas
function showView(view) {
  ['table', 'age', 'anc'].forEach(v => {
    document.getElementById('view-' + v).style.display = (v === view ? 'block' : 'none');
    document.getElementById('tab-' + v).classList.toggle('active', v === view);
  });
}

// Asociar botones después de que se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tab-table')?.addEventListener('click', () => showView('table'));
  document.getElementById('tab-age')?.addEventListener('click', () => showView('age'));
  document.getElementById('tab-anc')?.addEventListener('click', () => showView('anc'));
});
