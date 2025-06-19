function contieneEtiquetasHTML(str) {
    const htmlRegex = /<[^>]*>/g;
    return htmlRegex.test(str);
}

function contieneCaracteresEspeciales(str) {
    const regex = /[!@#$%^&*(),.?":{}|<>]/g;
    return regex.test(str);
}

function contieneInyeccionSQL(str) {
    const sqlPatterns = [
        /(--|;|\/\*|\*\/|@@|@|char\(|nchar\(|varchar\(|alter |begin |cast\(|create |cursor |declare |delete |drop |end |exec |execute |fetch |insert |kill |open |select |sys|system_user|table |update )/i
    ];
    return sqlPatterns.some((pattern) => pattern.test(str));
}

function soloLetras(str) {
    return /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/.test(str);
}

function validarFormulario(campo, valor) {
    const errores = [];

    if (!valor.trim()) {
        errores.push(`El campo "${campo}" no puede estar vacío.`);
    }
    if (contieneEtiquetasHTML(valor)) {
        errores.push(`El campo "${campo}" contiene etiquetas HTML no permitidas.`);
    }
    if (contieneCaracteresEspeciales(valor) && campo !== "Motivo") {
        errores.push(`El campo "${campo}" contiene caracteres especiales inválidos.`);
    }
    if (contieneInyeccionSQL(valor)) {
        errores.push(`El campo "${campo}" contiene patrones sospechosos de inyección SQL.`);
    }
    if ((campo === "Nombre del paciente" || campo === "Tratamiento") && !soloLetras(valor)) {
        errores.push(`El campo "${campo}" solo debe contener letras.`);
    }

    return errores;
}

// Validación general al intentar añadir una cita
function validarCita(datos) {
    const campos = Object.entries(datos);
    const todosErrores = [];

    for (const [campo, valor] of campos) {
        const errores = validarFormulario(campo, valor);
        if (errores.length) {
            todosErrores.push(...errores);
        }
    }

    return todosErrores;
}

// Ejemplo de uso: (esto se puede adaptar a eventos en tu página)
document.addEventListener('DOMContentLoaded', () => {

    
    const formulario = document.getElementById('formulario-cita');
    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            const datos = {
                'Nombre del paciente': document.getElementById('nombre').value,
                'Tratamiento': document.getElementById('tratamiento').value,
                'Hora de la cita': document.getElementById('hora').value,
                'Alergias': document.getElementById('alergias').value,
                'Motivo': document.getElementById('motivo').value
            };

            const errores = validarCita(datos);

            if (errores.length > 0) {
                alert('Errores:\n' + errores.join('\n'));
            } else {
                formulario.submit();
            }
        });
    }
});