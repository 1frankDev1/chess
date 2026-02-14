-- Crear la tabla de partidas de ajedrez
CREATE TABLE IF NOT EXISTS chess (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    white_player_id UUID REFERENCES auth.users(id),
    black_player_id UUID REFERENCES auth.users(id),
    board_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    current_turn TEXT CHECK (current_turn IN ('white', 'black')) DEFAULT 'white',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE chess ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Usuarios pueden ver sus propias partidas" 
ON chess FOR SELECT 
USING (auth.uid() = white_player_id OR auth.uid() = black_player_id);

CREATE POLICY "Usuarios pueden crear sus propias partidas" 
ON chess FOR INSERT 
WITH CHECK (auth.uid() = white_player_id);

CREATE POLICY "Usuarios pueden actualizar sus propias partidas" 
ON chess FOR UPDATE 
USING (auth.uid() = white_player_id OR auth.uid() = black_player_id);

-- Configuración de Storage
-- Nota: Debes crear manualmente el bucket 'chess-models' en el panel de Supabase y hacerlo público o configurar políticas.
-- Si es privado, usa las políticas de storage correspondientes.
