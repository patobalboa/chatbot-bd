-- =====================================================================
-- 02_schema.sql
-- Modelo de datos: usuarios, solicitudes, mensajes
-- =====================================================================
--
-- Ejecutar conectado a la base "chatbot_db":
--   sudo -u postgres psql -d chatbot_db
-- o bien:
--   \c chatbot_db
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABLA: usuarios
-- ---------------------------------------------------------------------
-- id               -> PRIMARY KEY autogenerada
-- numero_whatsapp  -> UNIQUE + NOT NULL (identifica a cada usuario)
-- nombre           -> NOT NULL
-- fecha_registro   -> DEFAULT CURRENT_TIMESTAMP
CREATE TABLE usuarios (
    id               SERIAL PRIMARY KEY,
    numero_whatsapp  VARCHAR(30) UNIQUE NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    fecha_registro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- TABLA: solicitudes
-- ---------------------------------------------------------------------
-- usuario_id   -> FOREIGN KEY hacia usuarios(id) -> integridad referencial
-- descripcion  -> TEXT NOT NULL
-- estado       -> valor inicial "pendiente"
-- fecha_creacion -> DEFAULT CURRENT_TIMESTAMP
CREATE TABLE solicitudes (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
    descripcion     TEXT NOT NULL,
    estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- TABLA: mensajes
-- ---------------------------------------------------------------------
-- usuario_id -> FK hacia usuarios(id)
-- mensaje    -> TEXT NOT NULL
-- tipo       -> distingue mensaje 'entrada' (del usuario) o 'salida' (del bot)
-- fecha      -> DEFAULT CURRENT_TIMESTAMP
CREATE TABLE mensajes (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios(id),
    mensaje     TEXT NOT NULL,
    tipo        VARCHAR(10) NOT NULL,
    fecha       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Privilegios mínimos para el rol de aplicación chatbot_app
-- ---------------------------------------------------------------------
-- La aplicación solo necesita leer y escribir datos, NO crear ni borrar
-- tablas, ni administrar el esquema.
GRANT SELECT, INSERT, UPDATE ON usuarios, solicitudes, mensajes TO chatbot_app;

-- Las columnas "id" son SERIAL (usan secuencias internas). El rol de
-- aplicación necesita permiso para usar esas secuencias al hacer INSERT.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO chatbot_app;

-- Pregunta para el estudiante:
--   ¿Qué ocurriría si intentamos crear una solicitud para un usuario
--   que no existe? (Probar y explicar el error de integridad referencial)
