import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext();

// Separate client for profile reads — always uses anon role (bypasses authenticated RLS)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const profileReader = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && !ignore) {
                    const perfil = await fetchProfile(session.user.id);
                    if (perfil && !ignore) {
                        setUser(session.user);
                        setProfile(perfil);
                        setIsAuthenticated(true);
                    }
                }
            } catch (err) {
                console.warn('AuthProvider init:', err.message);
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setIsAuthenticated(false);
            }
        });

        return () => {
            ignore = true;
            subscription?.unsubscribe();
        };
    }, []);

    // Uses the separate anon-only client to bypass authenticated RLS restrictions
    const fetchProfile = async (userId) => {
        if (!profileReader) return null;

        const { data, error } = await profileReader
            .from('perfis')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('fetchProfile error:', error.code, error.message);
            return null;
        }
        return data;
    };

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                let msg = error.message;
                if (msg === 'Invalid login credentials') msg = 'Email ou senha incorretos';
                if (msg === 'Email not confirmed') msg = 'Confirme seu email antes de entrar';
                return { success: false, error: msg };
            }

            if (!data.user) {
                return { success: false, error: 'Nenhum usuário retornado' };
            }

            const perfil = await fetchProfile(data.user.id);
            if (!perfil) {
                return { success: false, error: 'Perfil não encontrado. Contate o administrador.' };
            }

            setUser(data.user);
            setProfile(perfil);
            setIsAuthenticated(true);

            return { success: true, profile: perfil };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Erro de conexão. Tente novamente.' };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Logout error:', err);
        }
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
    };

    const isAdmin = () => profile?.tipo_acesso === 'admin';
    const isColaborador = () => profile?.tipo_acesso === 'colaborador';

    return (
        <AuthContext.Provider value={{
            user, profile, isAuthenticated, loading,
            login, logout, isAdmin, isColaborador
        }}>
            {children}
        </AuthContext.Provider>
    );
};
