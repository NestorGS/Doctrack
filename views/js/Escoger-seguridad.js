    const fondo = document.getElementById('fondo-bolitas');
    const cantidad = 15;
    for (let i = 0; i < cantidad; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;
        fondo.appendChild(dot);
    }