import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Estas variables deben ser configuradas por el usuario
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
