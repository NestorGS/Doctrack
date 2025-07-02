    // Fondo animado
    const fondo = document.getElementById('fondo-bolitas');
    for(let i=0;i<30;i++){
      const d = document.createElement('div');
      d.className = 'dot';
      d.style.left = `${Math.random()*100}%`;
      d.style.top  = `${Math.random()*100}%`;
      fondo.appendChild(d);
    }

    // Pestañas
    document.querySelectorAll('.tabs button').forEach(btn=>{
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.sec).classList.add('active');
      });
    });

    // Logout
    document.getElementById('logoutBtn').onclick = () => {
      sessionStorage.removeItem('adminUID');
      window.location.href = 'Admin.html';
    };