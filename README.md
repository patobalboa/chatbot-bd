# Chatbot WhatsApp + PostgreSQL

Proyecto educativo para la asignatura **Administración de Bases de Datos**.

## 1. Objetivo

Este proyecto **no** busca enseñar desarrollo avanzado de bots ni de
Node.js. Es un pretexto: una aplicación real que actúa como **cliente de
PostgreSQL**, para que puedas practicar tareas propias de administración de
bases de datos:

- Servicio de PostgreSQL, usuarios, roles y privilegios.
- Variables de entorno y conexiones.
- Tablas, PK, FK, UNIQUE, NOT NULL, DEFAULT, integridad referencial.
- SELECT, INSERT, UPDATE y consultas parametrizadas.
- Persistencia y troubleshooting por capas.
- Principio de mínimo privilegio.

## 2. Arquitectura

```
WhatsApp → whatsapp-web.js → Node.js → (pg) → PostgreSQL → Persistencia
```

Ver el detalle completo en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## 3. Requisitos

- Servidor Ubuntu Linux (por ejemplo, una instancia de AWS).
- Node.js `>= 20` (versión LTS).
- PostgreSQL instalado y en ejecución.
- Un teléfono con WhatsApp para escanear el código QR.

## 4. Instalación

```bash
git clone https://github.com/patobalboa/chatbot-bd
cd chatbot-whatsapp-postgresql
npm install
```

## 5. Configuración

> ⚠️ Antes de iniciar el bot debes completar la configuración de
> PostgreSQL descrita en [`docs/ACTIVIDAD.md`](docs/ACTIVIDAD.md)
> (crear base de datos, usuario de aplicación y tablas). Este proyecto
> **no** crea automáticamente nada de eso.

```bash
cp .env.example .env
nano .env
```

Completa las variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=chatbot_app
DB_PASSWORD=CAMBIAR_PASSWORD
DB_NAME=chatbot_db
```

Verifica la conexión antes de iniciar WhatsApp:

```bash
npm run db:test
```

## 6. Inicio del bot

```bash
npm start
```

Escanea el código QR que aparece en la terminal usando WhatsApp en tu
teléfono. Cuando veas `[WHATSAPP] Cliente listo.`, el bot está operativo.

## 7. Comandos

| Comando                | Descripción                                        |
|-------------------------|-----------------------------------------------------|
| `!ayuda`                | Lista los comandos disponibles                      |
| `!registrar Nombre`     | Registra al usuario que envía el mensaje            |
| `!perfil`               | Muestra los datos del usuario registrado            |
| `!solicitud Descripción`| Crea una nueva solicitud asociada al usuario        |
| `!solicitudes`          | Lista las últimas solicitudes del usuario           |
| `!estado ID`            | Consulta el estado de una solicitud propia          |

## 8. Estructura del proyecto

```
chatbot-whatsapp-postgresql/
│
├── src/
│   ├── bot.js         # Punto de entrada, integra WhatsApp con los comandos
│   ├── database.js    # Conexión a PostgreSQL (Pool, testConnection)
│   ├── commands.js     # Lógica de cada comando del bot
│   └── utils.js        # Funciones utilitarias (formato, normalización)
│
├── sql/
│   ├── 01_database.sql      # Creación de base de datos y usuario de app
│   ├── 02_schema.sql        # Tablas, PK, FK, privilegios mínimos
│   └── 03_sample_queries.sql# Consultas de referencia para verificar datos
│
├── docs/
│   ├── ACTIVIDAD.md         # Guía paso a paso del laboratorio (misiones)
│   ├── TROUBLESHOOTING.md   # Metodología de diagnóstico de errores
│   └── ARQUITECTURA.md      # Explicación de la arquitectura por capas
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── LICENSE
```

## 9. Seguridad

- Las credenciales se leen desde variables de entorno (`.env`), nunca se
  escriben en el código fuente.
- El archivo `.env` y la sesión de WhatsApp (`.wwebjs_auth/`,
  `.wwebjs_cache/`) están excluidos de Git mediante `.gitignore`.
- Todas las consultas que incorporan datos del usuario usan **consultas
  parametrizadas** (`$1`, `$2`, ...), nunca concatenación de strings.
- La aplicación se conecta con un usuario dedicado (`chatbot_app`), **no**
  con el superusuario `postgres`, aplicando el principio de mínimo
  privilegio.
- Los errores técnicos se muestran en consola (para administración), pero
  el usuario de WhatsApp recibe siempre un mensaje genérico, sin detalles
  internos del sistema.

## 10. Solución de problemas

Ver la guía completa en [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md),
basada en la metodología:

```
EVIDENCIA → HIPÓTESIS → PRUEBA → RESULTADO → CORRECCIÓN
```

## 11. Actividad educativa

El laboratorio completo, dividido en misiones, está en
[`docs/ACTIVIDAD.md`](docs/ACTIVIDAD.md). Incluye desde la verificación del
servicio de PostgreSQL hasta un desafío final de implementación libre.

## 12. Notas sobre Puppeteer/Chromium en Ubuntu Server

`whatsapp-web.js` depende de Puppeteer, que ejecuta Chromium en modo
`headless`. En un servidor Ubuntu sin interfaz gráfica pueden faltar
algunas librerías del sistema requeridas por Chromium. Si el bot falla al
iniciar (antes de mostrar el QR), consulta el caso "Problemas de
Chromium/Puppeteer en Ubuntu" en
[`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md).
