-- =====================================================================
-- 03_sample_queries.sql
-- Consultas de referencia para explorar y verificar los datos
-- =====================================================================
-- Estas consultas son ejemplos que el estudiante puede ejecutar
-- directamente en psql para verificar lo que el bot va almacenando.
-- =====================================================================

-- Ver todos los usuarios registrados
SELECT * FROM usuarios;

-- Ver todas las solicitudes junto con el nombre del usuario que las creó
-- (relación usuarios 1 ----- N solicitudes)
SELECT
    s.id,
    u.nombre,
    s.descripcion,
    s.estado,
    s.fecha_creacion
FROM solicitudes s
JOIN usuarios u ON u.id = s.usuario_id
ORDER BY s.fecha_creacion DESC;

-- Ver las solicitudes de un usuario específico por número de WhatsApp
SELECT s.*
FROM solicitudes s
JOIN usuarios u ON u.id = s.usuario_id
WHERE u.numero_whatsapp = '5491111111111'
ORDER BY s.fecha_creacion DESC;

-- Contar solicitudes por estado
SELECT estado, COUNT(*) AS cantidad
FROM solicitudes
GROUP BY estado;

-- Ver los últimos mensajes registrados (entrada/salida)
SELECT
    m.id,
    u.nombre,
    m.tipo,
    m.mensaje,
    m.fecha
FROM mensajes m
LEFT JOIN usuarios u ON u.id = m.usuario_id
ORDER BY m.fecha DESC
LIMIT 20;

-- Verificar integridad referencial: intentar insertar una solicitud
-- para un usuario_id inexistente (esto debe fallar)
-- INSERT INTO solicitudes (usuario_id, descripcion) VALUES (99999, 'prueba');
