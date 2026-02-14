import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Estas variables deben ser configuradas por el usuario
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Auth Functions
 */

export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

/**
 * Database Functions
 */

export async function createGame(whitePlayerId, blackPlayerId) {
    const { data, error } = await supabase
        .from('chess')
        .insert([
            {
                white_player_id: whitePlayerId,
                black_player_id: blackPlayerId,
                board_state: {}, // Initial state will be set by the game logic
                current_turn: 'white'
            }
        ])
        .select();
    if (error) throw error;
    return data[0];
}

export async function updateGameState(gameId, boardState, currentTurn) {
    const { data, error } = await supabase
        .from('chess')
        .update({
            board_state: boardState,
            current_turn: currentTurn,
            updated_at: new Date()
        })
        .eq('id', gameId);
    if (error) throw error;
    return data;
}

export async function getGame(gameId) {
    const { data, error } = await supabase
        .from('chess')
        .select('*')
        .eq('id', gameId)
        .single();
    if (error) throw error;
    return data;
}

export async function getActiveGame(userId) {
    const { data, error } = await supabase
        .from('chess')
        .select('*')
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
        .order('updated_at', { ascending: false })
        .limit(1);
    
    if (error) throw error;
    return data[0];
}

/**
 * Storage Functions
 */

export async function getModelUrl(path) {
    const { data } = supabase
        .storage
        .from('chess-models')
        .getPublicUrl(path);
    
    return data.publicUrl;
}

export async function getSignedModelUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase
        .storage
        .from('chess-models')
        .createSignedUrl(path, expiresIn);
    
    if (error) throw error;
    return data.signedUrl;
}
