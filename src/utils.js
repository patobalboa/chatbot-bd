// =========================================================================
// utils.js
// Funciones utilitarias simples reutilizadas por comandos y bot.
// =========================================================================

/**
 * Normaliza el número de WhatsApp recibido en "message.from"
 * (formato típico: "5491122334455@c.us") dejando solo el número.
 */
function normalizarNumero(whatsappId) {
    return String(whatsappId).split('@')[0].trim();
}

/**
 * Formatea una fecha (Date o string) como DD-MM-YYYY para mostrarla
 * en las respuestas del bot.
 */
function formatearFecha(fecha) {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}-${mes}-${anio}`;
}

/**
 * Extrae el texto que sigue a un comando.
 * Ejemplo: extraerArgumento('!registrar Pedro González', '!registrar')
 *          -> 'Pedro González'
 */
function extraerArgumento(texto, comando) {
    return texto.slice(comando.length).trim();
}

module.exports = {
    normalizarNumero,
    formatearFecha,
    extraerArgumento,
};
