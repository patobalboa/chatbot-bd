-- =====================================================================
-- 01_database.sql
-- Creación de la base de datos y del usuario de aplicación (rol dedicado)
-- =====================================================================
--
-- ESTE ARCHIVO ES UNA REFERENCIA / GUÍA.
-- El estudiante debe ejecutar y adaptar estos comandos manualmente,
-- conectado como el usuario administrativo "postgres".
--
-- Ejemplo de conexión administrativa:
--   sudo -u postgres psql
--
-- IMPORTANTE (principio de mínimo privilegio):
-- La aplicación Node.js NUNCA debe conectarse a PostgreSQL utilizando
-- el usuario "postgres". Ese usuario es el superusuario administrativo
-- del motor de base de datos y tiene privilegios totales sobre el
-- servidor (crear/borrar bases, roles, extensiones, etc.).
--
-- Una aplicación solo necesita poder leer y escribir en SUS tablas,
-- nada más. Por eso se crea un rol de aplicación separado: chatbot_app.
-- =====================================================================

-- 1) Crear la base de datos del proyecto
CREATE DATABASE chatbot_db;

-- 2) Crear el rol/usuario de aplicación
--    NOTA: "CAMBIAR_ESTA_PASSWORD" es un PLACEHOLDER. Reemplazarlo por una
--    contraseña real y segura, y usar ESA MISMA contraseña en el archivo .env
CREATE USER chatbot_app
WITH PASSWORD 'CAMBIAR_ESTA_PASSWORD';

-- 3) Otorgar al rol de aplicación solamente los privilegios necesarios
--    sobre la base de datos chatbot_db (mínimo privilegio).
--
--    El estudiante debe conectarse a la base "chatbot_db" (\c chatbot_db)
--    antes de otorgar privilegios sobre el esquema y las tablas, ya que
--    estas todavía no existen (se crean en 02_schema.sql).
--
--    Ejemplo de otorgamiento a nivel de base de datos:
GRANT CONNECT ON DATABASE chatbot_db TO chatbot_app;

-- Los privilegios sobre tablas específicas (SELECT, INSERT, UPDATE)
-- se otorgan DESPUÉS de crear las tablas, ver 02_schema.sql.
-- Pregunta para el estudiante:
--   ¿Por qué la aplicación no debería conectarse utilizando "postgres"?
