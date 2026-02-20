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

    // Verificar sessão ao carregar
    useEffect(() => {
        checkSession();

        // Listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await loadUserProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setIsAuthenticated(false);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const checkSession = async () => {
        console.log("AuthProvider: checkSession iniciado...");

        // GARANTIA: Em 5 segundos o loading PARARÁ mesmo que o Supabase trave
        const failsafe = setTimeout(() => {
            console.log("AuthProvider: Failsafe acionado (5s). Liberando tela.");
            setLoading(false);
        }, 5000);

        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("AuthProvider: Erro ao buscar sessão:", error);
            }

            if (session?.user) {
                console.log("AuthProvider: Usuário logado encontrado:", session.user.email);
                await loadUserProfile(session.user);
            } else {
                console.log("AuthProvider: Nenhuma sessão ativa.");
            }
        } catch (error) {
            console.error('AuthProvider: Falha na verificação:', error);
        } finally {
            console.log("AuthProvider: checkSession finalizado.");
            clearTimeout(failsafe);
            setLoading(false);
        }
    };

    const loadUserProfile = async (authUser) => {
        console.log("AuthProvider: Carregando perfil para:", authUser.id);
        try {
            // Timeout de 5 segundos para a query do perfil
            const profilePromise = supabase
                .from('perfis')
                .select('*, empresas(*)')
                .eq('id', authUser.id)
                .single();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout ao carregar perfil")), 5000)
            );

            const { data: perfil, error } = await Promise.race([profilePromise, timeoutPromise]);

            if (error) {
                console.error("AuthProvider: Erro na query de perfis:", error);
                throw error;
            }

            if (!perfil) {
                throw new Error("Perfil não encontrado no banco de dados");
            }

            console.log("AuthProvider: Perfil carregado com sucesso:", perfil);
            setUser(authUser);
            setProfile(perfil);
            setIsAuthenticated(true);
            return perfil;
        } catch (error) {
            console.error('AuthProvider: Falha ao carregar perfil do usuário:', error.message);
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
            throw error; // Repassa o erro para o login tratar
        }
    };

    const login = async (email, password) => {
        console.log("AuthProvider: Tentando login para:", email);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error("AuthProvider: Erro no signInWithPassword:", error.message);
                throw error;
            }

            if (!data.user) {
                throw new Error("Nenhum usuário retornado após login");
            }

            console.log("AuthProvider: Login Auth ok, carregando perfil...");
            const userProfile = await loadUserProfile(data.user);

            return { success: true, profile: userProfile };
        } catch (error) {
            console.error('AuthProvider: Erro completo no processo de login:', error);

            // Tratamento de mensagens amigáveis
            let friendlyError = error.message;
            if (error.message === 'Invalid login credentials') {
                friendlyError = 'Email ou senha incorretos';
            } else if (error.message === 'Email not confirmed') {
                friendlyError = 'Por favor, confirme seu email antes de entrar';
            } else if (error.message === 'Timeout ao carregar perfil') {
                friendlyError = 'O servidor demorou muito para responder. Tente novamente.';
            }

            return { success: false, error: friendlyError };
        }
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Erro no logout:', error);
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
