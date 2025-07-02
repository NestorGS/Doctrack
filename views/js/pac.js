document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleBtn");
  const formContainer = document.getElementById("formPersonal");

  if (toggleBtn && formContainer) {
    toggleBtn.addEventListener("click", () => {
      formContainer.classList.toggle("active");
    });
  }

  // Validaciones de los campos
  const inputs = formContainer.querySelectorAll("input[type='text'], input[type='password'], input[type='date']");
  const [nombre, paterno, materno, curp, nacimiento, pass, confirmPass] = inputs;

  function contieneCaracteresProhibidos(texto) {
    const regex = /[<>{}[\];'"`\\|&$%!=()]/g;
    return regex.test(texto);
  }

  function contieneInyeccionSQL(texto) {
    const patrones = /\b(SELECT|INSERT|DELETE|UPDATE|DROP|--|#|OR\s+1=1)\b/i;
    return patrones.test(texto);
  }

  // Validación antes de registrar
  const registrarBtn = document.getElementById("registrarBtn");
  if (registrarBtn) {
    registrarBtn.addEventListener("click", (e) => {
      for (let input of inputs) {
        const valor = input.value.trim();

        if (!valor) {
          alert(`El campo "${input.placeholder}" es obligatorio.`);
          e.preventDefault();
          return;
        }

        if (contieneCaracteresProhibidos(valor)) {
          alert(`El campo "${input.placeholder}" contiene caracteres no permitidos.`);
          e.preventDefault();
          return;
        }

        if (contieneInyeccionSQL(valor)) {
          alert(`Posible inyección SQL en "${input.placeholder}".`);
          e.preventDefault();
          return;
        }
      }

      if (pass.value !== confirmPass.value) {
        alert("Las contraseñas no coinciden.");
        e.preventDefault();
        return;
      }

      console.log("Formulario válido. Enviando...");
    });
  }
});
