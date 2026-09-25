// =========================================================================
// bot.js
// Punto de entrada de la aplicación: conecta WhatsApp (whatsapp-web.js)
// con PostgreSQL a través de commands.js / database.js.
//
// Flujo: WhatsApp -> whatsapp-web.js -> Node.js -> pg -> PostgreSQL
// =========================================================================

require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { testConnection } = require('./database');
const { manejarMensaje } = require('./commands');

console.log('[APP] Iniciando chatbot WhatsApp + PostgreSQL...');

// LocalAuth guarda la sesión de WhatsApp en disco (carpeta .wwebjs_auth/)
// para no tener que escanear el QR cada vez que se reinicia el bot.
// Esa carpeta NO debe subirse a GitHub (ver .gitignore).
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Argumentos recomendados para ejecutar Chromium en un servidor
        // Linux sin interfaz gráfica (por ejemplo, una instancia de AWS).
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ],
    },
});

client.on('qr', (qr) => {
    console.log('[WHATSAPP] QR generado.');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('[WHATSAPP] Cliente autenticado.');
});

client.on('auth_failure', (mensaje) => {
    console.error('[WHATSAPP] Falló la autenticación:', mensaje);
});

client.on('ready', () => {
    console.log('[WHATSAPP] Cliente listo.');
});

client.on('disconnected', (motivo) => {
    console.log('[WHATSAPP] Cliente desconectado:', motivo);
});

client.on('message', async (message) => {
    console.log('[WHATSAPP] Mensaje recibido.');
    try {
        const respuesta = await manejarMensaje(message);
        if (respuesta) {
            await message.reply(respuesta);
        }
    } catch (error) {
        console.error('[APP] Error inesperado procesando el mensaje:', error.message);
    }
});

/**
 * Antes de iniciar WhatsApp, se verifica que PostgreSQL esté accesible.
 * Esto permite diagnosticar problemas de conexión sin depender del QR.
 */
async function iniciar() {
    try {
        await testConnection();
    } catch (error) {
        console.error('[APP] No fue posible conectar con PostgreSQL. Revisa tu archivo .env');
        console.error('[APP] El bot NO se iniciará hasta que la conexión funcione.');
        process.exit(1);
    }

    console.log('[APP] Iniciando cliente de WhatsApp...');
    client.initialize();
}

iniciar();
