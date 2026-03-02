import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    const profileLoaded = useRef(false);

    useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && mounted) {
                    await loadUserProfile(session.user);
                }
            } catch (err) {
                console.warn('AuthProvider: init error (ignorado):', err.message);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN' && session?.user) {
                if (!profileLoaded.current) {
                    await loadUserProfile(session.user);
                }
            } else if (event === 'SIGNED_OUT') {
                profileLoaded.current = false;
                setUser(null);
                setProfile(null);
                setIsAuthenticated(false);
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const loadUserProfile = async (authUser) => {
        try {
            const { data: perfil, error } = await supabase
                .from('perfis')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) throw error;
            if (!perfil) throw new Error('Perfil não encontrado');

            setUser(authUser);
            setProfile(perfil);
            setIsAuthenticated(true);
            profileLoaded.current = true;
            return perfil;
        } catch (error) {
            console.error('AuthProvider: erro ao carregar perfil:', error.message);
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
            profileLoaded.current = false;
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            profileLoaded.current = false;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            if (!data.user) throw new Error('Nenhum usuário retornado');

            const userProfile = await loadUserProfile(data.user);
            return { success: true, profile: userProfile };
        } catch (error) {
            console.error('AuthProvider: erro no login:', error);

            let friendlyError = error.message;
            if (error.name === 'AbortError') {
                friendlyError = 'Conexão instável. Tente novamente.';
            } else if (error.message === 'Invalid login credentials') {
                friendlyError = 'Email ou senha incorretos';
            } else if (error.message === 'Email not confirmed') {
                friendlyError = 'Por favor, confirme seu email antes de entrar';
            }

            return { success: false, error: friendlyError };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            profileLoaded.current = false;
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
        }
    };

    const isAdmin = () => profile?.tipo_acesso === 'admin';
    const isColaborador = () => profile?.tipo_acesso === 'colaborador';

    const value = {
        user,
        profile,
        isAuthenticated,
        loading,
        login,
        logout,
        isAdmin,
        isColaborador
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
