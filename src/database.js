// =========================================================================
// database.js
// Módulo de conexión a PostgreSQL utilizando el paquete "pg".
//
// Las credenciales NUNCA se escriben aquí: se leen desde variables de
// entorno (archivo .env) mediante "dotenv". Esto evita subir contraseñas
// a GitHub y permite cambiar de entorno (dev/producción) sin tocar código.
// =========================================================================

require('dotenv').config();
const { Pool } = require('pg');

// El Pool administra un conjunto de conexiones reutilizables hacia
// PostgreSQL. Es la forma recomendada de usar "pg" en una aplicación.
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Registrar en consola los errores inesperados de clientes inactivos
// del pool, sin exponer la contraseña.
pool.on('error', (err) => {
    console.error('[DB] Error inesperado en el pool de conexiones:', err.message);
});

/**
 * Prueba la conexión a PostgreSQL ejecutando "SELECT NOW()".
 * Se utiliza tanto al iniciar el bot como en "npm run db:test".
 */
async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('[DB] Conexión PostgreSQL exitosa.');
        console.log(`[DB] Hora del servidor: ${result.rows[0].now}`);
        return true;
    } catch (error) {
        // No revelamos la contraseña, solo el mensaje técnico del error.
        console.error('[DB] Error de conexión PostgreSQL.');
        console.error(`[DB] Detalle: ${error.message}`);
        throw error;
    }
}

module.exports = {
    pool,
    testConnection,
};
