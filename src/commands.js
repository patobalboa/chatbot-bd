// =========================================================================
// commands.js
// Implementación de los comandos del bot.
//
// Flujo educativo de cada comando:
//   MENSAJE -> COMANDO -> CONSULTA SQL -> POSTGRESQL -> RESULTADO -> RESPUESTA
//
// IMPORTANTE: todas las consultas que incorporan datos provenientes de
// WhatsApp usan PARÁMETROS ($1, $2, ...) en lugar de concatenar texto.
// Esto evita inyección SQL: el valor del usuario nunca se interpreta
// como parte del comando SQL, solo como un dato.
// =========================================================================

const { pool } = require('./database');
const { normalizarNumero, formatearFecha, extraerArgumento } = require('./utils');

const TEXTO_AYUDA =
    'Comandos disponibles:\n\n' +
    '!registrar Nombre\n' +
    '!perfil\n' +
    '!solicitud Descripción\n' +
    '!solicitudes\n' +
    '!estado ID';

/**
 * Busca un usuario por su número de WhatsApp.
 * Consulta parametrizada: el número nunca se concatena en el SQL.
 */
async function buscarUsuarioPorNumero(numero) {
    const result = await pool.query(
        'SELECT * FROM usuarios WHERE numero_whatsapp = $1',
        [numero]
    );
    return result.rows[0] || null;
}

/**
 * Registra en la tabla "mensajes" un mensaje de entrada o salida.
 * usuarioId puede ser null si el usuario todavía no está registrado.
 */
async function registrarMensaje(usuarioId, mensaje, tipo) {
    try {
        await pool.query(
            'INSERT INTO mensajes (usuario_id, mensaje, tipo) VALUES ($1, $2, $3)',
            [usuarioId, mensaje, tipo]
        );
    } catch (error) {
        // El registro de mensajes es auxiliar: si falla, no debe romper
        // la respuesta al usuario, pero sí quedar visible en el log.
        console.error('[DB] Error al registrar mensaje:', error.message);
    }
}

// -------------------------------------------------------------------
// !registrar Nombre
// -------------------------------------------------------------------
async function comandoRegistrar(numero, texto) {
    const nombre = extraerArgumento(texto, '!registrar');

    if (!nombre) {
        return 'Debes indicar un nombre. Ejemplo: !registrar Pedro González';
    }

    const existente = await buscarUsuarioPorNumero(numero);
    if (existente) {
        return `Ya estás registrado como ${existente.nombre}.`;
    }

    console.log('[DB] Ejecutando inserción de usuario.');
    const result = await pool.query(
        'INSERT INTO usuarios (numero_whatsapp, nombre) VALUES ($1, $2) RETURNING id',
        [numero, nombre]
    );

    return `Registro exitoso. Bienvenido/a, ${nombre}.\nID de usuario: ${result.rows[0].id}`;
}

// -------------------------------------------------------------------
// !perfil
// -------------------------------------------------------------------
async function comandoPerfil(numero) {
    console.log('[DB] Ejecutando consulta de usuario.');
    const usuario = await buscarUsuarioPorNumero(numero);

    if (!usuario) {
        return 'No estás registrado. Utiliza !registrar Nombre';
    }

    return (
        `Nombre: ${usuario.nombre}\n` +
        `Registrado: ${formatearFecha(usuario.fecha_registro)}`
    );
}

// -------------------------------------------------------------------
// !solicitud Descripción
// -------------------------------------------------------------------
async function comandoSolicitud(numero, texto) {
    const descripcion = extraerArgumento(texto, '!solicitud');

    if (!descripcion) {
        return 'Debes indicar una descripción. Ejemplo: !solicitud No puedo acceder al sistema';
    }

    const usuario = await buscarUsuarioPorNumero(numero);
    if (!usuario) {
        return 'No estás registrado. Utiliza !registrar Nombre';
    }

    const result = await pool.query(
        'INSERT INTO solicitudes (usuario_id, descripcion) VALUES ($1, $2) RETURNING id, estado',
        [usuario.id, descripcion]
    );
    const solicitud = result.rows[0];

    return (
        'Solicitud creada correctamente.\n' +
        `ID: ${solicitud.id}\n` +
        `Estado: ${solicitud.estado}`
    );
}

