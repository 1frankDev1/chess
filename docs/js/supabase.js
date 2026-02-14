import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ehszvqwftqgxjggnbcmt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoc3p2cXdmdHFneGpnZ25iY210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDI5MjAsImV4cCI6MjA4NTMxODkyMH0.wh8_Xy4_w9roFxMgbJ-J9A3r5V7duUjnStl4ZsZ0804';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Custom Auth Functions (using 'usuarios' table)
 */
export async function customSignIn(username, password) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (error) throw new Error('Usuario o contraseña incorrectos');
    localStorage.setItem('chess_user', JSON.stringify(data));
    return data;
}

export function getCurrentUser() {
    const user = localStorage.getItem('chess_user');
    return user ? JSON.parse(user) : null;
}

export function customSignOut() {
    localStorage.removeItem('chess_user');
}

/**
 * Character Management Functions
 */
export async function getCharacters() {
    const { data, error } = await supabase
        .from('chess_characters')
        .select('*');
    if (error) throw error;
    return data;
}

export async function saveCharacter(character) {
    const { data, error } = await supabase
        .from('chess_characters')
        .upsert(character)
        .select();
    if (error) throw error;
    return data[0];
}

export async function deleteCharacter(id) {
    const { error } = await supabase
        .from('chess_characters')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

/**
 * User Selections Functions
 */
export async function getUserSelections(userId) {
    const { data, error } = await supabase
        .from('chess_user_selections')
        .select('*, chess_characters(*)')
        .eq('user_id', userId);
    if (error) throw error;
    return data;
}

export async function saveUserSelection(userId, pieceType, characterId) {
    const { data, error } = await supabase
        .from('chess_user_selections')
        .upsert({ user_id: userId, piece_type: pieceType, character_id: characterId })
        .select();
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

export async function listStorageFiles() {
    const { data, error } = await supabase
        .storage
        .from('chess-models')
        .list();
    if (error) throw error;
    return data;
}
