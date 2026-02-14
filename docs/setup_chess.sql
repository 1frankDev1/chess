-- Habilitar extensión para UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de personajes (modelos GLTF clasificados)
CREATE TABLE IF NOT EXISTS chess_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    gltf_path TEXT NOT NULL,
    piece_type TEXT NOT NULL CHECK (piece_type IN ('Rey', 'Reina', 'Torre', 'Alfil', 'Caballo', 'Peón')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de selecciones de usuario
-- user_id debe coincidir con el ID de la tabla 'usuarios'
CREATE TABLE IF NOT EXISTS chess_user_selections (
    user_id UUID NOT NULL,
    piece_type TEXT NOT NULL CHECK (piece_type IN ('Rey', 'Reina', 'Torre', 'Alfil', 'Caballo', 'Peón')),
    character_id UUID REFERENCES chess_characters(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, piece_type)
);

-- Habilitar RLS (Opcional, pero recomendado)
ALTER TABLE chess_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_user_selections ENABLE ROW LEVEL SECURITY;

-- Políticas para chess_characters
CREATE POLICY "Personajes visibles para todos" ON chess_characters
FOR SELECT USING (true);

-- Solo administradores pueden insertar/actualizar/eliminar
-- Asumiendo que existe una tabla 'usuarios' con columna 'role'
-- Nota: Estas políticas pueden requerir ajustes según la estructura exacta de 'usuarios'
-- CREATE POLICY "Solo admins pueden gestionar personajes" ON chess_characters
-- FOR ALL USING (
--     EXISTS (
--         SELECT 1 FROM usuarios
--         WHERE usuarios.id = auth.uid() AND usuarios.role = 'admin'
--     )
-- );
-- Como estamos usando un sistema de login custom con localStorage para el frontend,
-- las políticas de RLS basadas en auth.uid() podrían no funcionar directamente sin Supabase Auth.
-- Se recomienda usar Supabase Auth para máxima seguridad.

-- Políticas para chess_user_selections
CREATE POLICY "Selecciones visibles para todos" ON chess_user_selections
FOR SELECT USING (true);

CREATE POLICY "Usuarios gestionan sus propias selecciones" ON chess_user_selections
FOR ALL USING (true); -- Ajustar según sea necesario