// -------------------------------------------------------------------
// !solicitudes
// -------------------------------------------------------------------
async function comandoSolicitudes(numero) {
    const usuario = await buscarUsuarioPorNumero(numero);
    if (!usuario) {
        return 'No estás registrado. Utiliza !registrar Nombre';
    }

    const result = await pool.query(
        'SELECT id, estado, descripcion FROM solicitudes ' +
        'WHERE usuario_id = $1 ORDER BY fecha_creacion DESC LIMIT 10',
        [usuario.id]
    );

    if (result.rows.length === 0) {
        return 'No tienes solicitudes registradas.';
    }

    const lineas = result.rows.map(
        (s) => `#${s.id} - ${s.estado} - ${s.descripcion}`
    );

    return `Tus solicitudes:\n\n${lineas.join('\n')}`;
}

// -------------------------------------------------------------------
// !estado ID
// -------------------------------------------------------------------
async function comandoEstado(numero, texto) {
    const argumento = extraerArgumento(texto, '!estado');
    const id = Number(argumento);

    if (!argumento || !Number.isInteger(id)) {
        return 'Debes indicar un ID numérico. Ejemplo: !estado 15';
    }

    const usuario = await buscarUsuarioPorNumero(numero);
    if (!usuario) {
        return 'No estás registrado. Utiliza !registrar Nombre';
    }

    // Se verifica que la solicitud pertenezca al usuario que consulta
    // (usuario_id = $2) para no permitir consultar solicitudes ajenas.
    const result = await pool.query(
        'SELECT id, estado, descripcion, fecha_creacion FROM solicitudes ' +
        'WHERE id = $1 AND usuario_id = $2',
        [id, usuario.id]
    );

    if (result.rows.length === 0) {
        return `No se encontró la solicitud #${id} asociada a tu cuenta.`;
    }

    const s = result.rows[0];
    return (
        `Solicitud #${s.id}\n` +
        `Estado: ${s.estado}\n` +
        `Descripción: ${s.descripcion}\n` +
        `Creada: ${formatearFecha(s.fecha_creacion)}`
    );
}

/**
 * Punto de entrada: recibe el mensaje completo de whatsapp-web.js,
 * identifica el comando y delega en la función correspondiente.
 * Registra mensajes de entrada/salida en la tabla "mensajes".
 */
async function manejarMensaje(message) {
    const numero = normalizarNumero(message.from);
    const texto = (message.body || '').trim();

    console.log(`[COMMAND] Mensaje recibido: ${texto}`);

    // Registrar el mensaje de entrada (usuario_id puede ser desconocido aún)
    const usuarioExistente = await buscarUsuarioPorNumero(numero).catch(() => null);
    await registrarMensaje(usuarioExistente ? usuarioExistente.id : null, texto, 'entrada');

    let respuesta;

    try {
        if (texto === '!ayuda') {
            console.log('[COMMAND] !ayuda recibido.');
            respuesta = TEXTO_AYUDA;
        } else if (texto.startsWith('!registrar')) {
            console.log('[COMMAND] !registrar recibido.');
            respuesta = await comandoRegistrar(numero, texto);
        } else if (texto === '!perfil') {
            console.log('[COMMAND] !perfil recibido.');
            respuesta = await comandoPerfil(numero);
        } else if (texto.startsWith('!solicitudes')) {
            console.log('[COMMAND] !solicitudes recibido.');
            respuesta = await comandoSolicitudes(numero);
        } else if (texto.startsWith('!solicitud')) {
            console.log('[COMMAND] !solicitud recibido.');
            respuesta = await comandoSolicitud(numero, texto);
        } else if (texto.startsWith('!estado')) {
            console.log('[COMMAND] !estado recibido.');
            respuesta = await comandoEstado(numero, texto);
        } else {
            // Mensajes que no son comandos reconocidos se ignoran
            // (no se responde nada para no generar ruido en el chat).
            return null;
        }
    } catch (error) {
        // El error técnico completo queda en consola para troubleshooting.
        console.error(`[DB] Error: ${error.message}`);
        respuesta = 'Ocurrió un problema al procesar tu solicitud.';
    }

    const usuarioActual = await buscarUsuarioPorNumero(numero).catch(() => null);
    await registrarMensaje(usuarioActual ? usuarioActual.id : null, respuesta, 'salida');

    return respuesta;
}

module.exports = {
    manejarMensaje,
};
