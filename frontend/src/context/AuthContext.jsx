import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext();

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

    // On mount: check for existing session only
    useEffect(() => {
        let ignore = false;

        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && !ignore) {
                    const result = await fetchProfile(session.user.id);
                    if (result.profile && !ignore) {
                        setUser(session.user);
                        setProfile(result.profile);
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

        // Only listen for SIGN OUT — login() handles SIGN IN directly
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

    const fetchProfile = async (userId) => {
        // Try with .single() first
        const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('fetchProfile error:', error.code, error.message, error.details);
            return { profile: null, dbError: error.message };
        }
        return { profile: data, dbError: null };
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

            // Small delay to ensure auth token is fully propagated
            await new Promise(r => setTimeout(r, 500));

            const result = await fetchProfile(data.user.id);

            if (result.dbError) {
                return { success: false, error: `Erro no banco: ${result.dbError}` };
            }

            if (!result.profile) {
                return { success: false, error: `Perfil não encontrado para o ID ${data.user.id.substring(0, 8)}...` };
            }

            setUser(data.user);
            setProfile(result.profile);
            setIsAuthenticated(true);

            return { success: true, profile: result.profile };
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
