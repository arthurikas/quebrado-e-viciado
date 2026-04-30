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
    const [user, setUser] = useState({ id: '8e08166f-0cf8-4175-b413-73ae27fe0c0d', email: 'offline@normalizze' });
    const [profile, setProfile] = useState({ id: '8e08166f-0cf8-4175-b413-73ae27fe0c0d', tipo_acesso: 'admin', nome_completo: 'Modo Offline (Bypass)' });
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // BYPASS MODO OFFLINE: Retorna imediatamente para não sobrescrever a sessão mockada
        return;
        
        let ignore = false;
        
        // Fallback de segurança: se o Supabase travar (ex: bug de lock do localStorage),
        // força a saída do estado de loading após 8 segundos.
        const safetyTimer = setTimeout(() => {
            if (!ignore) {
                console.warn('AuthContext init timeout - forcing loading to false');
                // Limpa possíveis locks corrompidos do gotrue-js no localStorage
                try {
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (e) {
                    console.error('Erro ao limpar localStorage no timeout:', e);
                }
                setLoading(false);
            }
        }, 8000);

        const init = async () => {
            try {
                // Adiciona um timeout na requisição de sessão para não travar a UI
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter sessão')), 5000)
                );
                
                const result = await Promise.race([sessionPromise, timeoutPromise]);
                const session = result?.data?.session;

                if (session?.user && !ignore) {
                    const perfilPromise = fetchProfile(session.user.id);
                    const perfilTimeout = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 5000)
                    );
                    
                    const perfil = await Promise.race([perfilPromise, perfilTimeout]);

                    if (perfil && !ignore) {
                        setUser(session.user);
                        setProfile(perfil);
                        setIsAuthenticated(true);
                    }
                }
            } catch (err) {
                console.warn('AuthProvider init:', err.message);
            } finally {
                clearTimeout(safetyTimer);
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
            clearTimeout(safetyTimer);
            subscription?.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('fetchProfile error:', error.message);
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
